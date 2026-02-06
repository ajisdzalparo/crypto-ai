import { Card, CardContent } from "@/components/ui/card";
import { FullAnalysis } from "@/types";

interface InsightsListProps {
  insights: FullAnalysis["insights"];
}

export function InsightsList({ insights }: InsightsListProps) {
  if (!insights) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="border-l-4 border-l-[var(--accent-green)]">
        <CardContent className="p-5">
          <h4 className="font-bold text-[var(--accent-green)] mb-3">✓ Bullish Factors ({insights.bullish.length})</h4>
          <ul className="space-y-2">
            {insights.bullish.slice(0, 6).map((factor, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                <span className="text-[var(--accent-green)]">↑</span>
                {factor}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-[var(--accent-red)]">
        <CardContent className="p-5">
          <h4 className="font-bold text-[var(--accent-red)] mb-3">✗ Bearish Factors ({insights.bearish.length})</h4>
          <ul className="space-y-2">
            {insights.bearish.slice(0, 6).map((factor, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                <span className="text-[var(--accent-red)]">↓</span>
                {factor}
              </li>
            ))}
            {insights.bearish.length === 0 && <li className="text-sm text-[var(--text-muted)]">No significant bearish factors detected</li>}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
