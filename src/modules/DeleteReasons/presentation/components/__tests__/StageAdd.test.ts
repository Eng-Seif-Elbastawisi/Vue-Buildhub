import { describe, it, expect } from 'vitest';
import DeleteAccountsModel from '../../../core/models/delete.accountes.model';

describe('DeleteAccountsModel', () => {
  describe('constructor', () => {
    it('creates a valid model with all fields', () => {
      const model = new DeleteAccountsModel({
        name: 'Ahmed',
        Reason: 'Bored',
        notes: 'Nothing special',
        date: '2024-01-01',
      });

      expect(model.name).toBe('Ahmed');
      expect(model.Reason).toBe('Bored');
      expect(model.notes).toBe('Nothing special');
      expect(model.date).toBe('2024-01-01');
    });

    it('handles optional date', () => {
      const model = new DeleteAccountsModel({
        name: 'Ali',
        Reason: 'Work',
        notes: '',
      });

      expect(model.date).toBeUndefined();
    });

    it('stores the date when provided', () => {
      const model = new DeleteAccountsModel({
        name: 'Ali',
        date: '2025-06-01',
        Reason: 'Work',
        notes: '',
      });

      expect(model.date).toBe('2025-06-01');
    });

    it('is frozen after construction', () => {
      const model = new DeleteAccountsModel({
        name: 'Test',
        Reason: 'Reason',
        notes: '',
      });

      expect(Object.isFrozen(model)).toBe(true);
    });
  });

  describe('fromJson', () => {
    it('creates model from valid JSON', () => {
      const json = { name: 'Sara', Reason: 'Privacy', notes: 'note', date: '2024-01-01' };
      const model = DeleteAccountsModel.fromJson(json);

      expect(model.name).toBe('Sara');
      expect(model.Reason).toBe('Privacy');
    });

    it('throws when JSON is null', () => {
      expect(() => DeleteAccountsModel.fromJson(null)).toThrow();
    });

    it('throws when JSON is undefined', () => {
      expect(() => DeleteAccountsModel.fromJson(undefined)).toThrow();
    });
  });

  describe('example', () => {
    it('provides a valid example instance', () => {
      expect(DeleteAccountsModel.example).toBeInstanceOf(DeleteAccountsModel);
    });

    it('example has a string name', () => {
      expect(typeof DeleteAccountsModel.example.name).toBe('string');
    });

    it('example has a Reason', () => {
      expect(DeleteAccountsModel.example.Reason).toBeDefined();
    });
  });
});
