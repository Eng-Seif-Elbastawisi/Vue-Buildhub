import TranslationParams from '@/base/Core/Params/translationParams';
import ProjectModel from './project.model';

export type ProjectPreviewSelectItem = {
  id: number;
  title: string;
};

export default class ProjectPreviewModel {
  public readonly id?: number;
  public readonly title?: string;
  public readonly translations?: TranslationParams;

  public readonly project_id?: number;
  public readonly project_preview_id?: number;

  public readonly engineer?: ProjectPreviewSelectItem | null;
  public readonly engineer_id?: number;

  public readonly project?: ProjectPreviewSelectItem | null;

  public readonly preview_date?: string;
  public readonly preview_time?: string;
  public readonly site_link?: string;
  public readonly address?: string | null;

  public readonly status?: number | null;
  public readonly notification_type?: number | null;
  public readonly notification_message?: string | null;
  public readonly pricing_responsible?: ProjectPreviewSelectItem | null;
  public readonly pricing_responsible_id?: number;

  constructor(data: {
    id?: number;
    title?: string;
    translations?: TranslationParams;

    project_id?: number;
    project_preview_id?: number;

    engineer?: ProjectPreviewSelectItem | null;
    engineer_id?: number;

    project?: ProjectPreviewSelectItem | null;

    preview_date?: string;
    preview_time?: string;
    site_link?: string;
    address?: string | null;

    status?: number | null;
    notification_type?: number | null;
    notification_message?: string | null;
    pricing_responsible?: ProjectPreviewSelectItem | null;
    pricing_responsible_id?: number;
  }) {
    this.id = data.id;
    this.title = data.title;
    this.translations = data.translations;

    this.project_id = data.project_id;
    this.project_preview_id = data.project_preview_id;

    this.engineer = data.engineer;
    this.engineer_id = data.engineer_id;

    this.project = data.project;

    this.preview_date = data.preview_date;
    this.preview_time = data.preview_time;
    this.site_link = data.site_link;
    this.address = data.address;

    this.status = data.status;
    this.notification_type = data.notification_type;
    this.notification_message = data.notification_message;
    this.pricing_responsible = data.pricing_responsible;
    this.pricing_responsible_id = data.pricing_responsible_id;

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

  static getPlainTitle(value: unknown): string {
    if (!value) return '';

    if (typeof value === 'string') {
      return value;
    }

    if (Array.isArray(value)) {
      const enTitle = value.find((item) => item?.locale === 'en')?.title;
      const arTitle = value.find((item) => item?.locale === 'ar')?.title;
      const firstTitle = value[0]?.title;

      return enTitle || arTitle || firstTitle || '';
    }

    return '';
  }

  static mapSelectItem(item: any): ProjectPreviewSelectItem | null {
    if (!item) return null;

    return {
      id: Number(item.id),
      title: item.name || ProjectPreviewModel.getPlainTitle(item.title) || `#${item.id}`,
    };
  }

  static fromJson(json: Record<string, unknown>): ProjectPreviewModel {
    if (!json) {
      throw new Error('Cannot create ProjectPreviewModel from null or undefined');
    }

    const project = ProjectPreviewModel.mapSelectItem(json.project);
    const engineer = ProjectPreviewModel.mapSelectItem(json.engineer);
    const pricingResponsible = ProjectPreviewModel.mapSelectItem(json.pricing_responsible);

    return new ProjectPreviewModel({
      id: json.id as number | undefined,
      project_preview_id: json.id as number | undefined,

      project,
      project_id: project?.id,

      engineer,
      engineer_id: engineer?.id,

      title:
        ProjectPreviewModel.getPlainTitle((json.project as any)?.title) ||
        ProjectPreviewModel.getPlainTitle(json.title) ||
        `#${json.id}`,

      translations: new TranslationParams({
        title: ProjectModel.mapTranslations(
          (json.project as any)?.translations ?? json.translations,
        ),
      }),

      preview_date: json.preview_date as string | undefined,
      preview_time: json.preview_time as string | undefined,
      site_link: json.site_link as string | undefined,
      address: json.address as string | null | undefined,

      status: json.status as number | null | undefined,
      notification_type: json.notification_type as number | null | undefined,
      notification_message: json.notification_message as string | null | undefined,

      pricing_responsible: pricingResponsible,
      pricing_responsible_id: pricingResponsible?.id,
    });
  }

  static example = new ProjectPreviewModel({
    id: 1,
    project_preview_id: 1,

    project_id: 10,
    project: {
      id: 10,
      title: 'Commercial project',
    },

    engineer_id: 15,
    engineer: {
      id: 15,
      title: 'Site engineer',
    },

    title: 'Commercial project',
    translations: new TranslationParams({
      title: {
        ar: 'مشروع تجاري',
        en: 'Commercial project',
      },
    }),

    preview_date: '2026-06-25',
    preview_time: '10:30:00',
    site_link: 'https://maps.google.com/?q=30.0444,31.2357',
    address: 'Nasr City, Cairo, Egypt',

    status: null,
    notification_type: null,
    notification_message: null,
    pricing_responsible: null,
  });
}
