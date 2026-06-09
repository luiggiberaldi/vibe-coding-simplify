import { useEffect } from 'react';
import { useUIStore } from '../store/useUIStore';
import { fetchRates } from '../utils/exchangeRates';

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
      } catch (e) {
        console.error('Failed to fetch rates', e);
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