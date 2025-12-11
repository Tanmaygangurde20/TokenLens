FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV HF_HUB_DISABLE_TELEMETRY=1
ENV TRANSFORMERS_CACHE=/root/.cache/huggingface
ENV HF_HOME=/root/.cache/huggingface

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential git && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY app.py .
COPY model_manager.py .
COPY sampler.py .
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Pre-download model to avoid runtime downloads
RUN python3 - <<EOF
from transformers import AutoTokenizer, AutoModelForCausalLM
AutoTokenizer.from_pretrained("distilgpt2")
AutoModelForCausalLM.from_pretrained("distilgpt2")
EOF

EXPOSE 7860

CMD ["python", "app.py"]
