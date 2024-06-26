from batchbald_redux.consistent_mc_dropout import *

from src.model.lib.competence_model import *
from src.model.lib import utils


class BayesianCompetenceModel(BayesianModule):
    def __init__(self, competence_model: CompetenceModel):
        super().__init__()
        self.competence_model = competence_model
        self.device = competence_model.device
        BayesianCompetenceModel.transform_dropout(self.competence_model.model)

    @staticmethod
    def load(model_path: str, type: str, state_dict_path: str=None, device='cpu'):
        competence_model = CompetenceModel.load(model_path, type, state_dict_path, device)
        return BayesianCompetenceModel(competence_model)
    
    def forward(self, *args, type: str='set', **kwargs) -> torch.Tensor:
        if type == 'single':
            return self.forward_single(*args, **kwargs)
        elif type == 'set':
            return self.forward_set(*args, **kwargs)
        else:
            raise ValueError("Forward type should be either 'single' or 'set'.")
    
    def forward_single(self, transcripts: list[str], competences: list[str], k: int, **kwargs):
        BayesianModule.k = k
        transcripts = BayesianCompetenceModel.mc_list(transcripts, k)
        competences = BayesianCompetenceModel.mc_list(competences, k)
        
        prob = self.competence_model(transcripts, competences, type='single', tokenizer_padding='max_length', **kwargs)
        prob = BayesianModule.unflatten_tensor(prob, k)

        return prob

    def forward_set(self, transcripts: list[str], competence_sets: list[list[str]], k: int, **kwargs):
        lc_list = [len(competences) for competences in competence_sets]
        max_lc = max(lc_list)
        lc_mask = torch.tensor([[1] * lc + [0] * (max_lc - lc) for lc in lc_list], device=self.device)

        transcripts = [transcript for i, transcript in enumerate(transcripts) for _ in range(lc_list[i])]
        competences = [competence for competences in competence_sets for competence in competences]
        
        prob = self(transcripts, competences, k, type='single', **kwargs)
        prob = utils.reshape_with_padding_2d(prob, lc_mask, pad_value=0)
        prob = prob.transpose(1, 2)
        prob = utils.normalize_prob(prob, dim=2, p=1)
        prob = torch.clamp(prob, min=1e-100)

        return prob

    @staticmethod
    def transform_dropout(model, custom_prob_names: dict={'StableDropout': 'drop_prob'}):
        for name, layer in model.named_modules():
            if not name.endswith('dropout'):
                continue

            if name.endswith('pos_dropout'):  # for deBERTa
                continue

            if type(layer).__name__.endswith('ConsistentMCDropout'):
                continue

            try:
                for module_name, attr_name in custom_prob_names.items():
                    if type(layer).__name__.endswith(module_name):
                        p = getattr(layer, attr_name)
                        break
                else:
                    p = getattr(layer, 'p')

            except:
                raise AttributeError(f'Failed to get probability attribute from {layer.__class__}')

            utils.rec_setattr(model, name, ConsistentMCDropout(p))

        return model
    
    @staticmethod
    def mc_list(input: list, k: int):
        arr = [None for _ in range(len(input) * k)]
        for i in range(k):
            arr[i::k] = input
        return arr
