import { describe, expect, it } from 'vitest';
import AddTermParams from '../add.term.params';

describe('AddTermParams', () => {
  it('serializes department_id', () => {
    expect(new AddTermParams({ title: 'First Term', departmentId: 2 }).toMap()).toEqual({
      title: 'First Term',
      department_id: 2,
    });
  });
});
