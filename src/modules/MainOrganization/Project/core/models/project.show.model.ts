import TranslationParams from '@/base/Core/Params/translationParams';
import { ServiceType } from '@/modules/MainOrganization/Project/core/constants/serviceType.enum';
import { ConvertStatus } from '../constants/convert.status.enum';
import ProjectAttachmentModel from './project.show.attachment';

export type ProjectSelectItem = {
  id: number;
  title: string;
  parent?: ProjectSelectItem | null;
};


export type ProjectPreviewModel = {
  id: number;
  status?: number;
  pricing_responsible?: ProjectSelectItem | null;
  notification_type?: number;
  notification_message?: string | null;
  preview_date?: string;
  preview_time?: string;
  site_link?: string;
  address?: string;
  created_at?: string;
  terms?: string;
};

export default class ProjectShowModel {
  public readonly raw?: Record<string, unknown>;
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

  public readonly project_previews?: ProjectPreviewModel[];
  public readonly engineer?: ProjectSelectItem | null;
  public readonly engineer_id?: number;
  public readonly preview_date?: string;
  public readonly preview_time?: string;
  public readonly site_link?: string;
  public readonly address?: string;

  public readonly convert_status?: ConvertStatus;
  public readonly status?: ConvertStatus;
  public readonly has_auto_invoices?: boolean;

  public readonly terms?: string;

  constructor(data: {
    raw?: Record<string, unknown>;
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

    project_previews?: ProjectPreviewModel[];
    engineer?: ProjectSelectItem | null;
    engineer_id?: number;
    preview_date?: string;
    preview_time?: string;
    site_link?: string;
    address?: string;

    convert_status?: ConvertStatus;
    status?: ConvertStatus;
    has_auto_invoices?: boolean;

    terms?: string;
  }) {
    this.raw = data.raw;
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

    this.project_previews = data.project_previews;
    this.engineer = data.engineer;
    this.engineer_id = data.engineer_id;
    this.preview_date = data.preview_date;
    this.preview_time = data.preview_time;
    this.site_link = data.site_link;
    this.address = data.address;

    this.convert_status = data.convert_status;
    this.status = data.status;
    this.has_auto_invoices = data.has_auto_invoices;

    this.terms = data.terms;

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

  static mapTerms(value: unknown): string {
    if (!value) return '';

    if (typeof value === 'string') {
      return value;
    }

    if (Array.isArray(value)) {
      return value
        .map((item) => ProjectShowModel.mapTerms(item))
        .filter(Boolean)
        .join('\n');
    }

    if (typeof value === 'object') {
      const data = value as Record<string, unknown>;

      return (
        ProjectShowModel.getPlainTitle(data.title) ||
        (typeof data.name === 'string' ? data.name : '') ||
        (typeof data.value === 'string' ? data.value : '') ||
        (typeof data.description === 'string' ? data.description : '') ||
        ''
      );
    }

    return String(value);
  }

  static mapSelectItem(item: unknown): ProjectSelectItem | null {
    if (!item || typeof item !== 'object') return null;

    const data = item as Record<string, unknown>;
    const name = typeof data.name === 'string' ? data.name : '';

    return {
      id: Number(data.id),
      title: name || ProjectShowModel.getPlainTitle(data.title) || `#${data.id}`,
      parent: data.parent ? ProjectShowModel.mapSelectItem(data.parent) : null,
    };
  }

  static mapProjectPreview(item: unknown): ProjectPreviewModel | null {
    if (!item || typeof item !== 'object') return null;

    const data = item as Record<string, unknown>;

    return {
      id: Number(data.id),
      status: data.status !== undefined ? Number(data.status) : undefined,

      pricing_responsible: ProjectShowModel.mapSelectItem(data.pricing_responsible),

      notification_type:
        data.notification_type !== undefined ? Number(data.notification_type) : undefined,

      notification_message: data.notification_message as string | null | undefined,

      preview_date: data.preview_date as string | undefined,

      preview_time: data.preview_time as string | undefined,

      site_link: data.site_link as string | undefined,

      address: data.address as string | undefined,

      created_at: data.created_at as string | undefined,
    };
  }

  static fromJson(json: Record<string, unknown>): ProjectShowModel {
    if (!json) {
      throw new Error('Cannot create ProjectShowModel from null or undefined');
    }

    const client = ProjectShowModel.mapSelectItem(json.client);

    const clientData =
      json.client && typeof json.client === 'object'
        ? (json.client as Record<string, unknown>)
        : null;

    const projectType = ProjectShowModel.mapSelectItem(json.project_type);

    const convertStatus = Number(
      json.convert_status ?? json.status ?? ConvertStatus.PENDING,
    ) as ConvertStatus;

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

    const projectPreviews = Array.isArray(json.project_previews)
      ? json.project_previews
          .map((item) => ProjectShowModel.mapProjectPreview(item))
          .filter((item): item is ProjectPreviewModel => item !== null)
      : [];

    const previewData =
      json.project_preview && typeof json.project_preview === 'object'
        ? (json.project_preview as Record<string, unknown>)
        : Array.isArray(json.project_previews) &&
            json.project_previews[0] &&
            typeof json.project_previews[0] === 'object'
          ? (json.project_previews[0] as Record<string, unknown>)
          : null;

    const engineer = ProjectShowModel.mapSelectItem(json.engineer ?? previewData?.engineer);

    return new ProjectShowModel({
      raw: json,
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
      client_phone: clientData?.phone as string | undefined,

      client_source: ProjectShowModel.mapSelectItem(clientData?.client_source),

      project_type: projectType,
      project_type_id: projectType?.id,

      location,
      location_id: json.location_id as number | undefined,

      service_type: json.service_type as ServiceType | undefined,

      date: json.date as string | undefined,
      notes: json.notes as string | null | undefined,

      attachments: json.attachments && json.attachments.length > 0
        ? json.attachments?.map((item) => ProjectAttachmentModel.fromJson(item))
        : [],

      project_previews: projectPreviews,
      engineer,
      engineer_id:
        engineer?.id ?? (json.engineer_id !== undefined ? Number(json.engineer_id) : undefined),
      preview_date: (json.preview_date ?? previewData?.preview_date) as string | undefined,
      preview_time: (json.preview_time ?? previewData?.preview_time) as string | undefined,
      site_link: (json.site_link ?? previewData?.site_link) as string | undefined,
      address: (json.address ?? previewData?.address) as string | undefined,

      convert_status: convertStatus,
      status: convertStatus,
      has_auto_invoices: json.has_auto_invoices as boolean | undefined,

      terms: ProjectShowModel.mapTerms(json.terms),
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

    notes: 'Project notes',

    terms: 'First payment after approval\nSecond payment after delivery',

    attachments: [],

    project_previews: [
      {
        id: 20,
        status: 1,

        pricing_responsible: {
          id: 9,
          title: 'Fleur Armstrong',
        },

        notification_type: 1,
        notification_message: 'رسالة المعاينة',
        preview_date: '2026-07-12',
        preview_time: '15:38:00',
        site_link: 'https://www.jojijoluraja.net',
        address: 'عنوان الموقع',
        created_at: '2026-07-12 11:39:12',
      },
    ],

    convert_status: ConvertStatus.WAITING_PREVIEW,
    status: ConvertStatus.WAITING_PREVIEW,
  });
}
