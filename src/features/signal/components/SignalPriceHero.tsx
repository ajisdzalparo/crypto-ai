/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils";
import { FullAnalysis } from "@/types";

interface SignalPriceHeroProps {
  signal: FullAnalysis | null;
  text: any;
  formatPrice: (value: number | undefined | null) => string;
}

export function SignalPriceHero({ signal, text, formatPrice }: SignalPriceHeroProps) {
  return (
    <div className="mt-4 flex flex-col md:flex-row md:items-end gap-4">
      <div>
        <span className="text-xs text-(--text-muted)">{text.currentPrice}</span>
        <div className="text-4xl font-bold">{formatPrice(signal?.price)}</div>
      </div>
      {signal && (
        <div className="flex items-center gap-3">
          <span className={cn("text-3xl font-black", signal.action.includes("BUY") ? "text-(--accent-green) glow-text-green" : signal.action.includes("SELL") ? "text-(--accent-red)" : "text-white")}>{signal.action.replace("_", " ")}</span>
          <Badge variant="live" className="text-xs">
            {signal.confidence}% CONFIDENCE
          </Badge>
        </div>
      )}
    </div>
  );
}
