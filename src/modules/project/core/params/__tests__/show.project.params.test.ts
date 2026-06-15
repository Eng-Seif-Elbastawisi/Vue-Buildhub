import { describe, expect, it } from 'vitest';
import ShowProjectParams from '../show.project.params';
describe('ShowProjectParams', () => {
  it('maps project id', () => {
    expect(new ShowProjectParams({ projectId: 2 }).toMap()).toEqual({ project_id: 2 });
  });
});
