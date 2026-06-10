import { describe, it, expect } from 'vitest';
import BranchesModel from './branches.model';

describe('BranchesModel', () => {
  describe('constructor', () => {
    it('should create a valid model', () => {
      const model = new BranchesModel({
        branch_id: 1,
        branch_title: 'Test Branch',
        branches: [],
      });

      expect(model.branch_id).toBe(1);
      expect(model.branch_title).toBe('Test Branch');
      expect(model.branches).toEqual([]);
    });
  });

  describe('fromJson', () => {
    it('should create model from API response', () => {
      const json = {
        branch_id: 10,
        branch_title: 'API Branch',
        branches: [],
      };

      const model = BranchesModel.fromJson(json);

      expect(model.branch_id).toBe(10);
      expect(model.branch_title).toBe('API Branch');
      expect(model.branches).toEqual([]);
    });

    it('should handle nested branches in fromJson', () => {
      const json = {
        branch_id: 1,
        branch_title: 'Parent',
        branches: [
          {
            branch_id: 2,
            branch_title: 'Child',
            branches: [],
          },
        ],
      };

      const model = BranchesModel.fromJson(json);

      expect(model.branches).toHaveLength(1);
      expect(model.branches[0]).toBeInstanceOf(BranchesModel);
      expect(model.branches[0]?.branch_title).toBe('Child');
    });

    it('should throw error when JSON is null', () => {
      expect(() => BranchesModel.fromJson(null as unknown as Record<string, unknown>)).toThrow(
        'Cannot create BranchesModel from null or undefined',
      );
    });
  });

  describe('example', () => {
    it('should provide a valid example instance', () => {
      expect(BranchesModel.example).toBeInstanceOf(BranchesModel);
      expect(BranchesModel.example.branch_title).toBe('Basic education');
    });
  });

  describe('immutability', () => {
    it('should be frozen', () => {
      const model = new BranchesModel({
        branch_id: 1,
        branch_title: 'Test',
        branches: [],
      });

      expect(Object.isFrozen(model)).toBe(true);
    });
  });
});
