/**
 * Sentiment Analysis Service
 * Fetches real news from multiple sources and analyzes sentiment using AI
 */

import { NewsItem, SentimentResult } from "@/types";
import { CRYPTOPANIC_API_URL, COINGECKO_API_URL, FEAR_GREED_API_URL, OPENROUTER_API_URL, COIN_MAP } from "@/config";

/**
 * Fetch news from CryptoPanic API (free tier)
 */
async function fetchCryptoPanicNews(coin: string): Promise<NewsItem[]> {
  try {
    // CryptoPanic free public API
    const response = await fetch(
      `${CRYPTOPANIC_API_URL}/?auth_token=&public=true&currencies=${coin}&kind=news`,
      { next: { revalidate: 300 } }, // Cache for 5 minutes
    );

    if (!response.ok) throw new Error("CryptoPanic API failed");

    const data = await response.json();

    if (data.results && Array.isArray(data.results)) {
      return data.results.slice(0, 10).map((item: { title: string; source: { title: string }; url: string; published_at: string }) => ({
        title: item.title,
        source: item.source?.title || "CryptoPanic",
        url: item.url,
        publishedAt: item.published_at,
      }));
    }
  } catch (error) {
    console.error("CryptoPanic fetch failed:", error);
  }
  return [];
}

/**
 * Fetch news from CoinGecko API (free)
 */
async function fetchCoinGeckoNews(coin: string): Promise<NewsItem[]> {
  try {
    const coinId = COIN_MAP[coin] || coin.toLowerCase();

    // CoinGecko status updates as a proxy for news
    const response = await fetch(`${COINGECKO_API_URL}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=false&sparkline=false`, { next: { revalidate: 300 } });

    if (!response.ok) throw new Error("CoinGecko API failed");

    const data = await response.json();

    // Extract sentiment from market data
    const priceChange24h = data.market_data?.price_change_percentage_24h || 0;
    const priceChange7d = data.market_data?.price_change_percentage_7d || 0;

    return [
      {
        title: `${coin} ${priceChange24h >= 0 ? "up" : "down"} ${Math.abs(priceChange24h).toFixed(2)}% in 24h, ${priceChange7d >= 0 ? "up" : "down"} ${Math.abs(priceChange7d).toFixed(2)}% in 7 days`,
        source: "CoinGecko",
        url: `https://coingecko.com/en/coins/${coinId}`,
        publishedAt: new Date().toISOString(),
      },
    ];
  } catch (error) {
    console.error("CoinGecko fetch failed:", error);
  }
  return [];
}

/**
 * Fetch Fear & Greed Index
 */
async function fetchFearGreedIndex(): Promise<{ value: number; classification: string }> {
  try {
    const response = await fetch(
      `${FEAR_GREED_API_URL}/?limit=1`,
      { next: { revalidate: 3600 } }, // Cache for 1 hour
    );

    if (!response.ok) throw new Error("Fear & Greed API failed");

    const data = await response.json();

    if (data.data && data.data[0]) {
      return {
        value: parseInt(data.data[0].value),
        classification: data.data[0].value_classification,
      };
    }
  } catch (error) {
    console.error("Fear & Greed fetch failed:", error);
  }
  return { value: 50, classification: "Neutral" };
}

/**
 * Fetch latest crypto news from RSS feeds via public API
 */
async function fetchRSSNews(coin: string): Promise<NewsItem[]> {
  try {
    // Using a public RSS to JSON service
    const feeds = [`https://api.rss2json.com/v1/api.json?rss_url=https://cointelegraph.com/rss`];

    const results: NewsItem[] = [];

    for (const feedUrl of feeds) {
      try {
        const response = await fetch(feedUrl, { next: { revalidate: 600 } });
        if (!response.ok) continue;

        const data = await response.json();

        if (data.items && Array.isArray(data.items)) {
          const relevantItems = data.items
            .filter((item: { title: string }) => item.title.toLowerCase().includes(coin.toLowerCase()) || item.title.toLowerCase().includes("bitcoin") || item.title.toLowerCase().includes("crypto"))
            .slice(0, 5);

          for (const item of relevantItems) {
            results.push({
              title: item.title,
              source: data.feed?.title || "Crypto News",
              url: item.link,
              publishedAt: item.pubDate,
            });
          }
        }
      } catch {
        continue;
      }
    }

    return results;
  } catch (error) {
    console.error("RSS fetch failed:", error);
  }
  return [];
}

