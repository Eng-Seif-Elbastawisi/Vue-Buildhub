import { describe, expect, it } from 'vitest';
import IndexDepartmentParams from '../index.department.params';

describe('IndexDepartmentParams', () => {
  it('serializes pagination and search values', () => {
    expect(new IndexDepartmentParams('science', 2, 20).toMap()).toMatchObject({
      word: 'science',
      page: 2,
      per_page: 20,
    });
  });
});
