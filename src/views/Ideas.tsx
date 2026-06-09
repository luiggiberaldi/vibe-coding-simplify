import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useUIStore } from '../store/useUIStore';
import { useConfirm } from '../hooks/useConfirm';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { Lightbulb, Plus, Trash2, ArrowRight } from 'lucide-react';
import { Idea } from '../types';
import { relativeTime } from '../utils/formatters';
import { IdeaSchema, IdeaForm } from '../schemas';
import styles from './Ideas.module.css';

export const Ideas: React.FC = () => {
  const ideas = useAppStore(s => s.ideas);
  const clients = useAppStore(s => s.clients);
  const addIdea = useAppStore(s => s.addIdea);
  const updateIdea = useAppStore(s => s.updateIdea);
  const deleteIdea = useAppStore(s => s.deleteIdea);
  const convertIdeaToProject = useAppStore(s => s.convertIdeaToProject);
  const addProject = useAppStore(s => s.addProject);
  const { addToast } = useUIStore();
  const confirm = useConfirm();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<IdeaForm | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [convertData, setConvertData] = useState({ ideaId: '', clientId: '', price: 0 });

  const statuses = [
    { id: 'new', label: 'Nuevas', color: 'var(--color-info)' },
    { id: 'evaluating', label: 'Evaluando', color: 'var(--color-warning)' },
    { id: 'converted', label: 'Convertidas', color: 'var(--color-success)' },
    { id: 'discarded', label: 'Descartadas', color: 'var(--color-text-muted)' },
  ];

  let filtered = ideas.filter(i => i.title.toLowerCase().includes(search.toLowerCase()) || i.description?.toLowerCase().includes(search.toLowerCase()));
  if (filterStatus !== 'all') filtered = filtered.filter(i => i.status === filterStatus);

  const openForm = (idea?: Idea) => {
    setEditingIdea(idea || { title: '', description: '', status: 'new', priority: 'medium', tags: [] });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!editingIdea) return;
    const result = IdeaSchema.safeParse(editingIdea);
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
      updateIdea(data.id, data);
    } else {
      addIdea(data);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    confirm({
      title: 'Eliminar Idea',
      message: '¿Estás seguro?',
      confirmVariant: 'danger',
      onConfirm: () => deleteIdea(id)
    });
  };

  const openConvertModal = (idea: Idea) => {
    if (clients.length === 0) return addToast('Crea un cliente primero', 'warning');
    setConvertData({ ideaId: idea.id, clientId: clients[0].id, price: 0 });
    setIsConvertModalOpen(true);
  };

  const handleConvert = () => {
    const idea = ideas.find(i => i.id === convertData.ideaId);
    if (!idea) return;

    const newProjectId = addProject({
      clientId: convertData.clientId,
      name: idea.title,
      description: idea.description,
      status: 'active',
      currency: 'USD',
      price: convertData.price,
      startDate: new Date().toISOString().split('T')[0],
      techStack: idea.tags?.join(', ') || '',
    });

    convertIdeaToProject(idea.id, newProjectId);
    setIsConvertModalOpen(false);
    addToast('Idea convertida a proyecto', 'success');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Lluvia de Ideas</h1>
        <div className={styles.actions}>
          <Input placeholder="Buscar idea..." value={search} onChange={e=>setSearch(e.target.value)} className={styles.search} />
          <Button onClick={() => openForm()} icon={<Plus size={18}/>}>Nueva Idea</Button>
        </div>
      </div>

      <div className={styles.filters}>
        <button className={filterStatus === 'all' ? styles.activeFilter : ''} onClick={() => setFilterStatus('all')}>Todas</button>
        {statuses.map(s => (
          <button key={s.id} className={filterStatus === s.id ? styles.activeFilter : ''} onClick={() => setFilterStatus(s.id)}>{s.label}</button>
        ))}
      </div>

      {ideas.length === 0 ? (
        <EmptyState icon={<Lightbulb/>} title="Bandeja de ideas vacía" description="Anota cualquier idea de proyecto o feature aquí." action={<Button onClick={() => openForm()}>Añadir Idea</Button>} />
      ) : (
        <div className={styles.grid}>
          {filtered.map(i => (
            <Card key={i.id} className={`${styles.card} ${i.status === 'discarded' ? styles.discarded : ''}`}>
              <div className={styles.cardHeader}>
                <h3 className={styles.title} onClick={() => openForm(i)}>{i.title}</h3>
                <Badge variant={i.priority as any}>{i.priority}</Badge>
              </div>
              <p className={styles.desc}>{i.description}</p>
              <div className={styles.tags}>
                {i.tags?.map(t => <span key={t} className={styles.tag}>{t}</span>)}
              </div>
              <div className={styles.footer}>
                <span className={styles.status} style={{color: statuses.find(s=>s.id===i.status)?.color}}>{statuses.find(s=>s.id===i.status)?.label}</span>
                <span className={styles.time}>{relativeTime(i.createdAt)}</span>
              </div>
              <div className={styles.cardActions}>
                {i.status === 'new' || i.status === 'evaluating' ? (
                  <Button variant="ghost" className={styles.convertBtn} onClick={() => openConvertModal(i)} icon={<ArrowRight size={14}/>}>Convertir</Button>
                ) : <div/>}
                <Button variant="ghost" onClick={() => handleDelete(i.id)} icon={<Trash2 size={14} color="var(--color-error)"/>} />
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingIdea?.id ? 'Editar Idea' : 'Nueva Idea'} footer={<><Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button><Button onClick={handleSave}>Guardar</Button></>}>
        {editingIdea && (
          <form className={styles.form}>
            <Input label="Título *" value={editingIdea.title} onChange={e => setEditingIdea({...editingIdea, title: e.target.value})} error={formErrors.title} />
            <Input label="Descripción" multiline value={editingIdea.description || ''} onChange={e => setEditingIdea({...editingIdea, description: e.target.value})} />
            <Input label="Estado" options={statuses.map(s => ({label: s.label, value: s.id}))} value={editingIdea.status} onChange={e => setEditingIdea({...editingIdea, status: e.target.value as any})} />
            <Input label="Prioridad" options={[{label:'Baja',value:'low'},{label:'Media',value:'medium'},{label:'Alta',value:'high'}]} value={editingIdea.priority} onChange={e => setEditingIdea({...editingIdea, priority: e.target.value as any})} />
          </form>
        )}
      </Modal>

      <Modal isOpen={isConvertModalOpen} onClose={() => setIsConvertModalOpen(false)} title="Convertir a Proyecto" footer={<><Button variant="outline" onClick={() => setIsConvertModalOpen(false)}>Cancelar</Button><Button onClick={handleConvert}>Convertir</Button></>}>
        <form className={styles.form}>
          <p>Selecciona el cliente y el precio inicial para crear el proyecto.</p>
          <Input label="Cliente *" options={clients.map(c => ({label: c.name, value: c.id}))} value={convertData.clientId} onChange={e => setConvertData({...convertData, clientId: e.target.value})} />
          <Input label="Precio estimado" type="number" value={convertData.price} onChange={e => setConvertData({...convertData, price: Number(e.target.value)})} />
        </form>
      </Modal>
    </div>
  );
};