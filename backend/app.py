# app.py
from flask import Flask, request, Response, jsonify
from flask_cors import CORS
import json, time
from model_manager import ModelManager
from sampler import sample_from_logits
import torch
import torch.nn.functional as F
import numpy as np

app = Flask(__name__)
CORS(app)

# Load model once
MM = ModelManager(model_name="distilgpt2").load()
tokenizer = MM.tokenizer
model = MM.model
device = MM.device

@app.route("/models/info", methods=["GET"])
def models_info():
    return jsonify(MM.info())

@app.route("/tokenize", methods=["POST"])
def tokenize_text():
    """Tokenize input text and return detailed token information"""
    try:
        data = request.get_json()
        text = data.get("text", "")
        
        # Tokenize using encode to get token IDs
        token_ids = tokenizer.encode(text)
        
        # Create detailed token info
        token_info = []
        tokens = []
        for i, token_id in enumerate(token_ids):
            decoded = tokenizer.decode([token_id])
            tokens.append(decoded)
            token_info.append({
                "position": i,
                "token": decoded,
                "token_id": token_id,
                "decoded": decoded
            })
        
        return jsonify({
            "original_text": text,
            "tokens": tokens,
            "token_ids": token_ids,
            "token_info": token_info,
            "vocab_size": len(tokenizer)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/embeddings", methods=["POST"])
def get_embeddings():
    """Get token embeddings and positional encodings"""
    try:
        data = request.get_json()
        text = data.get("text", "")
        
        if not text.strip():
            return jsonify({"error": "Empty text provided"}), 400
        
        # Tokenize and get embeddings
        input_ids = tokenizer.encode(text, return_tensors="pt")
        if device != "cpu":
            input_ids = input_ids.to(device)
        
        with torch.no_grad():
            # Get embeddings from the model
            embeddings = model.transformer.wte(input_ids)  # Word token embeddings
            
            # Create position indices
            seq_len = input_ids.size(1)
            position_ids = torch.arange(seq_len, dtype=torch.long)
            if device != "cpu":
                position_ids = position_ids.to(device)
            
            pos_embeddings = model.transformer.wpe(position_ids)  # Positional embeddings
            
            # Combined embeddings
            combined_embeddings = embeddings + pos_embeddings.unsqueeze(0)
        
        # Convert to numpy for JSON serialization
        embeddings_np = embeddings.cpu().numpy().tolist()
        pos_embeddings_np = pos_embeddings.cpu().numpy().tolist()
        combined_np = combined_embeddings.cpu().numpy().tolist()
        
        # Get tokens by decoding each token ID
        tokens = [tokenizer.decode([token_id.item()]) for token_id in input_ids[0]]
        
        return jsonify({
            "tokens": tokens,
            "token_embeddings": embeddings_np[0],  # Remove batch dimension
            "positional_embeddings": pos_embeddings_np,
            "combined_embeddings": combined_np[0],
            "embedding_dim": int(embeddings.size(-1))
        })
    except Exception as e:
        print(f"Embeddings error: {e}")
        return jsonify({"error": f"Embeddings failed: {str(e)}"}), 500

@app.route("/attention", methods=["POST"])
def get_attention():
    """Get attention weights from the model"""
    try:
        data = request.get_json()
        text = data.get("text", "")
        
        if not text.strip():
            return jsonify({"error": "Empty text provided"}), 400
        
        input_ids = tokenizer.encode(text, return_tensors="pt")
        if device != "cpu":
            input_ids = input_ids.to(device)
            
        tokens = [tokenizer.decode([token_id.item()]) for token_id in input_ids[0]]
        
        try:
            # Temporarily enable attention output
            original_output_attentions = model.config.output_attentions
            model.config.output_attentions = True
            
            with torch.no_grad():
                outputs = model(input_ids, output_attentions=True, return_dict=True)
                attentions = outputs.attentions  # List of attention tensors for each layer
            
            # Restore original setting
            model.config.output_attentions = original_output_attentions
            
            if attentions is None or len(attentions) == 0:
                raise Exception("No attention weights returned")
            
            # Process attention weights
            attention_data = []
            
            for layer_idx, attention in enumerate(attentions):
                if attention is None:
                    continue
                    
                # attention shape: [batch_size, num_heads, seq_len, seq_len]
                attention_np = attention.cpu().numpy()[0]  # Remove batch dimension
                
                layer_data = {
                    "layer": layer_idx,
                    "num_heads": int(attention_np.shape[0]),
                    "attention_weights": attention_np.tolist(),
                    "average_attention": attention_np.mean(axis=0).tolist()  # Average across heads
                }
                attention_data.append(layer_data)
            
            return jsonify({
                "tokens": tokens,
                "attention_layers": attention_data,
                "num_layers": len(attention_data)
            })
            
        except Exception as attention_error:
            print(f"Attention extraction failed: {attention_error}")
            # Fallback: create dummy attention data
            seq_len = len(tokens)
            dummy_attention = [[0.1 if i == j else 0.05 for j in range(seq_len)] for i in range(seq_len)]
            
            return jsonify({
                "tokens": tokens,
                "attention_layers": [{
                    "layer": 0,
                    "num_heads": 1,
                    "attention_weights": [dummy_attention],
                    "average_attention": dummy_attention
                }],
                "num_layers": 1,
                "note": "Attention extraction not supported, showing dummy data"})
          
            
    except Exception as e:
        print(f"Attention error: {e}")
        return jsonify({"error": f"Attention failed: {str(e)}"}), 500

@app.route("/logits", methods=["POST"])
def get_logits():
    """Get logits and probability distribution for next token prediction"""
    try:
        data = request.get_json()
        text = data.get("text", "")
        temperature = float(data.get("temperature", 1.0))
        top_k = int(data.get("top_k", 50))
        top_p = float(data.get("top_p", 0.9))
        
        if not text.strip():
            return jsonify({"error": "Empty text provided"}), 400
        
        input_ids = tokenizer.encode(text, return_tensors="pt")
        if device != "cpu":
            input_ids = input_ids.to(device)
        
        with torch.no_grad():
            outputs = model(input_ids)
            logits = outputs.logits[0, -1, :]  # Last token logits
        
        # Apply temperature
        scaled_logits = logits / max(temperature, 1e-8)
        
        # Get probabilities
        probs = F.softmax(scaled_logits, dim=-1)
        
        # Get top tokens
        top_probs, top_indices = torch.topk(probs, min(100, len(probs)))
        
        # Create token probability data
        token_probs = []
        for prob, idx in zip(top_probs, top_indices):
            token = tokenizer.decode([idx.item()])
            token_probs.append({
                "token": token,
                "token_id": int(idx.item()),
                "probability": float(prob.item()),
                "logit": float(logits[idx].item())
            })
        
        # Sample next token - pass logits as 1D tensor
        next_token_id, _ = sample_from_logits(
            logits, temperature, top_k, top_p, do_sample=True
        )
        next_token = tokenizer.decode([next_token_id])
        
        return jsonify({
            "input_text": text,
            "next_token": next_token,
            "next_token_id": int(next_token_id),
            "top_tokens": token_probs,
            "temperature": float(temperature),
            "vocab_size": len(tokenizer)
        })
    except Exception as e:
        print(f"Logits error: {e}")
        return jsonify({"error": f"Logits failed: {str(e)}"}), 500


# ---------------------------------------------------
# FIXED STREAMING GENERATOR
# ---------------------------------------------------
def event_stream(prompt, temperature, max_tokens):
    tokenizer = MM.tokenizer
    model = MM.model

    # Encode prompt
    input_ids = tokenizer.encode(prompt, return_tensors="pt").to(model.device)

    # Initial forward pass (no past yet)
    outputs = model(input_ids, use_cache=True)
    past = outputs.past_key_values

    # Next token begins from end of prompt
    next_token = input_ids[0, -1].unsqueeze(0)

    generated_text = tokenizer.decode(input_ids[0])

    # Send initial prompt to frontend
    yield f"data: {json.dumps({'token': '', 'text': generated_text})}\n\n"

    for _ in range(max_tokens):

        # Only pass last token + KV cache
        outputs = model(next_token.unsqueeze(0), past_key_values=past, use_cache=True)

        logits = outputs.logits[:, -1, :]
        past = outputs.past_key_values

        # Temperature
        logits = logits / max(temperature, 1e-8)
        probs = torch.softmax(logits, dim=-1)

        # FIXED → remove batch dimension
        next_token = torch.multinomial(probs[0], num_samples=1)
        token_id = next_token.item()


        # Decode token + append to full text
        token_str = tokenizer.decode([token_id])
        generated_text += token_str

        # Stream to frontend
        yield f"data: {json.dumps({'token': token_str, 'text': generated_text})}\n\n"

        if token_id == tokenizer.eos_token_id:
            break

    # Send "done" message with full generated text
    final = {
        "event": "done",
        "final_text": generated_text
    }
    yield f"data: {json.dumps(final)}\n\n"


@app.route("/generate", methods=["POST"])
def generate():

    body = request.get_json(force=True)
    prompt = body.get("prompt", "")
    temperature = float(body.get("temperature", 1.0))
    max_tokens = int(body.get("max_new_tokens", 50))

    return Response(
        event_stream(prompt, temperature, max_tokens),
        mimetype="text/event-stream"
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False, threaded=True)
