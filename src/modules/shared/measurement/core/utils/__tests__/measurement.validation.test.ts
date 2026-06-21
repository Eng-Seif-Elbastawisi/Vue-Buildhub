import { describe, expect, it } from 'vitest';
import {
  isValidCountryCode,
  isValidCountryTitle,
  normalizeCountryCode,
} from '../measurement.validation';

describe('measurement validation utilities', () => {
  it('validates alpha-2 country codes', () => {
    expect(isValidCountryCode('eg')).toBe(true);
    expect(isValidCountryCode('USA')).toBe(false);
    expect(isValidCountryCode('')).toBe(false);
  });

  it('validates title length after trimming', () => {
    expect(isValidCountryTitle('Egypt')).toBe(true);
    expect(isValidCountryTitle(' E ')).toBe(false);
    expect(isValidCountryTitle('x'.repeat(101))).toBe(false);
  });

  it('normalizes country codes', () => {
    expect(normalizeCountryCode(' eg ')).toBe('EG');
    expect(normalizeCountryCode('')).toBe('');
  });
});
