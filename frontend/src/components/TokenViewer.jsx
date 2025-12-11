import React, { useState } from "react";

export default function TokenViewer({ data }) {
  const [selectedToken, setSelectedToken] = useState(null);

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Click "Analyze Text" to see tokenization</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Original Text */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">Original Text</h3>
        <div className="bg-gray-50 p-4 rounded-lg border">
          <p className="text-gray-800 font-mono">{data.original_text}</p>
        </div>
      </div>

      {/* Tokenized View */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">
          Tokens ({data.tokens.length} total)
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="flex flex-wrap gap-2">
            {data.token_info.map((token, index) => (
              <button
                key={index}
                onClick={() => setSelectedToken(token)}
                className={`px-3 py-2 rounded-md border text-sm font-mono transition-all ${
                  selectedToken?.position === token.position
                    ? "bg-indigo-100 border-indigo-300 text-indigo-800"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-100"
                }`}
              >
                {token.token.replace(/Ġ/g, "▁")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Token Details */}
      {selectedToken && (
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-3">Token Details</h3>
          <div className="bg-white border rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Position</p>
                <p className="font-mono text-lg">{selectedToken.position}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Token ID</p>
                <p className="font-mono text-lg">{selectedToken.token_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Raw Token</p>
                <p className="font-mono text-lg bg-gray-100 px-2 py-1 rounded">
                  {selectedToken.token}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Decoded</p>
                <p className="font-mono text-lg bg-gray-100 px-2 py-1 rounded">
                  "{selectedToken.decoded}"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">Statistics</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-600">{data.tokens.length}</p>
            <p className="text-sm text-blue-800">Tokens</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-600">{data.original_text.length}</p>
            <p className="text-sm text-green-800">Characters</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-purple-600">
              {(data.original_text.length / data.tokens.length).toFixed(1)}
            </p>
            <p className="text-sm text-purple-800">Chars/Token</p>
          </div>
        </div>
      </div>

      {/* Educational Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2">💡 What's Happening?</h4>
        <p className="text-sm text-yellow-700">
          The model breaks your text into subword tokens using Byte-Pair Encoding (BPE). 
          Common words become single tokens, while rare words are split into smaller pieces. 
          The "▁" symbol represents spaces in the tokenization.
        </p>
      </div>
    </div>
  );
}