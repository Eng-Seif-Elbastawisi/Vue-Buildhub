import { describe, expect, it } from 'vitest';
import { ClientApiEndpoints } from '../client.api.endpoints';

describe('ClientApiEndpoints', () => {
  it('uses dashboard client endpoints', () => {
    const endpoints = new ClientApiEndpoints();

    expect(endpoints.index).toContain('dashboard/fetch_client');
    expect(endpoints.store).toContain('dashboard/add_client');
    expect(endpoints.delete).toContain('dashboard/delete_client');
  });
});
