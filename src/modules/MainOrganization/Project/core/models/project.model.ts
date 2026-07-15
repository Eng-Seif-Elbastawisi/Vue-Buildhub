import TitleModel from '@/base/Core/Models/titleModel';
import TranslationParams from '@/base/Core/Params/translationParams';

export default class ProjectModel {
  public readonly id?: number;
  public readonly title?: string;
  public readonly translations?: TranslationParams;
  public readonly createdAt?: string;
  public readonly projectType?: TitleModel;

  constructor(data: {
    id?: number;
    title?: string;
    translations?: TranslationParams;
    createdAt?: string;
    projectType?: TitleModel;
  }) {
    this.id = data.id;
    this.title = data.title;
    this.translations = data.translations;
    this.createdAt = data.createdAt;
    this.projectType = data.projectType;

    Object.freeze(this);
  }

  static mapTranslations(translations: unknown, key: string = 'title'): Record<string, string> {
    if (!translations) return {};

    if (!Array.isArray(translations)) {
      const value = translations as { title?: Record<string, string> };

      return value?.title ?? (translations as Record<string, string>) ?? {};
    }

    return translations.reduce<Record<string, string>>((result, translation) => {
      const item = translation as Record<string, string>;

      if (item.locale && item[key]) {
        result[item.locale] = item[key];
      }

      return result;
    }, {});
  }

  static fromJson(json: Record<string, unknown>): ProjectModel {
    if (!json) {
      throw new Error('Cannot create ProjectModel from null or undefined');
    }

    return new ProjectModel({
      id: json.id as number | undefined,
      title: json.title as string | undefined,

      translations: new TranslationParams({
        title: ProjectModel.mapTranslations(json.translations),
      }),
      createdAt: json.created_at as string | undefined,
      projectType: TitleModel.fromMap(json.project_type),
    });
  }

  static example = new ProjectModel({
    id: 1,
    title: 'Commercial project',
    translations: new TranslationParams({
      title: {
        ar: 'مشروع تجاري',
        en: 'Commercial project',
      },
    }),
  });
}
