import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PrivacyRepository from './privacy.repository';

describe('PrivacyRepository', () => {
  let repository: PrivacyRepository;
  let mockApiService: any;

  beforeEach(() => {
    repository = PrivacyRepository.getInstance();

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
    const a = PrivacyRepository.getInstance();
    const b = PrivacyRepository.getInstance();
    expect(a).toBe(b);
  });
});
