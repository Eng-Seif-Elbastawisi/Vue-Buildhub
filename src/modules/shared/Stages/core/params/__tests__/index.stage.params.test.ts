import { describe, expect, it } from 'vitest';
import IndexStageParams from '../index.stage.params';

describe('IndexStageParams', () => {
  it('maps the selected department to the stage list filter', () => {
    const params = new IndexStageParams({
      perPage: 100,
      withPage: 0,
      departmentId: 11,
    });

    expect(params.toMap()).toEqual({
      with_pagination: 0,
      page: 1,
      per_page: 100,
      department_id: 11,
    });
  });
});
