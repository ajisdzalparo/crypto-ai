"use client";

import { useState, useEffect } from "react";

interface StatItem {
  label: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  badge?: string;
}

interface StatsBarProps {
  currency?: "USD" | "IDR";
  exchangeRate?: number;
}

export default function StatsBar({ currency = "USD", exchangeRate = 1 }: StatsBarProps) {
  const [stats, setStats] = useState<StatItem[]>([
    { label: "BTC Price", value: "$--,---", badge: "LIVE" },
    { label: "24h Change", value: "--%", isPositive: true },
    { label: "AI Sentiment", value: "--", badge: "BULLISH" },
    { label: "Market Cap", value: "$---B" },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch technical data from Binance
        const priceRes = await fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT");
        const priceData = await priceRes.json();

        const currentPrice = parseFloat(priceData.lastPrice);
        const priceChange24h = parseFloat(priceData.priceChangePercent);

        // Try to fetch sentiment from our API
        let sentimentScore = 0;
        let sentimentLabel = "NEUTRAL";

        try {
          const sentimentRes = await fetch("/api/sentiment?coin=BTC");
          const sentimentData = await sentimentRes.json();
          if (sentimentData.success && sentimentData.data) {
            sentimentScore = sentimentData.data.score || 0;
            sentimentLabel = sentimentData.data.label || "NEUTRAL";
          }
        } catch (_) {
          // Use fallback sentiment based on price change
          sentimentScore = priceChange24h / 10;
          sentimentLabel = priceChange24h > 2 ? "BULLISH" : priceChange24h < -2 ? "BEARISH" : "NEUTRAL";
        }

        const btcSupply = 19600000;
        const marketCap = (currentPrice * btcSupply) / 1e9;

        const formatPrice = (price: number) => {
          if (currency === "IDR") {
            return `Rp ${(price * exchangeRate).toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;
          }
          return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        };

        const formatMarketCap = (cap: number) => {
          // cap is in Billions USD
          if (currency === "IDR") {
            // Convert Billion USD to Trillion IDR roughly?
            // 1 Billion USD = 1,000,000,000 USD
            // * 16250 = 16,250,000,000,000 IDR = 16.25 Trillion
            const capIDR = cap * 1000000000 * exchangeRate;
            // Use Trillion (T) for IDR
            return `Rp ${(capIDR / 1e12).toLocaleString("id-ID", { maximumFractionDigits: 2 })}T`;
          }
          return `$${cap.toFixed(0)}B`;
        };

        setStats([
          {
            label: "BTC Price",
            value: formatPrice(currentPrice),
            badge: "LIVE",
          },
          {
            label: "24h Change",
            value: `${priceChange24h >= 0 ? "+" : ""}${priceChange24h.toFixed(2)}%`,
            isPositive: priceChange24h >= 0,
          },
          {
            label: "AI Sentiment",
            value: `${Math.round((sentimentScore + 1) * 50)}`,
            badge: sentimentLabel.replace("_", " "),
          },
          {
            label: "Market Cap",
            value: formatMarketCap(marketCap),
          },
        ]);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [currency, exchangeRate]);

  return (
    <>
      {stats.map((stat, index) => (
        <div key={index} className="stat-card">
          <div className="flex items-center gap-2 mb-1">
            <span className="stat-label">{stat.label}</span>
            {stat.badge && (
              <span className={`badge ${stat.badge === "LIVE" ? "badge-live" : stat.badge === "BULLISH" ? "badge-bullish" : stat.badge === "BEARISH" ? "bg-[var(--accent-red-soft)] text-[var(--accent-red)]" : "badge-pending"}`}>
                {stat.badge}
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`stat-value ${stat.value.includes("--") ? "animate-pulse" : ""}`}>{stat.value}</span>
            {stat.isPositive !== undefined && <span className={`stat-change ${stat.isPositive ? "positive" : "negative"}`}>{stat.isPositive ? "↑" : "↓"}</span>}
          </div>
        </div>
      ))}
    </>
  );
}
