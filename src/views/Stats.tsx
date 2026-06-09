import React, { useState, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Card } from '../components/ui/Card';
import { formatDate } from '../utils/formatters';
import { useResponsiveCanvas } from '../hooks/useResponsiveCanvas';
import styles from './Stats.module.css';

export const Stats: React.FC = () => {
  const projects = useAppStore(s => s.projects);
  const clients = useAppStore(s => s.clients);
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'VES' | 'USDT'>('USD');

  const filteredProjects = projects.filter(p => p.currency === currency);
  const delivered = filteredProjects.filter(p => p.status === 'delivered');

  const totalRevenue = delivered.reduce((sum, p) => sum + (p.price || 0), 0);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthRevenue = delivered.filter(p => {
    if (!p.updatedAt) return false;
    const d = new Date(p.updatedAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).reduce((sum, p) => sum + (p.price || 0), 0);

  const mostProfitable = [...filteredProjects].sort((a, b) => (b.price || 0) - (a.price || 0))[0];

  const clientCounts: Record<string, number> = {};
  projects.forEach(p => { clientCounts[p.clientId] = (clientCounts[p.clientId] || 0) + 1; });
  let topClientStr = 'N/A';
  if (Object.keys(clientCounts).length > 0) {
    const topId = Object.keys(clientCounts).reduce((a, b) => clientCounts[a] > clientCounts[b] ? a : b);
    topClientStr = clients.find(c => c.id === topId)?.name || 'N/A';
  }

  const drawBarChart = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (11 - i));
      return { label: d.toLocaleString('es-ES', { month: 'short' }), month: d.getMonth(), year: d.getFullYear(), value: 0 };
    });

    delivered.forEach(p => {
      const d = new Date(p.updatedAt || p.createdAt);
      const m = months.find(x => x.month === d.getMonth() && x.year === d.getFullYear());
      if (m) m.value += (p.price || 0);
    });

    const maxVal = Math.max(...months.map(m => m.value), 100);
    const padX = 40;
    const padY = 30;
    const chartW = width - padX * 2;
    const chartH = height - padY * 2;
    const barW = chartW / 12 - 10;

    ctx.strokeStyle = '#30363d';
    ctx.beginPath();
    ctx.moveTo(padX, padY);
    ctx.lineTo(padX, height - padY);
    ctx.lineTo(width - padX, height - padY);
    ctx.stroke();

    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';

    months.forEach((m, i) => {
      const barH = (m.value / maxVal) * chartH;
      const x = padX + 10 + i * (chartW / 12);
      const y = height - padY - barH;

      ctx.fillStyle = 'rgba(88, 166, 255, 0.8)';
      ctx.fillRect(x, y, barW, barH);

      ctx.fillStyle = '#8b949e';
      ctx.fillText(m.label, x + barW / 2, height - padY + 15);
    });
  }, [delivered]);

  const drawDonutChart = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const stats = {
      active: filteredProjects.filter(p => p.status === 'active').length,
      paused: filteredProjects.filter(p => p.status === 'paused').length,
      delivered: filteredProjects.filter(p => p.status === 'delivered').length,
      archived: filteredProjects.filter(p => p.status === 'archived').length,
    };
    const total = Object.values(stats).reduce((a, b) => a + b, 0);
    if (total === 0) return;

    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(cx, cy) - 20;
    const colors: Record<string, string> = {
      active: '#3fb950',
      paused: '#d29922',
      delivered: '#58a6ff',
      archived: '#484f58',
    };

    let currentAngle = -Math.PI / 2;
    Object.entries(stats).forEach(([key, val]) => {
      if (val === 0) return;
      const sliceAngle = (val / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, currentAngle, currentAngle + sliceAngle);
      ctx.fillStyle = colors[key];
      ctx.fill();
      currentAngle += sliceAngle;
    });

    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.6, 0, 2 * Math.PI);
    ctx.fillStyle = '#161b22';
    ctx.fill();
  }, [filteredProjects]);

  const barCanvasRef = useResponsiveCanvas(drawBarChart, [delivered]);
  const donutCanvasRef = useResponsiveCanvas(drawDonutChart, [filteredProjects]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Estadísticas</h1>
        <select className={styles.currencySelect} value={currency} onChange={e => setCurrency(e.target.value as any)}>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="VES">VES</option>
          <option value="USDT">USDT</option>
        </select>
      </div>

      <div className={styles.kpis}>
        <Card className={styles.kpiCard}>
          <div className={styles.label}>Ingreso Total Histórico</div>
          <div className={styles.value}>{totalRevenue.toLocaleString()} {currency}</div>
        </Card>
        <Card className={styles.kpiCard}>
          <div className={styles.label}>Ingreso Mes Actual</div>
          <div className={styles.value}>{currentMonthRevenue.toLocaleString()} {currency}</div>
        </Card>
        <Card className={styles.kpiCard}>
          <div className={styles.label}>Proyecto más rentable</div>
          <div className={styles.value} style={{ fontSize: '18px' }}>{mostProfitable ? mostProfitable.name : 'N/A'}</div>
        </Card>
        <Card className={styles.kpiCard}>
          <div className={styles.label}>Cliente Top</div>
          <div className={styles.value} style={{ fontSize: '18px' }}>{topClientStr}</div>
        </Card>
      </div>

      <div className={styles.charts}>
        <Card className={styles.chartCard}>
          <h3>Ingresos (Últimos 12 meses)</h3>
          {delivered.length === 0 ? <p className="text-muted">Sin datos</p> : (
            <div style={{ width: '100%', height: '300px' }}>
              <canvas ref={barCanvasRef} />
            </div>
          )}
        </Card>
        <Card className={styles.chartCard}>
          <h3>Estado de Proyectos</h3>
          {filteredProjects.length === 0 ? <p className="text-muted">Sin datos</p> : (
            <div className={styles.donutContainer}>
              <div style={{ width: '250px', height: '250px' }}>
                <canvas ref={donutCanvasRef} />
              </div>
              <div className={styles.donutLegend}>
                <span style={{ color: '#3fb950' }}>■ Activos</span>
                <span style={{ color: '#d29922' }}>■ Pausados</span>
                <span style={{ color: '#58a6ff' }}>■ Entregados</span>
                <span style={{ color: '#484f58' }}>■ Archivados</span>
              </div>
            </div>
          )}
        </Card>
      </div>

      <Card>
        <h3>Proyectos Entregados Recientemente</h3>
        {delivered.length === 0 ? <p className="text-muted">No hay proyectos entregados en esta moneda.</p> : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Proyecto</th>
                <th>Cliente</th>
                <th>Fecha Entrega</th>
                <th>Precio</th>
              </tr>
            </thead>
            <tbody>
              {[...delivered].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).map(p => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong></td>
                  <td>{clients.find(c => c.id === p.clientId)?.name}</td>
                  <td>{formatDate(p.updatedAt)}</td>
                  <td>{p.price?.toLocaleString()} {p.currency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
};