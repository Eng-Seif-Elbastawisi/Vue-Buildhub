import { describe, it, expect, beforeEach } from 'vitest';
import DeleteAccountsApiService from '../../../data/api/DeleteAccounts/delete.accounts.api-service';
import { DeleteAccountsEndpoints } from '../../../data/api/DeleteAccounts/delete.accounts.api.endpoints';

const endpoints = new DeleteAccountsEndpoints();

describe('DeleteAccountsApiService', () => {
  let service: DeleteAccountsApiService;

  beforeEach(() => {
    service = DeleteAccountsApiService.getInstance();
  });

  it('returns the same singleton instance', () => {
    const a = DeleteAccountsApiService.getInstance();
    const b = DeleteAccountsApiService.getInstance();
    expect(a).toBe(b);
  });

  it('has index endpoint configured', () => {
    const serviceEndpoints = (service as any).deleteAccountsEndpoints;
    expect(serviceEndpoints.index).toBe(endpoints.index);
  });

  it('index endpoint contains the correct path segment', () => {
    expect(endpoints.index).toContain('fetch_delete_accounts');
  });
});
