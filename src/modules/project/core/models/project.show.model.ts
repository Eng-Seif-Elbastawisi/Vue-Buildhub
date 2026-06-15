import type { ProjectTypeEnum } from '../constant/project.type.enum';
import ProjectModel from './project.model';

export default class ProjectShowModel extends ProjectModel {
  constructor(data: { id?: number; title: string; projectType: ProjectTypeEnum }) {
    super(data);
  }

  static fromJson(json: Record<string, unknown>): ProjectShowModel {
    const project = ProjectModel.fromJson(json);
    return new ProjectShowModel(project);
  }

  static example = new ProjectShowModel({ id: 1, title: 'Commercial project', projectType: 4 });
}
