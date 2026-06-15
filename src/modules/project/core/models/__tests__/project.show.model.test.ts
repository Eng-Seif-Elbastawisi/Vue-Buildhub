import { describe, expect, it } from 'vitest';
import ProjectShowModel from '../project.show.model';
describe('ProjectShowModel', () => {
  it('maps project details', () => {
    expect(ProjectShowModel.fromJson({ id: 3, title: 'Factory', projectType: 5 })).toMatchObject({
      id: 3,
      title: 'Factory',
      projectType: 5,
    });
  });
});
