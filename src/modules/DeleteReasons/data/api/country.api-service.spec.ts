import { describe, it, expect, beforeEach } from 'vitest';
import DeleteResasonsApiService from './delete.resons.api-service';
import { DeleteReasonsEndpoints } from './delete.reasons.api.endpoints';

const endpoints = new DeleteReasonsEndpoints();

describe('DeleteResasonsApiService', () => {
  let service: DeleteResasonsApiService;

  beforeEach(() => {
    service = DeleteResasonsApiService.getInstance();
  });

  it('returns the same singleton instance', () => {
    const a = DeleteResasonsApiService.getInstance();
    const b = DeleteResasonsApiService.getInstance();
    expect(a).toBe(b);
  });

  it('has index endpoint configured', () => {
    const serviceEndpoints = (service as any).deleteReasonsEndpoints;
    expect(serviceEndpoints.index).toBe(endpoints.index);
  });

  it('has create endpoint configured', () => {
    const serviceEndpoints = (service as any).deleteReasonsEndpoints;
    expect(serviceEndpoints.create).toBe(endpoints.create);
  });

  it('has edit endpoint configured', () => {
    const serviceEndpoints = (service as any).deleteReasonsEndpoints;
    expect(serviceEndpoints.edit).toBe(endpoints.edit);
  });

  it('has show endpoint configured', () => {
    const serviceEndpoints = (service as any).deleteReasonsEndpoints;
    expect(serviceEndpoints.show).toBe(endpoints.show);
  });

  it('has delete endpoint configured', () => {
    const serviceEndpoints = (service as any).deleteReasonsEndpoints;
    expect(serviceEndpoints.delete).toBe(endpoints.delete);
  });
});
