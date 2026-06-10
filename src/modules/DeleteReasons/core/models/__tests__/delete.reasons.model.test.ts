import { describe, it, expect } from 'vitest';
import DeleteResonsModel from '../delete.reasons.model';

describe('DeleteResonsModel', () => {
  const mockData = {
    id: 1,
    date: '2023-01-01',
    name: 'Test Name',
    Reason: { id: 10, title: 'Test Reason' },
    notes: 'Test Notes',
  };

  it('should create an instance with correct data', () => {
    const model = new DeleteResonsModel(mockData);
    expect(model.id).toBe(mockData.id);
    expect(model.date).toBe(mockData.date);
    expect(model.name).toBe(mockData.name);
    expect(model.Reason).toEqual(mockData.Reason);
    expect(model.notes).toBe(mockData.notes);
  });

  it('should create an instance from JSON', () => {
    const model = DeleteResonsModel.fromJson(mockData);
    expect(model).toBeInstanceOf(DeleteResonsModel);
    expect(model.id).toBe(mockData.id);
  });

  it('should throw error when creating from null JSON', () => {
    expect(() => DeleteResonsModel.fromJson(null)).toThrow();
  });

  it('should have an example instance', () => {
    expect(DeleteResonsModel.example).toBeInstanceOf(DeleteResonsModel);
  });

  it('should be immutable (frozen)', () => {
    const model = new DeleteResonsModel(mockData);
    expect(Object.isFrozen(model)).toBe(true);
  });
});
