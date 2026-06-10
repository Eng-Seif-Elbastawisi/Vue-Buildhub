import { describe, it, expect } from 'vitest';
import AddStageParams from './add.stges.params';
import EditStageParams from './edit.stage.params';
import ShowStageParams from './show.stage.params';
import { EducationType } from '../constants/educationtype.enum';

describe('Stage Params', () => {
  describe('AddStageParams', () => {
    it('creates valid params', () => {
      const params = new AddStageParams({
        title: 'Secondary',
        educationType: EducationType.General,
      });
      expect(params.title).toBe('Secondary');
      expect(params.educationType).toBe(EducationType.General);
    });

    it('converts to map correctly', () => {
      const params = new AddStageParams({
        title: 'Primary',
        educationType: EducationType.Technical,
      });
      const map = params.toMap();
      expect(map.title).toBe('Primary');
      expect(map.education_type).toBe(EducationType.Technical);
    });

    it('passes validation for valid params', () => {
      const params = new AddStageParams({ title: 'Stage', educationType: EducationType.General });
      expect(params.validate().isValid).toBe(true);
    });

    it('fails validation when title is empty', () => {
      const params = new AddStageParams({ title: '', educationType: EducationType.General });
      expect(params.validate().isValid).toBe(false);
    });
  });

  describe('EditStageParams', () => {
    it('creates valid params', () => {
      const params = new EditStageParams(1, 'Updated Stage', EducationType.General);
      expect(params.id).toBe(1);
      expect(params.title).toBe('Updated Stage');
    });

    it('converts to map correctly', () => {
      const params = new EditStageParams(5, 'Stage', EducationType.Technical);
      const map = params.toMap();
      expect(map.id).toBe(5);
      expect(map.title).toBe('Stage');
    });

    it('passes validation for valid params', () => {
      const params = new EditStageParams(1, 'Stage', EducationType.General);
      expect(params.validate().isValid).toBe(true);
    });
  });

  describe('ShowStageParams', () => {
    it('creates valid params', () => {
      const params = new ShowStageParams(7);
      expect(params.id).toBe(7);
    });

    it('converts to map correctly', () => {
      const params = new ShowStageParams(7);
      const map = params.toMap();
      expect(map).toEqual({ id: 7 });
    });

    it('passes validation for valid params', () => {
      const params = new ShowStageParams(1);
      expect(params.validate().isValid).toBe(true);
    });
  });
});
