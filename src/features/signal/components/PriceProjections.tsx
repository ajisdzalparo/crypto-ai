import { Card, CardContent } from "@/components/ui/card";
import { FullAnalysis } from "@/types";
import { cn } from "@/utils";

interface PriceProjectionsProps {
  signal: FullAnalysis;
  text: any;
  formatPrice: (value: number | undefined | null) => string;
  getSignalColor: (signalValue: string | undefined) => string;
}

export function PriceProjections({ signal, text, formatPrice, getSignalColor }: PriceProjectionsProps) {
  if (!signal.priceProjection) return null;

  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="font-bold mb-4">{text.priceProjections}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Short Term */}
          <div className="stat-box">
            <span className="text-xs text-[var(--text-muted)]">{text.shortTerm}</span>
            <div className="flex justify-between mt-2">
              <span className="font-bold">{formatPrice(signal.priceProjection.shortTerm.min)}</span>
              <span className="text-[var(--text-secondary)]">-</span>
              <span className="font-bold">{formatPrice(signal.priceProjection.shortTerm.max)}</span>
            </div>
            <div className={cn("text-xs mt-2", getSignalColor(signal.priceProjection.shortTerm.bias || "NEUTRAL"))}>{signal.priceProjection.shortTerm.bias}</div>
          </div>

          {/* Medium Term */}
          <div className="stat-box">
            <span className="text-xs text-[var(--text-muted)]">{text.midTerm}</span>
            <div className="flex justify-between mt-2">
              <span className="font-bold text-[var(--accent-green)]">{formatPrice(signal.priceProjection.mediumTerm.min)}</span>
              <span className="text-[var(--text-secondary)]">-</span>
              <span className="font-bold text-[var(--accent-green)]">{formatPrice(signal.priceProjection.mediumTerm.max)}</span>
            </div>
            <div className={cn("text-xs mt-2", getSignalColor(signal.priceProjection.mediumTerm.bias || "NEUTRAL"))}>{signal.priceProjection.mediumTerm.bias}</div>
          </div>

          {/* Long Term */}
          <div className="stat-box">
            <span className="text-xs text-[var(--text-muted)]">{text.longTerm}</span>
            <div className="flex justify-between mt-2">
              <span className="font-bold">{formatPrice(signal.priceProjection.longTerm.min)}</span>
              <span className="text-[var(--text-secondary)]">-</span>
              <span className="font-bold">{formatPrice(signal.priceProjection.longTerm.max)}</span>
            </div>
            <div className={cn("text-xs mt-2", getSignalColor(signal.priceProjection.longTerm.bias || "NEUTRAL"))}>{signal.priceProjection.longTerm.bias}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
