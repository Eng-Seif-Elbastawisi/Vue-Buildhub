import { describe, expect, it } from 'vitest';
import IndexLaborParams from '../index.labor.params';

describe('IndexLaborParams', () => {
  it('includes the optional active filter in list requests', () => {
    const params = new IndexLaborParams({
      word: 'paint',
      pageNumber: 2,
      perPage: 25,
      withPage: 1,
      active: 1,
    });

    expect(params.toMap()).toMatchObject({
      word: 'paint',
      page: 2,
      per_page: 25,
      active: 1,
    });
  });

  it('omits the active filter when it is not selected', () => {
    expect(new IndexLaborParams().toMap()).not.toHaveProperty('active');
  });
});
