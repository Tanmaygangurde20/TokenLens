# sampler.py
import torch
import torch.nn.functional as F
import numpy as np
from typing import Tuple

def softmax_probs(logits: torch.Tensor, temperature: float = 1.0) -> torch.Tensor:
    if temperature <= 0:
        temperature = 1e-8
    scaled = logits / temperature
    return F.softmax(scaled, dim=-1)

def top_k_logits(logits: torch.Tensor, k: int) -> torch.Tensor:
    if k <= 0:
        return logits
    values, _ = torch.topk(logits, k)
    min_value = values[-1]
    mask = logits < min_value
    logits = logits.clone()
    logits[mask] = -float("inf")
    return logits

def top_p_logits(logits: torch.Tensor, p: float) -> torch.Tensor:
    if p <= 0.0 or p >= 1.0:
        return logits
    
    # Ensure logits is 1D
    original_shape = logits.shape
    if logits.dim() > 1:
        logits = logits.view(-1)
    
    sorted_logits, sorted_idx = torch.sort(logits, descending=True)
    sorted_probs = F.softmax(sorted_logits, dim=-1)
    cumulative_probs = torch.cumsum(sorted_probs, dim=-1)
    cutoff = cumulative_probs > p
    
    if cutoff.any():
        first_cut = cutoff.nonzero(as_tuple=True)[0][0].item()
        sorted_logits[first_cut+1:] = -float('inf')
    
    # Create filtered logits with proper indexing
    filtered = torch.full_like(logits, -float('inf'))
    filtered.scatter_(0, sorted_idx, sorted_logits)
    
    return filtered.view(original_shape)

def sample_from_logits(logits: torch.Tensor, temperature: float, top_k: int, top_p: float, do_sample: bool) -> Tuple[int, np.ndarray]:
    # Ensure logits is the right shape - should be 1D for sampling
    if logits.dim() > 1:
        logits = logits.squeeze()
    
    logits = logits.clone()
    
    if top_k > 0:
        logits = top_k_logits(logits, top_k)
    if 0.0 < top_p < 1.0:
        logits = top_p_logits(logits, top_p)
    
    probs = softmax_probs(logits, temperature=temperature)
    probs_np = probs.cpu().numpy()
    
    if do_sample:
        # Ensure probs is 1D for multinomial
        if probs.dim() > 1:
            probs = probs.squeeze()
        next_token = torch.multinomial(probs, num_samples=1)
        token_id = int(next_token.item())
    else:
        token_id = int(torch.argmax(probs).item())
    
    return token_id, probs_np
