import type { ProjectType } from '../constant/project-type.enum';

export default class ProjectTypeModel {
  public readonly id?: number;
  public readonly title: string;
  public readonly projectType: ProjectType;

  constructor(data: { id?: number; title: string; projectType: ProjectType }) {
    this.id = data.id;
    this.title = data.title;
    this.projectType = data.projectType;
    Object.freeze(this);
  }

  static fromJson(json: Record<string, unknown>): ProjectTypeModel {
    if (!json) throw new Error('Cannot create ProjectTypeModel from null or undefined');

    return new ProjectTypeModel({
      id: json.id as number | undefined,
      title: String(json.title ?? json.name ?? ''),
      projectType: (json.projectType ?? json.project_type) as ProjectType,
    });
  }

  static example = new ProjectTypeModel({ id: 1, title: 'Commercial project', projectType: 4 });
}
