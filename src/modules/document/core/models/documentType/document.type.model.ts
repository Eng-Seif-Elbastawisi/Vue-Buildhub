import type TitleInterface from '@/base/Data/Models/titleInterface';
import DocumentTranslationParams from '../../params/translation.params';

export default class DocumentTypeModel {
  public readonly id?: number;
  public readonly translations: {
    title: Record<string, string>;
  };
  public readonly RefNumber: string;
  public readonly doecumentType: TitleInterface<number>;
  public readonly Subjtecs: TitleInterface<number>[];
  public readonly tranaslations: DocumentTranslationParams;
  public readonly title: string;
  constructor(data: {
    id?: number;
    translations: {
      title: Record<string, string>;
    };
    title: string;
    RefNumber: string;
    doecumentType: TitleInterface<number>;
    Subjtecs: TitleInterface<number>[];
    tranaslations: DocumentTranslationParams;
  }) {
    this.id = data.id;
    this.translations = data.translations;
    this.RefNumber = data.RefNumber;
    this.doecumentType = data.doecumentType;
    this.Subjtecs = data.Subjtecs;
    this.tranaslations = data.tranaslations;
    this.title = data.title;

    Object.freeze(this);
  }

  static fromJson(json: any): DocumentTypeModel {
    if (!json) {
      throw new Error('Cannot create DocumentTypeModel from null or undefined');
    }

    return new DocumentTypeModel({
      id: json.id,
      translations: {
        title: this.mapTranslations(json.title, 'title'),
      },
      RefNumber: json.ref_number,
      title: json.title,
      doecumentType: json.document_type,
      Subjtecs: json.subjtecs ?? [],
      tranaslations: json.tranaslations,
    });
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
  static example: DocumentTypeModel = new DocumentTypeModel({
    id: 10,
    title: 'title',
    RefNumber: '10',
    doecumentType: {
      id: 1,
      title: 'title',
    },
    Subjtecs: [
      {
        id: 1,
        title: 'aa',
      },
    ],
    tranaslations: new DocumentTranslationParams({
      description: {
        ar: '',
        en: '',
      },
      title: {
        ar: '',
        en: '',
      },
    }),
    translations: {
      title: {
        ar: '',
        en: '',
      },
    },
  });
}
