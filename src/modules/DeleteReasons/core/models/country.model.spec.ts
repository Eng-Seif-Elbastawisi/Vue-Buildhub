import { describe, it, expect } from 'vitest';
import DeleteResonsModel from './delete.reasons.model';

const makeReason = () => ({ id: 1, title: 'Bored with the app' });

describe('DeleteResonsModel', () => {
  describe('constructor', () => {
    it('creates a valid model with all fields', () => {
      const model = new DeleteResonsModel({
        id: 1,
        date: '2024-01-01',
        name: 'Ahmed',
        Reason: makeReason() as any,
        notes: 'some notes',
      });

      expect(model.id).toBe(1);
      expect(model.name).toBe('Ahmed');
      expect(model.notes).toBe('some notes');
      expect(model.date).toBe('2024-01-01');
    });

    it('handles optional id', () => {
      const model = new DeleteResonsModel({
        name: 'Ali',
        Reason: makeReason() as any,
        notes: '',
      });

      expect(model.id).toBeUndefined();
    });

    it('handles optional date', () => {
      const model = new DeleteResonsModel({
        name: 'Ali',
        Reason: makeReason() as any,
        notes: '',
      });

      expect(model.date).toBeUndefined();
    });

    it('stores the Reason TitleInterface', () => {
      const reason = makeReason();
      const model = new DeleteResonsModel({
        name: 'Test',
        Reason: reason as any,
        notes: '',
      });

      expect(model.Reason).toBe(reason);
    });

    it('is frozen after construction', () => {
      const model = new DeleteResonsModel({
        id: 2,
        name: 'Secondary',
        Reason: makeReason() as any,
        notes: 'n',
      });

      expect(Object.isFrozen(model)).toBe(true);
    });
  });

  describe('fromJson', () => {
    it('creates a model from valid JSON', () => {
      const json = {
        id: 5,
        date: '2024-06-15',
        name: 'Mohamed',
        Reason: makeReason(),
        notes: 'test notes',
      };

      const model = DeleteResonsModel.fromJson(json);

      expect(model.id).toBe(5);
      expect(model.name).toBe('Mohamed');
      expect(model.notes).toBe('test notes');
    });

    it('throws when JSON is null', () => {
      expect(() => DeleteResonsModel.fromJson(null)).toThrow();
    });

    it('throws when JSON is undefined', () => {
      expect(() => DeleteResonsModel.fromJson(undefined)).toThrow();
    });
  });

  describe('example', () => {
    it('provides a valid example instance', () => {
      expect(DeleteResonsModel.example).toBeInstanceOf(DeleteResonsModel);
    });

    it('example has a name string', () => {
      expect(typeof DeleteResonsModel.example.name).toBe('string');
    });

    it('example has an id', () => {
      expect(DeleteResonsModel.example.id).toBeDefined();
    });
  });
});
