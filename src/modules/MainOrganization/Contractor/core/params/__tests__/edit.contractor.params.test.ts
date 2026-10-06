import { describe, expect, it } from 'vitest';
import EditContractorParams from '../edit.contractor.params';

describe('EditContractorParams', () => {
  it('puts the contractor ID in the update body with name and stage IDs', () => {
    const params = new EditContractorParams(9, 'Builder', [1, 4]);
    expect(params.toMap()).toEqual({ id: 9, name: 'Builder', stage_ids: [1, 4] });
  });
});
