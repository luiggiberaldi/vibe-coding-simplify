export interface ExchangeRate {
  source: string;
  name: string;
  buy: number | null;
  sell: number | null;
  average: number;
  updatedAt: string;
}

export interface RatesData {
  bcvDollar: ExchangeRate;
  bcvEuro: ExchangeRate;
  parallelDollar: ExchangeRate;
  parallelEuro: ExchangeRate;
  usdt: ExchangeRate;
  fetchedAt: string;
}

export async function fetchRates(): Promise<RatesData> {
  const [dolares, euros, usdtRes] = await Promise.allSettled([
    fetch('https://ve.dolarapi.com/v1/dolares').then(r => r.json()),
    fetch('https://ve.dolarapi.com/v1/euros').then(r => r.json()),
    fetch('https://api.binance.com/api/v3/ticker/price?symbol=USDTUSD').then(r => r.json()),
  ]);

  const dolaresArr = dolares.status === 'fulfilled' ? dolares.value : [];
  const eurosArr = euros.status === 'fulfilled' ? euros.value : [];
  const usdtPrice = usdtRes.status === 'fulfilled' ? parseFloat(usdtRes.value?.price || '1') : 1;

  const findSource = (arr: any[], source: string) => arr.find((d: any) => d.fuente === source);

  const bcvD = findSource(dolaresArr, 'oficial');
  const parD = findSource(dolaresArr, 'paralelo');
  const bcvE = findSource(eurosArr, 'oficial');
  const parE = findSource(eurosArr, 'paralelo');

  const now = new Date().toISOString();

  return {
    bcvDollar: {
      source: 'BCV',
      name: 'Dólar BCV',
      buy: bcvD?.compra ?? null,
      sell: bcvD?.venta ?? null,
      average: bcvD?.promedio || 0,
      updatedAt: bcvD?.fechaActualizacion || now,
    },
    bcvEuro: {
      source: 'BCV',
      name: 'Euro BCV',
      buy: bcvE?.compra ?? null,
      sell: bcvE?.venta ?? null,
      average: bcvE?.promedio || 0,
      updatedAt: bcvE?.fechaActualizacion || now,
    },
    parallelDollar: {
      source: 'Paralelo',
      name: 'Dólar Paralelo',
      buy: parD?.compra ?? null,
      sell: parD?.venta ?? null,
      average: parD?.promedio || 0,
      updatedAt: parD?.fechaActualizacion || now,
    },
    parallelEuro: {
      source: 'Paralelo',
      name: 'Euro Paralelo',
      buy: parE?.compra ?? null,
      sell: parE?.venta ?? null,
      average: parE?.promedio || 0,
      updatedAt: parE?.fechaActualizacion || now,
    },
    usdt: {
      source: 'Binance',
      name: 'USDT',
      buy: null,
      sell: null,
      average: usdtPrice,
      updatedAt: now,
    },
    fetchedAt: now,
  };
}