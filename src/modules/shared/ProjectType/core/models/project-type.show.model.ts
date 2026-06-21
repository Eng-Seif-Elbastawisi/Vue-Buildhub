import type { ProjectType } from '../constant/project-type.enum';
import ProjectTypeModel from './project-type.model';

export default class ProjectTypeShowModel extends ProjectTypeModel {
  constructor(data: { id?: number; title: string; projectType: ProjectType }) {
    super(data);
  }

  static fromJson(json: Record<string, unknown>): ProjectTypeShowModel {
    const project = ProjectTypeModel.fromJson(json);
    return new ProjectTypeShowModel(project);
  }

  static example = new ProjectTypeShowModel({ id: 1, title: 'Commercial project', projectType: 4 });
}
