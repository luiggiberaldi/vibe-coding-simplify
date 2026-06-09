import React from 'react';
import { useExchangeRates } from '../../hooks/useExchangeRates';
import { useUIStore } from '../../store/useUIStore';
import { RefreshCw } from 'lucide-react';
import styles from './RatesPanel.module.css';

export const RatesPanel: React.FC = () => {
  const rates = useExchangeRates();
  const loading = useUIStore(s => s.ratesLoading);

  if (!rates) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Cargando tasas...</div>
      </div>
    );
  }

  const items = [
    { label: 'Dólar BCV', value: rates.bcvDollar.average, color: '#58a6ff' },
    { label: 'Euro BCV', value: rates.bcvEuro.average, color: '#f0883e' },
    { label: 'USDT', value: rates.parallelDollar.average, color: '#3fb950' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>Tasas de Cambio</span>
        {loading && <RefreshCw size={12} className={styles.spinning} />}
      </div>
      <div className={styles.list}>
        {items.map((item) => (
          <div key={item.label} className={styles.row}>
            <span className={styles.label}>
              <span className={styles.dot} style={{ backgroundColor: item.color }} />
              {item.label}
            </span>
            <span className={styles.value}>
              {item.value > 0 ? `Bs. ${item.value.toFixed(2)}` : 'N/D'}
            </span>
          </div>
        ))}
      </div>
      <div className={styles.updated}>
        Actualizado: {new Date(rates.fetchedAt).toLocaleTimeString('es-VE')}
      </div>
    </div>
  );
};