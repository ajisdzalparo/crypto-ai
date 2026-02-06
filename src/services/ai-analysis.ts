/**
 * AI-Powered Analysis Service
 * Uses OpenRouter to generate comprehensive crypto analysis
 */

import { FullAnalysis, FundamentalResult, HalvingData, TechnicalIndicators, SentimentResult } from "@/types";
import { OPENROUTER_API_URL } from "@/config";
import { getHalvingData } from "./fundamental";

const AI_MODEL = "google/gemini-2.0-flash-001";

type ActionType = "STRONG_BUY" | "BUY" | "HOLD" | "SELL" | "STRONG_SELL";
type BiasType = "STRONGLY_BULLISH" | "BULLISH" | "NEUTRAL" | "BEARISH" | "STRONGLY_BEARISH";
type SentimentLabel = "VERY_BULLISH" | "BULLISH" | "NEUTRAL" | "BEARISH" | "VERY_BEARISH";
type TrendType = "BULLISH" | "BEARISH" | "NEUTRAL";
type SignalType = "OVERSOLD" | "OVERBOUGHT" | "NEUTRAL";

/**
 * Generate comprehensive AI analysis using OpenRouter
 */
export async function generateAIAnalysis(coin: string = "BTC", language: "EN" | "ID" = "EN"): Promise<FullAnalysis> {
  const openRouterKey = process.env.OPEN_ROUTER;
  const currentDate = new Date().toISOString().split("T")[0];

  const halvingData = await getHalvingData();
  const daysToHalving = halvingData.nextHalving.daysRemaining ?? 0;
  const estimatedDate = halvingData.nextHalving.estimatedDate;
  const cyclePhase = halvingData.cyclePhase;

  if (!openRouterKey) {
    return getMockAnalysis(coin, cyclePhase, daysToHalving);
  }

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openRouterKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://cryptoai-screener.com",
        "X-Title": "CryptoAI Screener",
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: "system", content: buildSystemPrompt(currentDate, estimatedDate, daysToHalving, cyclePhase, language) },
          { role: "user", content: `Generate comprehensive trading analysis for ${coin}. Include realistic current market data.` },
        ],
        temperature: 0.4,
        max_tokens: 1500,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices[0]?.message?.content || "{}";
      const parsed = parseAIResponse(content);

      if (parsed) {
        return buildAnalysisResult(coin, parsed, halvingData, cyclePhase, daysToHalving);
      }
    }
  } catch (error) {
    console.error("AI analysis error:", error);
  }

  return getMockAnalysis(coin, cyclePhase, daysToHalving);
}

function buildSystemPrompt(currentDate: string, estimatedDate: string | undefined, daysToHalving: number, cyclePhase: string, language: "EN" | "ID"): string {
  return `You are an expert crypto analyst. Today is ${currentDate}. Next halving ~${estimatedDate} (${daysToHalving} days). Current phase: ${cyclePhase}.

OUTPUT: Valid JSON only with these fields:
{
  "price": number,
  "priceChange24h": number,
  "action": "STRONG_BUY|BUY|HOLD|SELL|STRONG_SELL",
  "confidence": 0-100,
  "reasoning": "string",
  "insights": { "bullish": ["string"], "bearish": ["string"] },
  "technical": { "rsi": 0-100, "macd": { "macd": n, "signal": n, "histogram": n }, "trend": "BULLISH|BEARISH|NEUTRAL", "signal": "OVERSOLD|OVERBOUGHT|NEUTRAL", "support": n, "resistance": n },
  "sentiment": { "score": -1 to 1, "label": "VERY_BULLISH|BULLISH|NEUTRAL|BEARISH|VERY_BEARISH", "summary": "string", "newsCount": n },
  "fundamental": { "score": -100 to 100, "bias": "STRONGLY_BULLISH|BULLISH|NEUTRAL|BEARISH|STRONGLY_BEARISH", "mvrvRatio": n, "nuplScore": n },
  "priceProjection": { "shortTerm": { "min": n, "max": n, "bias": "string", "timeframe": "1-4 weeks" }, "mediumTerm": {...}, "longTerm": {...} },
  "halvingPrediction": { "analysisNote": "string", "currentCycleReturn": "string", "cyclePeakPrice": n, "nextCyclePrediction": { "bearCase": n, "baseCase": n, "bullCase": n } }
}
${language === "ID" ? "OUTPUT text fields in Bahasa Indonesia." : ""}`;
}

