import { describe, it, expect } from 'vitest';
import EducationStageModel from './education.stages.model';

describe('EducationStageModel', () => {
  describe('constructor', () => {
    it('creates a valid model with all fields', () => {
      const model = new EducationStageModel({
        stage_id: 1,
        stage_title: 'Primary',
        has_children: false,
      });

      expect(model.stage_id).toBe(1);
      expect(model.stage_title).toBe('Primary');
      expect(model.has_children).toBe(false);
    });

    it('stores has_children as true when provided', () => {
      const model = new EducationStageModel({
        stage_id: 2,
        stage_title: 'Secondary',
        has_children: true,
      });

      expect(model.has_children).toBe(true);
    });

    it('is frozen after construction', () => {
      const model = new EducationStageModel({
        stage_id: 3,
        stage_title: 'Tertiary',
        has_children: false,
      });

      expect(Object.isFrozen(model)).toBe(true);
    });
  });

  describe('fromJson', () => {
    it('parses a valid JSON object correctly', () => {
      const model = EducationStageModel.fromJson({
        stage_id: 5,
        stage_title: 'Kindergarten',
        has_children: true,
      });

      expect(model).toBeInstanceOf(EducationStageModel);
      expect(model.stage_id).toBe(5);
      expect(model.stage_title).toBe('Kindergarten');
      expect(model.has_children).toBe(true);
    });

    it('throws when JSON is null', () => {
      expect(() => EducationStageModel.fromJson(null as any)).toThrow(
        'Cannot create BranchesModel from null or undefined',
      );
    });

    it('throws when JSON is undefined', () => {
      expect(() => EducationStageModel.fromJson(undefined as any)).toThrow();
    });
  });

  describe('example', () => {
    it('is a valid EducationStageModel instance', () => {
      expect(EducationStageModel.example).toBeInstanceOf(EducationStageModel);
    });

    it('has expected field values', () => {
      expect(EducationStageModel.example.stage_id).toBe(10);
      expect(EducationStageModel.example.stage_title).toBe('stage 1');
      expect(EducationStageModel.example.has_children).toBe(true);
    });
  });
});
