import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import EducationStageRepository from './education.stages.repository';
import EducationStageModel from '@/modules/EducationClassification/core/models/EducationStage/education.stages.model';
import {
  DataSuccess,
  DataFailed,
  DataEmpty,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { env } from '@/base/Core/Config';

const makeStageJson = (overrides: Record<string, unknown> = {}) => ({
  stage_id: 1,
  stage_title: 'Primary',
  has_children: false,
  ...overrides,
});

const makeListResponse = (items: unknown[]) => ({
  data: { status: true, message: 'ok', data: items, meta: {} },
  statusCode: 200,
});

const makeItemResponse = (item: unknown) => ({
  data: { status: true, message: 'ok', data: item, meta: {} },
  statusCode: 200,
});

const makeErrorResponse = () => ({
  data: { status: false, message: 'Internal Server Error', data: null },
  statusCode: 500,
});

describe('EducationStageRepository', () => {
  let repository: EducationStageRepository;
  let mockApiService: any;

  beforeEach(() => {
    repository = EducationStageRepository.getInstance();

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
    it('returns the same instance each time', () => {
      const a = EducationStageRepository.getInstance();
      const b = EducationStageRepository.getInstance();
      expect(a).toBe(b);
    });
  });

  describe('index', () => {
    it('returns DataSuccess with a parsed list of EducationStageModel', async () => {
      const items = [makeStageJson({ stage_id: 1 }), makeStageJson({ stage_id: 2 })];
      mockApiService.index.mockResolvedValue(makeListResponse(items));

      const result = await repository.index();

      expect(result).toBeInstanceOf(DataSuccess);
      if (result instanceof DataSuccess) {
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data).toHaveLength(2);
        expect(result.data![0]).toBeInstanceOf(EducationStageModel);
        expect(result.data![0].stage_id).toBe(1);
        expect(result.data![1].stage_id).toBe(2);
      }
    });

    it('returns DataEmpty when data is null', async () => {
      mockApiService.index.mockResolvedValue({
        data: { status: true, message: 'ok', data: null, meta: {} },
        statusCode: 200,
      });

      const result = await repository.index();
      expect(result).toBeInstanceOf(DataEmpty);
    });

    it('returns DataFailed on API error', async () => {
      mockApiService.index.mockResolvedValue(makeErrorResponse());

      const result = await repository.index();
      expect(result).toBeInstanceOf(DataFailed);
    });
  });

  describe('create', () => {
    it('returns DataSuccess with the created EducationStageModel', async () => {
      const item = makeStageJson({ stage_id: 99, stage_title: 'New Stage' });
      mockApiService.create.mockResolvedValue(makeItemResponse(item));

      const params = {
        toMap: () => ({ title: 'New Stage', classification_id: 1 }),
        validate: () => ({ isValid: true, errors: [] }),
        validateOrThrow: () => {},
      };
      const result = await repository.create(params as any);

      expect(result).toBeInstanceOf(DataSuccess);
      if (result instanceof DataSuccess) {
        expect(result.data).toBeInstanceOf(EducationStageModel);
        expect(result.data!.stage_title).toBe('New Stage');
        expect(result.data!.stage_id).toBe(99);
      }
    });
  });

  describe('parseList', () => {
    it('silently skips null items in the list', async () => {
      const items = [makeStageJson({ stage_id: 1 }), null, makeStageJson({ stage_id: 3 })];
      mockApiService.index.mockResolvedValue(makeListResponse(items));

      const result = await repository.index();

      expect(result).toBeInstanceOf(DataSuccess);
      if (result instanceof DataSuccess) {
        expect(result.data).toHaveLength(2);
        expect(result.data![0].stage_id).toBe(1);
        expect(result.data![1].stage_id).toBe(3);
      }
    });
  });

  describe('config', () => {
    it('exposes hasPagination as true', () => {
      expect((repository as any).config.hasPagination).toBe(true);
    });

    it('exposes correct dataKey and paginationKey', () => {
      expect((repository as any).config.dataKey).toBe('data');
      expect((repository as any).config.paginationKey).toBe('meta');
    });
  });

  describe('mockItem / mockList', () => {
    it('mockItem returns EducationStageModel.example', () => {
      const mock = (repository as any).mockItem;
      expect(mock).toBeInstanceOf(EducationStageModel);
      expect(mock.stage_id).toBe(10);
    });

    it('mockList returns an array with EducationStageModel.example', () => {
      const list = (repository as any).mockList;
      expect(Array.isArray(list)).toBe(true);
      expect(list).toHaveLength(1);
      expect(list[0]).toBeInstanceOf(EducationStageModel);
    });
  });
});
