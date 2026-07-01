import { describe, expect, it } from 'vitest';
import EditProjectTypeParams from '../edit.project-type.params';

describe('EditProjectTypeParams', () => {
  it('maps update data', () => {
    expect(
      new EditProjectTypeParams({ projectId: 2, name: 'Mall', projectType: 4 }).toMap(),
    ).toEqual({
      project_type_id: 2,
      name: 'Mall',
      project_type: 4,
      translations: undefined,
    });
  });
});
