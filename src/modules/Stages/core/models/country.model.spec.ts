import { describe, it, expect } from 'vitest';
import StageModel from './stage.model';
import TitleInterface from '@/base/Data/Models/titleInterface';
import { EducationType } from '../constants/educationtype.enum';

const makeEducationType = () => new TitleInterface({ id: EducationType.General, title: 'General' });

describe('StageModel', () => {
  describe('constructor', () => {
    it('creates a valid stage model', () => {
      const model = new StageModel({
        id: 1,
        title: 'المرحلة الثانوية',
        EducationType: makeEducationType(),
      });

      expect(model.id).toBe(1);
      expect(model.title).toBe('المرحلة الثانوية');
      expect(model.EducationType).toBeDefined();
    });

    it('handles missing id', () => {
      const model = new StageModel({
        title: 'Primary',
        EducationType: makeEducationType(),
      });

      expect(model.id).toBeUndefined();
      expect(model.title).toBe('Primary');
    });

    it('is frozen after construction', () => {
      const model = new StageModel({
        id: 2,
        title: 'Secondary',
        EducationType: makeEducationType(),
      });

      expect(Object.isFrozen(model)).toBe(true);
    });
  });

  describe('fromJson', () => {
    it('throws when JSON is null', () => {
      expect(() => StageModel.fromJson(null)).toThrow();
    });

    it('throws when JSON is undefined', () => {
      expect(() => StageModel.fromJson(undefined)).toThrow();
    });
  });

  describe('example', () => {
    it('provides a valid example instance', () => {
      expect(StageModel.example).toBeInstanceOf(StageModel);
      expect(typeof StageModel.example.title).toBe('string');
    });
  });
});
