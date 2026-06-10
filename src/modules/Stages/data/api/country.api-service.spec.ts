import { describe, it, expect, beforeEach } from 'vitest';
import StageApiService from './stage.api-service';
import { StageEndpoints } from './stage.api.endpoints';

const endpoints = new StageEndpoints();

describe('StageApiService', () => {
  let service: StageApiService;

  beforeEach(() => {
    service = StageApiService.getInstance();
  });

  it('returns the same singleton instance', () => {
    const a = StageApiService.getInstance();
    const b = StageApiService.getInstance();
    expect(a).toBe(b);
  });

  it('has index endpoint configured', () => {
    const serviceEndpoints = (service as any).stageEndpoints;
    expect(serviceEndpoints.index).toBe(endpoints.index);
  });

  it('has store endpoint configured', () => {
    const serviceEndpoints = (service as any).stageEndpoints;
    expect(serviceEndpoints.store).toBe(endpoints.store);
  });

  it('has update endpoint configured', () => {
    const serviceEndpoints = (service as any).stageEndpoints;
    expect(serviceEndpoints.update).toBe(endpoints.update);
  });

  it('has delete endpoint configured', () => {
    const serviceEndpoints = (service as any).stageEndpoints;
    expect(serviceEndpoints.delete).toBe(endpoints.delete);
  });
});
