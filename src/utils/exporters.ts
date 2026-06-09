import { Project, Client, Entry, Task, Idea, Note } from '../types';
import { formatDate } from './formatters';

export interface AppBackup {
  version: number;
  exportedAt: string;
  data: {
    clients: Client[];
    projects: Project[];
    entries: Entry[];
    tasks: Task[];
    ideas: Idea[];
    notes: Note[];
  };
}

export const exportToJSON = (data: AppBackup['data']) => {
  const backup: AppBackup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `projectflow-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importFromJSON = (file: File): Promise<AppBackup['data'] | null> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (parsed?.data?.clients && parsed?.data?.projects) {
          resolve(parsed.data);
        } else {
          resolve(null);
        }
      } catch {
        resolve(null);
      }
    };
    reader.readAsText(file);
  });
};

export const exportToMarkdown = (p: Project, c?: Client, entries: Entry[] = [], tasks: Task[] = []) => {
  let md = `# Proyecto: ${p.name}\n\n`;
  if (c) {
    md += `**Cliente:** ${c.name} (${c.company || 'N/A'})\n`;
  }
  md += `**Estado:** ${p.status} | **Precio:** ${p.price} ${p.currency}\n`;
  md += `**Fechas:** ${formatDate(p.startDate)} - ${p.deadline ? formatDate(p.deadline) : 'Sin límite'}\n\n`;
  
  if (p.description) {
    md += `## Descripción\n${p.description}\n\n`;
  }

  if (tasks.length > 0) {
    md += `## Tareas (${tasks.filter(t => t.completed).length}/${tasks.length})\n`;
    tasks.forEach(t => {
      md += `- [${t.completed ? 'x' : ' '}] ${t.title}${t.assignee ? ` (@${t.assignee})` : ''}\n`;
    });
    md += '\n';
  }

  if (entries.length > 0) {
    md += `## Entradas (${entries.length})\n`;
    entries.forEach(e => {
      md += `### [${e.type.toUpperCase()}] ${e.title} - ${e.resolved ? 'RESUELTO' : 'PENDIENTE'}\n`;
      md += `**Prioridad:** ${e.priority} | **Fecha:** ${formatDate(e.createdAt)}\n`;
      if (e.description) md += `${e.description}\n`;
      md += '\n';
    });
  }

  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `proyecto-${p.name.replace(/\s+/g, '-').toLowerCase()}.md`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportToPDF = () => {
  window.print();
};