import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import DeleteReasonesRepository from './delete.reasons.repository';

describe('DeleteReasonesRepository', () => {
  let repository: DeleteReasonesRepository;
  let mockApiService: any;

  beforeEach(() => {
    repository = DeleteReasonesRepository.getInstance();

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
    const a = DeleteReasonesRepository.getInstance();
    const b = DeleteReasonesRepository.getInstance();
    expect(a).toBe(b);
  });
});
