import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../store/useAppStore';

describe('AppStore - lastModifiedAt', () => {
  beforeEach(() => {
    useAppStore.setState({
      clients: [],
      projects: [],
      entries: [],
      tasks: [],
      ideas: [],
      notes: [],
      lastModifiedAt: null,
    });
  });

  it('starts with lastModifiedAt as null', () => {
    const state = useAppStore.getState();
    expect(state.lastModifiedAt).toBeNull();
  });

  it('updates lastModifiedAt when adding a client', () => {
    useAppStore.getState().addClient({ name: 'Test Client' });
    const state = useAppStore.getState();
    expect(state.lastModifiedAt).not.toBeNull();
    expect(new Date(state.lastModifiedAt!).getTime()).toBeGreaterThan(0);
  });

  it('updates lastModifiedAt when adding a project', () => {
    useAppStore.getState().addProject({
      clientId: 'client-1',
      name: 'Test Project',
      status: 'active',
      currency: 'USD',
      startDate: '2024-01-01',
    });
    const state = useAppStore.getState();
    expect(state.lastModifiedAt).not.toBeNull();
  });

  it('updates lastModifiedAt when adding an entry', () => {
    useAppStore.getState().addEntry({
      projectId: 'project-1',
      title: 'Test Entry',
      type: 'note',
      priority: 'medium',
      resolved: false,
    });
    const state = useAppStore.getState();
    expect(state.lastModifiedAt).not.toBeNull();
  });

  it('updates lastModifiedAt when clearing data', () => {
    useAppStore.getState().addClient({ name: 'Test' });
    const beforeClear = useAppStore.getState().lastModifiedAt;
    
    useAppStore.getState().clearData();
    const afterClear = useAppStore.getState().lastModifiedAt;
    
    expect(afterClear).not.toBeNull();
    expect(new Date(afterClear!).getTime()).toBeGreaterThanOrEqual(new Date(beforeClear!).getTime());
  });
});