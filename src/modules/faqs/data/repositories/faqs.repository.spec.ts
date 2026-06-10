import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import FaqsRepository from './faqs.repository';

describe('FaqsRepository', () => {
  let repository: FaqsRepository;
  let mockApiService: Record<string, unknown>;

  beforeEach(() => {
    repository = FaqsRepository.getInstance();

    mockApiService = {
      index: vi.fn(),
      show: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    // @ts-expect-error - apiService is protected
    vi.spyOn(repository, 'apiService', 'get').mockReturnValue(mockApiService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the same singleton instance', () => {
    const a = FaqsRepository.getInstance();
    const b = FaqsRepository.getInstance();
    expect(a).toBe(b);
  });
});
