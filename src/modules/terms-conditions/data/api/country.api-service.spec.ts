import { describe, it, expect, beforeEach } from 'vitest';
import TermsConditionsApiService from './terms-conditions.api-service';
import { TermsConditionsEndpoints } from './terms-conditions.api.endpoints';

const endpoints = new TermsConditionsEndpoints();

describe('TermsConditionsApiService', () => {
  let service: TermsConditionsApiService;

  beforeEach(() => {
    service = TermsConditionsApiService.getInstance();
  });

  it('returns the same singleton instance', () => {
    const a = TermsConditionsApiService.getInstance();
    const b = TermsConditionsApiService.getInstance();
    expect(a).toBe(b);
  });

  it('has index endpoint configured', () => {
    const ep = (service as any).termsConditionsEndpoints;
    expect(ep.index).toBe(endpoints.index);
  });

  it('has store endpoint configured', () => {
    const ep = (service as any).termsConditionsEndpoints;
    expect(ep.store).toBe(endpoints.store);
  });

  it('has update endpoint configured', () => {
    const ep = (service as any).termsConditionsEndpoints;
    expect(ep.update).toBe(endpoints.update);
  });

  it('has delete endpoint configured', () => {
    const ep = (service as any).termsConditionsEndpoints;
    expect(ep.delete).toBe(endpoints.delete);
  });
});
