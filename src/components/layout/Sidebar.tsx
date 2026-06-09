import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUIStore } from '../../store/useUIStore';
import { LayoutDashboard, Users, FolderOpen, Lightbulb, FileText, BarChart2, Moon, Sun } from 'lucide-react';
import { RatesPanel } from '../ui/RatesPanel';
import styles from './Sidebar.module.css';

export const Sidebar: React.FC = () => {
  const { theme, toggleTheme, isSidebarOpen, toggleSidebar } = useUIStore();

  return (
    <>
      <div className={`${styles.overlay} ${isSidebarOpen ? styles.open : ''}`} onClick={toggleSidebar} />
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`}>
        <div className={styles.brand}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16v16H4z"/><path d="M9 4v16"/><path d="M15 4v16"/><path d="M4 9h16"/><path d="M4 15h16"/>
          </svg>
          ProjectFlow Pro
        </div>
        
        <nav className={styles.nav}>
          <NavLink to="/" end className={({isActive}) => `${styles.navItem} ${isActive ? styles.active : ''}`} onClick={() => window.innerWidth <= 768 && toggleSidebar()}>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          <NavLink to="/clients" className={({isActive}) => `${styles.navItem} ${isActive ? styles.active : ''}`} onClick={() => window.innerWidth <= 768 && toggleSidebar()}>
            <Users size={20} /> Clientes
          </NavLink>
          <NavLink to="/projects" className={({isActive}) => `${styles.navItem} ${isActive ? styles.active : ''}`} onClick={() => window.innerWidth <= 768 && toggleSidebar()}>
            <FolderOpen size={20} /> Proyectos
          </NavLink>
          <NavLink to="/ideas" className={({isActive}) => `${styles.navItem} ${isActive ? styles.active : ''}`} onClick={() => window.innerWidth <= 768 && toggleSidebar()}>
            <Lightbulb size={20} /> Ideas
          </NavLink>
          <NavLink to="/notes" className={({isActive}) => `${styles.navItem} ${isActive ? styles.active : ''}`} onClick={() => window.innerWidth <= 768 && toggleSidebar()}>
            <FileText size={20} /> Notas
          </NavLink>
          <NavLink to="/stats" className={({isActive}) => `${styles.navItem} ${isActive ? styles.active : ''}`} onClick={() => window.innerWidth <= 768 && toggleSidebar()}>
            <BarChart2 size={20} /> Estadísticas
          </NavLink>
        </nav>

        <RatesPanel />

        <div className={styles.footer}>
          <button className={styles.themeToggle} onClick={toggleTheme}>
            {theme === 'dark' ? <><Sun size={20}/> Light</> : <><Moon size={20}/> Dark</>}
          </button>
        </div>
      </aside>
    </>
  );
};