import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useUIStore } from '../store/useUIStore';
import { useConfirm } from '../hooks/useConfirm';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { daysBetween, formatDate, relativeTime } from '../utils/formatters';
import { getInitials, getColorForId } from '../utils/generators';
import { exportToMarkdown } from '../utils/exporters';
import { exportProjectToPDF } from '../utils/pdfExporter';
import { Download, FileText, CheckCircle, Circle, Edit2, Trash2, Plus, ArrowLeft, MoreVertical, Printer, FolderOpen, Play, Pause } from 'lucide-react';
import { Entry, Task, Project } from '../types';
import { EntrySchema, TaskSchema, EntryForm, TaskForm } from '../schemas';
import styles from './ProjectDetail.module.css';

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function TaskTimer({ task }: { task: Task }) {
  const startTaskTimer = useAppStore(s => s.startTaskTimer);
  const stopTaskTimer = useAppStore(s => s.stopTaskTimer);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!task.timerStart) { setElapsed(0); return; }
    const base = task.timeSpent || 0;
    const start = task.timerStart;
    const tick = () => setElapsed(base + Math.floor((Date.now() - start) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [task.timerStart, task.timeSpent]);

  const total = (task.timeSpent || 0) + elapsed;
  const isRunning = !!task.timerStart;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => isRunning ? stopTaskTimer(task.id) : startTaskTimer(task.id)}
        icon={isRunning ? <Pause size={14} /> : <Play size={14} />}
      />
      {(total > 0 || isRunning) && (
        <span style={{ fontSize: '12px', color: isRunning ? 'var(--color-success)' : 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums' }}>
          {formatTime(total)}
        </span>
      )}
    </div>
  );
}

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{id: string}>();
  const projects = useAppStore(s => s.projects);
  const clients = useAppStore(s => s.clients);
  const entries = useAppStore(s => s.entries);
  const tasks = useAppStore(s => s.tasks);
  const updateProjectStatus = useAppStore(s => s.updateProjectStatus);
  const addEntry = useAppStore(s => s.addEntry);
  const updateEntry = useAppStore(s => s.updateEntry);
  const deleteEntry = useAppStore(s => s.deleteEntry);
  const toggleEntryResolved = useAppStore(s => s.toggleEntryResolved);
  const addTask = useAppStore(s => s.addTask);
  const updateTask = useAppStore(s => s.updateTask);
  const deleteTask = useAppStore(s => s.deleteTask);
  const toggleTaskCompleted = useAppStore(s => s.toggleTaskCompleted);
  const startTaskTimer = useAppStore(s => s.startTaskTimer);
  const stopTaskTimer = useAppStore(s => s.stopTaskTimer);
  const { addToast } = useUIStore();
  const confirm = useConfirm();

  const [activeTab, setActiveTab] = useState<'entries' | 'tasks'>('entries');
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<EntryForm | null>(null);
  const [entryFormErrors, setEntryFormErrors] = useState<Record<string, string>>({});
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskForm | null>(null);
  const [taskFormErrors, setTaskFormErrors] = useState<Record<string, string>>({});

  const p = projects.find(proj => proj.id === id);
  if (!p) {
    return <EmptyState icon={<FolderOpen />} title="Proyecto no encontrado" action={<Link to="/projects"><Button>Volver</Button></Link>} />;
  }

  const c = clients.find(client => client.id === p.clientId);
  const pEntries = entries.filter(e => e.projectId === p.id).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const pTasks = tasks.filter(t => t.projectId === p.id).sort((a,b) => {
    if (a.completed === b.completed) return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return a.completed ? 1 : -1;
  });

  const handleExportMD = () => {
    exportToMarkdown(p, c, pEntries, pTasks);
    addToast('Proyecto exportado a Markdown', 'success');
  };

  const handleStatusChange = (status: Project['status']) => {
    updateProjectStatus(p.id, status);
    addToast(`Estado cambiado a ${status}`, 'info');
  };

  // Entry Handlers
  const openEntryForm = (entry?: Entry) => {
    setEditingEntry(entry || { projectId: p.id, type: 'note', priority: 'medium', title: '', description: '', tags: [], resolved: false });
    setEntryFormErrors({});
    setIsEntryModalOpen(true);
  };
  const saveEntry = () => {
    if (!editingEntry) return;
    const result = EntrySchema.safeParse(editingEntry);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        const field = issue.path[0] as string;
        errors[field] = issue.message;
      });
      setEntryFormErrors(errors);
      return;
    }
    setEntryFormErrors({});
    const data = result.data;
    if (data.id) {
      updateEntry(data.id, data);
    } else {
      addEntry(data);
    }
    setIsEntryModalOpen(false);
  };

  // Task Handlers
  const openTaskForm = (task?: Task) => {
    setEditingTask(task || { projectId: p.id, title: '', completed: false, assignee: '', dueDate: '' });
    setTaskFormErrors({});
    setIsTaskModalOpen(true);
  };
  const saveTask = () => {
    if (!editingTask) return;
    const result = TaskSchema.safeParse(editingTask);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        const field = issue.path[0] as string;
        errors[field] = issue.message;
      });
      setTaskFormErrors(errors);
      return;
    }
    setTaskFormErrors({});
    const data = result.data;
    if (data.id) {
      updateTask(data.id, data);
    } else {
      addTask(data);
    }
    setIsTaskModalOpen(false);
  };

  const activeDays = daysBetween(p.startDate, new Date().toISOString());

  return (
    <div className={styles.container}>
      <div className="no-print">
        <div className={styles.breadcrumb}>
          <Link to="/projects">Proyectos</Link> › <span>{p.name}</span>
        </div>
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <h1>{p.name}</h1>
            <Badge variant={p.status as any}>{p.status}</Badge>
          </div>
          <div className={styles.actions}>
            <Button variant="outline" onClick={handleExportMD} icon={<Download size={16}/>}>MD</Button>
            <Button variant="outline" onClick={() => exportProjectToPDF(p, c, pEntries, pTasks)} icon={<Printer size={16}/>}>PDF</Button>
            {activeTab === 'entries' ? (
              <Button onClick={() => openEntryForm()} icon={<Plus size={16}/>}>Nueva Entrada</Button>
            ) : (
              <Button onClick={() => openTaskForm()} icon={<Plus size={16}/>}>Nueva Tarea</Button>
            )}
          </div>
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.sidebar}>
          <Card className={styles.infoCard}>
            {c && (
              <div className={styles.section}>
                <h4>Cliente</h4>
                <div className={styles.clientRow}>
                  <div className={styles.avatar} style={{background: getColorForId(c.id)}}>{getInitials(c.name)}</div>
                  <div>
                    <div className={styles.clientName}>{c.name}</div>
                    <div className={styles.clientEmail}>{c.email}</div>
                  </div>
                </div>
              </div>
            )}
            
            <div className={styles.section}>
              <h4>Detalles</h4>
              <div className={styles.detailRow}><span>Precio:</span> <strong>{p.price?.toLocaleString()} {p.currency}</strong></div>
              <div className={styles.detailRow}><span>Inicio:</span> <span>{formatDate(p.startDate)}</span></div>
              <div className={styles.detailRow}><span>Deadline:</span> <span>{p.deadline ? formatDate(p.deadline) : 'N/A'}</span></div>
              <div className={styles.detailRow}><span>Activo:</span> <span>{activeDays} días</span></div>
            </div>

            {p.techStack && (
              <div className={styles.section}>
                <h4>Stack</h4>
                <div className={styles.chips}>
                  {p.techStack.split(',').map(s => s.trim()).filter(Boolean).map(s => <span key={s} className={styles.chip}>{s}</span>)}
                </div>
              </div>
            )}

            {p.description && (
              <div className={styles.section}>
                <h4>Descripción</h4>
                <p className={styles.desc}>{p.description}</p>
              </div>
            )}
            
            <div className={`no-print ${styles.statusChanger}`}>
              {['active', 'paused', 'delivered', 'archived'].map(s => (
                s !== p.status && <button key={s} onClick={() => handleStatusChange(s as any)}>Marcar como {s}</button>
              ))}
            </div>
          </Card>
        </div>

        <div className={styles.mainContent}>
          <div className={`no-print ${styles.tabs}`}>
            <button className={activeTab === 'entries' ? styles.activeTab : ''} onClick={() => setActiveTab('entries')}>Entradas ({pEntries.length})</button>
            <button className={activeTab === 'tasks' ? styles.activeTab : ''} onClick={() => setActiveTab('tasks')}>Tareas ({pTasks.filter(t=>t.completed).length}/{pTasks.length})</button>
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'entries' ? (
              <div className={styles.timeline}>
                {pEntries.length === 0 ? <EmptyState icon={<FileText/>} title="No hay entradas" action={<Button onClick={()=>openEntryForm()}>Crear Entrada</Button>} /> : pEntries.map(e => (
                  <div key={e.id} className={styles.entryItem}>
                    <div className={styles.entryHeader}>
                      <strong className={styles.entryTitle}>{e.title}</strong>
                      <div className="no-print dropdown-container" style={{position:'relative'}}>
                        <button className={styles.menuBtn}><MoreVertical size={16}/></button>
                        <div className="dropdown-menu">
                          <button onClick={() => toggleEntryResolved(e.id)}>{e.resolved ? 'Marcar Pendiente' : 'Marcar Resuelto'}</button>
                          <button onClick={() => openEntryForm(e)}>Editar</button>
                          <button style={{color: 'var(--color-error)'}} onClick={() => {
                            confirm({ title: 'Eliminar', message: '¿Seguro?', confirmVariant: 'danger', onConfirm: () => deleteEntry(e.id) });
                          }}>Eliminar</button>
                        </div>
                      </div>
                    </div>
                    {e.description && <p className={styles.entryDesc}>{e.description}</p>}
                    <div className={styles.entryMeta}>
                      <Badge variant={e.resolved ? 'active' : 'archived'}>{e.resolved ? 'Resuelto' : 'Pendiente'}</Badge>
                      <Badge variant={e.priority as any}>{e.priority}</Badge>
                      <span className={styles.time}>{relativeTime(e.createdAt)}</span>
                      {e.type && <span className={styles.chip}>{e.type}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.tasks}>
                {pTasks.length === 0 ? <EmptyState icon={<CheckCircle/>} title="No hay tareas" action={<Button onClick={()=>openTaskForm()}>Añadir Tarea</Button>} /> : pTasks.map(t => (
                  <div key={t.id} className={`${styles.taskItem} ${t.completed ? styles.completed : ''}`}>
                    <button className={styles.checkBtn} onClick={() => toggleTaskCompleted(t.id)}>
                      {t.completed ? <CheckCircle size={20} color="var(--color-success)"/> : <Circle size={20} color="var(--color-text-muted)"/>}
                    </button>
                    <div className={styles.taskContent}>
                      <div className={styles.taskTitle}>{t.title}</div>
                      <div className={styles.taskMeta}>
                        {t.assignee && <span>@{t.assignee}</span>}
                        {t.dueDate && <span>Vence: {formatDate(t.dueDate)}</span>}
                      </div>
                    </div>
                    <TaskTimer task={t} />
                    <div className="no-print dropdown-container" style={{position:'relative'}}>
                      <button className={styles.menuBtn}><MoreVertical size={16}/></button>
                      <div className="dropdown-menu">
                        <button onClick={() => openTaskForm(t)}>Editar</button>
                        <button style={{color: 'var(--color-error)'}} onClick={() => {
                          confirm({ title: 'Eliminar', message: '¿Seguro?', confirmVariant: 'danger', onConfirm: () => deleteTask(t.id) });
                        }}>Eliminar</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={isEntryModalOpen} onClose={() => setIsEntryModalOpen(false)} title={editingEntry?.id ? 'Editar Entrada' : 'Nueva Entrada'} footer={<><Button variant="outline" onClick={() => setIsEntryModalOpen(false)}>Cancelar</Button><Button onClick={saveEntry}>Guardar</Button></>}>
        {editingEntry && (
          <form className={styles.form}>
            <Input label="Título *" value={editingEntry.title} onChange={e => setEditingEntry({...editingEntry, title: e.target.value})} error={entryFormErrors.title} />
            <Input label="Tipo" options={[{label:'Nota',value:'note'},{label:'Bug',value:'bug'},{label:'Sugerencia',value:'suggestion'},{label:'Cambio',value:'change'},{label:'Hito',value:'milestone'},{label:'Feedback',value:'feedback'}]} value={editingEntry.type} onChange={e => setEditingEntry({...editingEntry, type: e.target.value as any})} />
            <Input label="Prioridad" options={[{label:'Baja',value:'low'},{label:'Media',value:'medium'},{label:'Alta',value:'high'}]} value={editingEntry.priority} onChange={e => setEditingEntry({...editingEntry, priority: e.target.value as any})} />
            <Input label="Descripción" multiline value={editingEntry.description || ''} onChange={e => setEditingEntry({...editingEntry, description: e.target.value})} />
          </form>
        )}
      </Modal>

      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title={editingTask?.id ? 'Editar Tarea' : 'Nueva Tarea'} footer={<><Button variant="outline" onClick={() => setIsTaskModalOpen(false)}>Cancelar</Button><Button onClick={saveTask}>Guardar</Button></>}>
        {editingTask && (
          <form className={styles.form}>
            <Input label="Título de tarea *" value={editingTask.title} onChange={e => setEditingTask({...editingTask, title: e.target.value})} error={taskFormErrors.title} />
            <Input label="Asignado a" value={editingTask.assignee || ''} onChange={e => setEditingTask({...editingTask, assignee: e.target.value})} />
            <Input label="Fecha límite" type="date" value={editingTask.dueDate || ''} onChange={e => setEditingTask({...editingTask, dueDate: e.target.value})} />
          </form>
        )}
      </Modal>
    </div>
  );
};