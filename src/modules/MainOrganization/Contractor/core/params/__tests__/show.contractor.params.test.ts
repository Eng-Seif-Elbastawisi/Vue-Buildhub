import { describe, expect, it } from 'vitest';
import ShowContractorParams from '../show.contractor.params';

describe('ShowContractorParams', () => {
  it('identifies the contractor requested for show', () => {
    expect(new ShowContractorParams(12).toMap()).toEqual({ contractor_id: 12 });
  });
});
