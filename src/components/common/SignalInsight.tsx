"use client";

import { useState, useEffect } from "react";

interface TechnicalData {
  rsi: number;
  macd: { macd: number; signal: number; histogram: number };
  sma20: number;
  sma50: number;
  trend: string;
  signal: string;
  currentPrice: number;
  priceChange24h: number;
}

interface SentimentData {
  score: number;
  label: string;
  summary: string;
  news: { title: string; source: string }[];
}

export default function SignalInsight() {
  const [technical, setTechnical] = useState<TechnicalData | null>(null);
  const [sentiment, setSentiment] = useState<SentimentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [techRes, sentimentRes] = await Promise.all([fetch("/api/technical?coin=BTC"), fetch("/api/sentiment?coin=BTC")]);

        const techData = await techRes.json();
        const sentimentData = await sentimentRes.json();

        if (techData.success) setTechnical(techData.data);
        if (sentimentData.success) setSentiment(sentimentData.data);
      } catch (error) {
        console.error("Failed to fetch insight data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  // Convert sentiment score to Fear & Greed Index (0-100)
  const fearGreedIndex = sentiment ? Math.round((sentiment.score + 1) * 50) : 50;
  const getFearGreedLabel = (score: number) => {
    if (score <= 20) return "Extreme Fear";
    if (score <= 40) return "Fear";
    if (score <= 60) return "Neutral";
    if (score <= 80) return "Greed";
    return "Extreme Greed";
  };

  if (isLoading) {
    return (
      <div className="flex gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="pillar-card animate-pulse flex-1">
            <div className="h-6 bg-[var(--bg-secondary)] rounded w-32 mb-4"></div>
            <div className="h-24 bg-[var(--bg-secondary)] rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-5">
      {/* Technical Analysis */}
      <div className="pillar-card">
        <div className="pillar-header">
          <div className="pillar-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-white">Technical Analysis</h3>
            <span className="text-xs text-[var(--text-muted)]">Real-time indicators</span>
          </div>
        </div>

        <div className="space-y-4">
          {/* RSI */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-secondary)]">RSI (14)</span>
            <span className={`font-bold ${(technical?.rsi || 50) < 30 ? "text-[var(--accent-green)]" : (technical?.rsi || 50) > 70 ? "text-[var(--accent-red)]" : "text-white"}`}>{technical?.rsi?.toFixed(1) || "--"}</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${technical?.rsi || 50}%`,
                background: (technical?.rsi || 50) < 30 ? "var(--accent-green)" : (technical?.rsi || 50) > 70 ? "var(--accent-red)" : "linear-gradient(90deg, var(--accent-green), var(--accent-orange))",
              }}
            ></div>
          </div>

          {/* MACD */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-secondary)]">MACD</span>
            <span className={`font-bold ${(technical?.macd.histogram || 0) > 0 ? "text-[var(--accent-green)]" : "text-[var(--accent-red)]"}`}>{(technical?.macd.histogram || 0) > 0 ? "Bullish" : "Bearish"}</span>
          </div>

          {/* Crossover */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-secondary)]">Trend Signal</span>
            <span className={`badge ${technical?.trend === "BULLISH" ? "badge-live" : technical?.trend === "BEARISH" ? "bg-red-500/15 text-red-400" : "badge-pending"}`}>{technical?.trend || "NEUTRAL"}</span>
          </div>
        </div>
      </div>

      {/* Sentiment Analysis */}
      <div className="pillar-card">
        <div className="pillar-header">
          <div className="pillar-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-white">Sentiment Analysis</h3>
            <span className="text-xs text-[var(--text-muted)]">AI-powered news analysis</span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Fear & Greed Index */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-secondary)]">Fear & Greed</span>
            <span className={`font-bold ${fearGreedIndex > 50 ? "text-[var(--accent-green)]" : "text-[var(--accent-red)]"}`}>{fearGreedIndex}</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${fearGreedIndex}%`,
                background: fearGreedIndex > 60 ? "var(--accent-green)" : fearGreedIndex < 40 ? "var(--accent-red)" : "var(--accent-orange)",
              }}
            ></div>
          </div>
          <div className="text-center">
            <span className={`text-sm font-medium ${fearGreedIndex > 50 ? "text-[var(--accent-green)]" : "text-[var(--accent-red)]"}`}>{getFearGreedLabel(fearGreedIndex)}</span>
          </div>

          {/* Sentiment Label */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-secondary)]">News Sentiment</span>
            <span className={`badge ${(sentiment?.score || 0) > 0.2 ? "badge-live" : (sentiment?.score || 0) < -0.2 ? "bg-red-500/15 text-red-400" : "badge-pending"}`}>{sentiment?.label?.replace("_", " ") || "NEUTRAL"}</span>
          </div>
        </div>
      </div>

      {/* On-Chain Analysis */}
      <div className="pillar-card">
        <div className="pillar-header">
          <div className="pillar-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-white">On-Chain Analysis</h3>
            <span className="text-xs text-[var(--text-muted)]">Blockchain metrics</span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Whale Inflow (Mock data for now) */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-secondary)]">Whale Activity</span>
            <span className="font-bold text-[var(--accent-green)]">Accumulating</span>
          </div>

          {/* Exchange Net Flow */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-secondary)]">Exchange Flow</span>
            <span className="font-bold text-[var(--accent-green)]">-2,450 BTC</span>
          </div>
          <div className="text-xs text-[var(--text-muted)]">Net outflow indicates bullish sentiment</div>

          {/* Active Addresses */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-secondary)]">Active Addresses</span>
            <span className="badge badge-live">+12.4%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
