import { describe, expect, it } from 'vitest';
import DeleteContractorParams from '../delete.contractor.params';

describe('DeleteContractorParams', () => {
  it('identifies the contractor requested for deletion', () => {
    expect(new DeleteContractorParams(12).toMap()).toEqual({ contractor_id: 12 });
  });
});
