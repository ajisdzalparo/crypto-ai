import { NextResponse } from "next/server";
import { generateAIAnalysis } from "@/services/ai-analysis";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const coin = searchParams.get("coin") || "BTC";
    const language = (searchParams.get("language") as "EN" | "ID") || "EN";

    const analysis = await generateAIAnalysis(coin.toUpperCase(), language);

    return NextResponse.json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("AI Signal API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate AI analysis",
      },
      { status: 500 },
    );
  }
}
