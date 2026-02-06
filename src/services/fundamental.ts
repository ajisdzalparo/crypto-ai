/**
 * Fundamental Analysis Service
 * Analyzes on-chain data, halving cycles, and macro factors
 */

import { HalvingData, OnChainMetrics, MacroFactors, FundamentalResult } from "@/types";
import { HALVING_DATA } from "@/config";

/**
 * Get Bitcoin halving data and cycle analysis
 */
export async function getHalvingData(): Promise<HalvingData> {
  // Bitcoin halving schedule (historical data)
  const halvings = [
    { number: 1, date: "2012-11-28", block: 210000, priceAtHalving: 12.35, priceAfter1Year: 1000, percentGain: 8000 },
    { number: 2, date: "2016-07-09", block: 420000, priceAtHalving: 650.63, priceAfter1Year: 2500, percentGain: 284 },
    { number: 3, date: "2020-05-11", block: 630000, priceAtHalving: 8821, priceAfter1Year: 55000, percentGain: 523 },
    { number: 4, date: "2024-04-20", block: 840000, priceAtHalving: 63500, priceAfter1Year: 0, percentGain: 0 }, // Current cycle
  ];

  // Calculate next halving (Dynamic in real usage)
  const currentBlock = 883500; // Approximate current block
  const nextHalvingBlock = HALVING_DATA.nextHalvingBlock;
  const blocksRemaining = nextHalvingBlock - currentBlock;
  const avgBlockTime = HALVING_DATA.avgBlockTimeMinutes; // minutes
  const daysRemaining = Math.floor((blocksRemaining * avgBlockTime) / 60 / 24);

  const nextHalvingDate = new Date();
  nextHalvingDate.setDate(nextHalvingDate.getDate() + daysRemaining);

  // Determine cycle phase based on time since last halving
  const lastHalvingDate = new Date(HALVING_DATA.lastHalvingDate);
  const daysSinceHalving = Math.floor((Date.now() - lastHalvingDate.getTime()) / (1000 * 60 * 60 * 24));
  const cycleLength = daysRemaining + daysSinceHalving;
  const cycleProgress = Math.round((daysSinceHalving / cycleLength) * 100);

  // Cycle phases based on historical patterns
  let cyclePhase: HalvingData["cyclePhase"] = "ACCUMULATION";
  if (daysSinceHalving < 365) {
    cyclePhase = "ACCUMULATION"; // First year post-halving
  } else if (daysSinceHalving < 550) {
    cyclePhase = "MARKUP"; // Bull run typically 12-18 months post-halving
  } else if (daysSinceHalving < 800) {
    cyclePhase = "DISTRIBUTION"; // Peak and distribution
  } else {
    cyclePhase = "MARKDOWN"; // Bear market leading to next halving
  }

  return {
    lastHalving: {
      date: HALVING_DATA.lastHalvingDate,
      block: 840000,
      priceAtHalving: 63500,
    },
    nextHalving: {
      estimatedDate: nextHalvingDate.toISOString().split("T")[0],
      estimatedBlock: nextHalvingBlock,
      currentBlock,
      blocksRemaining,
      daysRemaining,
      date: "",
    },
    historicalPerformance: halvings.map((h) => ({
      halvingNumber: h.number,
      date: h.date,
      priceAtHalving: h.priceAtHalving,
      priceAfter1Year: h.priceAfter1Year,
      percentGain: h.percentGain,
    })),
    cyclePhase,
    cycleProgress,
    analysisNote: `We are in the ${cyclePhase} phase of the halving cycle.`,
  };
}

/**
 * Get on-chain metrics (simulated with realistic ranges)
 */
async function getOnChainMetrics(): Promise<OnChainMetrics> {
  try {
    // Fetch real data from blockchain APIs if available
    const response = await fetch("https://api.blockchain.info/stats?format=json", { next: { revalidate: 3600 } });

    if (response.ok) {
      const data = await response.json();

      return {
        activeAddresses24h: data.n_unique_addresses || 950000,
        transactionVolume24h: data.trade_volume_usd || 25000000000,
        exchangeNetFlow: -12500, // Negative = outflow (bullish)
        whaleTransactions: 1250,
        miningDifficulty: data.difficulty || 75000000000000,
        hashRate: data.hash_rate || 550000000,
        nupl: 0.45, // 0.45 = healthy profit zone
        mvrv: 1.8, // > 3.7 = overvalued, < 1 = undervalued
        sopr: 1.02, // > 1 = selling at profit
      };
    }
  } catch (error) {
    console.error("Blockchain API failed:", error);
  }

  // Fallback realistic values
  return {
    activeAddresses24h: 920000,
    transactionVolume24h: 28000000000,
    exchangeNetFlow: -8500,
    whaleTransactions: 1180,
    miningDifficulty: 72000000000000,
    hashRate: 520000000,
    nupl: 0.42,
    mvrv: 1.65,
    sopr: 1.01,
  };
}

/**
 * Get macro economic factors
 */
async function getMacroFactors(): Promise<MacroFactors> {
  // In production, these would come from economic APIs
  return {
    dxyIndex: 103.5,
    dxyTrend: "STABLE",
    fedRate: 4.5,
    fedOutlook: "NEUTRAL", // Based on recent Fed statements
    sp500Correlation: 0.65, // BTC correlation to S&P 500
    goldCorrelation: 0.35,
    inflation: 2.8, // CPI YoY
  };
}

/**
 * Calculate comprehensive fundamental score
 */
