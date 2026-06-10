import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import DeleteAccountsRepository from '../../../data/repositories/DeleteAccounts/delete.accounts.repository';

describe('DeleteAccountsRepository', () => {
  let repository: DeleteAccountsRepository;
  let mockApiService: any;

  beforeEach(() => {
    repository = DeleteAccountsRepository.getInstance();

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
    const a = DeleteAccountsRepository.getInstance();
    const b = DeleteAccountsRepository.getInstance();
    expect(a).toBe(b);
  });
});
