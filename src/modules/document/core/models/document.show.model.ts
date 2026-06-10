import TitleInterface from '@/base/Data/Models/titleInterface';
export default class DocumentShowModel {
  public readonly id?: number;
  public readonly translations: {
    title: Record<string, string>;
  };
  public readonly title: Record<string, string>;
  public readonly RefNumber: string;
  public readonly documentType: TitleInterface<number>;
  public readonly stage: TitleInterface<number>;
  public readonly subject: TitleInterface<number>;
  public readonly tags: string[];
  public readonly images: string;
  public readonly files: string;

  constructor(data: {
    id?: number;
    translations: {
      title: Record<string, string>;
    };
    title: Record<string, string>;
    RefNumber: string;
    documentType: TitleInterface<number>;
    stage: TitleInterface<number>;
    subject: TitleInterface<number>;
    tags: string[];
    images: string;
    files: string;
  }) {
    this.id = data.id;
    this.translations = data.translations;
    this.title = data.title;
    this.RefNumber = data.RefNumber;

    this.documentType = data.documentType;
    this.stage = data.stage;
    this.subject = data.subject;

    this.translations = data.translations;

    this.tags = data.tags;
    this.images = data.images;
    this.files = data.files;

    Object.freeze(this);
  }

  static mapTranslations = (translations: any[], key: string = 'value') => {
    const result: Record<string, string> = {};
    if (Array.isArray(translations)) {
      translations.forEach((t: any) => {
        if (t.locale && t[key]) {
          result[t.locale] = t[key];
        }
      });
    }
    return result;
  };

  static fromJson(json: any): DocumentShowModel {
    if (!json) throw new Error('Invalid DocumentShowModel data');

    return new DocumentShowModel({
      id: json.id,

      translations: {
        title: this.mapTranslations(json.title, 'title'),
      },

      title: this.mapTranslations(json.title ?? [], 'title'),

      RefNumber: json.RefNumber ?? json.reference_number ?? '',

      // documentType: new TitleInterface({
      //   id: json.document_type?.id,
      //   title: json.document_type?.title?.find((item: any) => item.locale === 'en')?.title ?? '',
      // }),
      // documentType: new TitleInterface({
      //   id: json.document_type?.id,
      //   title: json.document_type?.title ?? '',
      // }),
      documentType: new TitleInterface({
        id: json.document_type?.id,
        title: json.document_type?.title?.[0]?.title ?? '',
      }),

      stage: new TitleInterface({
        id: json.stage?.id,
        title: json.stage?.titles?.[0]?.title ?? '',
      }),

      subject: new TitleInterface({
        id: json.subject?.id,
        title: json.subject?.titles?.[0]?.title ?? '',
      }),

      tags: Array.isArray(json.tags)
        ? json.tags.map((t: any) => t.tag)
        : [],
      // tags: json.tags ?? [],
      // images: json.images ?? [],
      // files: json.files ?? [],
      images: json.image  ?? '',
      files: json.document_file  ?? '',
    });
  }

  static example: DocumentShowModel = new DocumentShowModel({
    id: 1,
    translations: { title: { ar: 'title', en: 'title' } },
    title: { ar: 'title', en: 'title' },
    RefNumber: '100',

    documentType: { id: 1, title: 'type' },
    stage: { id: 1, title: 'stage' },
    subject: { id: 1, title: 'subject' },

    // translations: new DocumentTranslationParams({
    //   title: { ar: '', en: '' },
    //   description: { ar: '', en: '' },
    // }),

    tags: [],
    images: '',
    files: '',
  });

  static getLocalizedData<T extends Record<string, any>>(
    obj: T,
    locale: string,
  ): TitleInterface<number> {
    const result: TitleInterface<number> = {
      id: obj.id,
    };

    Object.keys(obj).forEach((key) => {
      const value = obj[key];

      if (Array.isArray(value)) {
        const localizedItem = value.find((item) => item.locale === locale);

        if (localizedItem) {
          const { locale: _, ...rest } = localizedItem;

          Object.assign(result, rest);
        }
      }
    });

    return result;
  }
}
