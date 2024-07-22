from batchbald_redux import batchbald
import torch


def get_random_batch(N: int, batch_size: int) -> batchbald.CandidateBatch:
    batch_size = min(batch_size, N)
    candidate_indices = torch.randperm(N)[:batch_size]
    return batchbald.CandidateBatch(None, candidate_indices.tolist())

def get_powerbald_batch(log_probs_N_K_C: torch.Tensor, batch_size: int, alpha: float=5.0) -> batchbald.CandidateBatch:
    N = log_probs_N_K_C.size(0)
    batch_size = min(batch_size, N)

    with torch.no_grad():
        scores_N = compute_bald_scores(log_probs_N_K_C)
        probs_dist_N = scores_N.pow(alpha)
        n_probs_dist_N = probs_dist_N / torch.sum(probs_dist_N)
    
    candidate_indices = torch.multinomial(n_probs_dist_N, batch_size)
    candidate_probs = n_probs_dist_N[candidate_indices]

    return batchbald.CandidateBatch(candidate_probs.tolist(), candidate_indices.tolist())

def compute_bald_scores(log_probs_N_K_C: torch.Tensor) -> torch.Tensor:
    return batchbald.compute_entropy(log_probs_N_K_C) - batchbald.compute_conditional_entropy(log_probs_N_K_C)
