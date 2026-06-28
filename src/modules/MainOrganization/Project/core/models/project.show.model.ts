import TranslationParams from '@/base/Core/Params/translationParams';
import { ServiceType } from '@/modules/MainOrganization/Project/core/constants/serviceType.enum';

export type ProjectSelectItem = {
  id: number;
  title: string;
  parent?: ProjectSelectItem | null;
};

export type ProjectAttachmentModel = {
  id?: number;
  file: string;
  file_size?: string;
  alt?: string | null;
  type?: number;
  link?: string | null;
  created_at?: string;
};

export default class ProjectShowModel {
  public readonly id?: number;
  public readonly title?: string;
  public readonly translations?: TranslationParams;

  public readonly client_exist?: boolean;
  public readonly client?: ProjectSelectItem | null;
  public readonly client_id?: number;
  public readonly client_name?: string;
  public readonly client_phone?: string;
  public readonly client_source?: ProjectSelectItem | null;

  public readonly project_type?: ProjectSelectItem | null;
  public readonly project_type_id?: number;

  public readonly location?: ProjectSelectItem | null;
  public readonly location_id?: number;

  public readonly service_type?: ServiceType;
  public readonly date?: string;
  public readonly notes?: string | null;
  public readonly attachments?: ProjectAttachmentModel[];

  constructor(data: {
    id?: number;
    title?: string;
    translations?: TranslationParams;

    client_exist?: boolean;
    client?: ProjectSelectItem | null;
    client_id?: number;
    client_name?: string;
    client_phone?: string;
    client_source?: ProjectSelectItem | null;

    project_type?: ProjectSelectItem | null;
    project_type_id?: number;

    location?: ProjectSelectItem | null;
    location_id?: number;

    service_type?: ServiceType;
    date?: string;
    notes?: string | null;
    attachments?: ProjectAttachmentModel[];
  }) {
    this.id = data.id;
    this.title = data.title;
    this.translations = data.translations;

    this.client_exist = data.client_exist;
    this.client = data.client;
    this.client_id = data.client_id;
    this.client_name = data.client_name;
    this.client_phone = data.client_phone;
    this.client_source = data.client_source;

    this.project_type = data.project_type;
    this.project_type_id = data.project_type_id;

    this.location = data.location;
    this.location_id = data.location_id;

    this.service_type = data.service_type;
    this.date = data.date;
    this.notes = data.notes;
    this.attachments = data.attachments;

    Object.freeze(this);
  }

  static mapTranslations(translations: unknown, key: string = 'title'): Record<string, string> {
    if (!translations) return {};

    if (Array.isArray(translations)) {
      return translations.reduce<Record<string, string>>((result, translation) => {
        const item = translation as Record<string, string>;

        const locale = item.locale;
        const value = item[key];

        if (locale && value !== undefined && value !== null) {
          result[locale] = value;
        }

        return result;
      }, {});
    }

    return translations as Record<string, string>;
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

  static mapSelectItem(item: any): ProjectSelectItem | null {
    if (!item) return null;

    return {
      id: Number(item.id),
      title: item.name || ProjectShowModel.getPlainTitle(item.title) || `#${item.id}`,
      parent: item.parent ? ProjectShowModel.mapSelectItem(item.parent) : null,
    };
  }

  static fromJson(json: Record<string, unknown>): ProjectShowModel {
    if (!json) {
      throw new Error('Cannot create ProjectShowModel from null or undefined');
    }

    const client = ProjectShowModel.mapSelectItem(json.client);
    const projectType = ProjectShowModel.mapSelectItem(json.project_type);

    /**
     * مهم:
     * الـ API الحالي بيرجع location_id فقط.
     * لو backend رجّع location object، الكود ده هيقرأه.
     * لو مرجعوش، selected city هتظهر كـ #13 فقط.
     */
    const location =
      json.location && typeof json.location === 'object'
        ? ProjectShowModel.mapSelectItem(json.location)
        : json.location_id
          ? {
              id: Number(json.location_id),
              title: `#${json.location_id}`,
              parent: null,
            }
          : null;

    return new ProjectShowModel({
      id: json.id as number | undefined,

      title: ProjectShowModel.getPlainTitle(json.title),

      translations: new TranslationParams({
        title: ProjectShowModel.mapTranslations(json.title, 'title'),
        description: ProjectShowModel.mapTranslations(json.description, 'description'),
      }),

      client_exist: Boolean(client),
      client,
      client_id: client?.id,
      client_name: client?.title,
      client_phone: (json.client as any)?.phone,

      client_source: ProjectShowModel.mapSelectItem((json.client as any)?.client_source),

      project_type: projectType,
      project_type_id: projectType?.id,

      location,
      location_id: json.location_id as number | undefined,

      service_type: json.service_type as ServiceType | undefined,
      date: json.date as string | undefined,
      notes: json.notes as string | null | undefined,

      attachments: Array.isArray(json.attachments)
        ? (json.attachments as ProjectAttachmentModel[])
        : [],
    });
  }

  static example = new ProjectShowModel({
    id: 1,
    title: 'Commercial project',
    translations: new TranslationParams({
      title: {
        ar: 'مشروع تجاري',
        en: 'Commercial project',
      },
      description: {
        ar: 'وصف المشروع',
        en: 'Project description',
      },
    }),
    client_exist: true,
    client: {
      id: 3,
      title: 'Dieter Gonzales',
    },
    project_type: {
      id: 2,
      title: 'Villa',
    },
    location: {
      id: 13,
      title: '#13',
    },
    service_type: ServiceType.DESIGNONLY,
    attachments: [],
  });
}
