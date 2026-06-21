import { describe, expect, it } from 'vitest';
import DeleteProjectTypeParams from '../delete.project-type.params';
describe('DeleteProjectTypeParams', () => {
  it('maps project id', () => {
    expect(new DeleteProjectTypeParams({ projectId: 2 }).toMap()).toEqual({ project_id: 2 });
  });
});
