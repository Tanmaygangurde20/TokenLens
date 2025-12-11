import React from "react";

export default function PromptForm({ config, setConfig, onAnalyze, isAnalyzing }) {
  function update(field, value) {
    setConfig((c) => ({ ...c, [field]: value }));
  }

  const getTemperatureColor = (temp) => {
    if (temp < 0.5) return "text-blue-600";
    if (temp < 1.0) return "text-green-600";
    if (temp < 1.5) return "text-yellow-600";
    return "text-red-600";
  };

  const getTemperatureDescription = (temp) => {
    if (temp < 0.5) return "Conservative";
    if (temp < 1.0) return "Balanced";
    if (temp < 1.5) return "Creative";
    return "Very Creative";
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Input & Controls</h2>

      {/* Prompt Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Prompt
        </label>
        <textarea
          className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          value={config.prompt}
          onChange={(e) => update("prompt", e.target.value)}
          rows={4}
          placeholder="Enter your text here..."
        />
        <p className="text-xs text-gray-500 mt-1">
          Try: "The future of AI is..." or "Explain quantum physics"
        </p>
      </div>

      {/* Analysis Status */}
      {isAnalyzing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-blue-800 text-sm font-medium">Analyzing...</span>
        </div>
      )}

      {/* Parameter Controls */}
      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">Temperature</label>
            <span className={`text-sm font-bold ${getTemperatureColor(config.temperature)}`}>
              {config.temperature} ({getTemperatureDescription(config.temperature)})
            </span>
          </div>
          <input 
            type="range" 
            min="0.1" 
            max="2.0" 
            step="0.1" 
            value={config.temperature}
            onChange={(e) => update("temperature", parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Focused</span>
            <span>Random</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">Top-K</label>
            <span className="text-sm font-bold text-gray-800">
              {config.top_k === 0 ? "Disabled" : config.top_k}
            </span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            step="1" 
            value={config.top_k}
            onChange={(e) => update("top_k", parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Off</span>
            <span>Strict</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">Top-P (Nucleus)</label>
            <span className="text-sm font-bold text-gray-800">{config.top_p}</span>
          </div>
          <input 
            type="range" 
            min="0.1" 
            max="1.0" 
            step="0.05" 
            value={config.top_p}
            onChange={(e) => update("top_p", parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Narrow</span>
            <span>Wide</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">Max Tokens</label>
            <span className="text-sm font-bold text-gray-800">{config.max_new_tokens}</span>
          </div>
          <input 
            type="range" 
            min="10" 
            max="200" 
            step="10" 
            value={config.max_new_tokens}
            onChange={(e) => update("max_new_tokens", parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Short</span>
            <span>Long</span>
          </div>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm font-medium text-gray-700 mb-3">Quick Presets</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setConfig(c => ({ ...c, temperature: 0.3, top_k: 10, top_p: 0.8 }))}
            className="text-xs bg-blue-100 text-blue-800 py-2 px-3 rounded-md hover:bg-blue-200 transition-colors"
          >
            🎯 Precise
          </button>
          <button
            onClick={() => setConfig(c => ({ ...c, temperature: 1.2, top_k: 50, top_p: 0.95 }))}
            className="text-xs bg-purple-100 text-purple-800 py-2 px-3 rounded-md hover:bg-purple-200 transition-colors"
          >
            🎨 Creative
          </button>
        </div>
      </div>
    </div>
  );
}
