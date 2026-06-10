import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import EducationConfigurationController from './education.configuration.controller';
import EducationConfigurationModel from '@/modules/EducationClassification/core/models/EducationConfiguration/education.configuration.model';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import AddEducationConfigurationParams from '@/modules/EducationClassification/core/params/EducationConfiguration/add.educationConfiguration.params';
import TranslationParams from '@/modules/EducationClassification/core/params/translation.params';
import ConfigurationParams from '@/modules/EducationClassification/core/params/EducationConfiguration/Configuration.params';
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

describe('EducationConfigurationController', () => {
  let controller: EducationConfigurationController;
  let mockRepository: any;

  beforeEach(() => {
    controller = EducationConfigurationController.getInstance();

    mockRepository = {
      index: vi.fn(),
      show: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    vi.spyOn(controller as any, 'repository', 'get').mockReturnValue(mockRepository);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const a = EducationConfigurationController.getInstance();
      const b = EducationConfigurationController.getInstance();
      expect(a).toBe(b);
    });
  });

  describe('fetchList', () => {
    it('should call repository.index and return DataSuccess', async () => {
      const successState = new DataSuccess(EducationConfigurationModel.example);
      mockRepository.index.mockResolvedValue(successState);

      const result = await controller.fetchList();

      expect(mockRepository.index).toHaveBeenCalled();
      expect(result).toBe(successState);
    });
  });

  describe('create', () => {
    it('should call repository.create and redirect on success', async () => {
      const translation = new TranslationParams({
        SingularTitle: { en: 'Stage', ar: 'مرحلة' },
        PluralTitle: { en: 'Stages', ar: 'مراحل' },
      });
      const branch = new ConfigurationParams({ levelNumber: 1, translation });
      const params = new AddEducationConfigurationParams({
        educationClassificatioId: 1,
        numberOfBranches: 1,
        branches: [branch],
      });
      const successState = new DataSuccess(EducationConfigurationModel.example);
      mockRepository.create.mockResolvedValue(successState);

      const result = await controller.create(params);

      expect(mockRepository.create).toHaveBeenCalled();
      expect(router.push).toHaveBeenCalledWith({ name: 'EducationClassifications' });
      expect(result).toBe(successState);
    });
  });
});
