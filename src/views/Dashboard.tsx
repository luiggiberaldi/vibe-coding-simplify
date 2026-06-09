import React, { useCallback, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useUIStore } from '../store/useUIStore';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { FolderOpen, Users, AlertCircle, Clock, Activity, Zap, Trash2, DollarSign, Download, Upload } from 'lucide-react';
import { daysBetween, relativeTime } from '../utils/formatters';
import { exportToJSON, importFromJSON } from '../utils/exporters';
import { convert } from '../utils/currency';
import { Link } from 'react-router-dom';
import { useResponsiveCanvas } from '../hooks/useResponsiveCanvas';
import styles from './Dashboard.module.css';

export const Dashboard: React.FC = () => {
  const clients = useAppStore(s => s.clients);
  const projects = useAppStore(s => s.projects);
  const entries = useAppStore(s => s.entries);
  const clearData = useAppStore(s => s.clearData);
  const addToast = useUIStore(s => s.addToast);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeProjects = projects.filter(p => p.status === 'active');
  const delivered = projects.filter(p => p.status === 'delivered');
  const rates = useUIStore(s => s.rates);
  const totalRevenue = delivered.reduce((sum, p) => {
    const amount = p.price || 0;
    const converted = convert(amount, p.currency, 'USD', rates);
    return sum + converted;
  }, 0);
  const unresolvedEntriesToday = entries.filter(e =>
    !e.resolved && new Date(e.createdAt).toDateString() === new Date().toDateString()
  );

  const nearDeadline = activeProjects.filter(p => {
    if (!p.deadline) return false;
    const diff = daysBetween(new Date().toISOString(), p.deadline);
    return diff >= 0 && diff <= 7;
  });

  const recentEntries = [...entries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);
  const topActiveProjects = [...activeProjects].slice(0, 5);

  const handleClearData = () => {
    clearData();
    addToast('Datos eliminados', 'info');
  };

  const handleExportJSON = () => {
    exportToJSON({ clients, projects, entries, tasks: useAppStore.getState().tasks, ideas: useAppStore.getState().ideas, notes: useAppStore.getState().notes });
    addToast('Backup exportado', 'success');
  };

  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await importFromJSON(file);
    if (data) {
      loadDemoData(data);
      addToast('Backup importado correctamente', 'success');
    } else {
      addToast('Archivo de backup inválido', 'error');
    }
    e.target.value = '';
  };

  const drawBarChart = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const style = getComputedStyle(document.documentElement);
    const borderColor = style.getPropertyValue('--color-border').trim() || '#30363d';
    const primaryColor = style.getPropertyValue('--color-primary').trim() || '#58a6ff';
    const textMutedColor = style.getPropertyValue('--color-text-muted').trim() || '#8b949e';

    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return { label: d.toLocaleString('es-ES', { month: 'short' }), month: d.getMonth(), year: d.getFullYear(), value: 0 };
    });
    delivered.forEach(p => {
      const d = new Date(p.updatedAt || p.createdAt);
      const m = months.find(x => x.month === d.getMonth() && x.year === d.getFullYear());
      if (m) m.value += (p.price || 0);
    });
    const maxVal = Math.max(...months.map(m => m.value), 100);
    const padX = 40;
    const padY = 20;
    const chartW = width - padX * 2;
    const chartH = height - padY * 2;
    const barW = chartW / 6 - 8;

    ctx.strokeStyle = borderColor;
    ctx.beginPath();
    ctx.moveTo(padX, padY);
    ctx.lineTo(padX, height - padY);
    ctx.lineTo(width - padX, height - padY);
    ctx.stroke();

    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';

    months.forEach((m, i) => {
      const barH = (m.value / maxVal) * chartH;
      const x = padX + 5 + i * (chartW / 6);
      const y = height - padY - barH;
      ctx.fillStyle = primaryColor + 'cc';
      ctx.fillRect(x, y, barW, barH);
      ctx.fillStyle = textMutedColor;
      ctx.fillText(m.label, x + barW / 2, height - padY + 14);
    });
  }, [delivered]);

  const drawDonutChart = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const style = getComputedStyle(document.documentElement);
    const activeColor = style.getPropertyValue('--color-active').trim() || '#3fb950';
    const pausedColor = style.getPropertyValue('--color-paused').trim() || '#d29922';
    const deliveredColor = style.getPropertyValue('--color-delivered').trim() || '#58a6ff';
    const archivedColor = style.getPropertyValue('--color-archived').trim() || '#484f58';
    const surfaceColor = style.getPropertyValue('--color-surface').trim() || '#161b22';

    const stats = {
      active: activeProjects.length,
      paused: projects.filter(p => p.status === 'paused').length,
      delivered: delivered.length,
      archived: projects.filter(p => p.status === 'archived').length,
    };
    const total = Object.values(stats).reduce((a, b) => a + b, 0);
    if (total === 0) return;

    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(cx, cy) - 10;
    const colors: Record<string, string> = { active: activeColor, paused: pausedColor, delivered: deliveredColor, archived: archivedColor };

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
    ctx.fillStyle = surfaceColor;
    ctx.fill();
  }, [activeProjects, delivered, projects]);

  const theme = useUIStore(s => s.theme);
  const barRef = useResponsiveCanvas(drawBarChart, [delivered, theme]);
  const donutRef = useResponsiveCanvas(drawDonutChart, [projects, theme]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Dashboard</h1>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleImportJSON} style={{ display: 'none' }} />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} icon={<Upload size={16} />}>Importar</Button>
          <Button variant="outline" onClick={handleExportJSON} icon={<Download size={16} />}>Exportar</Button>
          {clients.length > 0 && (
            <Button variant="outline" onClick={handleClearData} icon={<Trash2 size={16} />}>Limpiar</Button>
          )}
        </div>
      </div>

      <div className={styles.kpiGrid}>
        <Card className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ color: 'var(--color-active)' }}><FolderOpen /></div>
          <div>
            <div className={styles.kpiValue}>{activeProjects.length}</div>
            <div className={styles.kpiLabel}>Proyectos Activos</div>
          </div>
        </Card>
        <Card className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ color: 'var(--color-primary)' }}><Users /></div>
          <div>
            <div className={styles.kpiValue}>{clients.length}</div>
            <div className={styles.kpiLabel}>Clientes Totales</div>
          </div>
        </Card>
        <Card className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ color: 'var(--color-success)' }}><DollarSign /></div>
          <div>
            <div className={styles.kpiValue}>{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ≈ USD</div>
            <div className={styles.kpiLabel}>Ingresos Totales</div>
          </div>
        </Card>
        <Card className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ color: nearDeadline.length > 0 ? 'var(--color-error)' : 'var(--color-text-muted)' }}><Clock /></div>
          <div>
            <div className={styles.kpiValue}>{nearDeadline.length}</div>
            <div className={styles.kpiLabel}>Deadlines próximos</div>
          </div>
        </Card>
      </div>

      <div className={styles.chartsRow}>
        <Card className={styles.chartCard}>
          <h3 className={styles.sectionTitle}>Ingresos (6 meses)</h3>
          {delivered.length === 0 ? <p style={{ color: 'var(--color-text-muted)', padding: '2rem' }}>Sin datos de ingresos</p> : (
            <div style={{ width: '100%', height: '180px' }}>
              <canvas ref={barRef} />
            </div>
          )}
        </Card>
        <Card className={styles.chartCard}>
          <h3 className={styles.sectionTitle}>Estado de Proyectos</h3>
          {projects.length === 0 ? <p style={{ color: 'var(--color-text-muted)', padding: '2rem' }}>Sin proyectos</p> : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '8px' }}>
              <div style={{ width: '140px', height: '140px' }}>
                <canvas ref={donutRef} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                <span style={{ color: 'var(--color-active)' }}>■ Activos ({activeProjects.length})</span>
                <span style={{ color: 'var(--color-paused)' }}>■ Pausados ({projects.filter(p => p.status === 'paused').length})</span>
                <span style={{ color: 'var(--color-delivered)' }}>■ Entregados ({delivered.length})</span>
                <span style={{ color: 'var(--color-archived)' }}>■ Archivados ({projects.filter(p => p.status === 'archived').length})</span>
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className={styles.sections}>
        <Card>
          <h3 className={styles.sectionTitle}><Activity size={20} /> Actividad Reciente</h3>
          <div className={styles.list}>
            {recentEntries.length === 0 && <p style={{ color: 'var(--color-text-muted)' }}>No hay actividad.</p>}
            {recentEntries.map(e => {
              const p = projects.find(proj => proj.id === e.projectId);
              return (
                <div key={e.id} className={styles.listItem}>
                  <div>
                    <strong>{e.title}</strong>
                    <div className={styles.itemMeta}>{p?.name || 'Eliminado'} • {relativeTime(e.createdAt)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
        <Card>
          <h3 className={styles.sectionTitle}><Zap size={20} /> Proyectos Activos</h3>
          <div className={styles.list}>
            {topActiveProjects.length === 0 && <p style={{ color: 'var(--color-text-muted)' }}>No hay proyectos activos.</p>}
            {topActiveProjects.map(p => {
              const c = clients.find(client => client.id === p.clientId);
              return (
                <Link key={p.id} to={`/projects/${p.id}`} className={styles.projectLink}>
                  <div className={styles.listItem}>
                    <div style={{ flex: 1 }}>
                      <div className={styles.projectHeader}>
                        <strong style={{ color: 'var(--color-primary)' }}>{p.name}</strong>
                        <Badge variant="active">Activo</Badge>
                      </div>
                      <div className={styles.itemMeta}>{c?.name}</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};