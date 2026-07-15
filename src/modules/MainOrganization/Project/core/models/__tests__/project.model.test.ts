import { describe, expect, it } from 'vitest';
import TitleModel from '@/base/Core/Models/titleModel';
import ProjectModel from '../project.model';

describe('ProjectModel project type mapping', () => {
  it('maps a valid project type object from the project list response', () => {
    const project = ProjectModel.fromJson({
      id: 10,
      title: 'Office renovation',
      project_type: { id: 4, title: 'Commercial' },
    });

    expect(project.projectType).toBeInstanceOf(TitleModel);
    expect(project.projectType).toMatchObject({ id: 4, title: 'Commercial' });
  });

  it.each([
    ['missing value', {}],
    ['null value', { project_type: null }],
    ['empty object', { project_type: {} }],
    ['malformed value', { project_type: 'commercial' }],
  ])('leaves project type undefined for a %s', (_scenario, payload) => {
    expect(ProjectModel.fromJson(payload).projectType).toBeUndefined();
  });
});
