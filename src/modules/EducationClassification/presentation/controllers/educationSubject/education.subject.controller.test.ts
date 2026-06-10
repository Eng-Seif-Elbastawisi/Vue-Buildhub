import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import EducationSubjectController from './education.subject.controller';
import EducationSubjectConfigurationModel from '@/modules/EducationClassification/core/models/EducationConfiguration/education.subject.configuration.model';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import AddEducationSubjectParams from '@/modules/EducationClassification/core/params/EducationSubjects/add.educationSubject.params';
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

describe('EducationSubjectController', () => {
  let controller: EducationSubjectController;
  let mockRepository: any;

  beforeEach(() => {
    controller = EducationSubjectController.getInstance();

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
      const a = EducationSubjectController.getInstance();
      const b = EducationSubjectController.getInstance();
      expect(a).toBe(b);
    });
  });

  describe('fetchList', () => {
    it('should call repository.index and return DataSuccess', async () => {
      const successState = new DataSuccess(EducationSubjectConfigurationModel.example);
      mockRepository.index.mockResolvedValue(successState);

      const result = await controller.fetchList();

      expect(mockRepository.index).toHaveBeenCalled();
      expect(result).toBe(successState);
    });
  });

  describe('create', () => {
    it('should call repository.create and redirect on success', async () => {
      const translation = new TranslationParams({
        SingularTitle: { en: 'Subject', ar: 'مادة' },
        PluralTitle: { en: 'Subjects', ar: 'مواد' },
      });
      const branchTranslation = new TranslationParams({
        SingularTitle: { en: 'Part', ar: 'جزء' },
        PluralTitle: { en: 'Parts', ar: 'اجزاء' },
      });
      const branch = new ConfigurationParams({ levelNumber: 1, translation: branchTranslation });
      const params = new AddEducationSubjectParams({
        educationClassificatioId: 1,
        numberOfBranches: 1,
        translation,
        branches: [branch],
      });
      const successState = new DataSuccess(EducationSubjectConfigurationModel.example);
      mockRepository.create.mockResolvedValue(successState);

      const result = await controller.create(params);

      expect(mockRepository.create).toHaveBeenCalled();
      expect(router.push).toHaveBeenCalledWith({ name: 'EducationClassifications' });
      expect(result).toBe(successState);
    });
  });
});
