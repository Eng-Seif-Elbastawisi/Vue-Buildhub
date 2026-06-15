import { describe, expect, it } from 'vitest';
import DeleteProjectParams from '../delete.project.params';
describe('DeleteProjectParams', () => {
  it('maps project id', () => {
    expect(new DeleteProjectParams({ projectId: 2 }).toMap()).toEqual({ project_id: 2 });
  });
});
