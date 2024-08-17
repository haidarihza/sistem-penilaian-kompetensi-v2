import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import numpy as np
import copy

class LabeledDataset(Dataset):
  def __init__(self, transcripts, competence_sets, labels):
    assert len(transcripts) == len(competence_sets) == len(labels), "Panjang transkrip dan set kompetensi harus sama"
    self.transcripts = transcripts
    self.competence_sets = competence_sets
    self.labels = labels

  def __len__(self):
    return len(self.transcripts)

  def __getitem__(self, idx):
    transcript = self.transcripts[idx]
    competences = self.competence_sets[idx]
    labels = self.labels[idx]

    return transcript, competences, labels

  # Fungsi collate_fn untuk menggabungkan batch dengan benar
  def collate_fn_labeled(batch):
      transcripts, competences, labels = zip(*batch)
      return list(transcripts), list(competences), torch.tensor(labels)
  
class UnlabeledDataset(Dataset):
  def __init__(self, transcripts, competence_sets):
    assert len(transcripts) == len(competence_sets), "Panjang transkrip dan set kompetensi harus sama"
    self.transcripts = transcripts
    self.competence_sets = competence_sets

  def __len__(self):
    return len(self.transcripts)

  def __getitem__(self, idx):
    transcript = self.transcripts[idx]
    competences = self.competence_sets[idx]

    return transcript, competences

  # Fungsi collate_fn untuk menggabungkan batch dengan benar
  def collate_fn_unlabeled(batch):
      transcripts, competences = zip(*batch)
      return list(transcripts), list(competences)
  
class ValidationDataset(Dataset):
  def __init__(self, transcripts, competence_sets, labels):
    assert len(transcripts) == len(competence_sets) == len(labels), "Panjang transkrip dan set kompetensi harus sama"
    self.transcripts = transcripts
    self.competence_sets = competence_sets
    self.labels = labels

  def __len__(self):
    return len(self.transcripts)

  def __getitem__(self, idx):
    transcript = self.transcripts[idx]
    competences = self.competence_sets[idx]
    labels = self.labels[idx]

    return transcript, competences, labels

  # Fungsi collate_fn untuk menggabungkan batch dengan benar
  def collate_fn_validation(batch):
      transcripts, competences, labels = zip(*batch)
      return list(transcripts), list(competences), torch.tensor(labels)
  
