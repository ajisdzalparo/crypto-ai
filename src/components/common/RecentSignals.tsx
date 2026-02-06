"use client";

import { useState, useEffect } from "react";

interface Signal {
  pair: string;
  type: "LONG" | "SHORT";
  entry: string;
  target: string;
  time: string;
  status: "ACTIVE" | "PENDING" | "CLOSED";
}

interface RecentSignalsProps {
  currency?: "USD" | "IDR";
  exchangeRate?: number;
}

export default function RecentSignals({ currency = "USD", exchangeRate = 1 }: RecentSignalsProps) {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSignals = async () => {
      try {
        // Fetch current prices for multiple coins
        const coins = ["BTCUSDT", "ETHUSDT", "SOLUSDT"];
        const pricePromises = coins.map((symbol) => fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`).then((res) => res.json()));

        const prices = await Promise.all(pricePromises);

        const btcPrice = parseFloat(prices[0].price);
        const ethPrice = parseFloat(prices[1].price);
        const solPrice = parseFloat(prices[2].price);

        const format = (price: number) => {
          if (currency === "IDR") {
            return `Rp ${(price * exchangeRate).toLocaleString("id-ID", {
              maximumFractionDigits: 0,
            })}`;
          }
          return `$${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
        };

        // Generate signals based on current prices
        const generatedSignals: Signal[] = [
          {
            pair: `BTC/${currency}`, // update pair name? maybe keep as USDT for clarity of source, or change to actual currency
            type: "LONG",
            entry: format(btcPrice),
            target: format(btcPrice * 1.08),
            time: "2h ago",
            status: "ACTIVE",
          },
          {
            pair: `ETH/${currency}`,
            type: "LONG",
            entry: format(ethPrice),
            target: format(ethPrice * 1.1),
            time: "5h ago",
            status: "PENDING",
          },
          {
            pair: `SOL/${currency}`,
            type: "SHORT",
            entry: format(solPrice),
            target: format(solPrice * 0.85),
            time: "8h ago",
            status: "CLOSED",
          },
        ];

        setSignals(generatedSignals);
      } catch (error) {
        console.error("Failed to fetch signals:", error);
        const format = (price: number) => {
          if (currency === "IDR") {
            return `Rp ${(price * exchangeRate).toLocaleString("id-ID", {
              maximumFractionDigits: 0,
            })}`;
          }
          return `$${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
        };

        // Fallback to mock data with conversion
        setSignals([
          {
            pair: `BTC/${currency}`,
            type: "LONG",
            entry: format(97500),
            target: format(105000),
            time: "2h ago",
            status: "ACTIVE",
          },
          {
            pair: `ETH/${currency}`,
            type: "LONG",
            entry: format(3280),
            target: format(3600),
            time: "5h ago",
            status: "PENDING",
          },
          {
            pair: `SOL/${currency}`,
            type: "SHORT",
            entry: format(185),
            target: format(160),
            time: "8h ago",
            status: "CLOSED",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSignals();
    const interval = setInterval(fetchSignals, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [currency, exchangeRate]);

  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center justify-center py-8">
          <div className="w-5 h-5 border-2 border-(--accent-green) border-t-transparent rounded-full animate-spin mr-2"></div>
          <span className="text-(--text-muted)">Loading signals...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-(--border-color)">
        <h3 className="font-semibold">Recent AI Signals</h3>
        <button className="text-xs text-(--accent-green) font-medium hover:underline">View All History →</button>
      </div>

      {/* Mobile Card View */}
      <div className="p-4 space-y-3 md:hidden">
        {signals.map((signal, index) => (
          <div key={index} className="bg-(--bg-secondary) rounded-lg p-4 border border-(--border-color)">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-(--accent-green-soft) flex items-center justify-center">
                  <span className="text-xs font-bold text-(--accent-green)">{signal.pair.split("/")[0].slice(0, 2)}</span>
                </div>
                <span className="font-semibold">{signal.pair}</span>
              </div>
              <span className={`badge ${signal.status === "ACTIVE" ? "badge-live" : signal.status === "PENDING" ? "badge-pending" : "bg-(--text-muted)/20 text-(--text-muted)"}`}>{signal.status}</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-(--text-muted) text-xs block">Type</span>
                <span className={`font-medium ${signal.type === "LONG" ? "text-(--accent-green)" : "text-(--accent-red)"}`}>{signal.type}</span>
              </div>
              <div>
                <span className="text-(--text-muted) text-xs block">Entry</span>
                <span className="font-medium">{signal.entry}</span>
              </div>
              <div>
                <span className="text-(--text-muted) text-xs block">Target</span>
                <span className="font-medium text-(--accent-green)">{signal.target}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <table className="data-table">
          <thead>
            <tr>
              <th className="pl-5">Pair</th>
              <th>Type</th>
              <th>Entry Price</th>
              <th>Take Profit</th>
              <th>Time</th>
              <th className="pr-5">Status</th>
            </tr>
          </thead>
          <tbody>
            {signals.map((signal, index) => (
              <tr key={index}>
                <td className="pl-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-(--accent-green-soft) flex items-center justify-center">
                      <span className="text-xs font-bold text-(--accent-green)">{signal.pair.split("/")[0].slice(0, 2)}</span>
                    </div>
                    <span className="font-medium">{signal.pair}</span>
                  </div>
                </td>
                <td>
                  <span className={`font-semibold ${signal.type === "LONG" ? "text-(--accent-green)" : "text-(--accent-red)"}`}>{signal.type}</span>
                </td>
                <td className="font-medium">{signal.entry}</td>
                <td className="font-medium text-(--accent-green)">{signal.target}</td>
                <td className="text-(--text-muted)">{signal.time}</td>
                <td className="pr-5">
                  <span className={`badge ${signal.status === "ACTIVE" ? "badge-live" : signal.status === "PENDING" ? "badge-pending" : "bg-(--text-muted)/20 text-(--text-muted)"}`}>{signal.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
