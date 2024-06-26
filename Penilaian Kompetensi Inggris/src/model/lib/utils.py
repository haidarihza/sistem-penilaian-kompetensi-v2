import torch


def rec_setattr(obj, attr, value):
    if '.' not in attr:
        setattr(obj, attr, value)
    
    else:
        L = attr.split('.')
        rec_setattr(getattr(obj, L[0]), '.'.join(L[1:]), value)

def normalize_prob(input: torch.Tensor, dim: int=1, p=1) -> torch.Tensor:
    '''
    Normalize the given tensor along the given dimension.

    Args:
        input (torch.Tensor): The probability tensor.
        dim (int): The dimension to normalize. Default is 1.
        p: The norm to use. Must be integer or "softmax". If int, it is the power of the norm. Default is 1.

    Returns:
        torch.Tensor: The normalized probability distribution tensor.

    Raises:
        NotImplementedError: If the norm type is not implemented.
    '''

    if type(p) == int:
        return input / torch.norm(input, p=p, dim=dim, keepdim=True)
    
    elif p == 'softmax':
        return torch.nn.functional.softmax(input, dim=dim)

    else:
        raise NotImplementedError(f"Norm type {p} is not implemented.")
        
def reshape_with_padding_2d(input: torch.Tensor, input_mask_2d: torch.Tensor, pad_value: float = 0) -> torch.Tensor:
    '''
    Reshape the first dimension of the input tensor with the given 2D mask tensor.

    Args:
        input (torch.Tensor): The input tensor.
        input_mask_2d (torch.Tensor): The 2D mask tensor.
        pad_value (float): The padding value. Default is 0.

    Returns:
        torch.Tensor: The reshaped tensor.
    '''
    
    k = 0
    output_size = input_mask_2d.size() + input.size()[1:]
    output = torch.full(output_size, pad_value, dtype=input.dtype, device=input.device)

    for i in range(input_mask_2d.size(0)):
        for j in range(input_mask_2d.size(1)):
            if input_mask_2d[i, j] == 1:
                output[i, j] = input[k]
                k += 1
    
    return output

