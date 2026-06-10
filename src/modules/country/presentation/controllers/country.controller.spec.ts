import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CountryController from './country.controller';
import CountryTestFactory from '../../__tests__/country.test-factory';
import {
  DataSuccess,
  //
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import AddCountryParams from '../../core/params/add.country.params';
import EditCountryParams from '../../core/params/edit.country.params';
//
import router from '@/router';

// Mock Pinia store to avoid "no active Pinia" error
vi.mock('@/stores/formsStore', () => ({
  useFormsStore: () => ({
    clearFormData: vi.fn(),
  }),
}));

// Mock router to avoid navigation side-effects
vi.mock('@/router', () => ({
  default: {
    push: vi.fn(),
  },
  push: vi.fn(),
}));

describe('CountryController', () => {
  let controller: CountryController;
  let mockRepository: any;

  beforeEach(() => {
    controller = CountryController.getInstance();

    // Create a mock repository
    mockRepository = {
      index: vi.fn(),
      show: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    // Spy on the repository getter to return our mock
    vi.spyOn(controller as any, 'repository', 'get').mockReturnValue(mockRepository);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = CountryController.getInstance();
      const instance2 = CountryController.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('create - create new country', () => {
    it('should call repository.create and redirect to Countries on success', async () => {
      const mockCountry = CountryTestFactory.createMockCountry({ id: 1 });
      const successState = new DataSuccess(mockCountry);
      const params = new AddCountryParams({ title: 'Egypt', code: 'EG', flag: '🇪🇬' });
      mockRepository.create.mockResolvedValue(successState);

      const result = await controller.create(params);

      expect(mockRepository.create).toHaveBeenCalled();
      expect(router.push).toHaveBeenCalledWith({ name: 'Countries' });
      expect(result).toBe(successState);
    });
  });

  describe('update - update existing country', () => {
    it('should call repository.update and redirect to Countries on success', async () => {
      const mockCountry = CountryTestFactory.createMockCountry({ id: 5 });
      const successState = new DataSuccess(mockCountry);
      const params = new EditCountryParams(5, 'Egypt', 'EG', '🇪🇬');
      mockRepository.update.mockResolvedValue(successState);

      const result = await controller.update(params);

      expect(mockRepository.update).toHaveBeenCalled();
      expect(router.push).toHaveBeenCalledWith({ name: 'Countries' });
      expect(result).toBe(successState);
    });
  });

  describe('fetchList - fetch all countries', () => {
    it('should call repository.index and return result', async () => {
      const mockCountries = CountryTestFactory.createMockCountryList(3);
      const successState = new DataSuccess(mockCountries);
      mockRepository.index.mockResolvedValue(successState);

      const result = await controller.fetchList();

      expect(mockRepository.index).toHaveBeenCalled();
      expect(result).toBe(successState);
    });
  });
});
