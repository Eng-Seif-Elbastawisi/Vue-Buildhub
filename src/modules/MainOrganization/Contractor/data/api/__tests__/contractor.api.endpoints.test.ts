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
      endpoints.deleteStage,
    ]).toEqual(
      [
        'fetch_contractors',
        'store_contractor',
        'update_contractor',
        'show_contractor',
        'delete_contractor',
        'delete_contractor_stage',
      ].map((path) => expect.stringContaining(`/organization/${path}`)),
    );
  });
});
