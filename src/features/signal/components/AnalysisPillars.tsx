import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FullAnalysis } from "@/types";
import { cn } from "@/utils";

interface AnalysisPillarsProps {
  signal: FullAnalysis;
  text: any;
  formatPrice: (value: number | undefined | null) => string;
  getSignalColor: (signalValue: string | undefined) => string;
  fearGreedValue: number;
}

export function AnalysisPillars({ signal, text, formatPrice, getSignalColor, fearGreedValue }: AnalysisPillarsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Technical Analysis */}
      <div className="pillar-card bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 flex flex-col">
        <div className="pillar-header flex items-center gap-3 mb-4">
          <div className="pillar-icon w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--accent-green-soft)] text-[var(--accent-green)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M2 12h20M22 2l-10 10-4-4-6 6" />
            </svg>
          </div>
          <h3 className="font-bold">{text.technical}</h3>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="stat-box">
              <span className="text-xs text-[var(--text-muted)]">RSI (14)</span>
              <div className={cn("text-xl font-bold", getSignalColor(signal.technical.signal || "NEUTRAL"))}>{signal.technical.rsi}</div>
            </div>
            <div className="stat-box">
              <span className="text-xs text-[var(--text-muted)]">MACD</span>
              <div className={cn("text-xl font-bold", signal.technical.macd.macd > 0 ? "text-[var(--accent-green)]" : "text-[var(--accent-red)]")}>{signal.technical.macd.macd?.toFixed(2) || "0.00"}</div>
            </div>
          </div>
          <div className="stat-box">
            <span className="text-xs text-[var(--text-muted)]">Support / Resistance</span>
            <div className="flex justify-between mt-2 text-sm">
              <div className="text-right">
                <span className="text-[var(--accent-red)]">Res:</span> {formatPrice(signal.technical.resistance)}
              </div>
              <div>
                <span className="text-[var(--accent-green)]">Sup:</span> {formatPrice(signal.technical.support)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sentiment Analysis */}
      <div className="pillar-card bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 flex flex-col">
        <div className="pillar-header flex items-center gap-3 mb-4">
          <div className="pillar-icon w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--accent-green-soft)] text-[var(--accent-green)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" />
              <line x1="12" y1="20" x2="12" y2="22" />
              <line x1="12" y1="2" x2="12" y2="4" />
              <line x1="4.93" y1="4.93" x2="3.51" y2="3.51" />
              <line x1="19.07" y1="19.07" x2="20.49" y2="20.49" />
            </svg>
          </div>
          <h3 className="font-bold">{text.sentiment}</h3>
        </div>
        <div className="space-y-4">
          <div className="stat-box">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-[var(--text-muted)]">{text.fearGreed}</span>
              <span className={cn("text-xs font-bold", fearGreedValue > 60 ? "text-[var(--accent-green)]" : fearGreedValue < 40 ? "text-[var(--accent-red)]" : "text-[var(--accent-orange)]")}>
                {fearGreedValue > 60 ? "GREED" : fearGreedValue < 40 ? "FEAR" : "NEUTRAL"}
              </span>
            </div>
            <div className="w-full bg-[var(--bg-secondary)] rounded-full h-2">
              <div className={cn("h-2 rounded-full", fearGreedValue > 60 ? "bg-[var(--accent-green)]" : fearGreedValue < 40 ? "bg-[var(--accent-red)]" : "bg-[var(--accent-orange)]")} style={{ width: `${fearGreedValue}%` }}></div>
            </div>
          </div>
          <div className="stat-box">
            <span className="text-xs text-[var(--text-muted)]">{text.newsSentiment}</span>
            <p className="text-sm mt-1 line-clamp-3">{signal.sentiment.summary}</p>
            <div className="mt-2 text-xs text-[var(--text-secondary)]">
              {signal.sentiment.newsCount} {text.articles} {text.analyzed}
            </div>
          </div>
        </div>
      </div>

      {/* Fundamental Analysis */}
      <div className="pillar-card bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 flex flex-col">
        <div className="pillar-header flex items-center gap-3 mb-4">
          <div className="pillar-icon w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--accent-green-soft)] text-[var(--accent-green)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h3 className="font-bold">{text.fundamental}</h3>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="stat-box">
              <span className="text-xs text-[var(--text-muted)]">{text.mvrv}</span>
              <div className="text-xl font-bold">{signal.fundamental.mvrvRatio}</div>
            </div>
            <div className="stat-box">
              <span className="text-xs text-[var(--text-muted)]">{text.nupl}</span>
              <div className="text-xl font-bold">{signal.fundamental.nuplScore}</div>
            </div>
          </div>
          <div className="stat-box">
            <span className="text-xs text-[var(--text-muted)]">{text.bias}</span>
            <div className={cn("font-bold mt-1", getSignalColor(signal.fundamental.bias || "NEUTRAL"))}>{signal.fundamental.bias.replace("_", " ")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
