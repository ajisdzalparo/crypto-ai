/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent } from "@/components/ui/card";
import { FullAnalysis } from "@/types";

interface HistoricalPerformanceProps {
  signal: FullAnalysis;
  text: any;
  formatPrice: (value: number | undefined | null) => string;
}

export function HistoricalPerformance({ signal, text, formatPrice }: HistoricalPerformanceProps) {
  // Helpers to parse dates
  const getLastHalvingDate = () => {
    if (!signal.halvingPrediction?.lastHalving?.date) return { month: "Apr", year: 2024 };
    const date = new Date(signal.halvingPrediction.lastHalving.date);
    return {
      month: date.toLocaleString("default", { month: "short" }),
      year: date.getFullYear(),
    };
  };

  const getNextHalvingDate = () => {
    if (!signal.halvingPrediction?.nextHalving?.estimatedDate) return { month: "Apr", year: 2028 };
    const date = new Date(signal.halvingPrediction.nextHalving.estimatedDate);
    return {
      month: date.toLocaleString("default", { month: "short" }),
      year: date.getFullYear(),
    };
  };

  const lastHalving = getLastHalvingDate();
  const nextHalving = getNextHalvingDate();

  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="font-bold mb-4">Historical Halving Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-(--text-muted) border-b border-(--border-color)">
                <th className="text-left py-2">{text.historicalTable.halving}</th>
                <th className="text-right py-2">{text.historicalTable.priceAt}</th>
                <th className="text-right py-2">{text.historicalTable.peakAfter}</th>
                <th className="text-right py-2">{text.historicalTable.return}</th>
                <th className="text-right py-2">{text.historicalTable.daysToPeak}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-(--border-color)">
                <td className="py-3">Nov 2012 (1st)</td>
                <td className="text-right">{formatPrice(12)}</td>
                <td className="text-right text-(--accent-green)">{formatPrice(1150)}</td>
                <td className="text-right text-(--accent-green) font-bold">+9,483%</td>
                <td className="text-right">365 {text.days.toLowerCase()}</td>
              </tr>
              <tr className="border-b border-(--border-color)">
                <td className="py-3">Jul 2016 (2nd)</td>
                <td className="text-right">{formatPrice(650)}</td>
                <td className="text-right text-(--accent-green)">{formatPrice(19700)}</td>
                <td className="text-right text-(--accent-green) font-bold">+2,931%</td>
                <td className="text-right">525 {text.days.toLowerCase()}</td>
              </tr>
              <tr className="border-b border-(--border-color)">
                <td className="py-3">May 2020 (3rd)</td>
                <td className="text-right">{formatPrice(8800)}</td>
                <td className="text-right text-(--accent-green)">{formatPrice(69000)}</td>
                <td className="text-right text-(--accent-green) font-bold">+684%</td>
                <td className="text-right">546 {text.days.toLowerCase()}</td>
              </tr>
              <tr className="border-b border-(--border-color) bg-(--accent-green-soft)">
                <td className="py-3 font-bold">
                  {lastHalving.month} {lastHalving.year} (4th) ✓
                </td>
                <td className="text-right">{formatPrice(signal.halvingPrediction?.lastHalving.priceAtHalving)}</td>
                <td className="text-right text-(--accent-green)">{formatPrice(signal.halvingPrediction?.cyclePeakPrice)}</td>
                <td className="text-right text-(--accent-green) font-bold">{signal.halvingPrediction?.currentCycleReturn}</td>
                <td className="text-right">~18 {text.monthsAgo}</td>
              </tr>
              <tr className="bg-(--bg-secondary) opacity-80">
                <td className="py-3 font-bold text-(--accent-orange)">
                  {nextHalving.month} {nextHalving.year} (5th) 🔮
                </td>
                <td className="text-right text-(--text-muted)">~{formatPrice(signal.price ? Math.round(signal.price * 1.5) : 150000)}</td>
                <td className="text-right text-(--accent-green)">
                  {formatPrice(signal.halvingPrediction?.nextCyclePrediction?.baseCase)} - {formatPrice(signal.halvingPrediction?.nextCyclePrediction?.bullCase)}
                </td>
                <td className="text-right text-(--accent-green) font-bold">+100-200%</td>
                <td className="text-right text-(--text-muted)">{text.est} 12-18 mo</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
