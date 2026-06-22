import { describe, it, expect, beforeEach } from 'vitest';
import CountryApiService from './country.api-service';
import { CountryEndpoints } from './country.api.endpoints';

const endpoints = new CountryEndpoints();

describe('CountryApiService', () => {
  let service: CountryApiService;

  beforeEach(() => {
    service = CountryApiService.getInstance();
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = CountryApiService.getInstance();
      const instance2 = CountryApiService.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('endpoints configuration', () => {
    it('should have index endpoint', () => {
      const serviceEndpoints = (service as any).endpoints;
      expect(serviceEndpoints.index).toBe(endpoints.index);
    });

    it('should have show endpoint', () => {
      const serviceEndpoints = (service as any).endpoints;
      expect(serviceEndpoints.show).toBe(endpoints.show);
    });

    it('should have create endpoint (mapped from store)', () => {
      const serviceEndpoints = (service as any).endpoints;
      expect(serviceEndpoints.create).toBe(endpoints.store);
    });

    it('should have update endpoint', () => {
      const serviceEndpoints = (service as any).endpoints;
      expect(serviceEndpoints.update).toBe(endpoints.update);
    });

    it('should have delete endpoint', () => {
      const serviceEndpoints = (service as any).endpoints;
      expect(serviceEndpoints.delete).toBe(endpoints.delete);
    });
  });
});