/**
 * Analyze sentiment using OpenRouter AI
 */
async function analyzeWithAI(news: NewsItem[], coin: string): Promise<{ score: number; summary: string }> {
  const openRouterKey = process.env.OPEN_ROUTER;

  if (!openRouterKey || news.length === 0) {
    return { score: 0, summary: "Insufficient data for sentiment analysis" };
  }

  const headlines = news.map((n) => `- ${n.title} (${n.source})`).join("\n");

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openRouterKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://cryptoai-screener.com",
        "X-Title": "CryptoAI Screener",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [
          {
            role: "system",
            content: `You are a crypto market sentiment analyst. Analyze news headlines and provide:
  1. A sentiment score from -1 (very bearish) to 1 (very bullish)
  2. A brief 1-sentence summary of overall market sentiment
  
  Consider: regulatory news, adoption, price movements, institutional interest, technical developments.
  
  Respond in JSON: {"score": number, "summary": "string"}`,
          },
          {
            role: "user",
            content: `Analyze sentiment for ${coin} based on these recent headlines:\n\n${headlines}`,
          },
        ],
        temperature: 0.2,
        max_tokens: 200,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices[0]?.message?.content || "{}";
      // Simple regex to extract JSON if it's wrapped in markdown code blocks
      const jsonMatch = content.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          score: Math.max(-1, Math.min(1, parsed.score || 0)),
          summary: parsed.summary || "Mixed market sentiment",
        };
      }
    }
  } catch (error) {
    console.error("AI sentiment analysis failed:", error);
  }

  return { score: 0, summary: "Unable to analyze sentiment" };
}

/**
 * Get comprehensive sentiment analysis
 */
export async function getSentimentAnalysis(coin: string = "BTC"): Promise<SentimentResult> {
  // Fetch from multiple sources in parallel
  const [cryptoPanicNews, coinGeckoData, fearGreed, rssNews] = await Promise.all([fetchCryptoPanicNews(coin), fetchCoinGeckoNews(coin), fetchFearGreedIndex(), fetchRSSNews(coin)]);

  // Combine all news
  const allNews = [...cryptoPanicNews, ...coinGeckoData, ...rssNews];

  // Calculate base score from Fear & Greed Index
  const fngScore = (fearGreed.value - 50) / 50; // Convert 0-100 to -1 to 1

  let finalScore = fngScore;
  let summary = `Market sentiment: ${fearGreed.classification} (Fear & Greed: ${fearGreed.value})`;

  // If we have news, analyze with AI
  if (allNews.length > 0) {
    const aiAnalysis = await analyzeWithAI(allNews, coin);

    // Blend AI sentiment with Fear & Greed Index
    finalScore = aiAnalysis.score * 0.6 + fngScore * 0.4;
    summary = aiAnalysis.summary || summary;
  }

  // Determine label
  let label: SentimentResult["label"] = "NEUTRAL";
  if (finalScore > 0.5) label = "VERY_BULLISH";
  else if (finalScore > 0.2) label = "BULLISH";
  else if (finalScore < -0.5) label = "VERY_BEARISH";
  else if (finalScore < -0.2) label = "BEARISH";

  return {
    score: Math.round(finalScore * 100) / 100,
    label,
    summary,
    newsCount: allNews.length,
    topNews: allNews.slice(0, 5),
  };
}

// Legacy export for compatibility
export { getSentimentAnalysis as analyzeSentiment };
