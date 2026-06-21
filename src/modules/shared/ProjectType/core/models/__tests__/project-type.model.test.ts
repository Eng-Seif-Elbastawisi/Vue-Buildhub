import { describe, expect, it } from 'vitest';
import ProjectTypeModel from '../project-type.model';
describe('ProjectTypeModel', () => {
  it('maps snake-case API data', () => {
    expect(ProjectTypeModel.fromJson({ id: 2, name: 'Mall', project_type: 4 })).toMatchObject({
      id: 2,
      title: 'Mall',
      projectType: 4,
    });
  });
});
