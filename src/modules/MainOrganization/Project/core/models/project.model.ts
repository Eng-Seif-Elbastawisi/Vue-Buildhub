import TitleModel from '@/base/Core/Models/titleModel';
import TranslationParams from '@/base/Core/Params/translationParams';
import { ConvertStatus } from '../constants/convert.status.enum';

interface ProjectClient {
  id: number;

  organization?: {
    id: number;
    name: string;
    address: string;
  };

  employee?: {
    id: number;
    name: string;
  };

  name: string;
}

export default class ProjectModel {
  public readonly id?: number;
  public readonly title?: string;
  public readonly translations?: TranslationParams;
  public readonly createdAt?: string;
  public readonly projectType?: TitleModel;
  public readonly status?: ConvertStatus;
  public readonly client?: ProjectClient;

  public readonly previewDate?: string;
  public readonly totalArea?: string;
  public readonly totalPrice?: string;
  public readonly serviceType?: number;

  constructor(data: {
    id?: number;
    title?: string;
    translations?: TranslationParams;
    createdAt?: string;
    projectType?: TitleModel;
    status?: ConvertStatus;
    client?: ProjectClient;

    previewDate?: string;
    totalArea?: string;
    totalPrice?: string;
    serviceType?: number;
  }) {
    this.id = data.id;
    this.title = data.title;
    this.translations = data.translations;
    this.createdAt = data.createdAt;
    this.projectType = data.projectType;
    this.status = data.status;
    this.client = data.client;

    this.previewDate = data.previewDate;
    this.totalArea = data.totalArea;
    this.totalPrice = data.totalPrice;
    this.serviceType = data.serviceType;

    Object.freeze(this);
  }

  static mapTranslations(translations: unknown, key: string = 'title'): Record<string, string> {
    if (!translations) {
      return {};
    }

    if (!Array.isArray(translations)) {
      const value = translations as {
        title?: Record<string, string>;
      };

      return value.title ?? (translations as Record<string, string>);
    }

    return translations.reduce<Record<string, string>>((result, translation) => {
      const item = translation as Record<string, unknown>;

      const locale = typeof item.locale === 'string' ? item.locale : undefined;

      const translatedValue = typeof item[key] === 'string' ? item[key] : undefined;

      if (locale && translatedValue) {
        result[locale] = translatedValue;
      }

      return result;
    }, {});
  }

  static fromJson(json: Record<string, unknown>): ProjectModel {
    if (!json) {
      throw new Error('Cannot create ProjectModel from null or undefined');
    }

    const clientJson =
      json.client && typeof json.client === 'object'
        ? (json.client as Record<string, unknown>)
        : undefined;

    const organizationJson =
      clientJson?.organization && typeof clientJson.organization === 'object'
        ? (clientJson.organization as Record<string, unknown>)
        : undefined;

    const employeeJson =
      clientJson?.employee && typeof clientJson.employee === 'object'
        ? (clientJson.employee as Record<string, unknown>)
        : undefined;

    return new ProjectModel({
      id: typeof json.id === 'number' ? json.id : undefined,

      title: typeof json.title === 'string' ? json.title : undefined,

      translations: new TranslationParams({
        title: ProjectModel.mapTranslations(json.translations),
      }),

      status: typeof json.status === 'number' ? (json.status as ConvertStatus) : undefined,

      client: clientJson
        ? {
            id: Number(clientJson.id),
            name: String(clientJson.name ?? ''),

            organization: organizationJson
              ? {
                  id: Number(organizationJson.id),
                  name: String(organizationJson.name ?? ''),
                  address: String(organizationJson.address ?? ''),
                }
              : undefined,

            employee: employeeJson
              ? {
                  id: Number(employeeJson.id),
                  name: String(employeeJson.name ?? ''),
                }
              : undefined,
          }
        : undefined,

      previewDate: typeof json.preview_date === 'string' ? json.preview_date : undefined,

      totalArea:
        typeof json.total_area === 'string' || typeof json.total_area === 'number'
          ? String(json.total_area)
          : undefined,

      totalPrice:
        typeof json.total_price === 'string' || typeof json.total_price === 'number'
          ? String(json.total_price)
          : undefined,
      createdAt: json.created_at as string | undefined,
      projectType: TitleModel.fromMap(json.project_type),
      serviceType:
        typeof json.service_type === 'number'
          ? json.service_type
          : json.service_type
            ? Number(json.service_type)
            : undefined,
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

    status: ConvertStatus.PENDING,

    client: {
      id: 1,

      organization: {
        id: 1,
        name: 'Commercial organization',
        address: 'Commercial address',
      },

      employee: {
        id: 1,
        name: 'Commercial employee',
      },

      name: 'Commercial client',
    },

    previewDate: '2026-07-16',
    totalArea: '512210.00',
    totalPrice: '7980.00',
  });
}
