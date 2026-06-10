import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import EducationSubjectRepository from './education.subject.repository';
import EducationSubjectConfigurationModel from '@/modules/EducationClassification/core/models/EducationConfiguration/education.subject.configuration.model';
import {
  DataSuccess,
  DataFailed,
  DataEmpty,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { env } from '@/base/Core/Config';

describe('EducationSubjectRepository', () => {
  let repository: EducationSubjectRepository;
  let mockApiService: Record<string, unknown>;

  beforeEach(() => {
    repository = EducationSubjectRepository.getInstance();

    mockApiService = {
      index: vi.fn(),
      show: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    vi.spyOn(repository as unknown as { apiService: unknown }, 'apiService', 'get').mockReturnValue(
      mockApiService,
    );
    env.override({ useStaticData: false });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    env.reset();
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const a = EducationSubjectRepository.getInstance();
      const b = EducationSubjectRepository.getInstance();
      expect(a).toBe(b);
    });
  });

  describe('index', () => {
    it('should return DataSuccess with parsed EducationSubjectConfigurationModel', async () => {
      const mockResponse = {
        data: {
          status: true,
          message: 'success',
          data: {
            education_classification_id: 2,
            number_of_branches: 2,
            translation: {
              SingularTitle: { en: 'Subject', ar: 'مادة' },
              PluralTitle: { en: 'Subjects', ar: 'مواد' },
            },
            branches: [
              {
                level_number: 1,
                translation: {
                  SingularTitle: { en: 'Part', ar: 'جزء' },
                  PluralTitle: { en: 'Parts', ar: 'اجزاء' },
                },
              },
            ],
          },
        },
        statusCode: 200,
      };
      mockApiService.index.mockResolvedValue(mockResponse);

      const result = await repository.index();

      expect(result).toBeInstanceOf(DataSuccess);
      if (result instanceof DataSuccess) {
        expect(result.data).toBeInstanceOf(Array);
        expect(result.data?.[0]).toBeInstanceOf(EducationSubjectConfigurationModel);
        expect(result.data?.[0].educationClassificatioId).toBe(2);
        expect(result.data?.[0].numberOfBranches).toBe(2);
        expect(result.data?.[0].SingularTitle.en).toBe('Subject');
      }
    });

    it('should return DataEmpty when response data is null', async () => {
      const mockResponse = {
        data: { status: true, message: 'No data', data: null },
        statusCode: 200,
      };
      mockApiService.index.mockResolvedValue(mockResponse);

      const result = await repository.index();

      expect(result).toBeInstanceOf(DataEmpty);
    });

    it('should return DataFailed on API error', async () => {
      const errorResponse = {
        data: { status: false, message: 'Error', data: null },
        statusCode: 500,
      };
      mockApiService.index.mockResolvedValue(errorResponse);

      const result = await repository.index();

      expect(result).toBeInstanceOf(DataFailed);
    });
  });

  describe('create', () => {
    it('should return DataSuccess with created model', async () => {
      const mockResponse = {
        data: {
          status: true,
          message: 'Created',
          data: {
            education_classification_id: 1,
            number_of_branches: 1,
            translation: { SingularTitle: {}, PluralTitle: {} },
            branches: [],
          },
        },
        statusCode: 200,
      };
      mockApiService.create.mockResolvedValue(mockResponse);

      const params = {
        toMap: () => ({}),
        validate: () => ({ isValid: true, errors: [] }),
        validateOrThrow: () => {
          // No-op for testing
        },
      };
      const result = await repository.create(params as unknown as any);

      expect(result).toBeInstanceOf(DataSuccess);
      if (result instanceof DataSuccess) {
        expect(result.data).toBeInstanceOf(EducationSubjectConfigurationModel);
      }
    });
  });
});
