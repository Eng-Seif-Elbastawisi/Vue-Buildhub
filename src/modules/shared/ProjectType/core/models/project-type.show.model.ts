import type { ProjectType } from '../constant/project-type.enum';
import ProjectTypeModel from './project-type.model';
import TranslationParams from '@/base/Core/Params/translationParams';

export default class ProjectTypeShowModel extends ProjectTypeModel {
  constructor(data: {
    id?: number;
    title: string;
    projectType: ProjectType;
    translations?: TranslationParams;
  }) {
    super(data);
  }

  static fromJson(json: Record<string, unknown>): ProjectTypeShowModel {
    const project = ProjectTypeModel.fromJson(json);
    return new ProjectTypeShowModel({
      id: project.id,
      title: project.title,
      projectType: project.projectType,
      translations: new TranslationParams({
        title: ProjectTypeModel.mapTranslations(json.title),
      }),
    });
  }

  static example = new ProjectTypeShowModel({
    id: 1,
    title: 'Commercial project',
    projectType: 4,
    translations: new TranslationParams({
      title: {
        ar: 'مشروع تجاري',
        en: 'Commercial project',
      },
    }),
  });
}
