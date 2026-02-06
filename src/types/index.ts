/* eslint-disable @typescript-eslint/no-explicit-any */
export type Currency = "USD" | "IDR";
export type Language = "EN" | "ID";

// Candle Data
export interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  time: number;
}

// Technical Analysis Types
export interface TechnicalIndicators {
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  sma20: number;
  sma50: number;
  ema12: number;
  ema26: number;
  currentPrice: number;
  priceChange24h: number;
  volume24h: number;
  trend: "BULLISH" | "BEARISH" | "NEUTRAL";
  signal: "OVERSOLD" | "OVERBOUGHT" | "NEUTRAL";
  support?: number;
  resistance?: number;
}

// Halving Data Types
export interface HalvingInfo {
  date: string; // ISO date string or YYYY-MM
  block?: number;
  priceAtHalving?: number;
  // Additional fields for UI compatibility
  year?: number;
  month?: string;
}

export interface NextHalvingInfo extends HalvingInfo {
  estimatedDate?: string;
  estimatedMonth?: string;
  estimatedBlock?: number;
  currentBlock?: number;
  blocksRemaining?: number;
  daysRemaining?: number;
  // Additional fields for UI compatibility
  year?: number;
  month?: string;
  daysUntil?: number;
}

export interface HalvingData {
  lastHalving: HalvingInfo;
  nextHalving: NextHalvingInfo;
  historicalPerformance?: {
    halvingNumber: number;
    date: string;
    priceAtHalving: number;
    priceAfter1Year: number;
    percentGain: number;
  }[];
  cyclePhase: "ACCUMULATION" | "MARKUP" | "DISTRIBUTION" | "MARKDOWN";
  cycleProgress?: number; // 0-100
  analysisNote?: string;
  currentCycleReturn?: string;
  cyclePeakPrice?: number;
  nextCyclePrediction?: {
    bearCase: number;
    baseCase: number;
    bullCase: number;
  };
}

// On-Chain Types
export interface OnChainMetrics {
  activeAddresses24h: number;
  transactionVolume24h: number;
  exchangeNetFlow: number; // Negative = accumulation, Positive = selling
  whaleTransactions: number;
  miningDifficulty: number;
  hashRate: number;
  nupl: number; // Net Unrealized Profit/Loss
  mvrv: number; // Market Value to Realized Value
  sopr: number; // Spent Output Profit Ratio
}

// Macro Types
export interface MacroFactors {
  dxyIndex: number;
  dxyTrend: "RISING" | "FALLING" | "STABLE";
  fedRate: number;
  fedOutlook: "HAWKISH" | "DOVISH" | "NEUTRAL";
  sp500Correlation: number;
  goldCorrelation: number;
  inflation: number;
}

// Fundamental Analysis Types
export interface FundamentalResult {
  fundamentalScore: any;
  score: number; // -100 to 100
  bias: "STRONGLY_BULLISH" | "BULLISH" | "NEUTRAL" | "BEARISH" | "STRONGLY_BEARISH";
  halving: HalvingData;
  onChain: OnChainMetrics;
  macro?: MacroFactors;
  keyFactors?: {
    bullish: string[];
    bearish: string[];
  };
  priceProjection?: {
    shortTerm: { min: number; max: number; bias: string; timeframe?: string };
    mediumTerm: { min: number; max: number; bias: string; timeframe?: string };
    longTerm: { min: number; max: number; bias: string; timeframe?: string };
  };
  // Simplified fields for AI analysis compatibility
  cyclePhase?: string;
  daysToHalving?: number;
  mvrvRatio?: number;
  nuplScore?: number;
}

// Sentiment Types
export interface NewsItem {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  sentiment?: number;
}

export interface SentimentResult {
  score: number; // -1 to 1
  label: "VERY_BULLISH" | "BULLISH" | "NEUTRAL" | "BEARISH" | "VERY_BEARISH";
  summary: string;
  newsCount: number;
  topNews?: NewsItem[];
}

// Full AI Analysis Types
export interface FullAnalysis {
  coin: string;
  price: number;
  priceChange24h: number;
  action: "STRONG_BUY" | "BUY" | "HOLD" | "SELL" | "STRONG_SELL";
  confidence: number;
  reasoning: string;
  insights: {
    bullish: string[];
    bearish: string[];
    neutral: string[];
  };
  technical: TechnicalIndicators;
  sentiment: SentimentResult;
  fundamental: FundamentalResult;
  priceProjection: {
    shortTerm: { min: number; max: number; bias: string; timeframe: string };
    mediumTerm: { min: number; max: number; bias: string; timeframe: string };
    longTerm: { min: number; max: number; bias: string; timeframe: string };
  };
  halvingPrediction: HalvingData;
  timestamp: string;
}

export type SignalType = "LONG" | "SHORT";
export type SignalStatus = "ACTIVE" | "PENDING" | "CLOSED";

export interface Signal {
  pair: string;
  type: SignalType;
  entry: string;
  target: string;
  time: string;
  status: SignalStatus;
}
