"use client";

import { useState } from "react";
import Link from "next/link";
import { Sidebar, Header } from "@/components/common";
import { useSignalData } from "@/features/signal/hooks";
import { Language } from "@/utils/i18n/translations";
import { SignalHeader, SignalPriceHero, HalvingAnalysis, AnalysisPillars, PriceProjections, AIReasoning, InsightsList, HistoricalPerformance } from "@/features/signal/components";

// Constants
const IDR_RATE = 16250;

// Utility functions
function formatPrice(value: number | undefined | null, currency: "USD" | "IDR"): string {
  if (value === undefined || value === null) return "--";
  if (currency === "IDR") {
    return `Rp ${(value * IDR_RATE).toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;
  }
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getSignalColor(signalValue: string | undefined): string {
  if (!signalValue) return "text-(--text-muted)";
  const lower = signalValue.toLowerCase();
  if (lower.includes("buy") || lower.includes("bullish") || lower.includes("green")) {
    return "text-(--accent-green)";
  }
  if (lower.includes("sell") || lower.includes("bearish") || lower.includes("red")) {
    return "text-(--accent-red)";
  }
  return "text-(--accent-orange)";
}

export default function SignalPage() {
  const [selectedCoin, setSelectedCoin] = useState<string>("BTC");
  const [currency, setCurrency] = useState<"USD" | "IDR">("USD");
  const [language, setLanguage] = useState<Language>("EN");

  const { signal, isLoading, error, refetch, text } = useSignalData({
    coin: selectedCoin,
    language,
  });

  const fearGreedValue = signal ? Math.round((signal.sentiment.score + 1) * 50) : 50;

  const priceFormatter = (value: number | undefined | null) => formatPrice(value, currency);

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <main className="flex-1 md:ml-50 pb-24 md:pb-6">
        <Header />

        <div className="px-4 md:px-6 py-6 space-y-6">
          <SignalHeader text={text} selectedCoin={selectedCoin} setSelectedCoin={setSelectedCoin} currency={currency} setCurrency={setCurrency} language={language} setLanguage={setLanguage} />

          <SignalPriceHero signal={signal} text={text} formatPrice={priceFormatter} />

          {isLoading ? (
            <LoadingState text={text} selectedCoin={selectedCoin} />
          ) : error ? (
            <ErrorState error={error} onRetry={refetch} />
          ) : signal ? (
            <div className="space-y-6">
              <HalvingAnalysis signal={signal} text={text} formatPrice={priceFormatter} />
              <AnalysisPillars signal={signal} text={text} formatPrice={priceFormatter} getSignalColor={getSignalColor} fearGreedValue={fearGreedValue} />
              <PriceProjections signal={signal} text={text} formatPrice={priceFormatter} getSignalColor={getSignalColor} />
              <AIReasoning reasoning={signal.reasoning} />
              <InsightsList insights={signal.insights} />
              <HistoricalPerformance signal={signal} text={text} formatPrice={priceFormatter} />
            </div>
          ) : null}
        </div>
      </main>

      <MobileNav />
    </div>
  );
}

// Sub-components
function LoadingState({ text, selectedCoin }: { text: { analyzing: string; fetching: string }; selectedCoin: string }) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="w-10 h-10 border-3 border-(--accent-green) border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-(--text-muted)">
          {text.analyzing} {selectedCoin}...
        </p>
        <p className="text-xs text-(--text-muted) mt-1">{text.fetching}</p>
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <p className="text-(--accent-red)">{error}</p>
        <button onClick={onRetry} className="mt-4 btn-primary">
          Retry
        </button>
      </div>
    </div>
  );
}

function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-(--bg-secondary) border-t border-(--border-color) px-6 py-3 md:hidden z-50">
      <div className="flex items-center justify-around max-w-md mx-auto">
        <Link href="/" className="flex flex-col items-center gap-1 text-(--text-muted)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <button className="flex flex-col items-center gap-1 text-(--accent-green)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          <span className="text-[10px] font-medium">Signals</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-(--text-muted)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="4" width="22" height="16" rx="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
          <span className="text-[10px] font-medium">Portfolio</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-(--text-muted)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span className="text-[10px] font-medium">Settings</span>
        </button>
      </div>
    </nav>
  );
}
