import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './views/Dashboard';
import { Clients } from './views/Clients';
import { Projects } from './views/Projects';
import { ProjectDetail } from './views/ProjectDetail';
import { Ideas } from './views/Ideas';
import { Notes } from './views/Notes';
import { Stats } from './views/Stats';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'clients', element: <Clients /> },
      { path: 'projects', element: <Projects /> },
      { path: 'projects/:id', element: <ProjectDetail /> },
      { path: 'ideas', element: <Ideas /> },
      { path: 'notes', element: <Notes /> },
      { path: 'stats', element: <Stats /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;