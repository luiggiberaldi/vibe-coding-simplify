import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useUIStore } from '../store/useUIStore';
import { useConfirm } from '../hooks/useConfirm';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { FileText, Plus, Trash2 } from 'lucide-react';
import { Note } from '../types';
import { relativeTime } from '../utils/formatters';
import { NoteSchema, NoteForm } from '../schemas';
import styles from './Notes.module.css';

const NOTE_COLORS = ['var(--color-surface)', '#1e293b', '#450a0a', '#14532d', '#083344', '#422006'];

export const Notes: React.FC = () => {
  const notes = useAppStore(s => s.notes);
  const projects = useAppStore(s => s.projects);
  const clients = useAppStore(s => s.clients);
  const addNote = useAppStore(s => s.addNote);
  const updateNote = useAppStore(s => s.updateNote);
  const deleteNote = useAppStore(s => s.deleteNote);
  const { addToast } = useUIStore();
  const confirm = useConfirm();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteForm | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filtered = notes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()));

  const openForm = (note?: Note) => {
    setEditingNote(note || { title: '', content: '', color: NOTE_COLORS[0], linkedTo: undefined });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!editingNote) return;
    const result = NoteSchema.safeParse(editingNote);
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
      updateNote(data.id, data);
    } else {
      addNote(data);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    confirm({
      title: 'Eliminar Nota',
      message: '¿Estás seguro?',
      confirmVariant: 'danger',
      onConfirm: () => deleteNote(id)
    });
  };

  const formatMarkdown = (text: string) => {
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    let html = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/^- (.*)/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    html = html.replace(/\n/g, '<br/>');
    return { __html: html };
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Notas Rápidas</h1>
        <div className={styles.actions}>
          <Input placeholder="Buscar nota..." value={search} onChange={e=>setSearch(e.target.value)} className={styles.search} />
          <Button onClick={() => openForm()} icon={<Plus size={18}/>}>Nueva Nota</Button>
        </div>
      </div>

      {notes.length === 0 ? (
        <EmptyState icon={<FileText/>} title="No tienes notas" description="Crea tu primera nota para empezar." action={<Button onClick={() => openForm()}>Añadir Nota</Button>} />
      ) : (
        <div className={styles.masonry}>
          {filtered.map(n => {
            let linkLabel = '';
            if (n.linkedTo?.type === 'project') linkLabel = projects.find(p => p.id === n.linkedTo?.id)?.name || '';
            if (n.linkedTo?.type === 'client') linkLabel = clients.find(c => c.id === n.linkedTo?.id)?.name || '';

            return (
              <Card key={n.id} className={styles.noteCard} style={{backgroundColor: n.color}} onClick={() => openForm(n)}>
                <div className={styles.noteHeader}>
                  <h3 className={styles.title}>{n.title}</h3>
                  <button className={styles.deleteBtn} onClick={(e) => handleDelete(n.id, e)}><Trash2 size={14}/></button>
                </div>
                <div className={styles.content} dangerouslySetInnerHTML={formatMarkdown(n.content)} />
                <div className={styles.footer}>
                  <span className={styles.time}>{relativeTime(n.updatedAt)}</span>
                  {linkLabel && <span className={styles.linkChip}>{linkLabel}</span>}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingNote?.id ? 'Editar Nota' : 'Nueva Nota'} footer={<><Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button><Button onClick={handleSave}>Guardar</Button></>}>
        {editingNote && (
          <form className={styles.form}>
            <Input label="Título *" value={editingNote.title} onChange={e => setEditingNote({...editingNote, title: e.target.value})} error={formErrors.title} />
            <Input label="Contenido (acepta markdown básico)" multiline value={editingNote.content || ''} onChange={e => setEditingNote({...editingNote, content: e.target.value})} style={{minHeight: '200px'}} />
            
            <div className={styles.colors}>
              {NOTE_COLORS.map(c => (
                <button 
                  key={c} type="button" 
                  className={`${styles.colorBtn} ${editingNote.color === c ? styles.activeColor : ''}`} 
                  style={{backgroundColor: c}} 
                  onClick={() => setEditingNote({...editingNote, color: c})}
                />
              ))}
            </div>

            <div className={styles.linkSection}>
              <select 
                className={styles.linkSelect}
                value={editingNote.linkedTo ? `${editingNote.linkedTo.type}|${editingNote.linkedTo.id}` : ''}
                onChange={e => {
                  const val = e.target.value;
                  if(!val) return setEditingNote({...editingNote, linkedTo: undefined});
                  const [type, id] = val.split('|');
                  setEditingNote({...editingNote, linkedTo: { type: type as any, id }});
                }}
              >
                <option value="">-- Sin vinculación --</option>
                <optgroup label="Proyectos">
                  {projects.map(p => <option key={`project|${p.id}`} value={`project|${p.id}`}>{p.name}</option>)}
                </optgroup>
                <optgroup label="Clientes">
                  {clients.map(c => <option key={`client|${c.id}`} value={`client|${c.id}`}>{c.name}</option>)}
                </optgroup>
              </select>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};