import React from 'react';
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
import styles from './AppLayout.module.css';

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