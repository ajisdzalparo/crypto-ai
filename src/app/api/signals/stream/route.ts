import { generateSignal } from "@/services/ai-signal";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const coin = searchParams.get("coin") || "BTC";

  // Set up SSE headers
  const headers = new Headers({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection message
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "connected", message: "SSE Connected" })}\n\n`));

      // Function to send signal update
      const sendSignal = async () => {
        try {
          const signal = await generateSignal(coin.toUpperCase());
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "signal", data: signal })}\n\n`));
        } catch (error) {
          console.error("SSE signal error:", error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "error", message: "Failed to fetch signal" })}\n\n`));
        }
      };

      // Send initial signal
      await sendSignal();

      // Set up interval for updates (every 30 seconds)
      const intervalId = setInterval(sendSignal, 30000);

      // Keep connection alive with heartbeat
      const heartbeatId = setInterval(() => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "heartbeat", timestamp: new Date().toISOString() })}\n\n`));
      }, 15000);

      // Clean up on abort
      request.signal.addEventListener("abort", () => {
        clearInterval(intervalId);
        clearInterval(heartbeatId);
        controller.close();
      });
    },
  });

  return new Response(stream, { headers });
}
