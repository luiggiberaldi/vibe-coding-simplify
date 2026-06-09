import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../store/useAppStore';

describe('useAppStore', () => {
  beforeEach(() => {
    useAppStore.getState().clearData();
  });

  describe('Clients', () => {
    it('adds a client', () => {
      const { addClient, clients } = useAppStore.getState();
      addClient({ name: 'Test Client', email: 'test@example.com' });
      expect(useAppStore.getState().clients).toHaveLength(1);
      expect(useAppStore.getState().clients[0].name).toBe('Test Client');
    });

    it('updates a client', () => {
      const { addClient } = useAppStore.getState();
      addClient({ name: 'Old Name', email: 'old@test.com' });
      const id = useAppStore.getState().clients[0].id;
      useAppStore.getState().updateClient(id, { name: 'New Name' });
      expect(useAppStore.getState().clients[0].name).toBe('New Name');
    });

    it('deletes a client', () => {
      const { addClient } = useAppStore.getState();
      addClient({ name: 'To Delete', email: 'del@test.com' });
      const id = useAppStore.getState().clients[0].id;
      useAppStore.getState().deleteClient(id);
      expect(useAppStore.getState().clients).toHaveLength(0);
    });
  });

  describe('Projects', () => {
    it('adds a project with timestamps', () => {
      const { addProject } = useAppStore.getState();
      addProject({
        clientId: 'client-1',
        name: 'Test Project',
        status: 'active',
        currency: 'USD',
        startDate: '2025-01-01',
      });
      const project = useAppStore.getState().projects[0];
      expect(project.name).toBe('Test Project');
      expect(project.id).toBeDefined();
      expect(project.createdAt).toBeDefined();
    });

    it('deletes project and cascades entries/tasks', () => {
      const { addProject, addEntry, addTask } = useAppStore.getState();
      addProject({ clientId: 'c1', name: 'P1', status: 'active', currency: 'USD', startDate: '2025-01-01' });
      const pid = useAppStore.getState().projects[0].id;
      addEntry({ projectId: pid, type: 'note', title: 'E1', priority: 'medium', resolved: false });
      addTask({ projectId: pid, title: 'T1', completed: false });
      expect(useAppStore.getState().entries).toHaveLength(1);
      expect(useAppStore.getState().tasks).toHaveLength(1);
      useAppStore.getState().deleteProject(pid);
      expect(useAppStore.getState().projects).toHaveLength(0);
      expect(useAppStore.getState().entries).toHaveLength(0);
      expect(useAppStore.getState().tasks).toHaveLength(0);
    });
  });

  describe('Ideas', () => {
    it('converts idea to project', () => {
      const { addIdea, convertIdeaToProject } = useAppStore.getState();
      addIdea({ title: 'My Idea', status: 'new', priority: 'medium', tags: [] });
      const idea = useAppStore.getState().ideas[0];
      convertIdeaToProject(idea.id, 'project-123');
      expect(useAppStore.getState().ideas[0].status).toBe('converted');
      expect(useAppStore.getState().ideas[0].convertedToProjectId).toBe('project-123');
    });
  });

  describe('Notes', () => {
    it('adds and toggles linkedTo', () => {
      const { addNote, updateNote } = useAppStore.getState();
      addNote({ title: 'Test Note', content: 'Hello', color: '#000' });
      const id = useAppStore.getState().notes[0].id;
      updateNote(id, { linkedTo: { type: 'project', id: 'p1' } });
      expect(useAppStore.getState().notes[0].linkedTo).toEqual({ type: 'project', id: 'p1' });
    });
  });

  describe('clearData', () => {
    it('clears all data', () => {
      useAppStore.getState().addClient({ name: 'C', email: 'c@test.com' });
      useAppStore.getState().addProject({ clientId: '1', name: 'P', status: 'active', currency: 'USD', startDate: '2025-01-01' });
      useAppStore.getState().clearData();
      expect(useAppStore.getState().clients).toHaveLength(0);
      expect(useAppStore.getState().projects).toHaveLength(0);
    });
  });
});