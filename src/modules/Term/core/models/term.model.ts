import TitleInterface from '@/base/Data/Models/titleInterface';

export default class TermModel {
  public readonly id?: number;
  public readonly title: string;
  public readonly translations: { title: Record<string, string> };
  public readonly department: TitleInterface<number>;

  constructor(data: {
    id?: number;
    title?: string;
    translations?: { title: Record<string, string> };
    department: TitleInterface<number>;
  }) {
    this.id = data.id;
    this.translations = data.translations ?? { title: { en: data.title ?? '' } };
    this.title =
      data.title ?? this.translations.title.en ?? Object.values(this.translations.title)[0] ?? '';
    this.department = data.department;
    Object.freeze(this);
  }

  static fromJson(json: unknown): TermModel {
    if (!json || typeof json !== 'object') {
      throw new Error('Cannot create TermModel from invalid data');
    }
    const data = json as {
      id?: number;
      title?: string;
      translations?: { title?: Record<string, string> };
      department?: { id?: number; title?: string };
      department_id?: number;
      department_title?: string;
    };

    return new TermModel({
      id: data.id,
      title: data.title,
      translations: { title: data.translations?.title ?? { en: data.title ?? '' } },
      department: new TitleInterface({
        id: data.department?.id ?? data.department_id ?? 0,
        title: data.department?.title ?? data.department_title ?? '',
      }),
    });
  }

  static example(): TermModel {
    return new TermModel({
      id: 1,
      translations: { title: { en: 'First Term', ar: 'الفصل الأول' } },
      department: new TitleInterface({
        id: 1,
        title: 'Engineering',
      }),
    });
  }
}
