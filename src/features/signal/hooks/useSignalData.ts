/**
 * Custom Hook: useSignalData
 * Handles fetching and managing signal analysis data
 */

import { useState, useEffect, useCallback } from "react";
import { FullAnalysis } from "@/types";
import { Language, SignalTranslations, signalTranslations } from "@/utils/i18n/translations";

interface UseSignalDataOptions {
  coin: string;
  language: Language;
  refreshInterval?: number; // in ms, default 60000
}

interface UseSignalDataReturn {
  signal: FullAnalysis | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  text: SignalTranslations;
}

export function useSignalData({ coin, language, refreshInterval = 60000 }: UseSignalDataOptions): UseSignalDataReturn {
  const [signal, setSignal] = useState<FullAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const text = signalTranslations[language];

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ai-signal?coin=${coin}&language=${language}`);
      const data = await response.json();

      if (data.success) {
        setSignal(data.data);
      } else {
        setError(text.failed);
      }
    } catch (err) {
      console.error("Failed to fetch signal data:", err);
      setError(text.connectionError);
    } finally {
      setIsLoading(false);
    }
  }, [coin, language, text.failed, text.connectionError]);

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  return {
    signal,
    isLoading,
    error,
    refetch: fetchData,
    text,
  };
}
