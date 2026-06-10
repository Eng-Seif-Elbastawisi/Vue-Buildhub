import { describe, it, expect, beforeEach } from 'vitest';
import EducationClassificationApiService from './educationClassification.api-service';
import { EducationClassificationEndpoints } from './educationClassification.api.endpoints';

const endpoints = new EducationClassificationEndpoints();

describe('EducationClassificationApiService', () => {
  let service: EducationClassificationApiService;

  beforeEach(() => {
    service = EducationClassificationApiService.getInstance();
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = EducationClassificationApiService.getInstance();
      const instance2 = EducationClassificationApiService.getInstance();

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
