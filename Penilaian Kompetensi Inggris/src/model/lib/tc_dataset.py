import torch


class TCDataset(torch.utils.data.Dataset):
    def __init__(self, transcripts: list[str], competence_sets: list[list[str]], label_indices: list[int]):
        assert len(transcripts) == len(competence_sets) == len(label_indices)
        
        self.transcripts = transcripts
        self.competence_sets = competence_sets
        self.label_indices = torch.tensor(label_indices)

    def __len__(self):
        return len(self.transcripts)

    def __getitem__(self, idx):
        return self.transcripts[idx], self.competence_sets[idx], self.label_indices[idx]
    
    @staticmethod
    def collate_fn(batch):
        transcripts, competence_sets, label_indices = zip(*batch)
        return list(transcripts), list(competence_sets), torch.tensor(label_indices)
