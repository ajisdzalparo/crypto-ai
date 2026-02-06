"use client";

import { useState } from "react";
import { Sidebar, Header, StatsBar, PriceChart, AISignalPanel, RecentSignals } from "@/components/common";

export default function Home() {
  const [currency, setCurrency] = useState<"USD" | "IDR">("USD");
  const [language, setLanguage] = useState<"EN" | "ID">("EN");

  const IDR_RATE = 16250; // Approximated rate

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - Desktop only */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-50 min-h-screen">
        {/* Header */}
        <Header activeCurrency={currency} setActiveCurrency={setCurrency} language={language} setLanguage={setLanguage} />

        {/* Stats Bar */}
        <section className="px-4 md:px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <StatsBar currency={currency} exchangeRate={IDR_RATE} />
          </div>
        </section>

        {/* Main Content Grid */}
        <section className="px-4 md:px-6 pb-24 md:pb-6">
          {/* Chart + AI Signal Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
            {/* Price Chart - 8 columns */}
            <div className="lg:col-span-8">
              <PriceChart currency={currency} exchangeRate={IDR_RATE} />
            </div>

            {/* AI Signal Panel - 4 columns */}
            <div className="lg:col-span-4">
              <AISignalPanel />
            </div>
          </div>

          {/* Recent Signals */}
          <div className="mt-4 md:mt-6">
            <RecentSignals currency={currency} exchangeRate={IDR_RATE} />
          </div>
        </section>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-(--bg-secondary) border-t border-(--border-color) px-6 py-3 md:hidden z-50 safe-area-pb">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <button className="flex flex-col items-center gap-1 text-(--accent-green)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="text-[10px] font-medium">Home</span>
          </button>

          <button className="flex flex-col items-center gap-1 text-(--text-muted)">
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
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33" />
            </svg>
            <span className="text-[10px] font-medium">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
