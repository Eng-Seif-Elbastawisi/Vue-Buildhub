import { describe, it, expect, beforeEach } from 'vitest';
import PrivacyApiService from './privacy.api-service';
import { PrivacyEndpoints } from './privacy.api.endpoints';

const endpoints = new PrivacyEndpoints();

describe('PrivacyApiService', () => {
  let service: PrivacyApiService;

  beforeEach(() => {
    service = PrivacyApiService.getInstance();
  });

  it('returns the same singleton instance', () => {
    const a = PrivacyApiService.getInstance();
    const b = PrivacyApiService.getInstance();
    expect(a).toBe(b);
  });

  it('has index endpoint configured', () => {
    const ep = (service as any).privacyEndpoints;
    expect(ep.index).toBe(endpoints.index);
  });

  it('has store endpoint configured', () => {
    const ep = (service as any).privacyEndpoints;
    expect(ep.store).toBe(endpoints.store);
  });

  it('has update endpoint configured', () => {
    const ep = (service as any).privacyEndpoints;
    expect(ep.update).toBe(endpoints.update);
  });

  it('has delete endpoint configured', () => {
    const ep = (service as any).privacyEndpoints;
    expect(ep.delete).toBe(endpoints.delete);
  });
});
