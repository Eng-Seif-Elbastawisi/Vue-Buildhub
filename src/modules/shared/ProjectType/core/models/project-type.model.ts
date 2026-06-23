import TranslationParams from '@/base/Core/Params/translationParams';
import type { ProjectType } from '../constant/project-type.enum';

export default class ProjectTypeModel {
  public readonly id?: number;
  public readonly title: string;
  public readonly projectType: ProjectType;
  public readonly translations?: TranslationParams;

  constructor(data: { id?: number; title: string; projectType: ProjectType,translations?:TranslationParams }) {
    this.id = data.id;
    this.title = data.title;
    this.projectType = data.projectType;
    this.translations = data.translations;
    Object.freeze(this);
  }

   static mapTranslations(translations: unknown, key: string = 'title'): Record<string, string> {
    if (!Array.isArray(translations)) {
      const value = translations as { title?: Record<string, string> } | undefined;
      return value?.title ?? (translations as Record<string, string>) ?? {};
    }

    return translations.reduce<Record<string, string>>((result, translation) => {
      const item = translation as Record<string, string>;
      if (item.locale && item[key]) result[item.locale] = item[key];
      return result;
    }, {});
  }

  static fromJson(json: Record<string, unknown>): ProjectTypeModel {
  if (!json) throw new Error('Cannot create ProjectTypeModel from null or undefined');

  return new ProjectTypeModel({
    id: json.id as number | undefined,
    title: String(json.title ?? json.name ?? ''),
    projectType: (json.projectType ?? json.project_type) as ProjectType,

    translations: new TranslationParams({
      title: ProjectTypeModel.mapTranslations(json.translations),
    }),
  });
}

static example = new ProjectTypeModel({
  id: 1,
  title: 'Commercial project',
  projectType: 4,
  translations: new TranslationParams({
    title: {
      ar: 'مشروع تجاري',
      en: 'Commercial project',
    },
  }),
});}
