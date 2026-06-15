import { describe, expect, it } from 'vitest';
import AddDepartmentParams from '../add.department.params';

describe('AddDepartmentParams', () => {
  it('serializes stage_id', () => {
    expect(new AddDepartmentParams({ title: 'Science', stageId: 2 }).toMap()).toEqual({
      title: 'Science',
      stage_id: 2,
    });
  });
});
