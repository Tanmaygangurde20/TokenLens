import React, { useState, useEffect } from "react";
import PromptForm from "./components/PromptForm";
import TokenViewer from "./components/TokenViewer";
import EmbeddingChart from "./components/EmbeddingChart";
import AttentionHeatmap from "./components/AttentionHeatmap";
import ProbabilityChart from "./components/ProbabilityChart";
import StreamViewer from "./components/StreamViewer";
import ExplanationPanel from "./components/ExplanationPanel";

export default function App() {
  const [config, setConfig] = useState({
    prompt: "The future of artificial intelligence is",
    temperature: 0.8,
    top_k: 40,
    top_p: 0.9,
    max_new_tokens: 60,
    do_sample: true
  });

  const [currentStep, setCurrentStep] = useState("overview");
  const [analysisData, setAnalysisData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoAnalyze, setAutoAnalyze] = useState(true);

  const steps = [
    { id: "overview", name: "📊 Overview", description: "See all analysis at once", icon: "📊" },
    { id: "tokenize", name: "🔤 Tokenization", description: "Break text into tokens", icon: "🔤" },
    { id: "embeddings", name: "🎯 Embeddings", description: "Convert tokens to vectors", icon: "🎯" },
    { id: "attention", name: "👁️ Attention", description: "Find token relationships", icon: "👁️" },
    { id: "probabilities", name: "🎲 Probabilities", description: "Calculate next token odds", icon: "🎲" },
    { id: "generate", name: "✨ Generate", description: "Create new text", icon: "✨" }
  ];

  // Auto-analyze when prompt changes
  useEffect(() => {
    if (autoAnalyze && config.prompt.trim() && config.prompt.length > 3) {
      const timeoutId = setTimeout(() => {
        analyzeText();
      }, 1000); // Debounce for 1 second
      
      return () => clearTimeout(timeoutId);
    }
  }, [config.prompt, autoAnalyze]);

  const analyzeText = async () => {
    if (!config.prompt.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const results = {};
      const errors = [];
      
      // Tokenization
      try {
        const tokenRes = await fetch("https://tanmay0483-tokenlens.hf.space/tokenize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: config.prompt })
        });
        
        if (tokenRes.ok) {
          results.tokenization = await tokenRes.json();
        } else {
          errors.push("Tokenization failed");
        }
      } catch (e) {
        errors.push("Tokenization error: " + e.message);
      }

      // Embeddings
      try {
        const embRes = await fetch("https://tanmay0483-tokenlens.hf.space/embeddings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: config.prompt })
        });
        
        if (embRes.ok) {
          results.embeddings = await embRes.json();
        } else {
          errors.push("Embeddings failed");
        }
      } catch (e) {
        errors.push("Embeddings error: " + e.message);
      }

      // Attention (optional - may not be supported)
      try {
        const attRes = await fetch("https://tanmay0483-tokenlens.hf.space/attention", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: config.prompt })
        });
        
        if (attRes.ok) {
          results.attention = await attRes.json();
        }
      } catch (e) {
        // Attention is optional, don't show error
      }

      // Probabilities
      try {
        const probRes = await fetch("https://tanmay0483-tokenlens.hf.space/logits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            text: config.prompt,
            temperature: config.temperature,
            top_k: config.top_k,
            top_p: config.top_p
          })
        });
        
        if (probRes.ok) {
          results.probabilities = await probRes.json();
        } else {
          errors.push("Probabilities failed");
        }
      } catch (e) {
        errors.push("Probabilities error: " + e.message);
      }

      setAnalysisData(results);
      
      // Auto-switch to tokenization step after analysis
      if (results.tokenization) {
        setCurrentStep("tokenize");
      }
      
      if (errors.length > 0) {
        console.warn("Some analysis steps failed:", errors);
      }
      
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Analysis failed. Make sure the backend is running on port 5000.");
    }
    setIsAnalyzing(false);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "overview":
        return (
          <div className="space-y-8">
            {/* Quick Stats */}
            {analysisData && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {analysisData.tokenization && (
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-600">{analysisData.tokenization.tokens.length}</p>
                    <p className="text-sm text-blue-800">Tokens</p>
                  </div>
                )}
                {analysisData.embeddings && (
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">{analysisData.embeddings.embedding_dim}</p>
                    <p className="text-sm text-green-800">Dimensions</p>
                  </div>
                )}
                {analysisData.attention && (
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-purple-600">{analysisData.attention.num_layers}</p>
                    <p className="text-sm text-purple-800">Layers</p>
                  </div>
                )}
                {analysisData.probabilities && (
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-orange-600">{analysisData.probabilities.top_tokens.length}</p>
                    <p className="text-sm text-orange-800">Top Tokens</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Mini Visualizations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analysisData?.tokenization && (
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-3">🔤 Tokens</h4>
                  <div className="flex flex-wrap gap-1">
                    {analysisData.tokenization.tokens.slice(0, 10).map((token, i) => (
                      <span key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">
                        {token.replace(/Ġ/g, "▁")}
                      </span>
                    ))}
                    {analysisData.tokenization.tokens.length > 10 && (
                      <span className="text-gray-500 text-xs">+{analysisData.tokenization.tokens.length - 10} more</span>
                    )}
                  </div>
                </div>
              )}
              
              {analysisData?.probabilities && (
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-3">🎲 Next Token Prediction</h4>
                  <div className="space-y-2">
                    {analysisData.probabilities.top_tokens.slice(0, 5).map((token, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">"{token.token}"</span>
                        <span className="text-sm font-medium">{(token.probability * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {!analysisData && (
              <div className="text-center py-12">
                <div className="animate-pulse">
                  <div className="text-4xl mb-4">🔍</div>
                  <p className="text-gray-500">
                    {isAnalyzing ? "Analyzing your text..." : "Enter a prompt to see analysis"}
                  </p>
                </div>
              </div>
            )}
          </div>
        );
        
      case "tokenize":
        return analysisData?.tokenization ? 
          <TokenViewer data={analysisData.tokenization} /> :
          <div className="text-center py-12">
            <p className="text-gray-500">Enter a prompt to see tokenization</p>
          </div>;
          
      case "embeddings":
        return analysisData?.embeddings ? 
          <EmbeddingChart data={analysisData.embeddings} /> :
          <div className="text-center py-12">
            <p className="text-gray-500">Enter a prompt to see embeddings</p>
          </div>;
          
      case "attention":
        return analysisData?.attention ? 
          <AttentionHeatmap data={analysisData.attention} /> :
          <div className="text-center py-12">
            <p className="text-gray-500">Enter a prompt to see attention patterns</p>
          </div>;
          
      case "probabilities":
        return analysisData?.probabilities ? 
          <ProbabilityChart data={analysisData.probabilities} /> :
          <div className="text-center py-12">
            <p className="text-gray-500">Enter a prompt to see probability distribution</p>
          </div>;
          
      case "generate":
        return <StreamViewer config={config} />;
        
      default:
        return <StreamViewer config={config} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🔍 TokenLens
          </h1>
          <p className="text-xl text-gray-600 mb-1">
            LLM Text Generation & Sampling Simulator
          </p>
          <p className="text-sm text-gray-500">
            Visualize how AI models understand and generate text, step by step
          </p>
        </header>

        {/* Step Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentStep === step.id
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "bg-white text-gray-600 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200"
                }`}
              >
                {step.name}
              </button>
            ))}
          </div>
          
          {/* Auto-analyze toggle */}
          <div className="text-center mb-4">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoAnalyze}
                onChange={(e) => setAutoAnalyze(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-600">Auto-analyze when typing</span>
            </label>
          </div>
          
          <div className="text-center">
            <p className="text-gray-600">
              {steps.find(s => s.id === currentStep)?.description}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-1">
            <PromptForm 
              config={config} 
              setConfig={setConfig}
              onAnalyze={analyzeText}
              isAnalyzing={isAnalyzing}
            />
          </div>

          {/* Visualization Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 min-h-[600px]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <span className="text-2xl">{steps.find(s => s.id === currentStep)?.icon}</span>
                  {steps.find(s => s.id === currentStep)?.name}
                </h2>
                
                {/* Analysis Status */}
                {isAnalyzing && (
                  <div className="flex items-center gap-2 text-indigo-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                    <span className="text-sm font-medium">Analyzing...</span>
                  </div>
                )}
              </div>
              
              {renderCurrentStep()}
            </div>
          </div>

          {/* Explanation Panel */}
          <div className="lg:col-span-1">
            <ExplanationPanel currentStep={currentStep} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={analyzeText}
                disabled={isAnalyzing || !config.prompt.trim()}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <span>🔍</span>
                {isAnalyzing ? "Analyzing..." : "Analyze Text"}
              </button>
              
              <button
                onClick={() => setCurrentStep("generate")}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <span>✨</span>
                Generate Text
              </button>
              
              <button
                onClick={() => {
                  setAnalysisData(null);
                  setCurrentStep("generate");
                }}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <span>🔄</span>
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Built to help you understand how Large Language Models work internally</p>
          <p className="mt-1">Perfect for students, educators, and ML engineers</p>
        </footer>
      </div>
    </div>
  );
}
