import { describe, expect, it } from 'vitest';
import AddContractorParams from '../add.contractor.params';

describe('AddContractorParams', () => {
  it('sends only a trimmed name and stage IDs', () => {
    const params = new AddContractorParams('  Builder  ', [1, 4, 7]);
    expect(params.toMap()).toEqual({ name: 'Builder', stage_ids: [1, 4, 7] });
    expect(params.validate().isValid).toBe(true);
  });

  it('requires a name and selected stages', () => {
    expect(new AddContractorParams('', []).validate().isValid).toBe(false);
  });
});