function calculateFundamentalScore(halving: HalvingData, onChain: OnChainMetrics, macro: MacroFactors): { score: number; factors: { bullish: string[]; bearish: string[] } } {
  let score = 0;
  const bullish: string[] = [];
  const bearish: string[] = [];

  // Halving Cycle Analysis (±30 points)
  if (halving.cyclePhase === "ACCUMULATION") {
    score += 25;
    bullish.push(`Post-halving accumulation phase - historically most bullish period`);
  } else if (halving.cyclePhase === "MARKUP") {
    score += 30;
    bullish.push(`Bull market markup phase - typically 300-500% gains from halving`);
  } else if (halving.cyclePhase === "DISTRIBUTION") {
    score -= 10;
    bearish.push(`Distribution phase - smart money taking profits`);
  } else {
    score -= 25;
    bearish.push(`Markdown phase - bear market conditions`);
  }

  // Days to next halving
  const daysRemaining = halving.nextHalving.daysRemaining || 0;
  if (daysRemaining < 365) {
    score += 15;
    bullish.push(`Only ${daysRemaining} days to next halving - supply shock incoming`);
  }

  // On-Chain Metrics (±40 points)
  // Exchange net flow
  if (onChain.exchangeNetFlow < -10000) {
    score += 15;
    bullish.push(`Strong exchange outflow (${Math.abs(onChain.exchangeNetFlow).toLocaleString()} BTC) - accumulation`);
  } else if (onChain.exchangeNetFlow > 10000) {
    score -= 15;
    bearish.push(`Exchange inflow detected - selling pressure`);
  }

  // MVRV Ratio
  if (onChain.mvrv < 1) {
    score += 20;
    bullish.push(`MVRV below 1 (${onChain.mvrv.toFixed(2)}) - historically undervalued`);
  } else if (onChain.mvrv > 3.5) {
    score -= 25;
    bearish.push(`MVRV at ${onChain.mvrv.toFixed(2)} - overvalued territory, correction likely`);
  } else if (onChain.mvrv < 2) {
    score += 10;
    bullish.push(`MVRV at ${onChain.mvrv.toFixed(2)} - healthy valuation with upside potential`);
  }

  // NUPL
  if (onChain.nupl < 0.25) {
    score += 15;
    bullish.push(`Low NUPL (${onChain.nupl.toFixed(2)}) - fear zone, good entry`);
  } else if (onChain.nupl > 0.75) {
    score -= 20;
    bearish.push(`High NUPL (${onChain.nupl.toFixed(2)}) - euphoria zone, risk of correction`);
  }

  // Macro Factors (±30 points)
  if (macro.dxyTrend === "FALLING") {
    score += 15;
    bullish.push(`Falling DXY supports risk assets including Bitcoin`);
  } else if (macro.dxyTrend === "RISING") {
    score -= 10;
    bearish.push(`Rising DXY creates headwinds for risk assets`);
  }

  if (macro.fedOutlook === "DOVISH") {
    score += 15;
    bullish.push(`Dovish Fed stance - liquidity favorable for crypto`);
  } else if (macro.fedOutlook === "HAWKISH") {
    score -= 15;
    bearish.push(`Hawkish Fed - tighter liquidity pressures risk assets`);
  }

  return { score: Math.max(-100, Math.min(100, score)), factors: { bullish, bearish } };
}

/**
 * Generate price projections
 */
function generatePriceProjection(currentPrice: number, fundamentalScore: number, halving: HalvingData): FundamentalResult["priceProjection"] {
  // Base projections on halving cycle and fundamental score
  const isPostHalvingBull = halving.cyclePhase === "ACCUMULATION" || halving.cyclePhase === "MARKUP";

  // Historical halving cycle gains: 80x (2012), 30x (2016), 6x (2020)
  // Diminishing returns pattern suggests 2-3x for this cycle

  const shortTermMultiplier = 1 + fundamentalScore / 200; // ±50% based on score
  const mediumTermMultiplier = isPostHalvingBull ? 1.5 : 0.8;
  const longTermMultiplier = isPostHalvingBull ? 2.5 : 1.2;

  return {
    shortTerm: {
      min: Math.round(currentPrice * (shortTermMultiplier - 0.15)),
      max: Math.round(currentPrice * (shortTermMultiplier + 0.2)),
      bias: fundamentalScore > 20 ? "BULLISH" : fundamentalScore < -20 ? "BEARISH" : "NEUTRAL",
    },
    mediumTerm: {
      min: Math.round(currentPrice * (mediumTermMultiplier - 0.3)),
      max: Math.round(currentPrice * (mediumTermMultiplier + 0.5)),
      bias: isPostHalvingBull ? "BULLISH" : "BEARISH",
    },
    longTerm: {
      min: Math.round(currentPrice * (longTermMultiplier - 0.5)),
      max: Math.round(currentPrice * (longTermMultiplier + 1)),
      bias: "BULLISH", // Long-term Bitcoin has always been bullish
    },
  };
}

/**
 * Get comprehensive fundamental analysis
 */
export async function getFundamentalAnalysis(currentPrice: number = 97000): Promise<FundamentalResult> {
  const [halving, onChain, macro] = await Promise.all([getHalvingData(), getOnChainMetrics(), getMacroFactors()]);

  const { score, factors } = calculateFundamentalScore(halving, onChain, macro);

  let bias: FundamentalResult["bias"] = "NEUTRAL";
  if (score > 50) bias = "STRONGLY_BULLISH";
  else if (score > 20) bias = "BULLISH";
  else if (score < -50) bias = "STRONGLY_BEARISH";
  else if (score < -20) bias = "BEARISH";

  const priceProjection = generatePriceProjection(currentPrice, score, halving);

  return {
    fundamentalScore: score,
    score,
    bias,
    halving,
    onChain,
    macro,
    keyFactors: factors,
    priceProjection,
    cyclePhase: halving.cyclePhase,
    daysToHalving: halving.nextHalving.daysRemaining,
    mvrvRatio: onChain.mvrv,
    nuplScore: onChain.nupl,
  };
}
