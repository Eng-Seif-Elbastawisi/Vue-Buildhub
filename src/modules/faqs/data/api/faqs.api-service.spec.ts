import { describe, it, expect, beforeEach } from 'vitest';
import FaqsApiService from './faqs.api-service';
import { FaqsEndpoints } from './faqs.api.endpoints';

const endpoints = new FaqsEndpoints();

describe('FaqsApiService', () => {
  let service: FaqsApiService;

  beforeEach(() => {
    service = FaqsApiService.getInstance();
  });

  it('returns the same singleton instance', () => {
    const a = FaqsApiService.getInstance();
    const b = FaqsApiService.getInstance();
    expect(a).toBe(b);
  });

  it('has index endpoint configured', () => {
    const ep = (service as any).faqsEndpoints;
    expect(ep.index).toBe(endpoints.index);
  });

  it('has store endpoint configured', () => {
    const ep = (service as any).faqsEndpoints;
    expect(ep.store).toBe(endpoints.store);
  });

  it('has update endpoint configured', () => {
    const ep = (service as any).faqsEndpoints;
    expect(ep.update).toBe(endpoints.update);
  });

  it('has delete endpoint configured', () => {
    const ep = (service as any).faqsEndpoints;
    expect(ep.delete).toBe(endpoints.delete);
  });
});
