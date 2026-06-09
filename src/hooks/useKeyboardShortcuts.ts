import { useEffect } from 'react';
import { useUIStore } from '../store/useUIStore';

export const useKeyboardShortcuts = () => {
  const setSearchOpen = useUIStore(state => state.setSearchOpen);
  const searchOpen = useUIStore(state => state.searchOpen);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }

      if (e.key === 'Escape') {
        if (searchOpen) setSearchOpen(false);
        // modals are handled internally
        return;
      }

      // Add shortcut actions here like 'c' for new client
      // We will map these to state triggers or navigate
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, setSearchOpen]);
};