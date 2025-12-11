import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function ProbabilityChart({ data }) {
  const [viewType, setViewType] = useState("bar"); // "bar" or "pie"
  const [showCount, setShowCount] = useState(20);

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Click "Analyze Text" to see probability distribution</p>
      </div>
    );
  }

  const topTokens = data.top_tokens.slice(0, showCount);
  const chartData = topTokens.map((token, index) => ({
    ...token,
    name: token.token.replace(/\n/g, "\\n").replace(/\t/g, "\\t"),
    rank: index + 1
  }));

  const colors = [
    "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
    "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1"
  ];

  const getTokenColor = (index) => colors[index % colors.length];

  const selectedToken = data.top_tokens[0]; // Highest probability token
  const totalProbability = topTokens.reduce((sum, token) => sum + token.probability, 0);

  return (
    <div className="space-y-6">
      {/* Next Token Prediction */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">Next Token Prediction</h3>
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Most Likely Next Token:</p>
              <p className="text-2xl font-bold text-green-600 font-mono">
                "{selectedToken.token}"
              </p>
              <p className="text-sm text-gray-500">
                Probability: {(selectedToken.probability * 100).toFixed(2)}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Temperature:</p>
              <p className="text-xl font-bold text-blue-600">{data.temperature}</p>
            </div>
          </div>
        </div>
      </div>

      {/* View Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-3">
            Top {showCount} Token Probabilities
          </h3>
        </div>
        <div className="flex gap-2">
          <select
            value={showCount}
            onChange={(e) => setShowCount(parseInt(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value={10}>Top 10</option>
            <option value={20}>Top 20</option>
            <option value={50}>Top 50</option>
          </select>
          <button
            onClick={() => setViewType(viewType === "bar" ? "pie" : "bar")}
            className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-md text-sm hover:bg-indigo-200 transition-colors"
          >
            {viewType === "bar" ? "📊 Pie Chart" : "📈 Bar Chart"}
          </button>
        </div>
      </div>

      {/* Probability Visualization */}
      <div className="bg-white border rounded-lg p-4">
        {viewType === "bar" ? (
          <div style={{ height: "400px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${(value * 100).toFixed(1)}%`}
                />
                <Tooltip 
                  formatter={(value) => [`${(value * 100).toFixed(3)}%`, "Probability"]}
                  labelFormatter={(label) => `Token: "${label}"`}
                />
                <Bar 
                  dataKey="probability" 
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ height: "400px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  dataKey="probability"
                  label={({ name, probability }) => 
                    probability > 0.02 ? `${name} (${(probability * 100).toFixed(1)}%)` : ""
                  }
                  labelLine={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getTokenColor(index)} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${(value * 100).toFixed(3)}%`, "Probability"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Token Details Table */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">Detailed Probabilities</h3>
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left">Rank</th>
                  <th className="px-4 py-2 text-left">Token</th>
                  <th className="px-4 py-2 text-right">Probability</th>
                  <th className="px-4 py-2 text-right">Logit</th>
                </tr>
              </thead>
              <tbody>
                {topTokens.map((token, index) => (
                  <tr key={index} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{index + 1}</td>
                    <td className="px-4 py-2 font-mono bg-gray-100 rounded">
                      "{token.token.replace(/\n/g, "\\n").replace(/\t/g, "\\t")}"
                    </td>
                    <td className="px-4 py-2 text-right font-medium">
                      {(token.probability * 100).toFixed(3)}%
                    </td>
                    <td className="px-4 py-2 text-right text-gray-600">
                      {token.logit.toFixed(3)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">Distribution Statistics</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-600">
              {(totalProbability * 100).toFixed(1)}%
            </p>
            <p className="text-sm text-blue-800">Top {showCount} Total</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-600">
              {(selectedToken.probability * 100).toFixed(2)}%
            </p>
            <p className="text-sm text-green-800">Highest Prob</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-purple-600">{data.vocab_size.toLocaleString()}</p>
            <p className="text-sm text-purple-800">Vocab Size</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-orange-600">{data.temperature}</p>
            <p className="text-sm text-orange-800">Temperature</p>
          </div>
        </div>
      </div>

      {/* Educational Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2">💡 Understanding Probabilities</h4>
        <div className="text-sm text-yellow-700 space-y-2">
          <p><strong>Logits:</strong> Raw scores from the model before normalization</p>
          <p><strong>Softmax:</strong> Converts logits into probabilities that sum to 1.0</p>
          <p><strong>Temperature:</strong> Higher values make distribution more uniform (creative), lower values make it more peaked (focused)</p>
          <p><strong>Sampling:</strong> The model randomly selects from this distribution, not always the highest probability</p>
        </div>
      </div>
    </div>
  );
}