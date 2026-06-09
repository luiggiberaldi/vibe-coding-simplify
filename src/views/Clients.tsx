import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { useConfirm } from '../hooks/useConfirm';
import { useUIStore } from '../store/useUIStore';
import { Search, Plus, MoreVertical, Edit2, Trash2, Mail, MessageCircle, Users } from 'lucide-react';
import { getInitials, getColorForId } from '../utils/generators';
import { Client } from '../types';
import { ClientSchema, ClientForm } from '../schemas';
import styles from './Clients.module.css';

export const Clients: React.FC = () => {
  const clients = useAppStore(s => s.clients);
  const projects = useAppStore(s => s.projects);
  const addClient = useAppStore(s => s.addClient);
  const updateClient = useAppStore(s => s.updateClient);
  const deleteClient = useAppStore(s => s.deleteClient);
  const addToast = useUIStore(state => state.addToast);
  const confirm = useConfirm();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientForm | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    const close = () => setOpenMenuId(null);
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.company && c.company.toLowerCase().includes(search.toLowerCase()))
  );

  const openForm = (client?: Client) => {
    setEditingClient(client || { name: '', email: '', company: '', whatsapp: '', stack: '', notes: '' });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!editingClient) return;
    const result = ClientSchema.safeParse(editingClient);
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
      updateClient(data.id, data);
      addToast('Cliente actualizado', 'success');
    } else {
      addClient(data);
      addToast('Cliente creado', 'success');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    const hasProjects = projects.some(p => p.clientId === id);
    if (hasProjects) {
      addToast('No se puede eliminar. El cliente tiene proyectos asociados.', 'error');
      return;
    }
    confirm({
      title: 'Eliminar Cliente',
      message: `¿Seguro que deseas eliminar a ${name}?`,
      confirmVariant: 'danger',
      onConfirm: () => {
        deleteClient(id);
        addToast('Cliente eliminado', 'info');
      }
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Clientes</h1>
        <div className={styles.actions}>
          <div className={styles.searchBox}>
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Buscar cliente..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className={styles.searchInput}
            />
          </div>
          <Button onClick={() => openForm()} icon={<Plus size={18}/>}>Nuevo Cliente</Button>
        </div>
      </div>

      {clients.length === 0 ? (
        <EmptyState 
          icon={<Users />} 
          title="No tienes clientes aún" 
          description="Comienza agregando tu primer cliente para organizar tus proyectos."
          action={<Button onClick={() => openForm()} icon={<Plus size={18}/>}>Nuevo Cliente</Button>}
        />
      ) : (
        <div className={styles.grid}>
          {filteredClients.map(c => {
            const activeProjects = projects.filter(p => p.clientId === c.id && p.status === 'active').length;
            const initials = getInitials(c.name);
            const color = getColorForId(c.id);
            const stacks = (c.stack || '').split(',').map(s => s.trim()).filter(Boolean);

            return (
              <Card key={c.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.avatar} style={{ backgroundColor: color }}>{initials}</div>
                  <div className={styles.info}>
                    <strong>{c.name}</strong>
                    <span>{c.company || 'Independiente'}</span>
                  </div>
                  <div className={styles.menu}>
                    <Button variant="ghost" className={styles.menuBtn} icon={<MoreVertical size={16}/>}
                      onClick={(e) => { e.stopPropagation(); setOpenMenuId(c.id === openMenuId ? null : c.id); }}
                    />
                    {openMenuId === c.id && (
                      <div className={styles.dropdown}>
                        <button onClick={() => { openForm(c); setOpenMenuId(null); }}><Edit2 size={14}/> Editar</button>
                        <button className={styles.danger} onClick={() => { handleDelete(c.id, c.name); setOpenMenuId(null); }}><Trash2 size={14}/> Eliminar</button>
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.contact}>
                  {c.email && <a href={`mailto:${c.email}`}><Mail size={14}/> {c.email}</a>}
                  {c.whatsapp && <a href={`https://wa.me/${c.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"><MessageCircle size={14}/> WhatsApp</a>}
                </div>
                <div className={styles.stacks}>
                  {stacks.map(s => <span key={s} className={styles.chip}>{s}</span>)}
                </div>
                <div className={styles.footer}>
                  <strong>{activeProjects}</strong> proyecto(s) activo(s)
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingClient?.id ? 'Editar Cliente' : 'Nuevo Cliente'}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Guardar</Button>
          </>
        }
      >
        {editingClient && (
          <form className={styles.form}>
            <Input label="Nombre Completo *" value={editingClient.name || ''} onChange={e => setEditingClient({...editingClient, name: e.target.value})} error={formErrors.name} />
            <Input label="Empresa" value={editingClient.company || ''} onChange={e => setEditingClient({...editingClient, company: e.target.value})} />
            <Input label="Email *" type="email" value={editingClient.email || ''} onChange={e => setEditingClient({...editingClient, email: e.target.value})} error={formErrors.email} />
            <Input label="WhatsApp" value={editingClient.whatsapp || ''} onChange={e => setEditingClient({...editingClient, whatsapp: e.target.value})} placeholder="+58..." />
            <Input label="Stack Tecnológico (comas)" value={editingClient.stack || ''} onChange={e => setEditingClient({...editingClient, stack: e.target.value})} />
            <Input label="Notas" multiline value={editingClient.notes || ''} onChange={e => setEditingClient({...editingClient, notes: e.target.value})} />
          </form>
        )}
      </Modal>
    </div>
  );
};