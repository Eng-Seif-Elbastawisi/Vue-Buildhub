import { describe, expect, it } from 'vitest';
import ProjectModel from '../project.model';
describe('ProjectModel', () => {
  it('maps snake-case API data', () => {
    expect(ProjectModel.fromJson({ id: 2, name: 'Mall', project_type: 4 })).toMatchObject({
      id: 2,
      title: 'Mall',
      projectType: 4,
    });
  });
});
