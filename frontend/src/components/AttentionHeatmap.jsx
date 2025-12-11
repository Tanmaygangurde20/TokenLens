import React, { useState } from "react";

export default function AttentionHeatmap({ data }) {
  const [selectedLayer, setSelectedLayer] = useState(0);
  const [selectedHead, setSelectedHead] = useState(0);

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Click "Analyze Text" to see attention patterns</p>
      </div>
    );
  }

  const currentLayer = data.attention_layers[selectedLayer];
  const attentionMatrix = selectedHead === -1 
    ? currentLayer.average_attention 
    : currentLayer.attention_weights[selectedHead];

  const getAttentionColor = (value) => {
    const intensity = Math.min(value * 255, 255);
    return `rgba(99, 102, 241, ${value})`;
  };

  const maxAttention = Math.max(...attentionMatrix.flat());

  return (
    <div className="space-y-6">
      {/* Layer Selector */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">
          Select Layer ({data.num_layers} total)
        </h3>
        <div className="flex flex-wrap gap-2">
          {data.attention_layers.map((_, index) => (
            <button
              key={index}
              onClick={() => setSelectedLayer(index)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                selectedLayer === index
                  ? "bg-indigo-100 border-2 border-indigo-300 text-indigo-800"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
              }`}
            >
              Layer {index}
            </button>
          ))}
        </div>
      </div>

      {/* Head Selector */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">
          Select Attention Head ({currentLayer.num_heads} total)
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedHead(-1)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
              selectedHead === -1
                ? "bg-purple-100 border-2 border-purple-300 text-purple-800"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
            }`}
          >
            Average
          </button>
          {Array.from({ length: currentLayer.num_heads }, (_, index) => (
            <button
              key={index}
              onClick={() => setSelectedHead(index)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                selectedHead === index
                  ? "bg-indigo-100 border-2 border-indigo-300 text-indigo-800"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
              }`}
            >
              Head {index}
            </button>
          ))}
        </div>
      </div>

      {/* Attention Heatmap */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">
          Attention Weights
          {selectedHead === -1 ? " (Average)" : ` (Head ${selectedHead})`}
        </h3>
        <div className="bg-white border rounded-lg p-4 overflow-auto">
          <div className="min-w-max">
            {/* Column Headers */}
            <div className="flex mb-2">
              <div className="w-20"></div>
              {data.tokens.map((token, index) => (
                <div
                  key={index}
                  className="w-16 text-xs text-center font-mono p-1 transform -rotate-45 origin-bottom-left"
                  style={{ height: "60px" }}
                >
                  {token.replace(/Ġ/g, "▁")}
                </div>
              ))}
            </div>

            {/* Attention Matrix */}
            {attentionMatrix.map((row, rowIndex) => (
              <div key={rowIndex} className="flex items-center mb-1">
                {/* Row Header */}
                <div className="w-20 text-xs font-mono text-right pr-2 truncate">
                  {data.tokens[rowIndex]?.replace(/Ġ/g, "▁")}
                </div>
                
                {/* Attention Cells */}
                {row.map((value, colIndex) => (
                  <div
                    key={colIndex}
                    className="w-16 h-8 border border-gray-200 flex items-center justify-center text-xs font-mono cursor-pointer hover:border-gray-400 transition-colors"
                    style={{ backgroundColor: getAttentionColor(value / maxAttention) }}
                    title={`${data.tokens[rowIndex]} → ${data.tokens[colIndex]}: ${value.toFixed(4)}`}
                  >
                    {value > 0.01 ? value.toFixed(2) : ""}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attention Statistics */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">Attention Statistics</h3>
        <div className="grid grid-cols-3 gap-4">
          {(() => {
            const flatValues = attentionMatrix.flat();
            const max = Math.max(...flatValues);
            const min = Math.min(...flatValues);
            const avg = flatValues.reduce((a, b) => a + b, 0) / flatValues.length;
            
            return [
              { label: "Max Attention", value: max.toFixed(4), bgClass: "bg-red-50", textClass: "text-red-600", labelClass: "text-red-800" },
              { label: "Average", value: avg.toFixed(4), bgClass: "bg-blue-50", textClass: "text-blue-600", labelClass: "text-blue-800" },
              { label: "Min Attention", value: min.toFixed(4), bgClass: "bg-green-50", textClass: "text-green-600", labelClass: "text-green-800" }
            ].map((stat) => (
              <div key={stat.label} className={`${stat.bgClass} p-4 rounded-lg text-center`}>
                <p className={`text-2xl font-bold ${stat.textClass}`}>{stat.value}</p>
                <p className={`text-sm ${stat.labelClass}`}>{stat.label}</p>
              </div>
            ));
          })()}
        </div>
      </div>

      {/* Educational Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2">💡 Reading Attention Maps</h4>
        <div className="text-sm text-yellow-700 space-y-2">
          <p><strong>Rows:</strong> The token that is "attending" (asking questions)</p>
          <p><strong>Columns:</strong> The tokens being "attended to" (providing answers)</p>
          <p><strong>Darker colors:</strong> Stronger attention weights (more important connections)</p>
          <p><strong>Different heads:</strong> Learn different types of relationships (syntax, semantics, etc.)</p>
        </div>
      </div>
    </div>
  );
}