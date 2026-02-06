"use client";

import { useState, useEffect, useRef } from "react";

interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  time: number;
}

const timeframes = [
  { label: "1H", value: "1h" },
  { label: "4H", value: "4h" },
  { label: "1D", value: "1d" },
  { label: "1W", value: "1w" },
];

const MAX_CANDLES = 30;

interface PriceChartProps {
  currency?: "USD" | "IDR";
  exchangeRate?: number;
}

export default function PriceChart({ currency = "USD", exchangeRate = 1 }: PriceChartProps) {
  const [activeTimeframe, setActiveTimeframe] = useState("1h");
  const [candles, setCandles] = useState<Candle[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [isConnected, setIsConnected] = useState(false);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchInitialCandles = async (interval: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${interval}&limit=${MAX_CANDLES}`);
      const data = await response.json();

      if (Array.isArray(data)) {
        const initialCandles: Candle[] = data.map((k: (string | number)[]) => ({
          time: k[0] as number,
          open: parseFloat(k[1] as string),
          high: parseFloat(k[2] as string),
          low: parseFloat(k[3] as string),
          close: parseFloat(k[4] as string),
        }));

        setCandles(initialCandles);
        if (initialCandles.length > 0) {
          const lastCandle = initialCandles[initialCandles.length - 1];
          const firstCandle = initialCandles[0];
          setCurrentPrice(lastCandle.close);
          setPriceChange(((lastCandle.close - firstCandle.open) / firstCandle.open) * 100);
        }
      }
    } catch (error) {
      console.error("Failed to fetch candles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const connectWebSocket = (interval: string) => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    try {
      const ws = new WebSocket(`wss://stream.binance.com:9443/ws/btcusdt@kline_${interval}`);
      wsRef.current = ws;

      ws.onopen = () => setIsConnected(true);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.e === "kline" && data.k) {
            const kline = data.k;
            const newCandle: Candle = {
              time: kline.t,
              open: parseFloat(kline.o),
              high: parseFloat(kline.h),
              low: parseFloat(kline.l),
              close: parseFloat(kline.c),
            };

            setCurrentPrice(newCandle.close);

            setCandles((prev) => {
              if (prev.length === 0) return prev;

              const updated = [...prev];
              const lastIndex = updated.findIndex((c) => c.time === newCandle.time);

              if (lastIndex !== -1) {
                updated[lastIndex] = newCandle;
              } else if (kline.x) {
                updated.push(newCandle);
                if (updated.length > MAX_CANDLES) updated.shift();
              } else {
                updated[updated.length - 1] = newCandle;
              }

              if (updated.length > 0) {
                const change = ((newCandle.close - updated[0].open) / updated[0].open) * 100;
                setPriceChange(change);
              }

              return updated;
            });
          }
        } catch (e) {
          console.error("WS error:", e);
        }
      };

      ws.onclose = () => setIsConnected(false);
      ws.onerror = () => setIsConnected(false);
    } catch (error) {
      console.error("WS connection error:", error);
    }
  };

  const handleTimeframeChange = (tf: string) => {
    if (tf === activeTimeframe) return;
    setActiveTimeframe(tf);
    setCandles([]);
    if (wsRef.current) wsRef.current.close();
    fetchInitialCandles(tf);
    connectWebSocket(tf);
  };

  useEffect(() => {
    fetchInitialCandles(activeTimeframe);
    connectWebSocket(activeTimeframe);
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // Helper for currency conversion and formatting
  const formatPrice = (price: number) => {
    if (currency === "IDR") {
      return `Rp ${(price * exchangeRate).toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;
    }
    return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const convert = (price: number) => {
    // For Chart Y-axis scale calculation, we can keep using USD values to simplify logic
    // OR convert everything to IDR. Converting everything is better for consistency.
    // However, for simplicity and performance, we can just scale the displayed text
    // BUT wait, chart candles need to assume a scale.
    // If we just scale the Y axis labels, the drawing logic (getY) needs to know the range.
    // Let's stick to base USD for calculations and just format the labels if possible.
    // Actually, it's safer to keep calculations in USD and only format output text.
    return price;
  };

  // Actually, wait, if I don't convert the candles, the shape is same.
  // The only thing changing is the text labels.

  const chartHeight = 280;
  const minPrice = candles.length > 0 ? Math.min(...candles.map((c) => c.low)) * 0.999 : 0;
  const maxPrice = candles.length > 0 ? Math.max(...candles.map((c) => c.high)) * 1.001 : 100;
  const priceRange = maxPrice - minPrice || 1;

  const getY = (price: number) => chartHeight - ((price - minPrice) / priceRange) * chartHeight;

  const lastCandle = candles[candles.length - 1];

  return (
    <div className="chart-container h-full" ref={containerRef}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">BTC/{currency}</span>
            <span className={`badge ${isConnected ? "badge-live" : "bg-red-500/10 text-red-400"}`}>{isConnected ? "LIVE" : "OFFLINE"}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {timeframes.map((tf) => (
            <button key={tf.value} onClick={() => handleTimeframeChange(tf.value)} className={`chart-timeframe-btn ${activeTimeframe === tf.value ? "active" : ""}`}>
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Display */}
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-3xl font-bold">{formatPrice(currentPrice)}</span>
        <span className={`text-sm font-semibold ${priceChange >= 0 ? "text-[var(--accent-green)]" : "text-[var(--accent-red)]"}`}>
          {priceChange >= 0 ? "+" : ""}
          {priceChange.toFixed(2)}%
        </span>
      </div>

      {/* Chart Area */}
      <div className="relative bg-[var(--bg-secondary)] rounded-lg p-4">
        {isLoading || candles.length === 0 ? (
          <div className="flex items-center justify-center h-[280px] text-[var(--text-muted)]">
            <div className="w-5 h-5 border-2 border-[var(--accent-green)] border-t-transparent rounded-full animate-spin mr-2"></div>
            Loading chart...
          </div>
        ) : (
          <svg width="100%" height={chartHeight} viewBox={`0 0 ${candles.length * 18 + 20} ${chartHeight}`} preserveAspectRatio="none" className="overflow-visible">
            {/* Grid Lines */}
            {[0.25, 0.5, 0.75].map((ratio) => (
              <line key={ratio} x1="0" y1={chartHeight * ratio} x2={candles.length * 18 + 20} y2={chartHeight * ratio} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
            ))}

            {/* Candles */}
            {candles.map((candle, i) => {
              const x = i * 18 + 10;
              const isGreen = candle.close >= candle.open;
              const bodyTop = getY(Math.max(candle.open, candle.close));
              const bodyHeight = Math.max(Math.abs(getY(candle.open) - getY(candle.close)), 2);

              return (
                <g key={candle.time}>
                  <line x1={x + 5} y1={getY(candle.high)} x2={x + 5} y2={getY(candle.low)} className={isGreen ? "candle-wick-green" : "candle-wick-red"} strokeWidth="1" />
                  <rect x={x} y={bodyTop} width={10} height={bodyHeight} className={isGreen ? "candle-green" : "candle-red"} rx="1" />
                </g>
              );
            })}

            {/* Price Line */}
            {currentPrice > 0 && <line x1="0" y1={getY(currentPrice)} x2={candles.length * 18 + 20} y2={getY(currentPrice)} stroke="var(--accent-green)" strokeWidth="1" strokeDasharray="4 2" opacity="0.5" />}
          </svg>
        )}

        {/* Current Price Badge */}
        {currentPrice > 0 && candles.length > 0 && !isLoading && (
          <div
            className="absolute right-0 bg-[var(--accent-green)] text-black text-xs font-bold px-2 py-1 rounded-l"
            style={{
              top: `${(getY(currentPrice) / chartHeight) * 100}%`,
              transform: "translateY(-50%)",
            }}
          >
            {formatPrice(currentPrice)}
          </div>
        )}
      </div>

      {/* OHLC Footer */}
      <div className="flex items-center gap-6 mt-4 text-xs overflow-x-auto">
        <div className="flex items-center gap-2">
          <span className="text-[var(--text-muted)]">Open</span>
          <span className="font-medium">{lastCandle ? formatPrice(lastCandle.open) : "-"}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[var(--text-muted)]">High</span>
          <span className="font-medium text-[var(--accent-green)]">{lastCandle ? formatPrice(lastCandle.high) : "-"}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[var(--text-muted)]">Low</span>
          <span className="font-medium text-[var(--accent-red)]">{lastCandle ? formatPrice(lastCandle.low) : "-"}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[var(--text-muted)]">Close</span>
          <span className="font-medium">{lastCandle ? formatPrice(lastCandle.close) : "-"}</span>
        </div>
      </div>
    </div>
  );
}
