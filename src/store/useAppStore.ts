import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Client, Project, Entry, Task, Idea, Note } from '../types';
import { generateId } from '../utils/generators';

type EntityWithTimestamps = { id: string; createdAt: string; updatedAt: string };
type CreateInput<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

function now() {
  return new Date().toISOString();
}

function addEntity<T extends EntityWithTimestamps>(
  arr: T[], data: CreateInput<T>
): T {
  const id = generateId();
  const timestamp = now();
  return { ...data, id, createdAt: timestamp, updatedAt: timestamp } as T;
}

function updateEntity<T extends EntityWithTimestamps>(
  arr: T[], id: string, data: Partial<T>
): void {
  const index = arr.findIndex(e => e.id === id);
  if (index !== -1) {
    Object.assign(arr[index], data, { updatedAt: now() });
  }
}

interface AppState {
  clients: Client[];
  projects: Project[];
  entries: Entry[];
  tasks: Task[];
  ideas: Idea[];
  notes: Note[];

  addClient: (client: CreateInput<Client>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  addProject: (project: CreateInput<Project>) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  updateProjectStatus: (id: string, status: Project['status']) => void;
  reorderProjects: (activeId: string, overId: string) => void;

  addEntry: (entry: CreateInput<Entry>) => void;
  updateEntry: (id: string, entry: Partial<Entry>) => void;
  deleteEntry: (id: string) => void;
  toggleEntryResolved: (id: string) => void;

  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompleted: (id: string) => void;
  startTaskTimer: (id: string) => void;
  stopTaskTimer: (id: string) => void;

  addIdea: (idea: CreateInput<Idea>) => void;
  updateIdea: (id: string, idea: Partial<Idea>) => void;
  deleteIdea: (id: string) => void;
  convertIdeaToProject: (ideaId: string, projectId: string) => void;

  addNote: (note: CreateInput<Note>) => void;
  updateNote: (id: string, note: Partial<Note>) => void;
  deleteNote: (id: string) => void;

  loadDemoData: (data: Partial<Pick<AppState, 'clients' | 'projects' | 'entries' | 'tasks' | 'ideas' | 'notes'>>) => void;
  clearData: () => void;
}

const useAppStore = create<AppState>()(
  persist(
    immer((set) => ({
      clients: [],
      projects: [],
      entries: [],
      tasks: [],
      ideas: [],
      notes: [],

      addClient: (data) => set(state => {
        state.clients.push(addEntity(state.clients, data));
      }),
      updateClient: (id, data) => set(state => {
        updateEntity(state.clients, id, data);
      }),
      deleteClient: (id) => set(state => {
        state.clients = state.clients.filter(c => c.id !== id);
      }),

      addProject: (data) => set(state => {
        state.projects.push(addEntity(state.projects, data));
      }),
      updateProject: (id, data) => set(state => {
        updateEntity(state.projects, id, data);
      }),
      deleteProject: (id) => set(state => {
        state.projects = state.projects.filter(p => p.id !== id);
        state.entries = state.entries.filter(e => e.projectId !== id);
        state.tasks = state.tasks.filter(t => t.projectId !== id);
      }),
      updateProjectStatus: (id, status) => set(state => {
        const p = state.projects.find(p => p.id === id);
        if (p) { p.status = status; p.updatedAt = now(); }
      }),
      reorderProjects: (activeId, overId) => set(state => {
        const oldIndex = state.projects.findIndex(p => p.id === activeId);
        const newIndex = state.projects.findIndex(p => p.id === overId);
        if (oldIndex === -1 || newIndex === -1) return;
        const [moved] = state.projects.splice(oldIndex, 1);
        state.projects.splice(newIndex, 0, moved);
        state.projects.forEach((p, i) => { p.order = i; p.updatedAt = now(); });
      }),

      addEntry: (data) => set(state => {
        state.entries.push(addEntity(state.entries, data));
      }),
      updateEntry: (id, data) => set(state => {
        updateEntity(state.entries, id, data);
      }),
      deleteEntry: (id) => set(state => {
        state.entries = state.entries.filter(e => e.id !== id);
      }),
      toggleEntryResolved: (id) => set(state => {
        const e = state.entries.find(e => e.id === id);
        if (e) { e.resolved = !e.resolved; e.updatedAt = now(); }
      }),

      addTask: (data) => set(state => {
        const id = generateId();
        const timestamp = now();
        state.tasks.push({ ...data, id, createdAt: timestamp } as Task);
      }),
      updateTask: (id, data) => set(state => {
        const t = state.tasks.find(t => t.id === id);
        if (t) Object.assign(t, data);
      }),
      deleteTask: (id) => set(state => {
        state.tasks = state.tasks.filter(t => t.id !== id);
      }),
      toggleTaskCompleted: (id) => set(state => {
        const t = state.tasks.find(t => t.id === id);
        if (t) t.completed = !t.completed;
      }),
      startTaskTimer: (id) => set(state => {
        const t = state.tasks.find(t => t.id === id);
        if (t && !t.timerStart) {
          t.timerStart = Date.now();
        }
      }),
      stopTaskTimer: (id) => set(state => {
        const t = state.tasks.find(t => t.id === id);
        if (t && t.timerStart) {
          const elapsed = Math.floor((Date.now() - t.timerStart) / 1000);
          t.timeSpent = (t.timeSpent || 0) + elapsed;
          t.timerStart = null;
        }
      }),

      addIdea: (data) => set(state => {
        state.ideas.push(addEntity(state.ideas, data));
      }),
      updateIdea: (id, data) => set(state => {
        updateEntity(state.ideas, id, data);
      }),
      deleteIdea: (id) => set(state => {
        state.ideas = state.ideas.filter(i => i.id !== id);
      }),
      convertIdeaToProject: (ideaId, projectId) => set(state => {
        const i = state.ideas.find(i => i.id === ideaId);
        if (i) {
          i.status = 'converted';
          i.convertedToProjectId = projectId;
          i.updatedAt = now();
        }
      }),

      addNote: (data) => set(state => {
        state.notes.push(addEntity(state.notes, data));
      }),
      updateNote: (id, data) => set(state => {
        updateEntity(state.notes, id, data);
      }),
      deleteNote: (id) => set(state => {
        state.notes = state.notes.filter(n => n.id !== id);
      }),

      loadDemoData: (data) => set(state => {
        if (data.clients) state.clients = data.clients;
        if (data.projects) state.projects = data.projects;
        if (data.entries) state.entries = data.entries;
        if (data.tasks) state.tasks = data.tasks;
        if (data.ideas) state.ideas = data.ideas;
        if (data.notes) state.notes = data.notes;
      }),
      clearData: () => set(state => {
        state.clients = [];
        state.projects = [];
        state.entries = [];
        state.tasks = [];
        state.ideas = [];
        state.notes = [];
      }),
    })),
    {
      name: 'pf-pro-v1',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          const s = persistedState?.state ?? persistedState;
          return {
            ...s,
            clients: s.clients?.map((c: any) => ({ ...c, color: c.color || undefined })) || [],
            projects: s.projects?.map((p: any) => ({ ...p, currency: p.currency || 'USD' })) || [],
          };
        }
        return persistedState;
      },
    }
  )
);

export { useAppStore };