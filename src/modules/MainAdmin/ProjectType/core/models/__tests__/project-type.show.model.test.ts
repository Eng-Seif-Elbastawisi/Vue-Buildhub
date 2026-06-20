import { describe, expect, it } from 'vitest';
import ProjectTypeShowModel from '../project-type.show.model';
describe('ProjectTypeShowModel', () => {
  it('maps project details', () => {
    expect(
      ProjectTypeShowModel.fromJson({ id: 3, title: 'Factory', projectType: 5 }),
    ).toMatchObject({
      id: 3,
      title: 'Factory',
      projectType: 5,
    });
  });
});
