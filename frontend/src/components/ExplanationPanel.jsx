import React from "react";

export default function ExplanationPanel({ currentStep }) {
  const explanations = {
    tokenize: {
      title: "🔤 Tokenization",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            <strong>What's happening:</strong> The model breaks your text into smaller pieces called "tokens" using Byte-Pair Encoding (BPE).
          </p>
          
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Why tokenize?</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Models work with numbers, not text</li>
              <li>• Handles unknown words by splitting them</li>
              <li>• Balances vocabulary size vs. meaning</li>
            </ul>
          </div>

          <div className="bg-green-50 p-3 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Key concepts:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• <strong>Token:</strong> Basic unit (word piece)</li>
              <li>• <strong>Token ID:</strong> Unique number for each token</li>
              <li>• <strong>Vocabulary:</strong> All possible tokens (~50k)</li>
            </ul>
          </div>

          <p className="text-xs text-gray-500 italic">
            💡 Tip: Common words become single tokens, rare words get split into pieces.
          </p>
        </div>
      )
    },

    embeddings: {
      title: "🎯 Embeddings",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            <strong>What's happening:</strong> Each token becomes a 768-dimensional vector that captures its meaning and position.
          </p>
          
          <div className="bg-purple-50 p-3 rounded-lg">
            <h4 className="font-medium text-purple-800 mb-2">Two types of embeddings:</h4>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• <strong>Token:</strong> What the word means</li>
              <li>• <strong>Position:</strong> Where it appears in sequence</li>
              <li>• <strong>Combined:</strong> Meaning + location</li>
            </ul>
          </div>

          <div className="bg-orange-50 p-3 rounded-lg">
            <h4 className="font-medium text-orange-800 mb-2">Why 768 dimensions?</h4>
            <p className="text-sm text-orange-700">
              High-dimensional space allows the model to capture complex relationships between words, grammar, and context.
            </p>
          </div>

          <p className="text-xs text-gray-500 italic">
            💡 Similar words have similar embedding vectors (closer in space).
          </p>
        </div>
      )
    },

    attention: {
      title: "👁️ Attention Mechanism",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            <strong>What's happening:</strong> The model figures out which words should "pay attention" to which other words.
          </p>
          
          <div className="bg-indigo-50 p-3 rounded-lg">
            <h4 className="font-medium text-indigo-800 mb-2">How attention works:</h4>
            <ul className="text-sm text-indigo-700 space-y-1">
              <li>• Each word asks: "What should I focus on?"</li>
              <li>• Creates Query (Q), Key (K), Value (V) matrices</li>
              <li>• Computes similarity scores between all pairs</li>
              <li>• Higher scores = stronger connections</li>
            </ul>
          </div>

          <div className="bg-red-50 p-3 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2">Multiple heads:</h4>
            <p className="text-sm text-red-700">
              Different attention heads learn different types of relationships (grammar, meaning, syntax, etc.).
            </p>
          </div>

          <p className="text-xs text-gray-500 italic">
            💡 Darker colors in the heatmap mean stronger attention connections.
          </p>
        </div>
      )
    },

    probabilities: {
      title: "🎲 Probability Distribution",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            <strong>What's happening:</strong> The model calculates how likely each possible next word is.
          </p>
          
          <div className="bg-green-50 p-3 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">From logits to probabilities:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• <strong>Logits:</strong> Raw scores for each word</li>
              <li>• <strong>Softmax:</strong> Converts to probabilities (0-100%)</li>
              <li>• <strong>Temperature:</strong> Controls randomness</li>
            </ul>
          </div>

          <div className="bg-yellow-50 p-3 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">Sampling strategies:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• <strong>Greedy:</strong> Always pick highest probability</li>
              <li>• <strong>Top-K:</strong> Choose from K most likely</li>
              <li>• <strong>Top-P:</strong> Choose from cumulative probability P</li>
            </ul>
          </div>

          <p className="text-xs text-gray-500 italic">
            💡 The model doesn't always pick the most likely word - randomness creates creativity!
          </p>
        </div>
      )
    },

    generate: {
      title: "✨ Text Generation",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            <strong>What's happening:</strong> The model generates text one token at a time, using everything it learned from previous steps.
          </p>
          
          <div className="bg-cyan-50 p-3 rounded-lg">
            <h4 className="font-medium text-cyan-800 mb-2">Autoregressive process:</h4>
            <ul className="text-sm text-cyan-700 space-y-1">
              <li>• Predict next token based on all previous tokens</li>
              <li>• Add predicted token to sequence</li>
              <li>• Repeat until done (EOS token or max length)</li>
            </ul>
          </div>

          <div className="bg-pink-50 p-3 rounded-lg">
            <h4 className="font-medium text-pink-800 mb-2">Why short → long?</h4>
            <p className="text-sm text-pink-700">
              Each new token becomes part of the context for predicting the next one. This creates a chain reaction that can produce long, coherent text from short prompts.
            </p>
          </div>

          <p className="text-xs text-gray-500 italic">
            💡 Watch how each new token influences the probability distribution for the next prediction!
          </p>
        </div>
      )
    }
  };

  const currentExplanation = explanations[currentStep] || explanations.tokenize;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        {currentExplanation.title}
      </h2>
      
      {currentExplanation.content}

      {/* Mathematical Formula (if relevant) */}
      {currentStep === "attention" && (
        <div className="mt-4 bg-gray-50 p-3 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">📐 The Math:</h4>
          <div className="text-sm font-mono bg-white p-2 rounded border">
            Attention(Q,K,V) = softmax(QK<sup>T</sup>/√d)V
          </div>
        </div>
      )}

      {currentStep === "probabilities" && (
        <div className="mt-4 bg-gray-50 p-3 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">📐 The Math:</h4>
          <div className="text-sm font-mono bg-white p-2 rounded border">
            P(token) = exp(logit/T) / Σ exp(logit<sub>i</sub>/T)
          </div>
        </div>
      )}

      {/* Quick Tips */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="font-medium text-gray-800 mb-2">🚀 Quick Tips:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Try different prompts to see how tokenization changes</li>
          <li>• Adjust temperature to see creativity vs. focus</li>
          <li>• Compare attention patterns across layers</li>
          <li>• Watch how probabilities shift with context</li>
        </ul>
      </div>
    </div>
  );
}