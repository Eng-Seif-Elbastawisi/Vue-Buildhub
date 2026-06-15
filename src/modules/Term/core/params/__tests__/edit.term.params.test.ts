import { describe, expect, it } from 'vitest';
import EditTermParams from '../edit.term.params';

describe('EditTermParams', () => {
  it('serializes id and department_id', () => {
    expect(new EditTermParams({ id: 5, title: 'First Term', departmentId: 2 }).toMap()).toEqual({
      id: 5,
      title: 'First Term',
      department_id: 2,
    });
  });
});
