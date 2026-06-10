import { describe, it, expect } from 'vitest';
import AddEducationConfigurationTreeParams from '../add.education.configuration.tree.params';

describe('AddEducationConfigurationTreeParams', () => {
  describe('constructor', () => {
    it('should create params with provided data', () => {
      const data = {
        education_classification_id: 1,
        branch_id: 2,
        branch_title: 'Math',
      };
      const params = new AddEducationConfigurationTreeParams(data);

      expect(params.education_classification_id).toBe(1);
      expect(params.branch_id).toBe(2);
      expect(params.branch_title).toBe('Math');
    });
  });

  describe('toMap', () => {
    it('should convert params to a map object', () => {
      const data = {
        education_classification_id: 1,
        branch_id: 2,
        branch_title: 'Math',
      };
      const params = new AddEducationConfigurationTreeParams(data);
      const map = params.toMap();

      expect(map).toEqual({
        education_classification_id: 1,
        branch_id: 2,
        branch_title: 'Math',
      });
    });
  });

  describe('validation', () => {
    it('should validate correctly when all required fields are present', () => {
      const params = new AddEducationConfigurationTreeParams({
        education_classification_id: 1,
        branch_title: 'Math',
      });
      const result = params.validate();
      expect(result.isValid).toBe(true);
    });

    it('should be invalid when education_classification_id is missing', () => {
      const params = new AddEducationConfigurationTreeParams({
        branch_title: 'Math',
      });
      const result = params.validate();
      expect(result.isValid).toBe(false);
    });

    it('should be invalid when branch_title is missing', () => {
      const params = new AddEducationConfigurationTreeParams({
        education_classification_id: 1,
      });
      const result = params.validate();
      expect(result.isValid).toBe(false);
    });

    it('should NOT throw error on validateOrThrow when invalid (current behavior of ClassValidation)', () => {
      const params = new AddEducationConfigurationTreeParams({});
      expect(() => params.validateOrThrow()).not.toThrow();
    });
  });
});
