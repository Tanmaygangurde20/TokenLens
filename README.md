# TokenLens: LLM Text Generation & Sampling Simulator

## 🎯 Project Overview
Live Link : https://tokenlensllm.netlify.app/
TokenLens is an educational tool that visualizes how Large Language Models (LLMs) process text internally and generate responses. It provides step-by-step visualization of tokenization, embeddings, attention mechanisms, and sampling algorithms to help users understand transformer architecture.

## 🏗️ Architecture

### Backend (Flask + PyTorch)
- **Model Manager**: Handles GPT-2/DistilGPT-2 model loading and management
- **Tokenization Engine**: Breaks text into subword tokens using BPE
- **Embedding Visualizer**: Shows token and positional embeddings
- **Attention Analyzer**: Extracts and visualizes multi-head attention weights
- **Sampling Engine**: Implements various sampling strategies (Greedy, Temperature, Top-K, Top-P)
- **Streaming Generator**: Real-time token-by-token text generation

### Frontend (React + Tailwind + Recharts)
- **Interactive Controls**: User-friendly sliders and inputs for model parameters
- **Real-time Visualization**: Charts and graphs showing model internals
- **Step-by-step Explanations**: Beginner-friendly descriptions of each process
- **Responsive Design**: Works on desktop and mobile devices

## 🔧 Key Features

### 1. Tokenization Visualization
- Shows how text is broken into BPE tokens
- Displays token IDs and vocabulary mappings
- Interactive token highlighting

### 2. Embedding Analysis
- Visualizes 768-dimensional token embeddings as bar charts
- Shows positional encodings and their mathematical basis
- Displays combined embeddings (token + position)

### 3. Attention Mechanism
- Multi-head attention heatmaps for each transformer layer
- Interactive attention weight exploration
- Shows which tokens the model "pays attention to"

### 4. Probability Distribution
- Real-time logits and softmax probability visualization
- Top-K and Top-P filtering effects
- Temperature scaling impact on distribution shape

### 5. Sampling Algorithms
- **Greedy**: Always picks highest probability token
- **Temperature**: Controls randomness (0.1 = conservative, 2.0 = creative)
- **Top-K**: Limits choices to K most likely tokens
- **Top-P (Nucleus)**: Cumulative probability threshold sampling

### 6. Autoregressive Generation
- Token-by-token generation with visual feedback
- Shows why short inputs can produce long outputs
- Real-time streaming with WebSocket-like EventSource

## 📊 Educational Value

### For Beginners
- Plain English explanations of complex concepts
- Visual representations of mathematical operations
- Interactive exploration without coding knowledge

### For ML Engineers
- Debugging tool for understanding model behavior
- Parameter tuning visualization
- Attention pattern analysis for interpretability

### For Educators
- Teaching aid for transformer architecture
- Hands-on demonstration of LLM internals
- Customizable examples and scenarios

## 🚀 Technical Implementation

### Backend Endpoints
```
GET  /models/info     - Model configuration and stats
POST /tokenize        - Text tokenization with detailed info
POST /embeddings      - Token and positional embeddings
POST /attention       - Multi-layer attention weights
POST /logits          - Probability distributions and sampling
POST /generate        - Streaming text generation
```

### Frontend Components
```
App.jsx              - Main application layout
PromptForm.jsx       - Input controls and parameters
TokenViewer.jsx      - Tokenization visualization
EmbeddingChart.jsx   - Embedding vector displays
AttentionHeatmap.jsx - Attention weight heatmaps
ProbabilityChart.jsx - Token probability distributions
StreamViewer.jsx     - Real-time generation display
ExplanationPanel.jsx - Educational content
```

## 🎨 UI/UX Design Principles

### Beginner-Friendly
- Clean, uncluttered interface
- Progressive disclosure of complexity
- Contextual help and tooltips
- Color-coded visualizations

### Interactive Learning
- Immediate visual feedback
- Adjustable parameters with real-time updates
- Step-by-step guided tours
- Exportable results for further study

### Responsive Design
- Mobile-first approach
- Flexible grid layouts
- Scalable vector graphics
- Touch-friendly controls

## 📈 Visualization Types

### 1. Bar Charts (Recharts)
- Token probability distributions
- Embedding vector components
- Layer-wise attention averages

### 2. Heatmaps
- Attention weight matrices
- Token-to-token relationships
- Multi-head attention patterns

### 3. Line Charts
- Temperature effect on probability curves
- Generation progress over time
- Sampling algorithm comparisons

### 4. Interactive Elements
- Hoverable tokens with detailed info
- Clickable attention cells
- Draggable parameter sliders

## 🔬 Mathematical Foundations

### Transformer Architecture
```
Attention(Q,K,V) = softmax(QK^T/√d)V
MultiHead = Concat(head₁,...,headₕ)W^O
LayerNorm(x) = γ(x-μ)/σ + β
```

### Sampling Mathematics
```
Temperature: p'ᵢ = exp(zᵢ/T) / Σⱼexp(zⱼ/T)
Top-K: Keep only K highest probability tokens
Top-P: Keep tokens until cumulative probability ≥ P
```

### Positional Encoding
```
PE(pos,2i) = sin(pos/10000^(2i/d))
PE(pos,2i+1) = cos(pos/10000^(2i/d))
```

## 🎯 Learning Objectives

After using TokenLens, users will understand:

1. **How text becomes numbers** (tokenization)
2. **How models represent meaning** (embeddings)
3. **How attention works** (Q/K/V matrices)
4. **How randomness is controlled** (sampling)
5. **Why short inputs create long outputs** (autoregression)
6. **How to tune model behavior** (parameters)

## 🔧 Installation & Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🎓 Educational Use Cases

### Computer Science Courses
- Natural Language Processing
- Machine Learning
- Deep Learning
- AI Ethics and Interpretability

### Self-Learning
- Understanding transformer papers
- Debugging LLM applications
- Exploring model behavior
- Building intuition for AI systems

### Research Applications
- Model interpretability studies
- Attention pattern analysis
- Sampling strategy comparison
- Educational tool development

## 🚀 Future Enhancements

### Advanced Features
- Support for larger models (GPT-3.5, Llama)
- Custom model fine-tuning visualization
- Batch processing capabilities
- Advanced interpretability metrics

### Educational Improvements
- Guided tutorials and lessons
- Quiz mode for learning verification
- Comparison between different models
- Export functionality for presentations

### Technical Upgrades
- WebGL-accelerated visualizations
- Real-time collaboration features
- Cloud deployment options
- API for educational platforms

## 📝 Conclusion

TokenLens bridges the gap between theoretical understanding and practical implementation of transformer models. By providing interactive visualizations and beginner-friendly explanations, it makes complex AI concepts accessible to learners at all levels while serving as a powerful debugging and analysis tool for practitioners.

The combination of real-time visualization, mathematical accuracy, and educational design makes TokenLens an invaluable resource for anyone seeking to understand how modern language models work under the hood.
