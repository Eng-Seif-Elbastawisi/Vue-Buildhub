import { describe, it, expect, vi } from 'vitest';
import EducationTreeRepository from '../education.configuration.tree.repository';
import EducationClassificationTreeModel from '@/modules/EducationClassification/core/models/EducationTree/education.classification.tree.model';

// Mock dependencies
vi.mock('../../api/EducationTree/education.configuration.tree.api-service', () => ({
  default: {
    getInstance: () => ({
      index: vi.fn(),
      show: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }),
  },
}));

describe('EducationTreeRepository', () => {
  const repository = EducationTreeRepository.getInstance();

  describe('getInstance', () => {
    it('should return a singleton instance', () => {
      const instance1 = EducationTreeRepository.getInstance();
      const instance2 = EducationTreeRepository.getInstance();
      expect(instance1).toBe(instance2);
      expect(instance1).toBeInstanceOf(EducationTreeRepository);
    });
  });

  describe('parseItem', () => {
    it('should correctly parse item from data', () => {
      const data = {
        id: 1,
        number_of_branches: 3,
        branches: [],
      };
      // @ts-expect-error - access protected for test
      const result = repository.parseItem(data);
      expect(result).toBeInstanceOf(EducationClassificationTreeModel);
      expect(result.id).toBe(1);
    });
  });

  describe('parseList', () => {
    it('should correctly parse list from data', () => {
      const data = [
        { id: 1, number_of_branches: 2, branches: [] },
        { id: 2, number_of_branches: 4, branches: [] },
      ];
      // @ts-expect-error - access protected for test
      const result = repository.parseList(data);
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(EducationClassificationTreeModel);
      expect(result[1].id).toBe(2);
    });

    it('should return empty array if data is not an array', () => {
      // @ts-expect-error - access protected for test
      const result = repository.parseList(null);
      expect(result).toEqual([]);
    });
  });

  describe('mockData', () => {
    it('should provide mockItem', () => {
      // @ts-expect-error - access protected
      expect(repository.mockItem).toBeInstanceOf(EducationClassificationTreeModel);
    });

    it('should provide mockList', () => {
      // @ts-expect-error - access protected
      expect(Array.isArray(repository.mockList)).toBe(true);
      // @ts-expect-error - access protected
      expect(repository.mockList[0]).toBeInstanceOf(EducationClassificationTreeModel);
    });
  });
});
