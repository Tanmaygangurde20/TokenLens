import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export default function EmbeddingChart({ data }) {
  const [selectedToken, setSelectedToken] = useState(0);
  const [viewType, setViewType] = useState("token"); // "token", "positional", "combined"

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Click "Analyze Text" to see embeddings</p>
      </div>
    );
  }

  const getCurrentEmbedding = () => {
    switch (viewType) {
      case "token":
        return data.token_embeddings[selectedToken];
      case "positional":
        return data.positional_embeddings[selectedToken];
      case "combined":
        return data.combined_embeddings[selectedToken];
      default:
        return data.token_embeddings[selectedToken];
    }
  };

  const chartData = (() => {
    const embedding = getCurrentEmbedding();
    if (!embedding || !Array.isArray(embedding)) return [];
    
    return embedding.slice(0, 50).map((value, index) => ({
      dimension: index,
      value: typeof value === 'number' ? value : 0
    }));
  })();

  const getViewTypeColor = () => {
    switch (viewType) {
      case "token": return "#3b82f6";
      case "positional": return "#10b981";
      case "combined": return "#8b5cf6";
      default: return "#3b82f6";
    }
  };

  return (
    <div className="space-y-6">
      {/* Token Selector */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">Select Token</h3>
        <div className="flex flex-wrap gap-2">
          {data.tokens.map((token, index) => (
            <button
              key={index}
              onClick={() => setSelectedToken(index)}
              className={`px-3 py-2 rounded-md text-sm font-mono transition-all ${
                selectedToken === index
                  ? "bg-indigo-100 border-2 border-indigo-300 text-indigo-800"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {token.replace(/Ġ/g, "▁")}
            </button>
          ))}
        </div>
      </div>

      {/* View Type Selector */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">Embedding Type</h3>
        <div className="flex gap-2">
          {[
            { id: "token", name: "Token Embedding", colorClass: "bg-blue-100 text-blue-800 border-blue-300" },
            { id: "positional", name: "Positional Encoding", colorClass: "bg-green-100 text-green-800 border-green-300" },
            { id: "combined", name: "Combined", colorClass: "bg-purple-100 text-purple-800 border-purple-300" }
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setViewType(type.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
                viewType === type.id
                  ? type.colorClass
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {type.name}
            </button>
          ))}
        </div>
      </div>

      {/* Embedding Visualization */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">
          Embedding Vector (First 50 dimensions)
        </h3>
        <div className="bg-white border rounded-lg p-4">
          <div className="w-full" style={{ height: "300px", minHeight: "300px" }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300} minHeight={300}>
                <BarChart 
                  data={chartData} 
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  width={500}
                  height={300}
                >
                  <XAxis 
                    dataKey="dimension" 
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value) => [value.toFixed(4), "Value"]}
                    labelFormatter={(label) => `Dimension ${label}`}
                  />
                  <Bar 
                    dataKey="value" 
                    fill={getViewTypeColor()}
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No embedding data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">Vector Statistics</h3>
        <div className="grid grid-cols-4 gap-4">
          {(() => {
            const embedding = getCurrentEmbedding() || [];
            const mean = embedding.reduce((a, b) => a + b, 0) / embedding.length;
            const variance = embedding.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / embedding.length;
            const max = Math.max(...embedding);
            const min = Math.min(...embedding);
            
            return [
              { label: "Mean", value: mean.toFixed(4), bgClass: "bg-blue-50", textClass: "text-blue-600", labelClass: "text-blue-800" },
              { label: "Std Dev", value: Math.sqrt(variance).toFixed(4), bgClass: "bg-green-50", textClass: "text-green-600", labelClass: "text-green-800" },
              { label: "Max", value: max.toFixed(4), bgClass: "bg-red-50", textClass: "text-red-600", labelClass: "text-red-800" },
              { label: "Min", value: min.toFixed(4), bgClass: "bg-purple-50", textClass: "text-purple-600", labelClass: "text-purple-800" }
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
        <h4 className="font-medium text-yellow-800 mb-2">💡 Understanding Embeddings</h4>
        <div className="text-sm text-yellow-700 space-y-2">
          <p><strong>Token Embeddings:</strong> Learned representations that capture semantic meaning</p>
          <p><strong>Positional Encodings:</strong> Mathematical patterns that tell the model where each token is located</p>
          <p><strong>Combined:</strong> The final input to the transformer (token + position)</p>
        </div>
      </div>
    </div>
  );
}