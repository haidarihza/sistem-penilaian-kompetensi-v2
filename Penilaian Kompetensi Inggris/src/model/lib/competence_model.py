from transformers import AutoTokenizer, AutoModel, AutoModelForSequenceClassification
from typing import Optional

from src.model.lib.tc_dataset import TCDataset
from src.model.lib import utils

import torch


class CompetenceModel(torch.nn.Module):
    def __init__(self, model, tokenizer, device):
        super().__init__()
        self.device = device
        self.model = model.to(self.device)
        self._tokenizer = tokenizer

    @staticmethod
    def load(model_path: str, type: str, state_dict_path: str=None, device='cpu') -> "CompetenceModel":
        '''
        Load the model from the given path and return the model instance.

        Args:
            model_path (str): The path to the model.
            type (str): The type of the model. It should be either 'biencoder' or 'crossencoder'.
            state_dict_path (str): The path to the state dict. Default is None.
            device (str): The device to use. Default is 'cpu'.

        Returns:
            CompetenceModel: The model instance.
        '''

        tokenizer = AutoTokenizer.from_pretrained(model_path)

        if type == 'biencoder':
            model = AutoModel.from_pretrained(model_path)
            competence_model = BiEncoder(model, tokenizer, device)

        elif type == 'crossencoder':
            model = AutoModelForSequenceClassification.from_pretrained(model_path)
            competence_model = CrossEncoder(model, tokenizer, device)

        else:
            raise NotImplementedError("Model type is only implemented for biencoder and crossencoder")
        
        if state_dict_path:
            competence_model.load_state_dict(torch.load(state_dict_path), strict=False)

        return competence_model
    
    def save_state_dict(self, state_dict_path: str) -> None:
        torch.save(self.state_dict(), state_dict_path)

    def tokenizer(self, *args, **kwargs):
        '''
        Tokenize the given arguments and return the tokenized tensors.
        Default options are padding=True, truncation=True, and return_tensors='pt'.
        '''

        kwargs.setdefault('padding', True)
        kwargs.setdefault('truncation', True)
        kwargs.setdefault('return_tensors', 'pt')
        return self._tokenizer(*args, **kwargs).to(self.device)
    
    def forward(self, *args, type: str='set', **kwargs) -> torch.Tensor:
        '''
        Forward pass of the model.
        Forward type should be either 'single' or 'set'.

        Args:
            type (str): The type of the forward pass. Default is 'set'.
        '''

        if type == 'single':
            return self.forward_single(*args, **kwargs)
        elif type == 'set':
            return self.forward_set(*args, **kwargs)
        else:
            raise ValueError("Forward type should be either 'single' or 'set'.")

    def forward_single(self, transcripts: list[str], competences: list[str], **kwargs) -> torch.Tensor:
        '''
        Forward pass of the model for each transcript and competence pair.

        Args:
            transcripts (list[str]): The list of transcripts.
            competences (list[str]): The list of competences.

        Returns:
            torch.Tensor: The predicted probabilities from each pair.
        '''

        assert len(transcripts) == len(competences)
        raise NotImplementedError
    
    def forward_set(self, transcripts: list[str], competence_sets: list[list[str]], **kwargs) -> torch.Tensor:
        '''
        Forward pass of the model for each transcript and set of competences.

        Args:
            transcripts (list[str]): The list of transcripts.
            competence_sets (list[list[str]]): The list of sets of competences.

        Returns:
            torch.Tensor: The predicted probabilities from each transcript across the set of competences.
        '''

        assert len(transcripts) == len(competence_sets)

        lc_list = [len(competences) for competences in competence_sets]
        max_lc = max(lc_list)
        lc_mask = torch.tensor([[1] * lc + [0] * (max_lc - lc) for lc in lc_list], device=self.device)

        transcripts = [transcript for i, transcript in enumerate(transcripts) for _ in range(lc_list[i])]
        competences = [competence for competences in competence_sets for competence in competences]

        prob = self(transcripts, competences, type='single', **kwargs)
        prob = utils.reshape_with_padding_2d(prob, lc_mask, pad_value=0)
        prob = utils.normalize_prob(prob, dim=1, p=1)
        prob = torch.clamp(prob, min=1e-100)

        return prob

    def fit(self, train_dataset: TCDataset, eval_dataset: Optional[TCDataset], epochs: int, batch_size: int, 
            optimizer: type[torch.optim.Optimizer]=torch.optim.Adam, optimizer_params: dict={'lr': 2e-5},
            early_stop: bool=True) -> None:
        '''
        Fit the model with the given arguments.

        Args:
            train_dataset (TCDataset): The training dataset.
            eval_dataset (TCDataset): The evaluation dataset.
            epochs (int): The number of epochs.
            batch_size (int): The batch size.
            optimizer (type[torch.optim.Optimizer]): The optimizer class.
            optimizer_param (dict): The optimizer parameters.
        '''

        has_eval = eval_dataset and len(eval_dataset) > 0

        train_dataloader = torch.utils.data.DataLoader(train_dataset, batch_size=batch_size, shuffle=True, collate_fn=TCDataset.collate_fn)
        
        if has_eval:
            eval_dataloader = torch.utils.data.DataLoader(eval_dataset, batch_size=batch_size, shuffle=False, collate_fn=TCDataset.collate_fn)
        
        optimizer = optimizer(self.parameters(), **optimizer_params)
        loss_fn = torch.nn.NLLLoss(reduction='sum')

        class EarlyStopping:
            def __init__(self, patience, delta):
                '''
                Args:
                    patience (int): How long to wait after last time validation loss improved.
                    delta (float): Minimum change in the monitored quantity to qualify as an improvement.
                '''

                self.patience = patience
                self.delta = delta
                self.counter = 0
                self.early_stop = False
                self.val_loss_min = float('inf')

            def __call__(self, val_loss):
                if val_loss < self.val_loss_min - self.delta:
                    self.val_loss_min = val_loss
                    self.counter = 0
                
                else:
                    self.counter += 1
                    if self.counter >= self.patience:
                        self.early_stop = True
        
        early_stopping = EarlyStopping(patience=5, delta=0)
        
        for epoch in range(epochs):
            print(f"Epoch {epoch+1} | ", end='', flush=True)

            train_loss = 0
            train_acc = 0
            self.train()

            for transcripts, competence_sets, label_indices in train_dataloader:
                label_indices = label_indices.to(self.device)
                
                optimizer.zero_grad()

                prob = self(transcripts, competence_sets)
                log_prob = torch.log(prob)
                loss = loss_fn(log_prob, label_indices)

                loss.backward()
                optimizer.step()
                
                train_loss += loss.item()
                train_acc += torch.sum(torch.argmax(prob, dim=1) == label_indices).item()
            
            train_loss = train_loss / len(train_dataloader.dataset)
            train_acc = train_acc / len(train_dataloader.dataset)

            if not has_eval:
                print(f"Train Loss = {train_loss:.4f} | Train Acc = {train_acc:.4f}")
                early_stopping(train_loss)
                if early_stop and early_stopping.early_stop:
                    print(f"Early stopped at epoch {epoch + 1}")
                    break
                continue

            print(f"Train Loss = {train_loss:.4f} | Train Acc = {train_acc:.4f} | ", end='', flush=True)

            with torch.no_grad():
                val_loss = 0
                val_acc = 0
                self.eval()

                for transcripts, competence_sets, label_indices in eval_dataloader:
                    prob = self(transcripts, competence_sets)
                    log_prob = torch.log(prob)
                    label_indices = label_indices.to(self.device)
                    loss = loss_fn(log_prob, label_indices)

                    val_loss += loss.item()
                    val_acc += torch.sum(torch.argmax(prob, dim=1) == label_indices).item()
                
                val_loss = val_loss / len(eval_dataloader.dataset)
                val_acc = val_acc / len(eval_dataloader.dataset)

                print(f"Val Loss = {val_loss:.4f} | Val Acc = {val_acc:.4f}")
            
            early_stopping(val_loss)
            if early_stop and early_stopping.early_stop:
                print(f"Early stopped at epoch {epoch + 1}")
                break
            
        self.eval()


