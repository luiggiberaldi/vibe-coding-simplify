<div align="center">

# ProjectFlow Pro

**Gestión de proyectos profesional para freelancers**

[![CI](https://github.com/luiggiberaldi/vibe-coding-simplify/actions/workflows/ci.yml/badge.svg)](https://github.com/luiggiberaldi/vibe-coding-simplify/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vitejs.dev)

</div>

---

## Demo

[https://vibe-coding-simplify.vercel.app](https://vibe-coding-simplify.vercel.app)

---

## Características

### Gestión de Proyectos
- **Kanban Board** — Drag & drop con `@dnd-kit` para gestionar estados de proyectos
- **Vista de Lista** — Tabla compacta con ordenamiento por columnas
- **Pipeline visual** — Estados: Activo, Pausado, Entregado, Archivado

### Clientes
- **CRM básico** — Nombre, empresa, email, WhatsApp, stack tecnológico
- **Color personalizado** — Avatar con color único por cliente
- **Vínculo con proyectos** — Relación 1:N entre clientes y proyectos

### Seguimiento de Trabajo
- **Entradas por proyecto** — Notas, bugs, sugerencias, cambios, hitos, feedback
- **Prioridades** — Low, Medium, High con indicadores visuales
- **Resolución** — Marcar entradas como resueltas con seguimiento

### Tareas
- **Checklist de tareas** — Por proyecto con fechas límite
- **Time Tracking** — Cronómetro por tarea con acumulación de tiempo
- **Asignación** — Responsable por tarea

### Notas Rápidas
- **Markdown básico** — Negrita, cursiva, listas
- **Colores** — 6 opciones de fondo para categorización visual
- **Vínculos** — Asociar notas a proyectos o clientes

### Ideas
- **Captura de ideas** — Título, descripción, tags, prioridad
- **Pipeline** — Nueva → Evaluando → Convertida / Descartada
- **Conversión** — Convertir idea en proyecto con un click

### Dashboard
- **KPIs** — Proyectos activos, clientes totales, ingresos, deadlines próximos
- **Gráficos** — Barras de ingresos (6 meses) + Donut de estados
- **Actividad reciente** — Últimas entradas con tiempo relativo
- **Proyectos activos** — Lista rápida de los 5 más recientes

### Estadísticas
- **Ingresos totales** — Por moneda (USD, EUR, VES, USDT)
- **Top clientes** — Por facturación
- **Tasa de conversión** — Ideas convertidas vs descartadas
- **Gráficos responsivos** — Canvas con ResizeObserver

### Tasas de Cambio en Vivo
- **Dólar BCV** — Oficial del Banco Central de Venezuela
- **Euro BCV** — Oficial
- **USDT** — Tasa paralelo (Binance API)
- **Auto-refresh** — Cada 5 minutos
- **Conversión automática** — Precios en cualquier moneda

### Búsqueda Global
- **Command Palette** — `Ctrl+K` desde cualquier vista
- **Búsqueda fuzzy** — Clientes, proyectos, ideas, notas
- **Navegación por teclado** — ↑↓ Enter Escape

### Import/Export
- **Backup JSON** — Exportar todo el estado de la aplicación
- **Restauración** — Importar desde archivo JSON
- **Formato completo** — Clientes, proyectos, entradas, tareas, ideas, notas

### Notificaciones
- **Deadline reminders** — Notificación push cuando un proyecto vence en ≤3 días
- **Toast messages** — Feedback de acciones

### PWA
- **Manifest** — Instalable como app nativa
- **Responsive** — Optimizado para todos los dispositivos

---

## Tecnologías

| Categoría | Tecnología | Versión |
|-----------|------------|---------|
| Framework | React | 19.2 |
| Language | TypeScript | 6.0 |
| Bundler | Vite | 8.0 |
| State | Zustand | 5.0 |
| Immutability | Immer | 11.1 |
| Routing | React Router | 7.17 |
| Forms | Zod | 4.4 |
| Drag & Drop | @dnd-kit | 6.3 |
| Icons | Lucide React | 1.17 |
| Testing | Vitest | 4.1 |
| CI/CD | GitHub Actions | - |

---

## Instalación

### Requisitos
- Node.js ≥ 18
- npm ≥ 9

### Pasos

```bash
# Clonar el repositorio
git clone https://github.com/luiggiberaldi/vibe-coding-simplify.git
cd vibe-coding-simplify

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

---

## Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Build de producción (TypeScript + Vite) |
| `npm run preview` | Preview del build de producción |
| `npm run test` | Ejecutar tests |
| `npm run test:watch` | Tests en modo watch |
| `npm run lint` | Linting con ESLint |

---

## Estructura del Proyecto

```
src/
├── components/
│   ├── layout/          # AppLayout, Sidebar
│   └── ui/              # Button, Card, Modal, Toast, etc.
├── hooks/               # useExchangeRates, useDeadlineNotifications, etc.
├── schemas/             # Validación con Zod
├── store/               # Zustand stores (useAppStore, useUIStore)
├── styles/              # CSS global, themes, tipografía
├── test/                # Tests unitarios
├── types/               # Definiciones TypeScript
├── utils/               # currency, exchangeRates, exporters, formatters
└── views/               # Dashboard, Projects, Clients, Ideas, Notes, Stats
```

---

## Arquitectura

### State Management
- **Zustand** con persistencia en `localStorage`
- **Immer** para updates inmutables
- **Selectores granulares** — Re-render óptimo por suscripción

### Estilos
- **CSS Modules** — Aislamiento de estilos por componente
- **CSS Custom Properties** — Tokens de diseño (colores, espaciado, breakpoints)
- **Responsive** — Mobile-first con breakpoints en 640px, 768px, 1024px

### Validación
- **Zod schemas** — Validación runtime + inferencia de tipos
- **Formularios controlados** — Estados locales con validación al submit

### Testing
- **Vitest** — Runner de tests rápido
- **Testing Library** — Tests de componentes React
- **14 tests** — Store (8) + Utils (6)

---

## API de Tasas de Cambio

| Fuente | Endpoint | Frecuencia |
|--------|----------|------------|
| BCV Oficial | `ve.dolarapi.com/v1/dolares` | 5 min |
| BCV Euro | `ve.dolarapi.com/v1/euros` | 5 min |
| USDT | `api.binance.com/api/v3/ticker/price?symbol=USDTUSD` | 5 min |

---

## Contribuir

1. Fork el repositorio
2. Crear una rama para la feature (`git checkout -b feature/nueva-feature`)
3. Commit los cambios (`git commit -m 'Add nueva feature'`)
4. Push a la rama (`git push origin feature/nueva-feature`)
5. Abrir un Pull Request

---

## Licencia

MIT License - Ver [LICENSE](LICENSE) para más detalles.

---

<div align="center">

**Desarrollado con React + TypeScript + Vite**

</div>