import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import EducationClassificationController from './educationClassification.controller';
import type EducationClassificationRepository from '../../data/repositories/educationClassification.repository';
import EducationClassificationTestFactory from '../../__tests__/educationClassification.test-factory';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import AddEducationClassificationParams from '../../core/params/add.educationClassification.params';
import EditEducationClassificationParams from '../../core/params/edit.educationClassification.params';
import TranslationParams from '@/modules/about/core/params/translation.params';
import router from '@/router';

vi.mock('@/stores/formsStore', () => ({
  useFormsStore: () => ({
    clearFormData: vi.fn(),
  }),
}));

vi.mock('@/router', () => ({
  default: { push: vi.fn() },
  push: vi.fn(),
}));

describe('EducationClassificationController', () => {
  let controller: EducationClassificationController;
  let mockRepository: {
    index: ReturnType<typeof vi.fn>;
    show: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    controller = EducationClassificationController.getInstance();

    mockRepository = {
      index: vi.fn(),
      show: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    vi.spyOn(
      controller as unknown as { repository: EducationClassificationRepository },
      'repository',
      'get',
    ).mockReturnValue(mockRepository as unknown as EducationClassificationRepository);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = EducationClassificationController.getInstance();
      const instance2 = EducationClassificationController.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('create - create new education classification', () => {
    it('should call repository.create and redirect to EducationClassifications on success', async () => {
      const mockItem = EducationClassificationTestFactory.createMockEducationClassification({
        id: 1,
      });
      const successState = new DataSuccess(mockItem);
      const translation = new TranslationParams({ title: { en: 'Basic Education' } });
      const params = new AddEducationClassificationParams({ translation });
      mockRepository.create.mockResolvedValue(successState);

      const result = await controller.create(params);

      expect(mockRepository.create).toHaveBeenCalled();
      expect(router.push).toHaveBeenCalledWith({ name: 'EducationClassifications' });
      expect(result).toBe(successState);
    });
  });

  describe('update - update existing education classification', () => {
    it('should call repository.update and redirect to EducationClassifications on success', async () => {
      const mockItem = EducationClassificationTestFactory.createMockEducationClassification({
        id: 5,
      });
      const successState = new DataSuccess(mockItem);
      const translations = new TranslationParams({ title: { en: 'Higher Education' } });
      const params = new EditEducationClassificationParams({ id: 5, translations });
      mockRepository.update.mockResolvedValue(successState);

      const result = await controller.update(params);

      expect(mockRepository.update).toHaveBeenCalled();
      expect(router.push).toHaveBeenCalledWith({ name: 'EducationClassifications' });
      expect(result).toBe(successState);
    });
  });

  describe('fetchList - fetch all education classifications', () => {
    it('should call repository.index and return result', async () => {
      const mockItems = EducationClassificationTestFactory.createMockEducationClassificationList(3);
      const successState = new DataSuccess(mockItems);
      mockRepository.index.mockResolvedValue(successState);

      const result = await controller.fetchList();

      expect(mockRepository.index).toHaveBeenCalled();
      expect(result).toBe(successState);
    });
  });
});
