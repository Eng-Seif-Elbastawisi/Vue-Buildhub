import { describe, it, expect } from 'vitest';
import EducationClassificationModel from './education.classification.model';

describe('EducationClassificationModel', () => {
  describe('constructor', () => {
    it('should create a valid model', () => {
      const model = new EducationClassificationModel({
        id: 1,
        title: 'Basic Education',
        created_at: '2022-01-01',
        status: true,
      });

      expect(model.id).toBe(1);
      expect(model.title).toBe('Basic Education');
      expect(model.created_at).toBe('2022-01-01');
      expect(model.status).toBe(true);
    });
  });

  describe('fromJson', () => {
    it('should create model from API response', () => {
      const json = { id: 5, title: 'Higher Education', created_at: '2023-06-01', status: false };

      const model = EducationClassificationModel.fromJson(json);

      expect(model.id).toBe(5);
      expect(model.title).toBe('Higher Education');
      expect(model.created_at).toBe('2023-06-01');
      expect(model.status).toBe(false);
    });

    it('should throw error when JSON is null', () => {
      expect(() => EducationClassificationModel.fromJson(null as any)).toThrow(
        'Cannot create EducationClassificationModel from null or undefined',
      );
    });

    it('should throw error when JSON is undefined', () => {
      expect(() => EducationClassificationModel.fromJson(undefined as any)).toThrow(
        'Cannot create EducationClassificationModel from null or undefined',
      );
    });
  });

  describe('example', () => {
    it('should provide a valid example instance', () => {
      expect(EducationClassificationModel.example).toBeInstanceOf(EducationClassificationModel);
      expect(EducationClassificationModel.example.title).toBe('Basic education');
      expect(EducationClassificationModel.example.status).toBe(true);
    });
  });

  describe('immutability', () => {
    it('should be frozen', () => {
      const model = new EducationClassificationModel({
        id: 1,
        title: 'Test',
        created_at: '2022-01-01',
        status: true,
      });

      expect(Object.isFrozen(model)).toBe(true);
    });
  });
});