class semisupervised(torch.nn.Module):
  def __init__(self, model, tokenizer, device):
    super().__init__()
    self.model = model.to(device)
    self.tokenizer = tokenizer
    self.device = device

  def forward(self, transcripts: list[str], competence_sets: list[list[str]]):
    # Flatten the transcripts and competence sets
    flattened_transcripts = []
    flattened_competences = []

    max_length = max(len(competences) for competences in competence_sets)

    for transcript, competences in zip(transcripts, competence_sets):
      for competence in competences:
          flattened_transcripts.append(transcript)
          flattened_competences.append(competence)
      # Add padding
      for _ in range(max_length - len(competences)):
          flattened_transcripts.append(transcript)
          flattened_competences.append("0")

    # Tokenize
    inputs = self.tokenizer(
        flattened_transcripts,
        flattened_competences,
        padding=True,
        truncation=True,
        max_length=512,
        return_tensors='pt'
    ).to(self.device)

    outputs = self.model(**inputs)

    # Get and reshape logits
    logits = torch.nn.functional.log_softmax(outputs.logits, 1)
    entailment_logit = logits[:,0]

    reshaped_logits = entailment_logit.view(len(transcripts), max_length)

    mask = torch.tensor([
        [1 if i < len(competences) else 0 for i in range(max_length)]
        for competences in competence_sets
    ]).to(self.device)

    # Pastikan reshaped_logits dan mask memiliki ukuran yang sama
    assert reshaped_logits.size() == mask.size(), f"Ukuran reshaped_logits {reshaped_logits.size()} dan mask {mask.size()} tidak cocok"

    reshaped_logits = reshaped_logits * mask + (1 - mask) * -10

    return torch.nn.functional.log_softmax(reshaped_logits, 1)

  def train_pseudo_label(self, labeled_data, unlabeled_data, validation_data, batch_size, num_epochs, T1, T2, alpha_f, learning_rate):
    def calculate_alpha(t, T1, T2, alpha_f):
      if t < T1:
          return 0
      elif T1 <= t < T2:
          return (t - T1) / (T2 - T1)
      else:
          return alpha_f

    def custom_loss(labeled_loss, unlabeled_loss, alpha_t, n_labeled, n_unlabeled):
      L_labeled = labeled_loss / n_labeled
      L_unlabeled = unlabeled_loss / n_unlabeled
      return L_labeled + alpha_t * L_unlabeled

    labeled_loader = DataLoader(labeled_data, batch_size=batch_size, shuffle=True, collate_fn=LabeledDataset.collate_fn_labeled)
    unlabeled_loader = DataLoader(unlabeled_data, batch_size=batch_size, shuffle=True, collate_fn=UnlabeledDataset.collate_fn_unlabeled)
    validation_loader = DataLoader(validation_data, batch_size=batch_size, shuffle=False, collate_fn=ValidationDataset.collate_fn_validation)

    optimizer = torch.optim.SGD(self.model.parameters(), lr = learning_rate)

    for epoch in range(num_epochs):
      self.model.train()

      total_train_loss = 0
      total_validation_loss = 0

      total_n_data = 0

      criterion = nn.NLLLoss()

      for labeled_data, unlabeled_data in zip(labeled_loader, unlabeled_loader):
        optimizer.zero_grad()

        # LABELED
        l_transcripts, l_competences_set, l_labels = labeled_data
        l_labels = l_labels.to(self.device)

        l_logits = self(l_transcripts, l_competences_set)
        l_loss = criterion(l_logits, l_labels)

        n_labeled = len(l_transcripts)
        total_n_data += len(l_transcripts)

        # UNLABELED
        ul_transcripts, ul_competences_set = unlabeled_data

        ul_logits = self(ul_transcripts, ul_competences_set)
        pseudo_labels = torch.argmax(ul_logits, dim = 1)
        ul_loss = criterion(ul_logits, pseudo_labels)

        n_unlabeled = len(ul_transcripts)
        total_n_data += len(ul_transcripts)

        # LOST / COST
        alpha_t = calculate_alpha(epoch, T1, T2, alpha_f)
        training_loss = custom_loss(l_loss, ul_loss, alpha_t, n_labeled , n_unlabeled)

        training_loss.backward()
        optimizer.step()

        total_train_loss += training_loss.item()
      avg_train_loss = total_train_loss / total_n_data

      # VALIDATION
      self.model.eval()
      total_validation_loss = 0
      n_validation = 0
      with torch.no_grad():
        for validation_data in validation_loader:
          v_transcripts, v_competences_set, v_labels = validation_data
          v_labels = v_labels.to(self.device)

          v_logits = self(v_transcripts, v_competences_set)
          v_loss = criterion(v_logits, v_labels)

          total_validation_loss += v_loss.item()
          n_validation += len(v_transcripts)
      avg_validation_loss = total_validation_loss / n_validation

      print(f"Epoch {epoch+1}/{num_epochs}, Training Loss: {avg_train_loss}, Validation Loss: {avg_validation_loss}")

  def train_ladder_gamma(self, labeled_data, unlabeled_data, validation_data, batch_size, num_epochs, learning_rate):
    # NOTE
    # Kedua jalur, clean maupun noisy menggunakan model yang sama sehingga weight yang di passing via network pasti sama / sharing weight

    def add_noise(tensor, noise_level):
      if tensor.dtype == torch.long:
        noise = torch.randn(tensor.size(), device=tensor.device) * noise_level
        return (tensor.float() + noise).long()
      else:
        noise = torch.randn_like(tensor) * noise_level
        return tensor + noise

    labeled_loader = DataLoader(labeled_data, batch_size=batch_size, shuffle=True, collate_fn=LabeledDataset.collate_fn_labeled)
    unlabeled_loader = DataLoader(unlabeled_data, batch_size=batch_size, shuffle=True, collate_fn=UnlabeledDataset.collate_fn_unlabeled)
    validation_loader = DataLoader(validation_data, batch_size=batch_size, shuffle=False, collate_fn=ValidationDataset.collate_fn_validation)

    optimizer = torch.optim.SGD(self.model.parameters(), lr = learning_rate)
    criterion = nn.NLLLoss()

    noise_level = 0.1

    for epoch in range(num_epochs):
      self.model.train()

      total_train_loss = 0
      total_supervised_loss = 0
      total_unsupervised_loss = 0
      total_n_data = 0

      for labeled_data, unlabeled_data in zip(labeled_loader, unlabeled_loader):
        optimizer.zero_grad()

        # LABELED
        l_transcripts, l_competences_set, l_labels = labeled_data
        l_labels = l_labels.to(self.device)

        flattened_transcripts = []
        flattened_competences = []

        max_length = max(len(competences) for competences in l_competences_set)

        for transcript, competences in zip(l_transcripts, l_competences_set):
          for competence in competences:
            flattened_transcripts.append(transcript)
            flattened_competences.append(competence)
          # Add padding
          for _ in range(max_length - len(competences)):
            flattened_transcripts.append(transcript)
            flattened_competences.append("0")

        # Tokenize the inputs
        l_inputs = self.tokenizer(
          flattened_transcripts,
          flattened_competences,
          padding=True,
          truncation=True,
          max_length=512,
          return_tensors='pt'
        ).to(self.device)

        # CLEAN PASS - LABELED
        l_logits = self.model(**l_inputs).logits
        class_l_logits = torch.nn.functional.log_softmax(l_logits, 1)
        entail_l_logits = class_l_logits[:,0]
        reshaped_entail_l_logits = entail_l_logits.view(len(l_transcripts), max_length)

        mask = torch.tensor([
          [1 if i < len(competences) else 0 for i in range(max_length)]
          for competences in l_competences_set
        ]).to(self.device)

        reshaped_entail_l_logits = reshaped_entail_l_logits * mask + (1 - mask) * -10
        reshaped_entail_l_logits = torch.nn.functional.log_softmax(reshaped_entail_l_logits, 1)

        # CORRUPTED PASS - LABELED
        l_inputs_noisy = {key: add_noise(val, noise_level) for key, val in l_inputs.items()}
        l_logits_noisy = self.model(**l_inputs_noisy).logits
        class_l_logits_noisy =  torch.nn.functional.log_softmax(l_logits_noisy, 1)
        entail_l_logits_noisy = class_l_logits_noisy[:,0]
        reshaped_entail_l_logits_noisy = entail_l_logits_noisy.view(len(l_transcripts), max_length)

        mask = torch.tensor([
          [1 if i < len(competences) else 0 for i in range(max_length)]
          for competences in l_competences_set
        ]).to(self.device)

        reshaped_entail_l_logits_noisy = reshaped_entail_l_logits_noisy * mask + (1 - mask) * -10
        reshaped_entail_l_logits_noisy = torch.nn.functional.log_softmax(reshaped_entail_l_logits_noisy, 1)

        supervised_loss_labeled = criterion(reshaped_entail_l_logits, l_labels)
        unsupervised_loss_labeled = torch.mean((reshaped_entail_l_logits - reshaped_entail_l_logits_noisy) ** 2)

        n_labeled = len(l_transcripts)
        total_n_data += n_labeled

        # UNLABELED
        ul_transcripts, ul_competences_set = unlabeled_data

        flattened_ul_transcripts = []
        flattened_ul_competences = []

        max_length_ul = max(len(competences) for competences in ul_competences_set)

        for transcript, competences in zip(ul_transcripts, ul_competences_set):
          for competence in competences:
            flattened_ul_transcripts.append(transcript)
            flattened_ul_competences.append(competence)
          # Add padding
          for _ in range(max_length_ul - len(competences)):
            flattened_ul_transcripts.append(transcript)
            flattened_ul_competences.append("0")

        # Tokenize the inputs
        ul_inputs = self.tokenizer(
          flattened_ul_transcripts,
          flattened_ul_competences,
          padding=True,
          truncation=True,
          max_length=512,
          return_tensors='pt'
        ).to(self.device)

        # CLEAN PASS - UNLABELED
        ul_logits = self.model(**ul_inputs).logits

        # CORRUPTED PASS - UNLABELED
        ul_inputs_noisy = {key: add_noise(val, noise_level) for key, val in ul_inputs.items()}
        ul_logits_noisy = self.model(**ul_inputs_noisy).logits

        supervised_loss_unlabeled = 0
        unsupervised_loss_unlabeled = torch.mean((ul_logits - ul_logits_noisy) ** 2)

        total_supervised_loss += supervised_loss_labeled.item()
        total_unsupervised_loss += unsupervised_loss_labeled.item() + unsupervised_loss_unlabeled.item()

        total_loss =  supervised_loss_labeled + unsupervised_loss_labeled + unsupervised_loss_unlabeled

        total_loss.backward()
        optimizer.step()

        total_train_loss += total_loss.item()

      avg_train_loss = total_train_loss / total_n_data

      # VALIDATION
      self.model.eval()
      total_validation_loss = 0
      n_validation = 0
      with torch.no_grad():
        for validation_data in validation_loader:
          v_transcripts, v_competences_set, v_labels = validation_data
          v_labels = v_labels.to(self.device)

          v_logits = self(v_transcripts, v_competences_set)
          v_loss = criterion(v_logits, v_labels)

          total_validation_loss += v_loss.item()
          n_validation += len(v_transcripts)
      avg_validation_loss = total_validation_loss / n_validation

      print(f"Epoch {epoch+1}/{num_epochs}, Training Loss: {avg_train_loss}, Validation Loss: {avg_validation_loss}")
