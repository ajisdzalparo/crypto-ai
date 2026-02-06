/**
 * Application Translations
 * Centralized i18n translations for EN and ID languages
 */

export type Language = "EN" | "ID";

export interface SignalTranslations {
  subtitle: string;
  title: string;
  currentPrice: string;
  analyzing: string;
  fetching: string;
  failed: string;
  connectionError: string;
  nextHalving: string;
  days: string;
  est: string;
  blockReward: string;
  currentPhase: string;
  since: string;
  halving: string;
  monthsAgo: string;
  halvingPredictions: string;
  bearCase: string;
  baseCase: string;
  bullCase: string;
  cyclePerformance: string;
  peakReached: string;
  returnFrom: string;
  aiUpdate: string;
  technical: string;
  sentiment: string;
  fundamental: string;
  fearGreed: string;
  newsSentiment: string;
  analyzed: string;
  articles: string;
  mvrv: string;
  nupl: string;
  bias: string;
  priceProjections: string;
  shortTerm: string;
  midTerm: string;
  longTerm: string;
  historicalTable: {
    halving: string;
    priceAt: string;
    peakAfter: string;
    return: string;
    daysToPeak: string;
  };
}

export const signalTranslations: Record<Language, SignalTranslations> = {
  EN: {
    subtitle: "COMPREHENSIVE AI ANALYSIS",
    title: "SIGNAL INSIGHT",
    currentPrice: "CURRENT PRICE",
    analyzing: "Analyzing",
    fetching: "Fetching technical, sentiment & fundamental data",
    failed: "Failed to fetch signal",
    connectionError: "Connection error",
    nextHalving: "Next Bitcoin Halving",
    days: "Days",
    est: "Est.",
    blockReward: "Block Reward",
    currentPhase: "Current Cycle Phase",
    since: "Since",
    halving: "halving",
    monthsAgo: "months ago",
    halvingPredictions: "Halving Cycle Predictions",
    bearCase: "Bear Case",
    baseCase: "Base Case",
    bullCase: "Bull Case",
    cyclePerformance: "Cycle Performance",
    peakReached: "Peak reached",
    returnFrom: "return from halving price of",
    aiUpdate: "AI analysis updates dynamically.",
    technical: "Technical Analysis",
    sentiment: "Market Sentiment",
    fundamental: "Fundamental",
    fearGreed: "Fear & Greed Index",
    newsSentiment: "News Sentiment",
    analyzed: "analyzed",
    articles: "articles",
    mvrv: "MVRV Ratio",
    nupl: "NUPL Score",
    bias: "Bias",
    priceProjections: "Price Projections",
    shortTerm: "Short Term",
    midTerm: "Medium Term",
    longTerm: "Long Term",
    historicalTable: {
      halving: "Halving",
      priceAt: "Price At",
      peakAfter: "Peak After",
      return: "Return",
      daysToPeak: "Days to Peak",
    },
  },
  ID: {
    subtitle: "ANALISIS AI KOMPREHENSIF",
    title: "WAWASAN SINYAL",
    currentPrice: "HARGA SAAT INI",
    analyzing: "Menganalisis",
    fetching: "Mengambil data teknikal, sentimen & fundamental",
    failed: "Gagal mengambil sinyal",
    connectionError: "Kesalahan koneksi",
    nextHalving: "Halving Bitcoin Berikutnya",
    days: "Hari",
    est: "Est.",
    blockReward: "Hadiah Blok",
    currentPhase: "Fase Siklus Saat Ini",
    since: "Sejak",
    halving: "halving",
    monthsAgo: "bulan lalu",
    halvingPredictions: "Prediksi Siklus Halving",
    bearCase: "Kasus Bear",
    baseCase: "Kasus Base",
    bullCase: "Kasus Bull",
    cyclePerformance: "Performa Siklus",
    peakReached: "Puncak tercapai",
    returnFrom: "return dari harga halving",
    aiUpdate: "Analisis AI diperbarui secara dinamis.",
    technical: "Analisis Teknikal",
    sentiment: "Sentimen Pasar",
    fundamental: "Fundamental",
    fearGreed: "Indeks Fear & Greed",
    newsSentiment: "Sentimen Berita",
    analyzed: "dianalisis",
    articles: "artikel",
    mvrv: "Rasio MVRV",
    nupl: "Skor NUPL",
    bias: "Bias",
    priceProjections: "Proyeksi Harga",
    shortTerm: "Jangka Pendek",
    midTerm: "Jangka Menengah",
    longTerm: "Jangka Panjang",
    historicalTable: {
      halving: "Halving",
      priceAt: "Harga Saat",
      peakAfter: "Puncak Setelah",
      return: "Return",
      daysToPeak: "Hari ke Puncak",
    },
  },
};
