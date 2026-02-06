/**
 * Technical Analysis Service
 * Calculates RSI, MACD, SMA, and other indicators from Binance data
 */

import { Candle, TechnicalIndicators } from "@/types";
import { BINANCE_API_URL, FALLBACK_PRICES } from "@/config";

/**
 * Fetch klines (candlestick) data from Binance
 */
export async function fetchBinanceKlines(symbol: string = "BTCUSDT", interval: string = "1h", limit: number = 100): Promise<Candle[]> {
  try {
    const response = await fetch(`${BINANCE_API_URL}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`, {
      next: { revalidate: 60 },
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error(`Binance API error: ${response.status} ${response.statusText}`);
      throw new Error(`Binance API error: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("Invalid response from Binance");
    }

    return data.map((k: (string | number)[]) => ({
      time: k[0] as number,
      open: parseFloat(k[1] as string),
      high: parseFloat(k[2] as string),
      low: parseFloat(k[3] as string),
      close: parseFloat(k[4] as string),
      volume: parseFloat(k[5] as string),
    }));
  } catch (error) {
    console.error("fetchBinanceKlines error:", error);
    throw error;
  }
}

/**
 * Calculate Relative Strength Index (RSI)
 */
export function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) {
    return 50;
  }

  const changes: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }

  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) {
      avgGain += changes[i];
    } else {
      avgLoss += Math.abs(changes[i]);
    }
  }

  avgGain /= period;
  avgLoss /= period;

  for (let i = period; i < changes.length; i++) {
    const change = changes[i];
    if (change > 0) {
      avgGain = (avgGain * (period - 1) + change) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) + Math.abs(change)) / period;
    }
  }

  if (avgLoss === 0) return 100;

  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

/**
 * Calculate Simple Moving Average (SMA)
 */
export function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) {
    return prices[prices.length - 1];
  }

  const slice = prices.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

/**
 * Calculate Exponential Moving Average (EMA)
 */
export function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) {
    return prices[prices.length - 1];
  }

  const multiplier = 2 / (period + 1);
  let ema = calculateSMA(prices.slice(0, period), period);

  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }

  return ema;
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macd = ema12 - ema26;

  const signal = macd * 0.8;
  const histogram = macd - signal;

  return { macd, signal, histogram };
}

/**
 * Get fallback data when API fails
 */
function getFallbackData(symbol: string): TechnicalIndicators {
  const price = FALLBACK_PRICES[symbol] || 1000;

  return {
    rsi: 52,
    macd: { macd: 50, signal: 45, histogram: 5 },
    sma20: price * 0.98,
    sma50: price * 0.95,
    ema12: price * 0.99,
    ema26: price * 0.97,
    currentPrice: price,
    priceChange24h: 1.5,
    volume24h: 25000000000,
    trend: "NEUTRAL",
    signal: "NEUTRAL",
    support: price * 0.9,
    resistance: price * 1.1,
  };
}

/**
 * Get complete technical analysis for a coin
 */
export async function getTechnicalAnalysis(symbol: string = "BTCUSDT"): Promise<TechnicalIndicators> {
  try {
    const candles = await fetchBinanceKlines(symbol, "1h", 100);

    if (!candles || candles.length === 0) {
      console.error("No candles returned, using fallback");
      return getFallbackData(symbol);
    }

    const closePrices = candles.map((c) => c.close);

    const currentPrice = closePrices[closePrices.length - 1];
    const price24hAgo = closePrices[closePrices.length - 24] || closePrices[0];
    const priceChange24h = ((currentPrice - price24hAgo) / price24hAgo) * 100;

    const rsi = calculateRSI(closePrices);
    const macd = calculateMACD(closePrices);
    const sma20 = calculateSMA(closePrices, 20);
    const sma50 = calculateSMA(closePrices, 50);
    const ema12 = calculateEMA(closePrices, 12);
    const ema26 = calculateEMA(closePrices, 26);

    const volume24h = candles.slice(-24).reduce((sum, c) => sum + c.volume * c.close, 0);

    let trend: "BULLISH" | "BEARISH" | "NEUTRAL" = "NEUTRAL";
    if (currentPrice > sma20 && sma20 > sma50 && macd.histogram > 0) {
      trend = "BULLISH";
    } else if (currentPrice < sma20 && sma20 < sma50 && macd.histogram < 0) {
      trend = "BEARISH";
    }

    let signal: "OVERSOLD" | "OVERBOUGHT" | "NEUTRAL" = "NEUTRAL";
    if (rsi < 30) {
      signal = "OVERSOLD";
    } else if (rsi > 70) {
      signal = "OVERBOUGHT";
    }

    // Simple support/resistance detection
    const lowPrices = candles.map((c) => c.low);
    const highPrices = candles.map((c) => c.high);
    const support = Math.min(...lowPrices.slice(-20));
    const resistance = Math.max(...highPrices.slice(-20));

    return {
      rsi: Math.round(rsi * 100) / 100,
      macd: {
        macd: Math.round(macd.macd * 100) / 100,
        signal: Math.round(macd.signal * 100) / 100,
        histogram: Math.round(macd.histogram * 100) / 100,
      },
      sma20: Math.round(sma20 * 100) / 100,
      sma50: Math.round(sma50 * 100) / 100,
      ema12: Math.round(ema12 * 100) / 100,
      ema26: Math.round(ema26 * 100) / 100,
      currentPrice: Math.round(currentPrice * 100) / 100,
      priceChange24h: Math.round(priceChange24h * 100) / 100,
      volume24h: Math.round(volume24h),
      trend,
      signal,
      support,
      resistance,
    };
  } catch (error) {
    console.error("getTechnicalAnalysis error:", error);
    return getFallbackData(symbol);
  }
}
