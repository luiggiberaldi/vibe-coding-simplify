import { RatesData } from './exchangeRates';
import { useUIStore } from '../store/useUIStore';

// Actualizado: 2026-06-09. Regenerar periódicamente.
const FALLBACK_RATES: Record<string, Record<string, number>> = {
  USD: { EUR: 0.92, VES: 90.5, USDT: 1, USD: 1 },
  EUR: { USD: 1.09, VES: 97.0, USDT: 1, EUR: 1 },
  VES: { USD: 0.011, EUR: 0.010, USDT: 0.011, VES: 1 },
  USDT: { USD: 1, EUR: 0.92, VES: 90.5, USDT: 1 },
};

export function convert(amount: number, from: string, to: string, rates?: RatesData | null): number {
  if (from === to) return amount;
  
  if (rates) {
    const r = getRateFromData(rates, from, to);
    if (r !== null) return Math.round(amount * r * 100) / 100;
  }
  
  const fallback = FALLBACK_RATES[from]?.[to];
  if (fallback) return Math.round(amount * fallback * 100) / 100;
  return amount;
}

function getRateFromData(rates: RatesData, from: string, to: string): number | null {
  const getVes = (cur: string): number | null => {
    switch (cur) {
      case 'USD': return rates.bcvDollar.average;
      case 'EUR': return rates.bcvEuro.average;
      case 'USDT': return rates.bcvDollar.average * rates.usdt.average;
      default: return null;
    }
  };

  const fromVes = getVes(from);
  const toVes = getVes(to);
  
  if (fromVes !== null && toVes !== null && fromVes > 0) {
    return toVes / fromVes;
  }
  return null;
}

export function formatCurrency(amount: number, currency: string): string {
  return `${amount.toLocaleString()} ${currency}`;
}

export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = { USD: '$', EUR: '€', VES: 'Bs', USDT: '₮' };
  return symbols[currency] || currency;
}

export function useConvert(amount: number, from: string, to: string): number {
  const rates = useUIStore(s => s.rates);
  return convert(amount, from, to, rates);
}