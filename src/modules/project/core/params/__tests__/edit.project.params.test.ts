import { describe, expect, it } from 'vitest';
import EditProjectParams from '../edit.project.params';
describe('EditProjectParams', () => {
  it('maps update data', () => {
    expect(new EditProjectParams({ projectId: 2, name: 'Mall', projectType: 4 }).toMap()).toEqual({
      project_id: 2,
      name: 'Mall',
      project_type: 4,
    });
  });
});
