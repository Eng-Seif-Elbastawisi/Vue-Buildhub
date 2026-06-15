import type { ProjectTypeEnum } from '../constant/project.type.enum';

export default class ProjectModel {
  public readonly id?: number;
  public readonly title: string;
  public readonly projectType: ProjectTypeEnum;

  constructor(data: { id?: number; title: string; projectType: ProjectTypeEnum }) {
    this.id = data.id;
    this.title = data.title;
    this.projectType = data.projectType;
    Object.freeze(this);
  }

  static fromJson(json: Record<string, unknown>): ProjectModel {
    if (!json) throw new Error('Cannot create ProjectModel from null or undefined');

    return new ProjectModel({
      id: json.id as number | undefined,
      title: String(json.title ?? json.name ?? ''),
      projectType: (json.projectType ?? json.project_type) as ProjectTypeEnum,
    });
  }

  static example = new ProjectModel({ id: 1, title: 'Commercial project', projectType: 4 });
}
