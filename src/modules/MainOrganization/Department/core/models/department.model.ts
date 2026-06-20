import TitleInterface from '@/base/Data/Models/titleInterface';

export default class DepartmentModel {
  public readonly id?: number;
  public readonly title: string;
  public readonly translations: { title: Record<string, string> };
  public readonly stage: TitleInterface<number>;

  constructor(data: { id?: number; translations?: { title: Record<string, string> }; title?: string;stage: TitleInterface<number> }) {
    this.id = data.id;
    this.translations = data.translations ?? { title: { en: data.title ?? '' } };
    this.title = data.title ?? this.translations.title.en ?? Object.values(this.translations.title)[0] ?? '';
    this.stage = data.stage;
    Object.freeze(this);
  }

  static fromJson(json: unknown): DepartmentModel {
    if (!json || typeof json !== 'object') {
      throw new Error('Cannot create DepartmentModel from invalid data');
    }
    const data = json as {
      id?: number;
      translations?: { title?: Record<string, string> };
      title?: string;
      stage?: { id?: number; title?: string };
      stage_id?: number;
      stage_title?: string;
    };

    return new DepartmentModel({
      id: data.id,
       title: data.title,
      translations: { title: data.translations?.title ?? { en: data.title ?? '' } },
      stage: new TitleInterface({
        id: data.stage?.id ?? data.stage_id ?? 0,
        title: data.stage?.title ?? data.stage_title ?? '',
      }),
    });
  }

  static example(): DepartmentModel {
    return new DepartmentModel({
      id: 1,
     translations: {
      title: {
        ar: 'منصة التعلم الذكي',
        en: 'Smart Learning Platform',
      }, 
    },
      stage: new TitleInterface({
        id: 1,
        title: 'Engineering',
      }),
    });
  }
}
