"use client";

import { cn } from "@/utils";

type Currency = "USD" | "IDR";
type Language = "EN" | "ID";

interface HeaderProps {
  activeCurrency?: Currency;
  setActiveCurrency?: (currency: Currency) => void;
  language?: Language;
  setLanguage?: (language: Language) => void;
}

export default function Header({ activeCurrency = "USD", setActiveCurrency, language = "EN", setLanguage }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
      {/* Mobile Logo */}
      <div className="flex items-center gap-3 md:hidden">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--accent-green)] to-[var(--accent-green-dim)] flex items-center justify-center">
          <span className="text-black font-bold">C</span>
        </div>
        <span className="font-bold text-lg">CryptoAI</span>
      </div>

      {/* Search Bar - Desktop */}
      <div className="hidden md:flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input type="text" placeholder="Search pairs e.g. BTC/USD" className="search-input pl-11" />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {/* Live Badge */}
        <div className="live-indicator hidden sm:flex">
          <span className="live-dot"></span>
          <span>LIVE</span>
        </div>

        {/* Language Toggle */}
        {setLanguage && (
          <div className="flex bg-[var(--bg-card)] rounded-lg p-1 border border-[var(--border-color)]">
            {(["EN", "ID"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={cn("px-3 py-1 rounded text-xs font-semibold transition-all", language === lang ? "bg-[var(--accent-green)] text-black" : "text-[var(--text-muted)] hover:text-white")}
              >
                {lang}
              </button>
            ))}
          </div>
        )}

        {/* Currency Toggle */}
        {setActiveCurrency && (
          <div className="flex bg-[var(--bg-card)] rounded-lg p-1 border border-[var(--border-color)]">
            {(["USD", "IDR"] as const).map((curr) => (
              <button
                key={curr}
                onClick={() => setActiveCurrency(curr)}
                className={cn("px-3 py-1 rounded text-xs font-semibold transition-all", activeCurrency === curr ? "bg-[var(--accent-green)] text-black" : "text-[var(--text-muted)] hover:text-white")}
              >
                {curr}
              </button>
            ))}
          </div>
        )}

        {/* Notification */}
        <button className="hidden sm:flex w-10 h-10 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-green)] hover:border-[var(--accent-green-soft)] transition-all relative">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[var(--accent-green)] rounded-full shadow-[0_0_6px_var(--accent-green)]"></span>
        </button>
      </div>
    </header>
  );
}
