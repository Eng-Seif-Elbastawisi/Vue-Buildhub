import {
  isValidCountryCode,
  isValidCountryTitle,
  normalizeCountryCode,
} from './education.classification.validation';

describe('Education Classification Validation Utilities', () => {
  describe('isValidCountryCode', () => {
    it('should return true for valid 2-letter ISO codes', () => {
      expect(isValidCountryCode('EG')).toBe(true);
      expect(isValidCountryCode('us')).toBe(true);
      expect(isValidCountryCode('SA')).toBe(true);
    });

    it('should return false for invalid codes', () => {
      expect(isValidCountryCode('EGY')).toBe(false);
      expect(isValidCountryCode('12')).toBe(false);
      expect(isValidCountryCode('A')).toBe(false);
      expect(isValidCountryCode('')).toBe(false);
    });

    it('should return false for null or undefined', () => {
      expect(isValidCountryCode(null as any)).toBe(false);
      expect(isValidCountryCode(undefined as any)).toBe(false);
    });
  });

  describe('isValidCountryTitle', () => {
    it('should return true for valid country names', () => {
      expect(isValidCountryTitle('Egypt')).toBe(true);
      expect(isValidCountryTitle('United States')).toBe(true);
    });

    it('should return false for too short names', () => {
      expect(isValidCountryTitle('A')).toBe(false);
    });

    it('should return false for too long names', () => {
      expect(isValidCountryTitle('a'.repeat(101))).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidCountryTitle('')).toBe(false);
    });
  });

  describe('normalizeCountryCode', () => {
    it('should trim and uppercase the code', () => {
      expect(normalizeCountryCode(' eg ')).toBe('EG');
      expect(normalizeCountryCode('Us')).toBe('US');
    });

    it('should return empty string for invalid input', () => {
      expect(normalizeCountryCode(null as any)).toBe('');
      expect(normalizeCountryCode(undefined as any)).toBe('');
    });
  });
});
