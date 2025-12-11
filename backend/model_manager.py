# model_manager.py
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

class ModelManager:
    def __init__(self, model_name: str = "distilgpt2", device: str = None):
        """
        Uses ONLY public models. If a wrong model name is passed,
        it safely falls back to distilgpt2 without requiring login.
        """
        self.requested_model = model_name
        self.model_name = model_name
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = None
        self.model = None

    def load(self):
        """
        Attempts to load the requested model.
        If HuggingFace blocks it (private repo / unauthorized), 
        fallback to distilgpt2 automatically.
        """
        try:
            # Try loading the requested model
            self.tokenizer = AutoTokenizer.from_pretrained(self.requested_model, use_fast=True)
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token

            self.model = AutoModelForCausalLM.from_pretrained(self.requested_model)
            self.model.to(self.device)
            self.model.eval()

            print(f"✅ Loaded model: {self.requested_model}")
            return self

        except Exception as e:
            print(f"⚠️ Failed to load '{self.requested_model}'. Reason: {e}")
            print("➡️ Falling back to safe public model: distilgpt2")

            # Fallback to distilgpt2 (always public)
            self.model_name = "distilgpt2"
            self.tokenizer = AutoTokenizer.from_pretrained("distilgpt2", use_fast=True)

            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token

            self.model = AutoModelForCausalLM.from_pretrained("distilgpt2")
            self.model.to(self.device)
            self.model.eval()

            print("✅ Loaded fallback model: distilgpt2")
            return self

    def info(self):
        cfg = self.model.config
        return {
            "model_name": self.model_name,
            "device": self.device,
            "vocab_size": len(self.tokenizer),
            "n_layer": getattr(cfg, "n_layer", None),
            "n_head": getattr(cfg, "n_head", None),
            "n_embd": getattr(cfg, "n_embd", None),
        }
