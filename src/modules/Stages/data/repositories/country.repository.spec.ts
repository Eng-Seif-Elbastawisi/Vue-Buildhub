import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import StageRepository from './stage.repository';

describe('StageRepository', () => {
  let repository: StageRepository;
  let mockApiService: any;

  beforeEach(() => {
    repository = StageRepository.getInstance();

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
    const a = StageRepository.getInstance();
    const b = StageRepository.getInstance();
    expect(a).toBe(b);
  });
});
