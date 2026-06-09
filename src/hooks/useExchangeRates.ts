import { useEffect } from 'react';
import { useUIStore } from '../store/useUIStore';
import { fetchRates, RatesData } from '../utils/exchangeRates';

const CACHE_KEY = 'pf-rates-cache';
const CACHE_MAX_AGE = 24 * 60 * 60 * 1000;

interface RatesCache {
  rates: RatesData;
  cachedAt: string;
}

function loadCachedRates(): RatesData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cache: RatesCache = JSON.parse(raw);
    const age = Date.now() - new Date(cache.cachedAt).getTime();
    if (age > CACHE_MAX_AGE) return null;
    return cache.rates;
  } catch {
    return null;
  }
}

function saveRatesCache(rates: RatesData): void {
  try {
    const cache: RatesCache = { rates, cachedAt: new Date().toISOString() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore storage errors
  }
}

export function useExchangeRates() {
  const setRates = useUIStore(s => s.setRates);
  const setRatesLoading = useUIStore(s => s.setRatesLoading);
  const rates = useUIStore(s => s.rates);

  useEffect(() => {
    const load = async () => {
      setRatesLoading(true);
      try {
        const data = await fetchRates();
        setRates(data);
        saveRatesCache(data);
      } catch (e) {
        console.error('Failed to fetch rates, trying cache', e);
        const cached = loadCachedRates();
        if (cached) setRates(cached);
      } finally {
        setRatesLoading(false);
      }
    };

    load();
    const interval = setInterval(load, 300000);
    return () => clearInterval(interval);
  }, [setRates, setRatesLoading]);

  return rates;
}