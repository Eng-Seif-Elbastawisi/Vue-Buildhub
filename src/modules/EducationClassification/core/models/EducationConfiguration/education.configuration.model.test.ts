import { describe, it, expect } from 'vitest';
import EducationConfigurationModel from './education.configuration.model';

describe('EducationConfigurationModel', () => {
  describe('constructor', () => {
    it('should create a valid model', () => {
      const model = new EducationConfigurationModel({
        educationClassificatioId: 1,
        numberOfBranches: 2,
        branches: [
          new EducationConfigurationModel.example.branches[0].constructor({
            id: 1,
            levelNumber: 1,
            singularTitle: { en: 'Level 1', ar: 'مستوى 1' },
            pluralTitle: { en: 'Levels 1', ar: 'مستويات 1' },
          }),
          new EducationConfigurationModel.example.branches[0].constructor({
            id: 2,
            levelNumber: 2,
            singularTitle: { en: 'Level 2', ar: 'مستوى 2' },
            pluralTitle: { en: 'Levels 2', ar: 'مستويات 2' },
          }),
        ],
      });

      expect(model.educationClassificatioId).toBe(1);
      expect(model.numberOfBranches).toBe(2);
      expect(model.branches).toHaveLength(2);
    });
  });

  describe('fromJson', () => {
    it('should parse API JSON correctly', () => {
      const json = {
        education_classification_id: 3,
        number_of_branches: 2,
        branches: [
          {
            level_number: 1,
            translation: {
              SingularTitle: { en: 'Stage', ar: 'مرحلة' },
              PluralTitle: { en: 'Stages', ar: 'مراحل' },
            },
          },
          {
            level_number: 2,
            translation: {
              SingularTitle: { en: 'Grade', ar: 'صف' },
              PluralTitle: { en: 'Grades', ar: 'صفوف' },
            },
          },
        ],
      };

      const model = EducationConfigurationModel.fromJson(json);

      expect(model.educationClassificatioId).toBe(3);
      expect(model.numberOfBranches).toBe(2);
      expect(model.branches).toHaveLength(2);
      expect(model.branches[0].levelNumber).toBe(1);
      expect(model.branches[0].singularTitle).toEqual({ en: 'Stage', ar: 'مرحلة' });
    });

    it('should default branches to [] when missing', () => {
      const json = { education_classification_id: 1, number_of_branches: 0 };

      const model = EducationConfigurationModel.fromJson(json);

      expect(model.branches).toEqual([]);
    });

    it('should support translations key instead of translation', () => {
      const json = {
        education_classification_id: 1,
        number_of_branches: 1,
        branches: [
          {
            level_number: 1,
            translations: {
              SingularTitle: { en: 'Stage', ar: 'مرحلة' },
              PluralTitle: { en: 'Stages', ar: 'مراحل' },
            },
          },
        ],
      };

      const model = EducationConfigurationModel.fromJson(json);

      expect(model.branches[0].singularTitle).toEqual({ en: 'Stage', ar: 'مرحلة' });
    });

    it('should throw when JSON is null', () => {
      expect(() => EducationConfigurationModel.fromJson(null)).toThrow(
        'Cannot create EducationConfigurationModel from null or undefined',
      );
    });
  });

  describe('example', () => {
    it('should be a valid instance with 3 branches', () => {
      const ex = EducationConfigurationModel.example;

      expect(ex).toBeInstanceOf(EducationConfigurationModel);
      expect(ex.numberOfBranches).toBe(3);
      expect(ex.branches).toHaveLength(3);
    });
  });

  describe('immutability', () => {
    it('should be frozen', () => {
      const model = new EducationConfigurationModel({
        educationClassificatioId: 1,
        numberOfBranches: 0,
        branches: [],
      });

      expect(Object.isFrozen(model)).toBe(true);
    });
  });
});
