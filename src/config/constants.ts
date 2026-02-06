export const BINANCE_API_URL = "https://api.binance.com/api/v3";
export const CRYPTOPANIC_API_URL = "https://cryptopanic.com/api/free/v1/posts";
export const COINGECKO_API_URL = "https://api.coingecko.com/api/v3";
export const FEAR_GREED_API_URL = "https://api.alternative.me/fng";
export const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export const COIN_MAP: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  BNB: "binancecoin",
};

export const HALVING_DATA = {
  lastHalvingDate: "2024-04-20",
  nextHalvingBlock: 1050000,
  avgBlockTimeMinutes: 10,
};

export const FALLBACK_PRICES: Record<string, number> = {
  BTCUSDT: 97500,
  ETHUSDT: 3280,
  SOLUSDT: 185,
  BNBUSDT: 620,
};

export const DEFAULT_COIN = "BTC";
