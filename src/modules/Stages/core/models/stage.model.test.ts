import { describe, expect, it } from 'vitest';
import TitleInterface from '@/base/Data/Models/titleInterface';
import { EducationType } from '../constants/educationtype.enum';
import BranchesModel from './branches.model';
import StageModel from './stage.model';

const makeTranslations = (en = 'Primary', ar = 'ابتدائي') => ({
  title: { en, ar },
});

const makeEducationType = () =>
  new TitleInterface({
    id: EducationType.General,
    title: 'General',
  });

describe('StageModel', () => {
  it('creates an immutable stage model from constructor data', () => {
    const branch = BranchesModel.example;
    const child = new StageModel({
      id: 2,
      translations: makeTranslations('Child', 'فرعي'),
      branches: [],
      EducationType: makeEducationType(),
      children: [],
    });

    const model = new StageModel({
      id: 1,
      translations: makeTranslations(),
      e_c_subject_id: 7,
      branches: [branch],
      EducationType: makeEducationType(),
      children: [child],
    });

    expect(model.id).toBe(1);
    expect(model.translations.title.en).toBe('Primary');
    expect(model.e_c_subject_id).toBe(7);
    expect(model.branches).toEqual([branch]);
    expect(model.children).toEqual([child]);
    expect(Object.isFrozen(model)).toBe(true);
  });

  it('maps API responses, branches, and children recursively', () => {
    const model = StageModel.fromJson({
      id: 10,
      translations: makeTranslations('Secondary', 'ثانوي'),
      e_c_subject_id: 5,
      branches: [
        {
          id: 20,
          title: 'Scientific',
          subjects: [{ id: 1, title: 'Math' }],
          e_c_branch_id: 4,
          parent_id: 3,
        },
      ],
      education_type: { id: EducationType.Technical, title: 'Technical' },
      children: [
        {
          id: 11,
          translations: makeTranslations('Grade 1', 'الصف الاول'),
          branches: [],
          education_type: { id: EducationType.General, title: 'General' },
          children: [],
        },
      ],
    });

    expect(model.id).toBe(10);
    expect(model.translations.title.ar).toBe('ثانوي');
    expect(model.EducationType).toEqual({ id: EducationType.Technical, title: 'Technical' });
    expect(model.branches[0]).toBeInstanceOf(BranchesModel);
    expect(model.branches[0].title).toBe('Scientific');
    expect(model.children[0]).toBeInstanceOf(StageModel);
    expect(model.children[0].translations.title.en).toBe('Grade 1');
  });

  it('defaults missing branches and children to empty arrays', () => {
    const model = StageModel.fromJson({
      id: 3,
      translations: makeTranslations(),
      education_type: { id: EducationType.General, title: 'General' },
    });

    expect(model.branches).toEqual([]);
    expect(model.children).toEqual([]);
  });

  it('throws for empty API responses and exposes a valid example', () => {
    expect(() => StageModel.fromJson(null)).toThrow('Cannot create CountryModel');
    expect(() => StageModel.fromJson(undefined)).toThrow('Cannot create CountryModel');
    expect(StageModel.example).toBeInstanceOf(StageModel);
  });
});