function parseAIResponse(content: string): Record<string, unknown> | null {
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      return null;
    }
  }
  return null;
}

function buildAnalysisResult(coin: string, parsed: Record<string, unknown>, halvingData: HalvingData, cyclePhase: string, daysToHalving: number): FullAnalysis {
  const technical = (parsed.technical as Record<string, unknown>) || {};
  const sentiment = (parsed.sentiment as Record<string, unknown>) || {};
  const fundamental = (parsed.fundamental as Record<string, unknown>) || {};
  const insights = (parsed.insights as Record<string, unknown>) || {};
  const halvingPred = (parsed.halvingPrediction as Record<string, unknown>) || {};

  const price = (parsed.price as number) || 97500;

  const technicalResult: TechnicalIndicators = {
    rsi: (technical.rsi as number) || 50,
    macd: (technical.macd as { macd: number; signal: number; histogram: number }) || { macd: 0, signal: 0, histogram: 0 },
    sma20: price * 0.98,
    sma50: price * 0.95,
    ema12: price * 0.99,
    ema26: price * 0.97,
    currentPrice: price,
    priceChange24h: (parsed.priceChange24h as number) || 0,
    volume24h: 0,
    trend: ((technical.trend as string) || "NEUTRAL") as TrendType,
    signal: ((technical.signal as string) || "NEUTRAL") as SignalType,
    support: (technical.support as number) || price * 0.92,
    resistance: (technical.resistance as number) || price * 1.08,
  };

  const sentimentResult: SentimentResult = {
    score: (sentiment.score as number) || 0,
    label: ((sentiment.label as string) || "NEUTRAL") as SentimentLabel,
    summary: (sentiment.summary as string) || "Analyzing market sentiment...",
    newsCount: (sentiment.newsCount as number) || 0,
  };

  const fundamentalResult: FundamentalResult = {
    fundamentalScore: (fundamental.score as number) || 0,
    score: (fundamental.score as number) || 0,
    bias: ((fundamental.bias as string) || "NEUTRAL") as BiasType,
    halving: halvingData,
    onChain: {
      activeAddresses24h: 0,
      transactionVolume24h: 0,
      exchangeNetFlow: 0,
      whaleTransactions: 0,
      miningDifficulty: 0,
      hashRate: 0,
      nupl: (fundamental.nuplScore as number) || 0,
      mvrv: (fundamental.mvrvRatio as number) || 0,
      sopr: 1,
    },
    keyFactors: { bullish: [], bearish: [] },
    cyclePhase,
    daysToHalving,
    mvrvRatio: (fundamental.mvrvRatio as number) || 1.5,
    nuplScore: (fundamental.nuplScore as number) || 0.4,
  };

  const halvingPrediction: HalvingData = {
    ...halvingData,
    analysisNote: (halvingPred.analysisNote as string) || halvingData.analysisNote,
    currentCycleReturn: (halvingPred.currentCycleReturn as string) || "+70%",
    cyclePeakPrice: (halvingPred.cyclePeakPrice as number) || 108000,
    nextCyclePrediction: (halvingPred.nextCyclePrediction as { bearCase: number; baseCase: number; bullCase: number }) || {
      bearCase: 150000,
      baseCase: 250000,
      bullCase: 500000,
    },
  };

  return {
    coin,
    price,
    priceChange24h: (parsed.priceChange24h as number) || 0,
    action: ((parsed.action as string) || "HOLD") as ActionType,
    confidence: Math.max(0, Math.min(100, (parsed.confidence as number) || 50)),
    reasoning: (parsed.reasoning as string) || "Analysis in progress...",
    insights: {
      bullish: (insights.bullish as string[]) || [],
      bearish: (insights.bearish as string[]) || [],
      neutral: (insights.neutral as string[]) || [],
    },
    technical: technicalResult,
    sentiment: sentimentResult,
    fundamental: fundamentalResult,
    priceProjection: (parsed.priceProjection as FullAnalysis["priceProjection"]) || {
      shortTerm: { min: price * 0.9, max: price * 1.15, bias: "BULLISH", timeframe: "1-4 weeks" },
      mediumTerm: { min: price * 1.2, max: price * 1.8, bias: "BULLISH", timeframe: "3-6 months" },
      longTerm: { min: price * 1.5, max: price * 3, bias: "BULLISH", timeframe: "1-2 years" },
    },
    halvingPrediction,
    timestamp: new Date().toISOString(),
  };
}

