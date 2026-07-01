import { describe, expect, it } from 'vitest';
import { ClientApiEndpoints } from '../client.api.endpoints';

describe('ClientApiEndpoints', () => {
  it('uses dashboard client endpoints', () => {
    const endpoints = new ClientApiEndpoints();

    expect(endpoints.index).toContain('organization/fetch_clients');
    expect(endpoints.store).toContain('organization/store_client');
    expect(endpoints.delete).toContain('organization/delete_client');
  });
});
