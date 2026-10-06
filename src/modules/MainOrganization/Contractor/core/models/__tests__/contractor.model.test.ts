import { describe, expect, it } from 'vitest';
import ContractorModel from '../contractor.model';

describe('ContractorModel', () => {
  it('reads selected stage IDs and stage details from show data', () => {
    const contractor = ContractorModel.fromJson({
      id: 9,
      name: 'Builder',
      stage_ids: [1, 4],
      stages: [{ id: 1, title: 'Design', parent_id: null }],
    });

    expect(contractor.stageIds).toEqual([1, 4]);
    expect(contractor.stages[0]?.title).toBe('Design');
  });

  it('uses stage relations when stage_ids is absent', () => {
    expect(
      ContractorModel.fromJson({
        id: 9,
        name: 'Builder',
        stages: [{ id: 4, title: 'Build', parent_id: null }],
      }).stageIds,
    ).toEqual([4]);
  });
});
