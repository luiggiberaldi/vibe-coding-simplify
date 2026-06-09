import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { useUIStore } from '../../store/useUIStore';
import { Search, Users, FolderOpen, Lightbulb, FileText, BarChart2, Plus } from 'lucide-react';
import styles from './CommandPalette.module.css';

interface CommandItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  description?: string;
  action: () => void;
  category: string;
}

export const CommandPalette: React.FC = () => {
  const navigate = useNavigate();
  const clients = useAppStore(s => s.clients);
  const projects = useAppStore(s => s.projects);
  const ideas = useAppStore(s => s.ideas);
  const notes = useAppStore(s => s.notes);
  const searchOpen = useUIStore(s => s.searchOpen);
  const setSearchOpen = useUIStore(s => s.setSearchOpen);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, setSearchOpen]);

  useEffect(() => {
    if (searchOpen) {
      setQuery('');
      setSelectedIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [searchOpen]);

  const items = useMemo<CommandItem[]>(() => {
    const cmds: CommandItem[] = [
      { id: 'nav-dashboard', icon: <BarChart2 size={16} />, label: 'Dashboard', action: () => { navigate('/'); setSearchOpen(false); }, category: 'Navegación' },
      { id: 'nav-clients', icon: <Users size={16} />, label: 'Clientes', action: () => { navigate('/clients'); setSearchOpen(false); }, category: 'Navegación' },
      { id: 'nav-projects', icon: <FolderOpen size={16} />, label: 'Proyectos', action: () => { navigate('/projects'); setSearchOpen(false); }, category: 'Navegación' },
      { id: 'nav-ideas', icon: <Lightbulb size={16} />, label: 'Ideas', action: () => { navigate('/ideas'); setSearchOpen(false); }, category: 'Navegación' },
      { id: 'nav-notes', icon: <FileText size={16} />, label: 'Notas', action: () => { navigate('/notes'); setSearchOpen(false); }, category: 'Navegación' },
      { id: 'nav-stats', icon: <BarChart2 size={16} />, label: 'Estadísticas', action: () => { navigate('/stats'); setSearchOpen(false); }, category: 'Navegación' },
      { id: 'new-client', icon: <Plus size={16} />, label: 'Nuevo Cliente', action: () => { navigate('/clients'); setSearchOpen(false); }, category: 'Crear' },
      { id: 'new-project', icon: <Plus size={16} />, label: 'Nuevo Proyecto', action: () => { navigate('/projects'); setSearchOpen(false); }, category: 'Crear' },
      { id: 'new-idea', icon: <Plus size={16} />, label: 'Nueva Idea', action: () => { navigate('/ideas'); setSearchOpen(false); }, category: 'Crear' },
      { id: 'new-note', icon: <Plus size={16} />, label: 'Nueva Nota', action: () => { navigate('/notes'); setSearchOpen(false); }, category: 'Crear' },
    ];

    clients.forEach(c => {
      cmds.push({
        id: `client-${c.id}`,
        icon: <Users size={16} />,
        label: c.name,
        description: c.company || c.email || '',
        action: () => { navigate('/clients'); setSearchOpen(false); },
        category: 'Clientes',
      });
    });

    projects.forEach(p => {
      cmds.push({
        id: `project-${p.id}`,
        icon: <FolderOpen size={16} />,
        label: p.name,
        description: p.status,
        action: () => { navigate(`/projects/${p.id}`); setSearchOpen(false); },
        category: 'Proyectos',
      });
    });

    ideas.forEach(i => {
      cmds.push({
        id: `idea-${i.id}`,
        icon: <Lightbulb size={16} />,
        label: i.title,
        description: i.status,
        action: () => { navigate('/ideas'); setSearchOpen(false); },
        category: 'Ideas',
      });
    });

    notes.forEach(n => {
      cmds.push({
        id: `note-${n.id}`,
        icon: <FileText size={16} />,
        label: n.title,
        action: () => { navigate('/notes'); setSearchOpen(false); },
        category: 'Notas',
      });
    });

    return cmds;
  }, [clients, projects, ideas, notes, navigate, setSearchOpen]);

  const filtered = useMemo(() => {
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter(item =>
      item.label.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  }, [items, query]);

  useEffect(() => { setSelectedIndex(0); }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      filtered[selectedIndex].action();
    } else if (e.key === 'Escape') {
      setSearchOpen(false);
    }
  };

  if (!searchOpen) return null;

  return (
    <div className={styles.overlay} onClick={() => setSearchOpen(false)}>
      <div className={styles.palette} onClick={e => e.stopPropagation()}>
        <div className={styles.searchRow}>
          <Search size={18} className={styles.searchIcon} />
          <input
            ref={inputRef}
            className={styles.input}
            placeholder="Buscar o escribir un comando..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <kbd className={styles.kbd}>ESC</kbd>
        </div>
        <div className={styles.results}>
          {filtered.length === 0 && <div className={styles.empty}>Sin resultados</div>}
          {(() => {
            let lastCat = '';
            return filtered.map((item, i) => {
              const showCat = item.category !== lastCat;
              lastCat = item.category;
              return (
                <React.Fragment key={item.id}>
                  {showCat && <div className={styles.category}>{item.category}</div>}
                  <button
                    className={`${styles.item} ${i === selectedIndex ? styles.selected : ''}`}
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIndex(i)}
                  >
                    <span className={styles.itemIcon}>{item.icon}</span>
                    <span className={styles.itemLabel}>{item.label}</span>
                    {item.description && <span className={styles.itemDesc}>{item.description}</span>}
                  </button>
                </React.Fragment>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
};