import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CountryRepository from './country.repository';
import CountryTestFactory from '../../__tests__/country.test-factory';
import { DataSuccess, DataEmpty, DataFailed } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import CountryModel from '../../core/models/country.model';
import { env } from '@/base/Core/Config';

describe('CountryRepository', () => {
  let repository: CountryRepository;
  let mockApiService: any;

  beforeEach(() => {
    repository = CountryRepository.getInstance();

    // Create a mock API service
    mockApiService = {
      index: vi.fn(),
      show: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    // Spy on the apiService getter to return our mock
    vi.spyOn(repository as any, 'apiService', 'get').mockReturnValue(mockApiService);

    // Disable static data to test actual repository-to-api-service interaction
    env.override({ useStaticData: false });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    env.reset(); // Reset environment changes
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = CountryRepository.getInstance();
      const instance2 = CountryRepository.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('index - fetch list', () => {
    it('should return DataSuccess with parsed country list', async () => {
      const mockCountries = CountryTestFactory.createMockCountryJsonList(3);
      const mockResponse = CountryTestFactory.createCountryListApiResponse(mockCountries);
      mockApiService.index.mockResolvedValue(mockResponse);

      const result = await repository.index();

      expect(result).toBeInstanceOf(DataSuccess);
      if (result instanceof DataSuccess) {
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data).toHaveLength(3);
        expect(result.data[0]).toBeInstanceOf(CountryModel);
        expect(result.data[0].title).toBe(mockCountries[0].title);
      }
    });

    it('should return DataEmpty when response contains no data', async () => {
      const mockResponse = {
        data: { data: null, status: true, message: 'No countries found' },
        statusCode: 200,
      };
      mockApiService.index.mockResolvedValue(mockResponse);

      const result = await repository.index();

      expect(result).toBeInstanceOf(DataEmpty);
    });

    it('should return DataFailed on API error', async () => {
      const errorResponse = CountryTestFactory.createErrorCountryResponse(
        'Failed to fetch countries',
        500,
      );
      mockApiService.index.mockResolvedValue(errorResponse);

      const result = await repository.index();

      expect(result).toBeInstanceOf(DataFailed);
    });
  });

  describe('show - fetch single item', () => {
    it('should return DataSuccess with parsed country', async () => {
      const mockCountry = CountryTestFactory.createMockCountryJson({ id: 10 });
      const mockResponse = CountryTestFactory.createCountryApiResponse(mockCountry);
      mockApiService.show.mockResolvedValue(mockResponse);

      const params = {
        toMap: () => ({ id: 10 }),
        validate: () => ({ isValid: true, errors: [] }),
        validateOrThrow: () => {},
      };
      const result = await repository.show(params as any);

      expect(result).toBeInstanceOf(DataSuccess);
      if (result instanceof DataSuccess) {
        expect(result.data).toBeInstanceOf(CountryModel);
        expect(result.data.id).toBe(10);
        expect(result.data.title).toBe(mockCountry.title);
      }
    });
  });

  describe('create - create new item', () => {
    it('should return DataSuccess with created country', async () => {
      const mockCountry = CountryTestFactory.createMockCountryJson({
        title: 'New Country',
        code: 'NC',
      });
      const mockResponse = CountryTestFactory.createCountryApiResponse(mockCountry);
      mockApiService.create.mockResolvedValue(mockResponse);

      const params = { title: 'New Country', code: 'NC', flag: '🏳️' };
      const result = await repository.create(params as any);

      expect(result).toBeInstanceOf(DataSuccess);
      if (result instanceof DataSuccess) {
        expect(result.data).toBeInstanceOf(CountryModel);
        expect(result.data.title).toBe('New Country');
      }
    });
  });

  describe('update - update existing item', () => {
    it('should return DataSuccess with updated country', async () => {
      const mockCountry = CountryTestFactory.createMockCountryJson({
        id: 5,
        title: 'Updated Country',
      });
      const mockResponse = CountryTestFactory.createCountryApiResponse(mockCountry);
      mockApiService.update.mockResolvedValue(mockResponse);

      const params = {
        toMap: () => ({
          id: 5,
          title: 'Updated Country',
        }),
        validate: () => ({ isValid: true, errors: [] }),
        validateOrThrow: () => {},
      };
      const result = await repository.update(params as any);

      expect(result).toBeInstanceOf(DataSuccess);
      if (result instanceof DataSuccess) {
        expect(result.data).toBeInstanceOf(CountryModel);
        expect(result.data.title).toBe('Updated Country');
      }
    });
  });

  describe('delete - delete item', () => {
    it('should return DataSuccess on successful delete', async () => {
      const mockResponse = {
        data: { status: true, message: 'Country deleted' },
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
