import { z } from 'zod';

export const ClientSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Nombre requerido'),
  company: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  whatsapp: z.string().optional(),
  notes: z.string().optional(),
  color: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type ClientForm = z.infer<typeof ClientSchema>;

export const ProjectSchema = z.object({
  id: z.string().optional(),
  clientId: z.string().min(1, 'Cliente requerido'),
  name: z.string().min(1, 'Nombre requerido'),
  description: z.string().optional(),
  status: z.enum(['active', 'paused', 'delivered', 'archived']).default('active'),
  techStack: z.string().optional(),
  price: z.number().min(0).default(0),
  currency: z.enum(['USD', 'EUR', 'VES', 'USDT']).default('USD'),
  startDate: z.string().min(1, 'Fecha de inicio requerida'),
  deadline: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type ProjectForm = z.infer<typeof ProjectSchema>;

export const EntrySchema = z.object({
  id: z.string().optional(),
  projectId: z.string().min(1, 'Proyecto requerido'),
  type: z.enum(['note', 'bug', 'suggestion', 'change', 'milestone', 'feedback']).default('note'),
  title: z.string().min(1, 'Título requerido'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  tags: z.array(z.string()).default([]),
  resolved: z.boolean().default(false),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type EntryForm = z.infer<typeof EntrySchema>;

export const TaskSchema = z.object({
  id: z.string().optional(),
  projectId: z.string().min(1, 'Proyecto requerido'),
  title: z.string().min(1, 'Título requerido'),
  completed: z.boolean().default(false),
  dueDate: z.string().optional(),
  assignee: z.string().optional(),
  createdAt: z.string().optional(),
});

export type TaskForm = z.infer<typeof TaskSchema>;

export const IdeaSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Título requerido'),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  status: z.enum(['new', 'evaluating', 'discarded', 'converted']).default('new'),
  convertedToProjectId: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type IdeaForm = z.infer<typeof IdeaSchema>;

export const NoteSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Título requerido'),
  content: z.string().default(''),
  color: z.string().default('var(--color-surface)'),
  linkedTo: z.object({
    type: z.enum(['project', 'client']),
    id: z.string(),
  }).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type NoteForm = z.infer<typeof NoteSchema>;