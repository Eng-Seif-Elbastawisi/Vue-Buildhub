import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import EducationClassificationRepository from './educationClassification.repository';
import EducationClassificationTestFactory from '../../__tests__/educationClassification.test-factory';
import {
  DataSuccess,
  DataEmpty,
  DataFailed,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import EducationClassificationModel from '../../core/models/education.classification.model';
import { env } from '@/base/Core/Config';

describe('EducationClassificationRepository', () => {
  let repository: EducationClassificationRepository;
  let mockApiService: any;

  beforeEach(() => {
    repository = EducationClassificationRepository.getInstance();

    mockApiService = {
      index: vi.fn(),
      show: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    vi.spyOn(repository as any, 'apiService', 'get').mockReturnValue(mockApiService);
    env.override({ useStaticData: false });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    env.reset();
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = EducationClassificationRepository.getInstance();
      const instance2 = EducationClassificationRepository.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('index - fetch list', () => {
    it('should return DataSuccess with parsed education classification list', async () => {
      const mockItems =
        EducationClassificationTestFactory.createMockEducationClassificationJsonList(3);
      const mockResponse =
        EducationClassificationTestFactory.createEducationClassificationListApiResponse(mockItems);
      mockApiService.index.mockResolvedValue(mockResponse);

      const result = await repository.index();

      expect(result).toBeInstanceOf(DataSuccess);
      if (result instanceof DataSuccess) {
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data).toHaveLength(3);
        expect(result.data[0]).toBeInstanceOf(EducationClassificationModel);
        expect(result.data[0].title).toBe(mockItems[0].title);
      }
    });

    it('should return DataEmpty when response contains no data', async () => {
      const mockResponse = {
        data: { data: null, status: true, message: 'No data found' },
        statusCode: 200,
      };
      mockApiService.index.mockResolvedValue(mockResponse);

      const result = await repository.index();

      expect(result).toBeInstanceOf(DataEmpty);
    });

    it('should return DataFailed on API error', async () => {
      const errorResponse =
        EducationClassificationTestFactory.createErrorEducationClassificationResponse(
          'Failed to fetch',
          500,
        );
      mockApiService.index.mockResolvedValue(errorResponse);

      const result = await repository.index();

      expect(result).toBeInstanceOf(DataFailed);
    });
  });

  describe('show - fetch single item', () => {
    it('should return DataSuccess with parsed model', async () => {
      const mockItem = EducationClassificationTestFactory.createMockEducationClassificationJson({
        id: 10,
      });
      const mockResponse =
        EducationClassificationTestFactory.createEducationClassificationApiResponse(mockItem);
      mockApiService.show.mockResolvedValue(mockResponse);

      const params = {
        toMap: () => ({ id: 10 }),
        validate: () => ({ isValid: true, errors: [] }),
        validateOrThrow: () => {},
      };
      const result = await repository.show(params as any);

      expect(result).toBeInstanceOf(DataSuccess);
      if (result instanceof DataSuccess) {
        expect(result.data).toBeInstanceOf(EducationClassificationModel);
        expect(result.data.id).toBe(10);
        expect(result.data.title).toBe(mockItem.title);
      }
    });
  });

  describe('create - create new item', () => {
    it('should return DataSuccess with created model', async () => {
      const mockItem = EducationClassificationTestFactory.createMockEducationClassificationJson({
        title: 'Basic Education',
      });
      const mockResponse =
        EducationClassificationTestFactory.createEducationClassificationApiResponse(mockItem);
      mockApiService.create.mockResolvedValue(mockResponse);

      const params = { title: 'Basic Education' };
      const result = await repository.create(params as any);

      expect(result).toBeInstanceOf(DataSuccess);
      if (result instanceof DataSuccess) {
        expect(result.data).toBeInstanceOf(EducationClassificationModel);
        expect(result.data.title).toBe('Basic Education');
      }
    });
  });

  describe('update - update existing item', () => {
    it('should return DataSuccess with updated model', async () => {
      const mockItem = EducationClassificationTestFactory.createMockEducationClassificationJson({
        id: 5,
        title: 'Updated Education',
      });
      const mockResponse =
        EducationClassificationTestFactory.createEducationClassificationApiResponse(mockItem);
      mockApiService.update.mockResolvedValue(mockResponse);

      const params = {
        toMap: () => ({ id: 5, title: 'Updated Education' }),
        validate: () => ({ isValid: true, errors: [] }),
        validateOrThrow: () => {},
      };
      const result = await repository.update(params as any);

      expect(result).toBeInstanceOf(DataSuccess);
      if (result instanceof DataSuccess) {
        expect(result.data).toBeInstanceOf(EducationClassificationModel);
        expect(result.data.title).toBe('Updated Education');
      }
    });
  });

  describe('delete - delete item', () => {
    it('should return DataSuccess on successful delete', async () => {
      const mockResponse = {
        data: { status: true, message: 'Deleted successfully' },
        statusCode: 200,
      };
      mockApiService.delete.mockResolvedValue(mockResponse);

      const params = {
        toMap: () => ({ id: 20 }),
        validate: () => ({ isValid: true, errors: [] }),
        validateOrThrow: () => {},
      };
      const result = await repository.delete(params as any);

      expect(result).toBeInstanceOf(DataSuccess);
    });
  });
});
