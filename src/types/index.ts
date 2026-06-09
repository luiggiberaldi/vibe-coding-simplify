export interface Client {
  id: string;
  name: string;
  company?: string;
  email?: string;
  whatsapp?: string;
  notes?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  description?: string;
  status: 'active' | 'paused' | 'delivered' | 'archived';
  techStack?: string;
  price?: number;
  currency: 'USD' | 'EUR' | 'VES' | 'USDT';
  startDate: string;
  deadline?: string;
  order?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Entry {
  id: string;
  projectId: string;
  type: 'note' | 'bug' | 'suggestion' | 'change' | 'milestone' | 'feedback';
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  tags?: string[];
  resolved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  assignee?: string;
  timeSpent?: number;
  timerStart?: number | null;
  createdAt: string;
}

export interface Idea {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  priority: 'low' | 'medium' | 'high';
  status: 'new' | 'evaluating' | 'discarded' | 'converted';
  convertedToProjectId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  linkedTo?: { type: 'project' | 'client'; id: string };
  createdAt: string;
  updatedAt: string;
}