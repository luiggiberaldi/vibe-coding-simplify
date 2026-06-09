import { describe, it, expect } from 'vitest';
import { generateId, getColorForId, getInitials } from '../utils/generators';
import { daysBetween, formatDate, relativeTime } from '../utils/formatters';

describe('generators', () => {
  it('generateId returns unique UUIDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('getColorForId returns consistent colors', () => {
    const color1 = getColorForId('test-id-1');
    const color2 = getColorForId('test-id-1');
    expect(color1).toBe(color2);
    expect(color1).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('getInitials extracts first 2 words', () => {
    expect(getInitials('John Doe')).toBe('JD');
    expect(getInitials('Alice')).toBe('A');
    expect(getInitials('')).toBe('');
    expect(getInitials(undefined)).toBe('');
  });
});

describe('formatters', () => {
  it('daysBetween calculates days', () => {
    const now = new Date();
    const future = new Date(now);
    future.setDate(future.getDate() + 10);
    expect(daysBetween(now.toISOString(), future.toISOString())).toBe(10);
  });

  it('formatDate returns formatted string', () => {
    const result = formatDate('2025-06-15');
    expect(result).toBeTruthy();
  });

  it('relativeTime returns human-readable string', () => {
    const recent = new Date();
    recent.setMinutes(recent.getMinutes() - 5);
    const result = relativeTime(recent.toISOString());
    expect(result).toBeTruthy();
  });
});