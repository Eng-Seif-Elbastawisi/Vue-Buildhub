import { describe, expect, it } from 'vitest';
import ShowProjectTypeParams from '../show.project-type.params';
describe('ShowProjectTypeParams', () => {
  it('maps project id', () => {
    expect(new ShowProjectTypeParams({ projectId: 2 }).toMap()).toEqual({ project_id: 2 });
  });
});
