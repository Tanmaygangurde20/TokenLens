import { useState } from "react";

export default function StreamViewer({ config }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const startGeneration = async () => {
    if (!config.prompt.trim()) return;
    
    setLoading(true);
    setIsStreaming(true);
    setText(config.prompt);
    setTokens([]);

    try {
      const res = await fetch("https://tanmay0483-tokenlens.hf.space/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: config.prompt,
          temperature: config.temperature,
          max_new_tokens: config.max_new_tokens
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);

        chunk.split("\n\n").forEach(line => {
          if (!line.startsWith("data:")) return;

          try {
            const json = JSON.parse(line.replace("data:", "").trim());
            
            if (json.event === "done") {
              setIsStreaming(false);
              setText(json.final_text);
            } else if (json.text) {
              setText(json.text);
              if (json.token) {
                setTokens(prev => [...prev, {
                  token: json.token,
                  timestamp: Date.now()
                }]);
              }
            }
          } catch (e) {
            console.log("Failed to parse chunk:", line, e);
          }
        });
      }
    } catch (error) {
      console.error("Generation failed:", error);
      setIsStreaming(false);
      setLoading(false);
    }

    setLoading(false);
    setIsStreaming(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="space-y-6">
        {/* Generation Controls */}
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">Live Text Generation</h3>
          <button
            onClick={startGeneration}
            disabled={loading || !config.prompt.trim()}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Generating..." : "🚀 Generate Text"}
          </button>
        </div>

        {/* Generation Status */}
        {isStreaming && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <p className="text-blue-800 font-medium">Generating text token by token...</p>
              <span className="text-blue-600 text-sm">({tokens.length} tokens generated)</span>
            </div>
          </div>
        )}

        {/* Generated Text Display */}
        <div className="bg-gray-50 rounded-lg p-6 min-h-[300px]">
          {text ? (
            <div className="text-gray-800 font-mono text-sm leading-relaxed whitespace-pre-wrap">
              {text}
              {isStreaming && <span className="animate-pulse bg-indigo-600 text-white px-1 rounded ml-1">|</span>}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 italic text-center">
                Click "Generate Text" to see the model create text token by token
              </p>
            </div>
          )}
        </div>

        {/* Token Stream Visualization */}
        {tokens.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-800 mb-3">
              Token Stream ({tokens.length} new tokens)
            </h4>
            <div className="bg-gray-50 rounded-lg p-4 max-h-32 overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {tokens.map((tokenData, index) => (
                  <span
                    key={index}
                    className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm font-mono border"
                  >
                    {tokenData.token.replace(/\n/g, "\\n")}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Generation Statistics */}
        {text && !isStreaming && tokens.length > 0 && (
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-600">{tokens.length}</p>
              <p className="text-sm text-green-800">New Tokens</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-600">{text.length}</p>
              <p className="text-sm text-blue-800">Total Chars</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-purple-600">{config.temperature}</p>
              <p className="text-sm text-purple-800">Temperature</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-orange-600">
                {tokens.length > 0 ? (tokens.length / ((Date.now() - tokens[0].timestamp) / 1000)).toFixed(1) : "0"}
              </p>
              <p className="text-sm text-orange-800">Tokens/sec</p>
            </div>
          </div>
        )}

        {/* Educational Note */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2">💡 How LLM Generation Works</h4>
          <div className="text-sm text-yellow-700 space-y-2">
            <p>
              <strong>Autoregressive:</strong> The model predicts one token at a time, using all previous tokens as context.
            </p>
            <p>
              <strong>Short → Long:</strong> Each prediction becomes part of the input for the next prediction, 
              creating a chain reaction that can produce long, coherent text from short prompts.
            </p>
            <p>
              <strong>Parameters:</strong> Temperature controls creativity (higher = more random), 
              Top-K and Top-P limit the vocabulary considered for each prediction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
