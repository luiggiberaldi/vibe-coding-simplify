import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { daysBetween } from '../utils/formatters';

export function useDeadlineNotifications() {
  const projects = useAppStore(s => s.projects);

  useEffect(() => {
    if (!('Notification' in window)) return;

    const requestPermission = async () => {
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    };
    requestPermission();

    const checkDeadlines = () => {
      if (Notification.permission !== 'granted') return;

      const active = projects.filter(p => p.status === 'active' && p.deadline);
      active.forEach(p => {
        const diff = daysBetween(new Date().toISOString(), p.deadline!);
        if (diff >= 0 && diff <= 3) {
          const key = `pf-notified-${p.id}-${diff}`;
          if (!sessionStorage.getItem(key)) {
            new Notification('Proyecto proximo a vencer', {
              body: `${p.name} vence en ${diff} dia(s)`,
              icon: '/favicon.svg',
            });
            sessionStorage.setItem(key, '1');
          }
        }
      });
    };

    const interval = setInterval(checkDeadlines, 60000);
    checkDeadlines();
    return () => clearInterval(interval);
  }, [projects]);
}