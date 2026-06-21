import { describe, expect, it } from 'vitest';
import { EducationType } from '../../constants/educationtype.enum';
import BranchesModel from '../branches.model';
import MeasurementModel from '../stage.model';

const branchJson = {
  id: 2,
  title: 'Science',
  subjects: [{ id: 1, title: 'Physics' }],
  e_c_branch_id: 8,
  parent_id: 1,
};

describe('MeasurementModel', () => {
  it('maps nested JSON and freezes the instance', () => {
    const model = MeasurementModel.fromJson({
      id: 1,
      title: 'Preparatory',
      translations: { title: { en: 'Preparatory', ar: 'Preparatory AR' } },
      e_c_subject_id: 3,
      branches: [branchJson],
      education_type: { id: EducationType.General, title: 'General' },
      children: [
        {
          id: 4,
          title: 'Child',
          branches: [],
          education_type: { id: EducationType.General, title: 'General' },
        },
      ],
    });

    expect(model).toMatchObject({
      id: 1,
      title: 'Preparatory',
      translations: { title: { en: 'Preparatory', ar: 'Preparatory AR' } },
      e_c_subject_id: 3,
      EducationType: { id: EducationType.General, title: 'General' },
    });
    expect(model.branches[0]).toBeInstanceOf(BranchesModel);
    expect(model.children[0]).toBeInstanceOf(MeasurementModel);
    expect(Object.isFrozen(model)).toBe(true);
  });

  it('falls back to title translations and exposes an example', () => {
    expect(
      MeasurementModel.fromJson({ id: 1, title: 'Fallback', education_type: null }).translations,
    ).toEqual({
      title: { en: 'Fallback' },
    });
    expect(() => MeasurementModel.fromJson(null)).toThrow('Cannot create CountryModel');
    expect(MeasurementModel.example).toBeInstanceOf(MeasurementModel);
  });
});
