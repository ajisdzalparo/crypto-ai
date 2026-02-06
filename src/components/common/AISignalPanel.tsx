"use client";

import { useState, useEffect } from "react";
import { FullAnalysis } from "@/types";
import { cn } from "@/utils";

export default function AISignalPanel() {
  const [signal, setSignal] = useState<FullAnalysis | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let retryTimeout: NodeJS.Timeout | null = null;
    let retryCount = 0;
    const maxRetries = 3;

    const connectSSE = () => {
      try {
        eventSource = new EventSource("/api/signals/stream?coin=BTC");

        eventSource.onopen = () => {
          setIsConnected(true);
          setError(null);
          retryCount = 0;
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === "signal" && data.data) {
              setSignal(data.data);
              setLastUpdate(getTimeAgo(data.data.timestamp));
              setIsLoading(false);
              setError(null);
            } else if (data.type === "connected") {
              setIsConnected(true);
            } else if (data.type === "error") {
              setError(data.message);
            }
          } catch (e) {
            console.error("SSE parse error:", e);
          }
        };

        eventSource.onerror = () => {
          setIsConnected(false);
          eventSource?.close();

          if (retryCount < maxRetries) {
            retryCount++;
            retryTimeout = setTimeout(connectSSE, 3000 * retryCount);
          } else {
            setError("Connection failed. Please refresh the page.");
            setIsLoading(false);
          }
        };
      } catch (e) {
        setError("Failed to connect to signal stream");
        setIsLoading(false);
      }
    };

    // Initial fetch via REST API as fallback
    const fetchSignal = async () => {
      try {
        const res = await fetch("/api/ai-signal?coin=BTC");
        const data = await res.json();
        if (data.success && data.data) {
          setSignal(data.data);
          setLastUpdate("Just now");
          setIsLoading(false);
        }
      } catch (e) {
        console.error("Failed to fetch signal:", e);
      }
    };

    // Try SSE first, fallback to REST
    connectSSE();

    // Also fetch via REST as backup
    setTimeout(() => {
      if (isLoading && !signal) {
        fetchSignal();
      }
    }, 3000);

    return () => {
      eventSource?.close();
      if (retryTimeout) clearTimeout(retryTimeout);
      // Clean up catch block
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (signal?.timestamp) {
        setLastUpdate(getTimeAgo(signal.timestamp));
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [signal?.timestamp]);

  const getTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  const getActionClass = (action: string) => {
    if (action?.includes("BUY")) return "buy";
    if (action?.includes("SELL")) return "sell";
    return "";
  };

  const getActionDescription = (action: string) => {
    switch (action) {
      case "STRONG_BUY":
        return "High probability upward movement expected";
      case "BUY":
        return "Favorable entry conditions detected";
      case "HOLD":
        return "Wait for clearer market direction";
      case "SELL":
        return "Consider taking profits";
      case "STRONG_SELL":
        return "High risk of correction - reduce exposure";
      default:
        return "Analyzing market...";
    }
  };

  if (isLoading) {
    return (
      <div className="glass-card p-6 h-full flex flex-col items-center justify-center min-h-[450px]">
        <div className="w-10 h-10 border-3 border-[var(--accent-green)] border-t-transparent rounded-full animate-spin mb-4"></div>
        <span className="text-[var(--text-secondary)] text-sm font-medium">Analyzing Market Data...</span>
        <span className="text-[var(--text-muted)] text-xs mt-1">Fetching technical & sentiment data</span>
      </div>
    );
  }

  if (error && !signal) {
    return (
      <div className="glass-card p-6 h-full flex flex-col items-center justify-center min-h-[450px]">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent-orange)" strokeWidth="2" className="mb-4">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span className="text-[var(--text-secondary)] text-sm">{error}</span>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-[var(--accent-green-soft)] text-[var(--accent-green)] rounded-lg text-sm font-medium">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 h-full flex flex-col min-h-[450px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={cn("w-2.5 h-2.5 rounded-full transition-all duration-500", isConnected ? "bg-[var(--accent-green)] shadow-[0_0_8px_var(--accent-green)]" : "bg-[var(--accent-orange)]")}></div>
          <span className="text-sm font-bold text-[var(--accent-green)]">Live AI Signal</span>
        </div>
        <span className="text-xs text-[var(--text-muted)]">Updated {lastUpdate}</span>
      </div>

      {/* Action Display */}
      <div className="text-center mb-4">
        <span className="text-xs text-[var(--text-muted)] uppercase tracking-widest">Recommendation</span>
        <div className={`signal-action ${getActionClass(signal?.action || "")} mt-1`}>{signal?.action?.replace("_", " ") || "ANALYZING..."}</div>
        <p className="text-xs text-[var(--text-secondary)] mt-1">{getActionDescription(signal?.action || "")}</p>
      </div>

      {/* Confidence Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[var(--text-secondary)]">AI Confidence</span>
          <span className="text-xl font-bold text-[var(--accent-green)]">{signal?.confidence || 0}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${signal?.confidence || 0}%` }}></div>
        </div>
      </div>

      {/* Key Indicators */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="neu-card-inset p-3 rounded-lg">
          <span className="text-xs text-[var(--text-muted)] block mb-1">RSI (14)</span>
          <span className={cn("text-lg font-bold", (signal?.technical.rsi || 50) < 30 ? "text-[var(--accent-green)]" : (signal?.technical.rsi || 50) > 70 ? "text-[var(--accent-red)]" : "text-white")}>
            {signal?.technical.rsi?.toFixed(1) || "--"}
          </span>
          <span className="text-xs text-[var(--text-muted)] block">{(signal?.technical.rsi || 50) < 30 ? "Oversold" : (signal?.technical.rsi || 50) > 70 ? "Overbought" : "Neutral"}</span>
        </div>
        <div className="neu-card-inset p-3 rounded-lg">
          <span className="text-xs text-[var(--text-muted)] block mb-1">Sentiment</span>
          <span className={cn("text-lg font-bold", (signal?.sentiment.score || 0) > 0.2 ? "text-[var(--accent-green)]" : (signal?.sentiment.score || 0) < -0.2 ? "text-[var(--accent-red)]" : "text-white")}>
            {Math.round(((signal?.sentiment.score || 0) + 1) * 50)}
          </span>
          <span className="text-xs text-[var(--text-muted)] block">{signal?.sentiment.label?.replace("_", " ") || "Neutral"}</span>
        </div>
      </div>

      {/* AI Reasoning */}
      <div className="mb-4 flex-1">
        <span className="text-xs text-[var(--text-muted)] uppercase tracking-widest block mb-2">Why {signal?.action?.replace("_", " ")}?</span>
        <div className="neu-card-inset p-4">
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{signal?.reasoning || "Analyzing market conditions..."}</p>
        </div>
      </div>

      {/* Insights Summary */}
      {signal?.insights && (
        <div className="mb-4 space-y-2">
          {signal.insights.bullish.length > 0 && (
            <div className="flex items-start gap-2">
              <span className="text-[var(--accent-green)] text-sm">↑</span>
              <span className="text-xs text-[var(--text-secondary)]">{signal.insights.bullish[0]}</span>
            </div>
          )}
          {signal.insights.bearish.length > 0 && (
            <div className="flex items-start gap-2">
              <span className="text-[var(--accent-red)] text-sm">↓</span>
              <span className="text-xs text-[var(--text-secondary)]">{signal.insights.bearish[0]}</span>
            </div>
          )}
        </div>
      )}

      {/* Execute Button */}
      <button className="btn-primary w-full mt-auto">
        Execute Trade
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
