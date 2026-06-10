import type TitleInterface from '@/base/Data/Models/titleInterface';
import DocumentTranslationParams from '../params/translation.params';

export default class DocumentModel {
  public readonly id?: number;
  public readonly title: string;
  public readonly RefNumber: string;
  public readonly doecumentType: TitleInterface<number>;
  public readonly Subjtecs: TitleInterface<number>[];
  public readonly tranaslations: DocumentTranslationParams;
  public readonly tags: string[];
  public readonly images: string[];
  public readonly files: string[];

  constructor(data: {
    id?: number;
    title: string;
    RefNumber: string;
    doecumentType: TitleInterface<number>;
    Subjtecs: TitleInterface<number>[];
    tranaslations: DocumentTranslationParams;
    tags: string[];
    images: string[];
    files: string[];
  }) {
    this.id = data.id;
    this.title = data.title;
    this.RefNumber = data.RefNumber;
    this.doecumentType = data.doecumentType;
    this.Subjtecs = data.Subjtecs;
    this.tranaslations = data.tranaslations;
    this.tags = data.tags;
    this.images = data.images;
    this.files = data.files;

    Object.freeze(this);
  }

  static fromJson(json: any): DocumentModel {
    if (!json) {
      throw new Error('Cannot create DocumentModel from null or undefined');
    }

    return new DocumentModel({
      id: json.id,
      title: json.title,
      RefNumber: json.ref_number,
      doecumentType: json.document_type,
      Subjtecs: json.subjtecs ?? [],
      tranaslations: json.tranaslations,
      tags: json.tags,
      images: json.images,
      files: json.files,
    });
  }

  static example: DocumentModel = new DocumentModel({
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
      title: {
        ar: 'عنوان',
        en: 'title',
      },
      description: {
        ar: 'وصف',
        en: 'description',
      },
    }),
    tags: ['tag1', 'tage2'],
    images: [],
    files: [],
  });
}
