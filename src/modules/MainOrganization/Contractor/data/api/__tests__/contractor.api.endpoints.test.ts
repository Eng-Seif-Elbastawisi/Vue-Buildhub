import { describe, expect, it } from 'vitest';
import { ContractorApiEndpoints } from '../contractor.api.endpoints';

describe('ContractorApiEndpoints', () => {
  it('uses the existing organization contractor endpoints', () => {
    const endpoints = new ContractorApiEndpoints();
    expect([
      endpoints.index,
      endpoints.store,
      endpoints.update,
      endpoints.show,
      endpoints.delete,
    ]).toEqual(
      [
        'fetch_contractors',
        'store_contractor',
        'update_contractor',
        'show_contractor',
        'delete_contractor',
      ].map((path) => expect.stringContaining(`/organization/${path}`)),
    );
  });
});
