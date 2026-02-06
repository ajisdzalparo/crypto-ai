import { Card, CardContent } from "@/components/ui/card";
import { FullAnalysis } from "@/types";
import { SignalTranslations } from "@/utils/i18n/translations";

interface HalvingAnalysisProps {
  signal: FullAnalysis;
  text: SignalTranslations;
  formatPrice: (value: number | undefined | null) => string;
}

export function HalvingAnalysis({ signal, text, formatPrice }: HalvingAnalysisProps) {
  if (!signal.halvingPrediction) return null;

  const { halvingPrediction } = signal;
  const nextHalving = halvingPrediction.nextHalving;
  const lastHalving = halvingPrediction.lastHalving;

  // Extract year from date if not provided
  const nextYear = nextHalving.year ?? (nextHalving.estimatedDate ? new Date(nextHalving.estimatedDate).getFullYear() : 2028);
  const lastYear = lastHalving.year ?? (lastHalving.date ? new Date(lastHalving.date).getFullYear() : 2024);
  const lastMonth = lastHalving.month ?? (lastHalving.date ? new Date(lastHalving.date).toLocaleString("default", { month: "short" }) : "Apr");
  const daysUntil = nextHalving.daysUntil ?? nextHalving.daysRemaining ?? 0;

  return (
    <div className="space-y-4">
      {/* Next Halving Countdown */}
      <Card className="bg-linear-to-r from-(--accent-green-soft) to-transparent border-l-4 border-l-(--accent-green) border-y-(--border-color) border-r-(--border-color)">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="text-xs text-(--text-muted) uppercase tracking-wider">
                🔮 {text.nextHalving} ({nextYear})
              </span>
              <div className="text-3xl font-bold text-(--accent-green) mt-1">
                ~{daysUntil} {text.days}
              </div>
              <p className="text-sm text-(--text-secondary) mt-1">
                {text.est} {nextHalving.estimatedMonth ?? "Q1"} {nextYear} • {text.blockReward}: 3.125 → 1.5625 BTC
              </p>
            </div>
            <div>
              <span className="text-xs text-(--text-muted)">{text.currentPhase}</span>
              <div className="text-2xl font-bold text-(--accent-green) mt-1">{signal.fundamental.cyclePhase}</div>
              <p className="text-xs text-(--text-muted)">
                {text.since} {lastMonth} {lastYear} {text.halving}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Cycle Halving Price Predictions */}
      {halvingPrediction.nextCyclePrediction && (
        <Card className="border-(--accent-green-soft)">
          <CardContent className="p-5">
            <h3 className="font-bold mb-4">
              🎯 {nextYear} {text.halvingPredictions}
            </h3>
            <p className="text-sm text-(--text-secondary) mb-4">{halvingPrediction.analysisNote}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="neu-card-inset p-4 rounded-lg text-center">
                <span className="text-xs text-(--text-muted)">🐻 {text.bearCase}</span>
                <div className="text-2xl font-bold text-(--accent-orange) mt-2">{formatPrice(halvingPrediction.nextCyclePrediction.bearCase)}</div>
                <p className="text-xs text-(--text-muted) mt-1">If macro headwinds persist</p>
              </div>
              <div className="neu-card-inset p-4 rounded-lg text-center border-2 border-(--accent-green)">
                <span className="text-xs text-(--accent-green)">📈 {text.baseCase}</span>
                <div className="text-2xl font-bold text-(--accent-green) mt-2">{formatPrice(halvingPrediction.nextCyclePrediction.baseCase)}</div>
                <p className="text-xs text-(--text-muted) mt-1">Following historical pattern</p>
              </div>
              <div className="neu-card-inset p-4 rounded-lg text-center">
                <span className="text-xs text-(--text-muted)">🚀 {text.bullCase}</span>
                <div className="text-2xl font-bold text-(--accent-green) mt-2">{formatPrice(halvingPrediction.nextCyclePrediction.bullCase)}+</div>
                <p className="text-xs text-(--text-muted) mt-1">If institutional adoption accelerates</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-(--bg-secondary) rounded-lg">
              <p className="text-xs text-(--text-secondary)">
                <strong>
                  {lastYear} {text.cyclePerformance}:
                </strong>{" "}
                {text.peakReached} {formatPrice(halvingPrediction.cyclePeakPrice)} ({halvingPrediction.currentCycleReturn} {text.returnFrom} {formatPrice(lastHalving.priceAtHalving)}). {text.aiUpdate}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
