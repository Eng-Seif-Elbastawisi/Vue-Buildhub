import { describe, expect, it } from 'vitest';
import EditDepartmentParams from '../edit.department.params';

describe('EditDepartmentParams', () => {
  it('serializes id and stage_id', () => {
    expect(new EditDepartmentParams({ id: 5, title: 'Science', stageId: 2 }).toMap()).toEqual({
      id: 5,
      title: 'Science',
      stage_id: 2,
    });
  });
});
