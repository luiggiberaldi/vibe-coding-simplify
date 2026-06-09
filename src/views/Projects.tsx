import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useUIStore } from '../store/useUIStore';
import { useConfirm } from '../hooks/useConfirm';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { Folder, Plus, LayoutList, Columns, Edit2, Archive } from 'lucide-react';
import { daysBetween } from '../utils/formatters';
import { Project } from '../types';
import { ProjectSchema, ProjectForm } from '../schemas';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styles from './Projects.module.css';

function SortableProjectCard({ p, clients, tasks, projectsViewMode, onEdit, onArchive, renderCardContent }: {
  p: Project;
  clients: any[];
  tasks: any[];
  projectsViewMode: string;
  onEdit: (p: Project) => void;
  onArchive: (p: Project) => void;
  renderCardContent: (p: Project) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: p.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={styles.projectCard}>
      {renderCardContent(p)}
    </div>
  );
}

function KanbanColumn({ col, colProjects, clients, tasks, projectsViewMode, onEdit, onArchive, renderCardContent }: {
  col: { id: string; label: string };
  colProjects: Project[];
  clients: any[];
  tasks: any[];
  projectsViewMode: string;
  onEdit: (p: Project) => void;
  onArchive: (p: Project) => void;
  renderCardContent: (p: Project) => React.ReactNode;
}) {
  return (
    <div className={styles.kanbanColumn}>
      <div className={styles.columnHeader}>
        {col.label} <span className={styles.count}>{colProjects.length}</span>
      </div>
      <SortableContext items={colProjects.map(p => p.id)} strategy={verticalListSortingStrategy}>
        <div className={styles.columnBody}>
          {colProjects.map(p => (
            <SortableProjectCard
              key={p.id}
              p={p}
              clients={clients}
              tasks={tasks}
              projectsViewMode={projectsViewMode}
              onEdit={onEdit}
              onArchive={onArchive}
              renderCardContent={renderCardContent}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export const Projects: React.FC = () => {
  const projects = useAppStore(s => s.projects);
  const clients = useAppStore(s => s.clients);
  const tasks = useAppStore(s => s.tasks);
  const addProject = useAppStore(s => s.addProject);
  const updateProject = useAppStore(s => s.updateProject);
  const updateProjectStatus = useAppStore(s => s.updateProjectStatus);
  const reorderProjects = useAppStore(s => s.reorderProjects);
  const projectsViewMode = useUIStore(s => s.projectsViewMode);
  const setProjectsViewMode = useUIStore(s => s.setProjectsViewMode);
  const addToast = useUIStore(s => s.addToast);
  const confirm = useConfirm();

  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectForm | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const statuses = [
    { id: 'active', label: 'Activos' },
    { id: 'paused', label: 'Pausados' },
    { id: 'delivered', label: 'Entregados' },
    { id: 'archived', label: 'Archivados' },
  ];

  let filteredProjects = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  if (filter !== 'all') {
    filteredProjects = filteredProjects.filter(p => p.status === filter);
  }

  const sortedProjects = [...filteredProjects].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const openForm = (p?: Project) => {
    if (clients.length === 0) {
      addToast('Debes crear un cliente primero', 'warning');
      return;
    }
    setEditingProject(p || {
      name: '', clientId: clients[0].id, status: 'active', currency: 'USD',
      price: 0, startDate: new Date().toISOString().split('T')[0], techStack: '', description: ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!editingProject) return;
    const result = ProjectSchema.safeParse(editingProject);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        const field = issue.path[0] as string;
        errors[field] = issue.message;
      });
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    const data = result.data;
    if (data.id) {
      updateProject(data.id, data);
      addToast('Proyecto actualizado', 'success');
    } else {
      addProject(data);
      addToast('Proyecto creado', 'success');
    }
    setIsModalOpen(false);
  };

  const handleArchive = (p: Project) => {
    confirm({
      title: 'Archivar Proyecto',
      message: `¿Seguro que deseas archivar ${p.name}?`,
      onConfirm: () => {
        updateProjectStatus(p.id, 'archived');
        addToast('Proyecto archivado', 'info');
      }
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;
    reorderProjects(active.id as string, over.id as string);
  };

  const renderCardContent = (p: Project) => {
    const c = clients.find(client => client.id === p.clientId);
    const projTasks = tasks.filter(t => t.projectId === p.id);
    const completedTasks = projTasks.filter(t => t.completed).length;
    const stack = (p.techStack || '').split(',').map(s => s.trim()).filter(Boolean);
    const activeDays = daysBetween(p.startDate, new Date().toISOString());

    return (
      <>
        <div className={styles.cardHeader}>
          <Link to={`/projects/${p.id}`} className={styles.projectLink}>{p.name}</Link>
          <Badge variant={p.status as any}>{statuses.find(s => s.id === p.status)?.label || p.status}</Badge>
        </div>
        <div className={styles.clientName}>{c?.name || 'Sin cliente'}</div>
        <div className={styles.price}>{p.price?.toLocaleString()} {p.currency}</div>

        {projectsViewMode === 'list' && (
          <div className={styles.stacks}>
            {stack.slice(0, 3).map(s => <span key={s} className={styles.chip}>{s}</span>)}
            {stack.length > 3 && <span className={styles.chip}>+{stack.length - 3}</span>}
          </div>
        )}

        <div className={styles.metaRow}>
          <span className={styles.metaInfo}>{activeDays}d activo</span>
          <span className={styles.metaInfo}>{completedTasks}/{projTasks.length} tareas</span>
        </div>

        <div className={styles.actions}>
          <Button variant="ghost" onClick={(e) => { e.stopPropagation(); e.preventDefault(); openForm(p); }} icon={<Edit2 size={14} />} />
          {p.status !== 'archived' && (
            <Button variant="ghost" onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleArchive(p); }} icon={<Archive size={14} />} />
          )}
        </div>
      </>
    );
  };

  const activeProject = activeId ? projects.find(p => p.id === activeId) : null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Proyectos</h1>
        <div className={styles.headerControls}>
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.search}
          />
          <div className={styles.viewToggle}>
            <button className={projectsViewMode === 'list' ? styles.active : ''} onClick={() => setProjectsViewMode('list')} title="Vista Lista">
              <LayoutList size={18} />
            </button>
            <button className={projectsViewMode === 'kanban' ? styles.active : ''} onClick={() => setProjectsViewMode('kanban')} title="Vista Kanban">
              <Columns size={18} />
            </button>
          </div>
          <Button onClick={() => openForm()} icon={<Plus size={18} />}>Nuevo Proyecto</Button>
        </div>
      </div>

      <div className={styles.filters}>
        <button className={`${styles.filterBtn} ${filter === 'all' ? styles.activeFilter : ''}`} onClick={() => setFilter('all')}>Todos</button>
        {statuses.map(s => (
          <button
            key={s.id}
            className={`${styles.filterBtn} ${filter === s.id ? styles.activeFilter : ''}`}
            onClick={() => setFilter(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={<Folder />}
          title="No tienes proyectos"
          description="Añade tu primer proyecto para empezar a organizarte."
          action={<Button onClick={() => openForm()} icon={<Plus size={18} />}>Nuevo Proyecto</Button>}
        />
      ) : (
        projectsViewMode === 'list' ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <SortableContext items={sortedProjects.map(p => p.id)} strategy={verticalListSortingStrategy}>
              <div className={styles.listContainer}>
                {sortedProjects.map(p => (
                  <div key={p.id} className={styles.projectCard}>
                    {renderCardContent(p)}
                  </div>
                ))}
              </div>
            </SortableContext>
            <DragOverlay>
              {activeProject ? (
                <div className={styles.projectCard}>
                  {renderCardContent(activeProject)}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className={styles.kanbanBoard}>
              {statuses.map(col => {
                const colProjects = sortedProjects.filter(p => p.status === col.id);
                return (
                  <KanbanColumn
                    key={col.id}
                    col={col}
                    colProjects={colProjects}
                    clients={clients}
                    tasks={tasks}
                    projectsViewMode={projectsViewMode}
                    onEdit={openForm}
                    onArchive={handleArchive}
                    renderCardContent={renderCardContent}
                  />
                );
              })}
            </div>
            <DragOverlay>
              {activeProject ? (
                <div className={styles.projectCard}>
                  {renderCardContent(activeProject)}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject?.id ? 'Editar Proyecto' : 'Nuevo Proyecto'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Guardar</Button>
          </>
        }
      >
        {editingProject && (
          <form className={styles.form}>
            <Input label="Nombre del Proyecto *" value={editingProject.name || ''} onChange={e => setEditingProject({ ...editingProject, name: e.target.value })} error={formErrors.name} />
            <Input label="Cliente *" options={clients.map(c => ({ label: c.name, value: c.id }))} value={editingProject.clientId || ''} onChange={e => setEditingProject({ ...editingProject, clientId: e.target.value })} error={formErrors.clientId} />
            <Input label="Descripción" multiline value={editingProject.description || ''} onChange={e => setEditingProject({ ...editingProject, description: e.target.value })} />

            <div className={styles.grid2}>
              <Input label="Estado" options={statuses.map(s => ({ label: s.label, value: s.id }))} value={editingProject.status || 'active'} onChange={e => setEditingProject({ ...editingProject, status: e.target.value as any })} />
              <Input label="Tech Stack" value={editingProject.techStack || ''} onChange={e => setEditingProject({ ...editingProject, techStack: e.target.value })} placeholder="React, Node..." />
            </div>

            <div className={styles.grid2}>
              <Input label="Precio" type="number" value={editingProject.price || ''} onChange={e => setEditingProject({ ...editingProject, price: Number(e.target.value) })} error={formErrors.price} />
              <Input label="Moneda" options={[{ label: 'USD', value: 'USD' }, { label: 'EUR', value: 'EUR' }, { label: 'VES', value: 'VES' }, { label: 'USDT', value: 'USDT' }]} value={editingProject.currency || 'USD'} onChange={e => setEditingProject({ ...editingProject, currency: e.target.value as any })} />
            </div>

            <div className={styles.grid2}>
              <Input label="Fecha Inicio *" type="date" value={editingProject.startDate || ''} onChange={e => setEditingProject({ ...editingProject, startDate: e.target.value })} error={formErrors.startDate} />
              <Input label="Deadline" type="date" value={editingProject.deadline || ''} onChange={e => setEditingProject({ ...editingProject, deadline: e.target.value })} />
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};