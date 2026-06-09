import { Project, Client, Entry, Task } from '../types';
import { formatDate } from './formatters';

export async function exportProjectToPDF(
  project: Project,
  client: Client | undefined,
  entries: Entry[],
  tasks: Task[]
): Promise<void> {
  const completedTasks = tasks.filter(t => t.completed).length;
  const resolvedEntries = entries.filter(e => e.resolved).length;

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${project.name} - ProjectFlow Pro</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1f2328; padding: 40px; max-width: 800px; margin: 0 auto; }
    .header { border-bottom: 2px solid #d0d7de; padding-bottom: 16px; margin-bottom: 24px; }
    h1 { font-size: 24px; margin-bottom: 8px; }
    .meta { font-size: 14px; color: #636c76; line-height: 1.6; }
    .badge { display: inline-block; padding: 2px 8px; background: #ddf4ff; color: #0969da; border-radius: 4px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 16px; font-weight: 600; margin-bottom: 12px; border-bottom: 1px solid #eaeef2; padding-bottom: 8px; }
    .task { display: flex; align-items: center; gap: 8px; padding: 6px 0; border-bottom: 1px solid #f6f8fa; }
    .checkbox { width: 16px; height: 16px; border: 1px solid #d0d7de; border-radius: 3px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .checkbox.checked { background: #1f701d; border-color: #1f701d; color: white; font-size: 10px; }
    .task-text { flex: 1; font-size: 14px; }
    .task-text.completed { text-decoration: line-through; color: #636c76; }
    .task-meta { font-size: 12px; color: #636c76; }
    .entry { padding: 8px 0; border-bottom: 1px solid #f6f8fa; }
    .entry-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
    .entry-type { font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 3px; text-transform: uppercase; }
    .type-bug { background: #ffebe9; color: #cf222e; }
    .type-note { background: #ddf4ff; color: #0969da; }
    .type-suggestion { background: #fff8c5; color: #9a6700; }
    .type-change { background: #fff1e5; color: #bc4c00; }
    .type-milestone { background: #dafbe1; color: #1a7f37; }
    .type-feedback { background: #fbefff; color: #8250df; }
    .entry-title { flex: 1; font-size: 14px; }
    .entry-status { font-size: 11px; font-weight: 600; }
    .status-resolved { color: #1a7f37; }
    .status-pending { color: #9a6700; }
    .entry-desc { font-size: 13px; color: #636c76; margin-top: 4px; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #d0d7de; display: flex; justify-content: space-between; font-size: 12px; color: #636c76; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>${escapeHtml(project.name)}</h1>
    <div class="meta">
      ${client ? `<div><strong>Cliente:</strong> ${escapeHtml(client.name)}${client.company ? ` (${escapeHtml(client.company)})` : ''}</div>` : ''}
      <div><strong>Estado:</strong> <span class="badge">${project.status}</span> &nbsp; <strong>Precio:</strong> ${project.price || 0} ${project.currency}</div>
      <div><strong>Inicio:</strong> ${formatDate(project.startDate)}${project.deadline ? ` &nbsp;|&nbsp; <strong>Fin:</strong> ${formatDate(project.deadline)}` : ''}</div>
      ${project.techStack ? `<div><strong>Tech:</strong> ${escapeHtml(project.techStack)}</div>` : ''}
    </div>
  </div>

  ${tasks.length > 0 ? `
  <div class="section">
    <div class="section-title">Tareas (${completedTasks}/${tasks.length})</div>
    ${tasks.map(t => `
    <div class="task">
      <div class="checkbox ${t.completed ? 'checked' : ''}">${t.completed ? '✓' : ''}</div>
      <div class="task-text ${t.completed ? 'completed' : ''}">${escapeHtml(t.title)}</div>
      ${t.assignee || t.dueDate ? `<div class="task-meta">${t.assignee ? `@${escapeHtml(t.assignee)}` : ''}${t.assignee && t.dueDate ? ' · ' : ''}${t.dueDate ? `Vence: ${formatDate(t.dueDate)}` : ''}</div>` : ''}
    </div>`).join('')}
  </div>` : ''}

  ${entries.length > 0 ? `
  <div class="section">
    <div class="section-title">Entradas (${entries.length})</div>
    ${entries.map(e => `
    <div class="entry">
      <div class="entry-header">
        <span class="entry-type type-${e.type}">${e.type}</span>
        <div class="entry-title">${escapeHtml(e.title)}</div>
        <span class="entry-status ${e.resolved ? 'status-resolved' : 'status-pending'}">${e.resolved ? 'RESUELTO' : 'PENDIENTE'}</span>
      </div>
      ${e.description ? `<div class="entry-desc">${escapeHtml(e.description)}</div>` : ''}
    </div>`).join('')}
  </div>` : ''}

  <div class="footer">
    <span>Generado por ProjectFlow Pro</span>
    <span>${new Date().toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
  </div>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}