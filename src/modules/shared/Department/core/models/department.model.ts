import TitleInterface from '@/base/Data/Models/titleInterface';

export default class DepartmentModel {
  public readonly id?: number;
  public readonly title: string;
  public readonly translations: { title: Record<string, string> };
  public readonly stage: TitleInterface<number>;

  constructor(data: {
    id?: number;
    translations?: { title: Record<string, string> };
    title?: string;
    stage: TitleInterface<number>;
  }) {
    this.id = data.id;
    this.translations = data.translations ?? { title: { en: data.title ?? '' } };
    this.title =
      data.title ?? this.translations.title.en ?? Object.values(this.translations.title)[0] ?? '';
    this.stage = data.stage;
    Object.freeze(this);
  }

  static fromJson(json: unknown): DepartmentModel {
    if (!json || typeof json !== 'object') {
      throw new Error('Cannot create DepartmentModel from invalid data');
    }
    const data = json as {
      id?: number;
      translations?: { title?: unknown };
      title?: unknown;
      stage?: { id?: number; title?: unknown };
      stage_id?: number;
      stage_title?: unknown;
    };
    const translatedTitle = DepartmentModel.mapTranslations(data.translations?.title);
    const titleTranslations =
      Object.keys(translatedTitle).length > 0
        ? translatedTitle
        : DepartmentModel.mapTranslations(data.title);
    const stageTitleSource = data.stage?.title ?? data.stage_title;
    const stageTitleTranslations = DepartmentModel.mapTranslations(stageTitleSource);

    return new DepartmentModel({
      id: data.id,
      title: DepartmentModel.toDefaultTitle(titleTranslations, data.title),
      translations: { title: titleTranslations },
      stage: new TitleInterface({
        id: data.stage?.id ?? data.stage_id ?? 0,
        title: DepartmentModel.toBilingualLabel(stageTitleTranslations, stageTitleSource),
      }),
    });
  }

  static mapTranslations(value: unknown, key: string = 'title'): Record<string, string> {
    if (!value) return {};

    if (typeof value === 'string' || typeof value === 'number') {
      return { en: String(value) };
    }

    if (Array.isArray(value)) {
      return value.reduce<Record<string, string>>((result, item) => {
        const translation = item as Record<string, unknown>;
        const locale = translation.locale ?? translation.lang ?? translation.language;
        const text = translation[key] ?? translation.value ?? translation.title ?? translation.name;

        if (locale && text !== undefined && text !== null) {
          result[String(locale)] = DepartmentModel.stringifyText(text);
        }

        return result;
      }, {});
    }

    if (typeof value === 'object') {
      const record = value as Record<string, unknown>;

      if (record.title && typeof record.title === 'object') {
        return DepartmentModel.mapTranslations(record.title, key);
      }

      return Object.entries(record).reduce<Record<string, string>>((result, [locale, text]) => {
        if (text !== undefined && text !== null && typeof text !== 'object') {
          result[locale] = String(text);
        }

        return result;
      }, {});
    }

    return {};
  }

  static toBilingualLabel(translations: Record<string, string>, fallback?: unknown): string {
    const en = translations.en?.trim();
    const ar = translations.ar?.trim();

    if (en && ar) return `${en} / ${ar}`;
    if (en) return en;
    if (ar) return ar;

    return DepartmentModel.stringifyText(fallback);
  }

  private static toDefaultTitle(translations: Record<string, string>, fallback?: unknown): string {
    return (
      translations.en ??
      translations.ar ??
      Object.values(translations)[0] ??
      DepartmentModel.stringifyText(fallback)
    );
  }

  private static stringifyText(value: unknown): string {
    if (value === undefined || value === null) return '';
    if (typeof value === 'string' || typeof value === 'number') return String(value);
    return '';
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
