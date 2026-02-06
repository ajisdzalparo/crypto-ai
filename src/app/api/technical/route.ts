import { NextResponse } from "next/server";
import { generateAIAnalysis } from "@/services/ai-analysis";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const coin = searchParams.get("coin") || "BTC";

    const analysis = await generateAIAnalysis(coin.toUpperCase());

    return NextResponse.json({
      success: true,
      data: {
        rsi: analysis.technical.rsi,
        macd: analysis.technical.macd,
        trend: analysis.technical.trend,
        signal: analysis.technical.signal,
        currentPrice: analysis.price,
        priceChange24h: analysis.priceChange24h,
        support: analysis.technical.support,
        resistance: analysis.technical.resistance,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Technical API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch technical data",
      },
      { status: 500 },
    );
  }
}
