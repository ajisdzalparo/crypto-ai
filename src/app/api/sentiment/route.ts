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
        score: analysis.sentiment.score,
        label: analysis.sentiment.label,
        summary: analysis.sentiment.summary,
        newsCount: analysis.sentiment.newsCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Sentiment API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch sentiment data",
      },
      { status: 500 },
    );
  }
}