class BiEncoder(CompetenceModel):
    def __init__(self, model, tokenizer, device='cpu'):
        super().__init__(model, tokenizer, device)
    
    def forward_single(self, transcripts: list[str], competences: list[str], tokenizer_padding=True) -> torch.Tensor:
        assert len(transcripts) == len(competences)

        features_t = self.tokenizer(transcripts, padding=tokenizer_padding)
        features_c = self.tokenizer(competences, padding=tokenizer_padding)

        embeddings_t = self.model(**features_t)
        embeddings_c = self.model(**features_c)

        embeddings_t = self.pooling(embeddings_t, features_t['attention_mask'])
        embeddings_c = self.pooling(embeddings_c, features_c['attention_mask'])

        prob = torch.nn.functional.cosine_similarity(embeddings_t, embeddings_c, dim=1)
        prob = torch.clamp(prob, min=0)

        return prob

    @staticmethod
    def pooling(model_output, attention_mask: torch.Tensor) -> torch.Tensor:
        '''
        Pool the model output using the attention mask with normalized mean pooling.

        Args:
            model_output (torch.Tensor): The model output tensor.
            attention_mask (torch.Tensor): The attention mask tensor.

        Returns:
            torch.Tensor: The pooled embeddings.
        '''

        token_embeddings = model_output[0]
        input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
        pooled_embeddings = torch.sum(token_embeddings * input_mask_expanded, 1) / torch.clamp(input_mask_expanded.sum(1), min=1e-9)
        return torch.nn.functional.normalize(pooled_embeddings, p=2, dim=1)


class CrossEncoder(CompetenceModel):
    def __init__(self, model, tokenizer, device='cpu'):
        super().__init__(model, tokenizer, device)
    
    def forward_single(self, transcripts: list[str], competences: list[str], tokenizer_padding=True) -> torch.Tensor:
        assert len(transcripts) == len(competences)

        features = self.tokenizer(transcripts, competences, padding=tokenizer_padding)
        logits = self.model(**features).logits
        prob = torch.nn.functional.softmax(logits, dim=1)

        return prob[:, 1]

