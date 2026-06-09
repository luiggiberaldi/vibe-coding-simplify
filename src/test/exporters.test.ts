import { describe, it, expect } from 'vitest';
import { exportToJSON, importFromJSON, AppBackup } from '../utils/exporters';

describe('exporters', () => {
  describe('exportToJSON', () => {
    it('creates a valid JSON backup structure', () => {
      const data = {
        clients: [{ id: '1', name: 'Test Client', createdAt: '2024-01-01', updatedAt: '2024-01-01' }],
        projects: [],
        entries: [],
        tasks: [],
        ideas: [],
        notes: [],
      };

      const originalCreateObjectURL = URL.createObjectURL;
      const originalRevokeObjectURL = URL.revokeObjectURL;
      let capturedBlob: Blob | null = null;

      URL.createObjectURL = (blob: Blob | MediaSource) => {
        capturedBlob = blob as Blob;
        return 'blob:test';
      };
      URL.revokeObjectURL = () => {};

      try {
        exportToJSON(data);
        expect(capturedBlob).not.toBeNull();
      } finally {
        URL.createObjectURL = originalCreateObjectURL;
        URL.revokeObjectURL = originalRevokeObjectURL;
      }
    });
  });

  describe('importFromJSON', () => {
    it('parses valid backup JSON', async () => {
      const backup: AppBackup = {
        version: 1,
        exportedAt: '2024-01-01T00:00:00.000Z',
        data: {
          clients: [{ id: '1', name: 'Test', createdAt: '2024-01-01', updatedAt: '2024-01-01' }],
          projects: [],
          entries: [],
          tasks: [],
          ideas: [],
          notes: [],
        },
      };

      const file = new File([JSON.stringify(backup)], 'backup.json', { type: 'application/json' });
      const result = await importFromJSON(file);
      expect(result).not.toBeNull();
      expect(result?.clients).toHaveLength(1);
      expect(result?.clients[0].name).toBe('Test');
    });

    it('returns null for invalid JSON', async () => {
      const file = new File(['not valid json'], 'bad.json', { type: 'application/json' });
      const result = await importFromJSON(file);
      expect(result).toBeNull();
    });

    it('returns null for JSON missing required fields', async () => {
      const file = new File([JSON.stringify({ foo: 'bar' })], 'incomplete.json', { type: 'application/json' });
      const result = await importFromJSON(file);
      expect(result).toBeNull();
    });
  });
});