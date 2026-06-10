import { describe, it, expect } from 'vitest';
import EducationClassificationTreeModel from './education.classification.tree.model';
import BranchesModel from './branches.model';

describe('EducationClassificationTreeModel', () => {
  describe('constructor', () => {
    it('should create a valid model', () => {
      const branches = [BranchesModel.example];
      const model = new EducationClassificationTreeModel({
        id: 1,
        number_of_branches: 3,
        branches: branches,
      });

      expect(model.id).toBe(1);
      expect(model.number_of_branches).toBe(3);
      expect(model.branches).toBe(branches);
    });
  });

  describe('fromJson', () => {
    it('should create model from API response', () => {
      const json = {
        id: 5,
        number_of_branches: 2,
        branches: [
          {
            branch_id: 1,
            branch_title: 'Test Branch',
            branches: [],
          },
        ],
      };

      const model = EducationClassificationTreeModel.fromJson(json);

      expect(model.id).toBe(5);
      expect(model.number_of_branches).toBe(2);
      expect(model.branches).toHaveLength(1);
      expect(model.branches[0]).toBeInstanceOf(BranchesModel);
    });

    it('should throw error when JSON is null', () => {
      expect(() =>
        EducationClassificationTreeModel.fromJson(null as unknown as Record<string, unknown>),
      ).toThrow('Cannot create EducationClassificationTreeModel from null or undefined');
    });
  });

  describe('example', () => {
    it('should provide a valid example instance', () => {
      expect(EducationClassificationTreeModel.example).toBeInstanceOf(
        EducationClassificationTreeModel,
      );
      expect(EducationClassificationTreeModel.example.number_of_branches).toBe(4);
    });
  });

  describe('immutability', () => {
    it('should be frozen', () => {
      const model = new EducationClassificationTreeModel({
        id: 1,
        number_of_branches: 1,
        branches: [],
      });

      expect(Object.isFrozen(model)).toBe(true);
    });
  });
});
