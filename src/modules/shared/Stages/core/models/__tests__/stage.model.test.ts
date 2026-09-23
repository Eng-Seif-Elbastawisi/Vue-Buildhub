import { describe, expect, it } from 'vitest';
import StageModel from '../stage.model';

describe('StageModel', () => {
  it('maps stages without the removed e_c_subject_id field', () => {
    const stage = StageModel.fromJson({
      id: 1,
      title: 'Preparation',
      e_c_subject_id: 99,
      children: [{ id: 2, title: 'Excavation' }],
    });

    expect(stage).toMatchObject({ id: 1, title: 'Preparation' });
    expect(stage.children[0]).toBeInstanceOf(StageModel);
    expect('e_c_subject_id' in stage).toBe(false);
  });

  it('maps the shared parent_id relationship for root and child stages', () => {
    expect(StageModel.fromJson({ id: 1, parent_id: null, children: [] }).parentId).toBeNull();
    expect(StageModel.fromJson({ id: 2, parent_id: '1', children: [] }).parentId).toBe(1);
  });
});
