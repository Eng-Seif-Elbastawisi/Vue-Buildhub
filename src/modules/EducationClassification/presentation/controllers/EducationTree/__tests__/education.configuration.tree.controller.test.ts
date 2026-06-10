import { describe, it, expect, vi } from 'vitest';
import EducationTreeController from '../education.configuration.tree.controller';
import EducationTreeRepository from '@/modules/EducationClassification/data/repositories/EducationTree/education.configuration.tree.repository';

const mockRepository = {
  index: vi.fn(),
  show: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

// Mock the repository
vi.mock(
  '@/modules/EducationClassification/data/repositories/EducationTree/education.configuration.tree.repository',
  () => ({
    default: {
      getInstance: () => mockRepository,
    },
  }),
);

describe('EducationTreeController', () => {
  const controller = EducationTreeController.getInstance();

  describe('getInstance', () => {
    it('should return a singleton instance', () => {
      const instance1 = EducationTreeController.getInstance();
      const instance2 = EducationTreeController.getInstance();
      expect(instance1).toBe(instance2);
      expect(instance1).toBeInstanceOf(EducationTreeController);
    });
  });

  describe('repository', () => {
    it('should use EducationTreeRepository', () => {
      // @ts-expect-error - access protected
      expect(controller.repository).toBe(EducationTreeRepository.getInstance());
    });
  });

  describe('config', () => {
    it('should have correct default configuration', () => {
      // @ts-expect-error - access protected
      const config = controller.config;
      expect(config.showLoadingDialog).toBe(true);
      expect(config.showSuccessDialog).toBe(true);
      expect(config.showErrorDialog).toBe(true);
    });
  });
});
