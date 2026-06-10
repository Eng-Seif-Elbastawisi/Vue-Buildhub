import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import TermsConditionsRepository from './terms-conditions.repository';

describe('TermsConditionsRepository', () => {
  let repository: TermsConditionsRepository;
  let mockApiService: any;

  beforeEach(() => {
    repository = TermsConditionsRepository.getInstance();

    mockApiService = {
      index: vi.fn(),
      show: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    vi.spyOn(repository as any, 'apiService', 'get').mockReturnValue(mockApiService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the same singleton instance', () => {
    const a = TermsConditionsRepository.getInstance();
    const b = TermsConditionsRepository.getInstance();
    expect(a).toBe(b);
  });
});