// Mock data for fallback
const PRICE_MAP: Record<string, number> = { BTC: 97500, ETH: 3280, SOL: 185, BNB: 620 };

function getMockAnalysis(coin: string, cyclePhase: string, daysToHalving: number): FullAnalysis {
  const price = PRICE_MAP[coin] || 1000;
  const phase = cyclePhase as HalvingData["cyclePhase"];

  return {
    coin,
    price,
    priceChange24h: 2.5,
    action: "BUY",
    confidence: 72,
    reasoning: `${coin} is in ${cyclePhase} phase with ${daysToHalving} days until the next halving.`,
    insights: {
      bullish: [`Post-halving ${cyclePhase} phase`, `${daysToHalving} days to next halving`, "Institutional adoption growing"],
      bearish: ["Macroeconomic uncertainty", "Regulatory headwinds"],
      neutral: [],
    },
    technical: {
      rsi: 52,
      macd: { macd: 150, signal: 140, histogram: 10 },
      sma20: price * 0.98,
      sma50: price * 0.95,
      ema12: price * 0.99,
      ema26: price * 0.97,
      currentPrice: price,
      priceChange24h: 2.5,
      volume24h: 0,
      trend: "BULLISH",
      signal: "NEUTRAL",
      support: Math.round(price * 0.92),
      resistance: Math.round(price * 1.08),
    },
    sentiment: {
      score: 0.35,
      label: "BULLISH",
      summary: "Market sentiment cautiously optimistic.",
      newsCount: 24,
    },
    fundamental: {
      fundamentalScore: 45,
      score: 45,
      bias: "BULLISH",
      halving: {
        lastHalving: { date: "2024-04-20", block: 840000, priceAtHalving: 63500 },
        nextHalving: { date: "2028-04-20", daysRemaining: daysToHalving },
        cyclePhase: phase,
      },
      onChain: {
        activeAddresses24h: 0,
        transactionVolume24h: 0,
        exchangeNetFlow: 0,
        whaleTransactions: 0,
        miningDifficulty: 0,
        hashRate: 0,
        nupl: 0.42,
        mvrv: 1.65,
        sopr: 1,
      },
      keyFactors: { bullish: [], bearish: [] },
      cyclePhase,
      daysToHalving,
      mvrvRatio: 1.65,
      nuplScore: 0.42,
    },
    priceProjection: {
      shortTerm: { min: Math.round(price * 0.9), max: Math.round(price * 1.15), bias: "BULLISH", timeframe: "1-4 weeks" },
      mediumTerm: { min: Math.round(price * 1.2), max: Math.round(price * 1.8), bias: "BULLISH", timeframe: "3-6 months" },
      longTerm: { min: Math.round(price * 1.5), max: Math.round(price * 3), bias: "BULLISH", timeframe: "1-2 years" },
    },
    halvingPrediction: {
      lastHalving: { date: "2024-04-20", block: 840000, priceAtHalving: 63500 },
      nextHalving: { date: "2028-04-20", estimatedDate: "2028-04-20", daysRemaining: daysToHalving },
      currentCycleReturn: "+70%",
      cyclePeakPrice: 108000,
      nextCyclePrediction: { bearCase: 150000, baseCase: 250000, bullCase: 500000 },
      cyclePhase: phase,
      analysisNote: "We are in the 4th halving cycle.",
    },
    timestamp: new Date().toISOString(),
  };
}

export type { FullAnalysis };
