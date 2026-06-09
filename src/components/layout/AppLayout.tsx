import React, { useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { ToastContainer } from '../ui/Toast';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { CommandPalette } from '../ui/CommandPalette';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useDeadlineNotifications } from '../../hooks/useDeadlineNotifications';
import { Menu } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';
import { useAppStore } from '../../store/useAppStore';
import { exportToJSON } from '../../utils/exporters';
import styles from './AppLayout.module.css';

const BACKUP_REMINDER_DAYS = 7;

function useBackupReminder() {
  const lastModifiedAt = useAppStore(s => s.lastModifiedAt);
  const lastExportedAt = useUIStore(s => s.lastExportedAt);
  const setLastExportedAt = useUIStore(s => s.setLastExportedAt);
  const addToast = useUIStore(s => s.addToast);

  const handleExport = useCallback(() => {
    const state = useAppStore.getState();
    exportToJSON({
      clients: state.clients,
      projects: state.projects,
      entries: state.entries,
      tasks: state.tasks,
      ideas: state.ideas,
      notes: state.notes,
    });
    setLastExportedAt(new Date().toISOString());
    addToast('Backup exportado correctamente', 'success');
  }, [setLastExportedAt, addToast]);

  useEffect(() => {
    if (!lastModifiedAt) return;

    const lastMod = new Date(lastModifiedAt).getTime();
    const lastExp = lastExportedAt ? new Date(lastExportedAt).getTime() : 0;
    const daysSinceExport = (Date.now() - lastExp) / (1000 * 60 * 60 * 24);
    const daysSinceModified = (Date.now() - lastMod) / (1000 * 60 * 60 * 24);

    if (daysSinceModified >= BACKUP_REMINDER_DAYS && daysSinceExport >= BACKUP_REMINDER_DAYS) {
      const days = Math.floor(Math.min(daysSinceExport, daysSinceModified));
      addToast(
        `⚠️ Llevas ${days} días sin exportar tu backup. Tus datos solo existen en este navegador.`,
        'warning'
      );
    }
  }, [lastModifiedAt, lastExportedAt, addToast]);

  return handleExport;
}

export const AppLayout: React.FC = () => {
  useKeyboardShortcuts();
  useDeadlineNotifications();
  const toggleSidebar = useUIStore(state => state.toggleSidebar);

  return (
    <div className={styles.wrapper}>
      <Sidebar />
      <main className={styles.main}>
        <div className={styles.mobileHeader}>
          <button className={styles.menuBtn} onClick={toggleSidebar}>
            <Menu size={24} />
          </button>
          <span className={styles.mobileTitle}>ProjectFlow Pro</span>
        </div>
        <div className={styles.content}>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>
      <ToastContainer />
      <ConfirmDialog />
      <CommandPalette />
    </div>
  );
};