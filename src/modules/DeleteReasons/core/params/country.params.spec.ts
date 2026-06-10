import { describe, it, expect } from 'vitest';
import AddDeleteResonsParams from './add.delete.reasons.params';
import EditDeleteResonsParams from './edit.delete.reasons.params';
import DeleteDeleteResonsParams from './delete.delete.reasons.params';

describe('DeleteReasons Params', () => {
  describe('AddDeleteResonsParams', () => {
    it('creates params and stores translations', () => {
      const params = new AddDeleteResonsParams({
        translations: { title: { en: 'Bored', ar: 'ممل' } } as any,
      });

      expect(params.translations).toBeDefined();
    });

    it('toMap returns an object', () => {
      const params = new AddDeleteResonsParams({ translations: {} as any });
      expect(params.toMap()).toBeTypeOf('object');
    });

    it('passes validation (no rules defined)', () => {
      const params = new AddDeleteResonsParams({ translations: {} as any });
      expect(params.validate().isValid).toBe(true);
    });
  });

  describe('EditDeleteResonsParams', () => {
    it('creates params with id and translations', () => {
      const params = new EditDeleteResonsParams({
        id: 3,
        translations: { title: { en: 'Updated' } } as any,
      });

      expect(params.id).toBe(3);
      expect(params.translations).toBeDefined();
    });

    it('toMap returns an object', () => {
      const params = new EditDeleteResonsParams({ id: 1, translations: {} as any });
      expect(params.toMap()).toBeTypeOf('object');
    });

    it('passes validation (no rules defined)', () => {
      const params = new EditDeleteResonsParams({ id: 1, translations: {} as any });
      expect(params.validate().isValid).toBe(true);
    });
  });

  describe('DeleteDeleteResonsParams', () => {
    it('creates params with id', () => {
      const params = new DeleteDeleteResonsParams({ id: 7 });
      expect(params.id).toBe(7);
    });

    it('toMap returns an object', () => {
      const params = new DeleteDeleteResonsParams({ id: 7 });
      expect(params.toMap()).toBeTypeOf('object');
    });

    it('passes validation (no rules defined)', () => {
      const params = new DeleteDeleteResonsParams({ id: 7 });
      expect(params.validate().isValid).toBe(true);
    });

    it('stores different ids correctly', () => {
      const p1 = new DeleteDeleteResonsParams({ id: 1 });
      const p2 = new DeleteDeleteResonsParams({ id: 99 });
      expect(p1.id).toBe(1);
      expect(p2.id).toBe(99);
    });
  });
});
