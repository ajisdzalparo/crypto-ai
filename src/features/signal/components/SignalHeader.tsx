import { cn } from "@/utils";

interface SignalHeaderProps {
  text: any;
  selectedCoin: string;
  setSelectedCoin: (coin: string) => void;
  currency: "USD" | "IDR";
  setCurrency: (curr: "USD" | "IDR") => void;
  language: "EN" | "ID";
  setLanguage: (lang: "EN" | "ID") => void;
}

const coins = ["BTC", "ETH", "SOL", "BNB"];

export function SignalHeader({ text, selectedCoin, setSelectedCoin, currency, setCurrency, language, setLanguage }: SignalHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-1">
          <span className="live-dot"></span>
          <span>{text.subtitle}</span>
        </div>
        <h1 className="text-2xl font-bold">
          <span className="gradient-text">
            {selectedCoin} {text.title}
          </span>
        </h1>
      </div>

      {/* Controls: Coin, Currency, Language */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Language Toggle */}
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

        {/* Currency Toggle */}
        <div className="flex bg-[var(--bg-card)] rounded-lg p-1 border border-[var(--border-color)]">
          {(["USD", "IDR"] as const).map((curr) => (
            <button
              key={curr}
              onClick={() => setCurrency(curr)}
              className={cn("px-3 py-1 rounded text-xs font-semibold transition-all", currency === curr ? "bg-[var(--accent-green)] text-black" : "text-[var(--text-muted)] hover:text-white")}
            >
              {curr}
            </button>
          ))}
        </div>

        {/* Coin Selector */}
        <div className="flex items-center gap-2">
          {coins.map((coin) => (
            <button
              key={coin}
              onClick={() => setSelectedCoin(coin)}
              className={cn(
                "px-4 py-2 rounded-lg font-semibold text-sm transition-all border",
                selectedCoin === coin ? "bg-[var(--accent-green)] text-black border-transparent" : "bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-white border-[var(--border-color)]",
              )}
            >
              {coin}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
