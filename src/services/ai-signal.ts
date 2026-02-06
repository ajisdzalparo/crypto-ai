/**
 * Comprehensive AI Signal Generation Service
 * Combines technical, sentiment, and fundamental analysis for accurate predictions
 */

import { FundamentalResult } from "@/types";
import { getTechnicalAnalysis } from "./technical";
import { getSentimentAnalysis } from "./sentiment";
import { getFundamentalAnalysis } from "./fundamental";

interface SignalResult {
  coin: string;
  action: "STRONG_BUY" | "BUY" | "HOLD" | "SELL" | "STRONG_SELL";
  confidence: number;
  price: number;
  reasoning: string;
  insights: {
    bullish: string[];
    bearish: string[];
    neutral: string[];
  };
  technical: {
    rsi: number;
    macd: number;
    trend: string;
    signal: string;
  };
  sentiment: {
    score: number;
    label: string;
    summary: string;
    newsCount: number;
  };
  fundamental: {
    score: number;
    bias: string;
    cyclePhase: string;
    daysToHalving: number;
  };
  priceProjection: {
    shortTerm: { min: number; max: number; bias: string };
    mediumTerm: { min: number; max: number; bias: string };
    longTerm: { min: number; max: number; bias: string };
  };
  timestamp: string;
}

/**
 * Generate comprehensive AI-powered trading signal
 */
export async function generateSignal(coin: string = "BTC"): Promise<SignalResult> {
  const symbol = `${coin}USDT`;

  // Fetch all analysis data in parallel
  const [technical, sentiment] = await Promise.all([getTechnicalAnalysis(symbol), getSentimentAnalysis(coin)]);

  // Get fundamental with actual current price
  const fundamentalWithPrice = await getFundamentalAnalysis(technical.currentPrice);

  const openRouterKey = process.env.OPEN_ROUTER;

  let action: SignalResult["action"] = "HOLD";
  let confidence = 50;
  let reasoning = "";
  const insights: SignalResult["insights"] = {
    bullish: [...(fundamentalWithPrice.keyFactors?.bullish || [])],
    bearish: [...(fundamentalWithPrice.keyFactors?.bearish || [])],
    neutral: [],
  };

  // Build insights from technical analysis
  if (technical.rsi < 30) {
    insights.bullish.push(`RSI oversold at ${technical.rsi.toFixed(1)} - strong bounce potential`);
  } else if (technical.rsi > 70) {
    insights.bearish.push(`RSI overbought at ${technical.rsi.toFixed(1)} - correction likely`);
  }

  if (technical.macd.histogram > 0) {
    insights.bullish.push("MACD bullish with positive momentum");
  } else {
    insights.bearish.push("MACD bearish with negative momentum");
  }

  // Build insights from sentiment
  if (sentiment.score > 0.3) {
    insights.bullish.push(`Strong positive sentiment (${(sentiment.score * 100).toFixed(0)}%) from ${sentiment.newsCount} news sources`);
  } else if (sentiment.score < -0.3) {
    insights.bearish.push(`Negative market sentiment (${(sentiment.score * 100).toFixed(0)}%)`);
  }

  // Calculate weighted composite score
  const technicalScore = calculateTechnicalScore(technical);
  const sentimentScore = sentiment.score * 100;
  const fundamentalScore = fundamentalWithPrice.score; // Use 'score' not 'fundamentalScore'

  const compositeScore = technicalScore * 0.3 + sentimentScore * 0.25 + fundamentalScore * 0.45;

  // AI Analysis for refined decision
  if (openRouterKey) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openRouterKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://cryptoai-screener.com",
          "X-Title": "CryptoAI Screener",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001",
          messages: [
            {
              role: "system",
              content: `You are an expert crypto analyst. Return ONLY valid JSON:
{"action": "STRONG_BUY|BUY|HOLD|SELL|STRONG_SELL", "confidence": 0-100, "reasoning": "Brief analysis"}`,
            },
            {
              role: "user",
              content: `${coin} Analysis: Price $${technical.currentPrice}, RSI ${technical.rsi.toFixed(1)}, MACD ${technical.macd.histogram > 0 ? "bullish" : "bearish"}, Sentiment ${sentiment.label}, Halving Phase ${fundamentalWithPrice.halving.cyclePhase}, Score ${compositeScore.toFixed(0)}/100`,
            },
          ],
          temperature: 0.25,
          max_tokens: 300,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0]?.message?.content || "{}";
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          action = parsed.action || determineAction(compositeScore);
          confidence = Math.max(0, Math.min(100, parsed.confidence || Math.abs(compositeScore)));
          reasoning = parsed.reasoning || "";
        }
      }
    } catch (error) {
      console.error("AI signal generation error:", error);
    }
  }

  // Fallback logic
  if (!reasoning) {
    action = determineAction(compositeScore);
    confidence = Math.min(95, Math.max(40, Math.abs(compositeScore) + 20));
    reasoning = generateDetailedReasoning(action, technical, sentiment, fundamentalWithPrice, compositeScore);
  }

  const daysToHalving = fundamentalWithPrice.halving.nextHalving.daysRemaining ?? 0;

  return {
    coin,
    action,
    confidence,
    price: technical.currentPrice,
    reasoning,
    insights,
    technical: {
      rsi: technical.rsi,
      macd: technical.macd.histogram,
      trend: technical.trend,
      signal: technical.signal,
    },
    sentiment: {
      score: sentiment.score,
      label: sentiment.label,
      summary: sentiment.summary,
      newsCount: sentiment.newsCount,
    },
    fundamental: {
      score: fundamentalWithPrice.score,
      bias: fundamentalWithPrice.bias,
      cyclePhase: fundamentalWithPrice.halving.cyclePhase,
      daysToHalving,
    },
    priceProjection: fundamentalWithPrice.priceProjection ?? {
      shortTerm: { min: technical.currentPrice * 0.9, max: technical.currentPrice * 1.1, bias: "NEUTRAL" },
      mediumTerm: { min: technical.currentPrice * 0.8, max: technical.currentPrice * 1.3, bias: "NEUTRAL" },
      longTerm: { min: technical.currentPrice * 0.7, max: technical.currentPrice * 2, bias: "BULLISH" },
    },
    timestamp: new Date().toISOString(),
  };
}

