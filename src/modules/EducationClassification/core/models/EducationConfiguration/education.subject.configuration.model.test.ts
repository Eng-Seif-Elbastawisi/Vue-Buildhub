import { describe, it, expect } from 'vitest';
import EducationSubjectConfigurationModel from './education.subject.configuration.model';
describe('EducationSubjectConfigurationModel', () => {
  describe('constructor', () => {
    it('should create a valid model', () => {
      const model = new EducationSubjectConfigurationModel({
        educationClassificatioId: 1,
        numberOfBranches: 2,
        SingularTitle: { en: 'Subject', ar: 'مادة' },
        pluralTitle: { en: 'Subjects', ar: 'مواد' },
        branches: [
          new EducationSubjectConfigurationModel.example.branches[0].constructor({
            id: 1,
            levelNumber: 1,
            singularTitle: { en: 'Part', ar: 'جزء' },
            pluralTitle: { en: 'Parts', ar: 'اجزاء' },
          }),
        ],
      });

      expect(model.educationClassificatioId).toBe(1);
      expect(model.numberOfBranches).toBe(2);
      expect(model.SingularTitle.en).toBe('Subject');
      expect(model.branches).toHaveLength(1);
    });
  });

  describe('fromJson', () => {
    it('should parse API JSON correctly', () => {
      const json = {
        education_classification_id: 2,
        number_of_branches: 2,
        translation: {
          SingularTitle: { en: 'Subject', ar: 'مادة' },
          PluralTitle: { en: 'Subjects', ar: 'مواد' },
        },
        branches: [
          {
            level_number: 1,
            translation: {
              SingularTitle: { en: 'Part', ar: 'جزء' },
              PluralTitle: { en: 'Parts', ar: 'اجزاء' },
            },
          },
          {
            level_number: 2,
            translation: {
              SingularTitle: { en: 'Unit', ar: 'وحدة' },
              PluralTitle: { en: 'Units', ar: 'وحدات' },
            },
          },
        ],
      };

      const model = EducationSubjectConfigurationModel.fromJson(json);

      expect(model.educationClassificatioId).toBe(2);
      expect(model.numberOfBranches).toBe(2);
      expect(model.SingularTitle).toEqual({ en: 'Subject', ar: 'مادة' });
      expect(model.pluralTitle).toEqual({ en: 'Subjects', ar: 'مواد' });
      expect(model.branches).toHaveLength(2);
      expect(model.branches[0].levelNumber).toBe(1);
    });

    it('should default translation to empty objects when missing', () => {
      const json = {
        education_classification_id: 1,
        number_of_branches: 0,
      };

      const model = EducationSubjectConfigurationModel.fromJson(json);

      expect(model.SingularTitle).toEqual({});
      expect(model.pluralTitle).toEqual({});
      expect(model.branches).toEqual([]);
    });

    it('should throw when JSON is null', () => {
      expect(() => EducationSubjectConfigurationModel.fromJson(null)).toThrow(
        'Cannot create EducationSubjectConfigurationModel from null or undefined',
      );
    });
  });

  describe('example', () => {
    it('should be a valid instance with 2 branches', () => {
      const ex = EducationSubjectConfigurationModel.example;

      expect(ex).toBeInstanceOf(EducationSubjectConfigurationModel);
      expect(ex.numberOfBranches).toBe(2);
      expect(ex.branches).toHaveLength(2);
      expect(ex.SingularTitle.en).toBe('title 1 ');
    });
  });

  describe('immutability', () => {
    it('should be frozen', () => {
      const model = new EducationSubjectConfigurationModel({
        educationClassificatioId: 1,
        numberOfBranches: 0,
        SingularTitle: { en: 'X', ar: 'X' },
        pluralTitle: { en: 'Xs', ar: 'Xs' },
        branches: [],
      });

      expect(Object.isFrozen(model)).toBe(true);
    });
  });
});
