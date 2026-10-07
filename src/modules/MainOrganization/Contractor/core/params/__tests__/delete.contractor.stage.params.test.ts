import { describe, expect, it } from 'vitest';
import DeleteContractorStageParams from '../delete.contractor.stage.params';

describe('DeleteContractorStageParams', () => {
  it('sends both relation IDs in the request body', () => {
    expect(new DeleteContractorStageParams(1, 152).toMap()).toEqual({
      contractor_id: 1,
      stage_id: 152,
    });
  });
});