function calculateTechnicalScore(technical: { rsi: number; macd: { histogram: number }; trend: string }): number {
  let score = 50;
  if (technical.rsi < 30) score += 25;
  else if (technical.rsi < 40) score += 15;
  else if (technical.rsi > 70) score -= 25;
  else if (technical.rsi > 60) score -= 15;

  if (technical.macd.histogram > 0) score += 15;
  else score -= 15;

  if (technical.trend === "BULLISH") score += 10;
  else if (technical.trend === "BEARISH") score -= 10;

  return Math.max(-100, Math.min(100, score));
}

function determineAction(score: number): SignalResult["action"] {
  if (score > 60) return "STRONG_BUY";
  if (score > 25) return "BUY";
  if (score < -60) return "STRONG_SELL";
  if (score < -25) return "SELL";
  return "HOLD";
}

function generateDetailedReasoning(action: string, technical: { rsi: number; currentPrice: number }, sentiment: { score: number; label: string }, fundamental: FundamentalResult, compositeScore: number): string {
  const cyclePhase = fundamental.halving.cyclePhase;
  const daysToH = fundamental.halving.nextHalving.daysRemaining ?? 0;

  switch (action) {
    case "STRONG_BUY":
      return `Strong bullish confluence (score ${compositeScore.toFixed(0)}). ${cyclePhase} phase with RSI at ${technical.rsi.toFixed(1)}. ${daysToH < 500 ? `${daysToH} days to halving.` : ""} Sentiment: ${sentiment.label.toLowerCase()}.`;
    case "BUY":
      return `Favorable accumulation conditions (score ${compositeScore.toFixed(0)}). RSI ${technical.rsi.toFixed(1)} not overextended. ${cyclePhase} phase provides support.`;
    case "SELL":
      return `Caution warranted (score ${compositeScore.toFixed(0)}). RSI ${technical.rsi.toFixed(1)} shows weakening. Consider reducing positions.`;
    case "STRONG_SELL":
      return `Multiple bearish signals (score ${compositeScore.toFixed(0)}). RSI ${technical.rsi.toFixed(1)} indicates ${technical.rsi > 70 ? "overbought" : "weakness"}. Reduce exposure.`;
    default:
      return `Mixed signals (score ${compositeScore.toFixed(0)}). RSI ${technical.rsi.toFixed(1)} neutral. ${cyclePhase} phase, ${daysToH} days to halving. Wait for confirmation.`;
  }
}
