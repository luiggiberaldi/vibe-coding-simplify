import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App'

// Ensure theme is applied on load
if (typeof window !== 'undefined') {
  const savedTheme = localStorage.getItem('pf-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)