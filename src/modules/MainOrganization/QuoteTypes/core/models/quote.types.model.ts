import BranchesModel from './branches.model';

/**
 * Quote Type model
 */
export default class QuoteTypeModel {
  public readonly id?: number;
  public readonly title: string;
  public readonly description?: string;

  public readonly translations: {
    title: Record<string, string>;
    description: Record<string, string>;
  };

  public readonly e_c_subject_id?: number;

  public readonly branches: BranchesModel[];
  public readonly children: QuoteTypeModel[];
  public readonly status: boolean;
  public readonly quoteTypeChildrenCount: number;

  constructor(data: {
    id?: number;
    translations?: {
      title?: Record<string, string>;
      description?: Record<string, string>;
    };
    title?: string;
    description?: string;
    e_c_subject_id?: number;
    branches: BranchesModel[];
    children: QuoteTypeModel[];
    status?: boolean;
    quoteTypeChildrenCount?: number;
  }) {
    this.id = data.id;

    this.translations = {
      title: data.translations?.title ?? {
        en: data.title ?? '',
      },
      description: data.translations?.description ?? {
        en: data.description ?? '',
      },
    };

    this.title =
      data.title ?? this.translations.title.en ?? Object.values(this.translations.title)[0] ?? '';

    this.description =
      data.description ??
      this.translations.description.en ??
      Object.values(this.translations.description)[0] ??
      '';

    this.e_c_subject_id = data.e_c_subject_id;
    this.branches = data.branches;
    this.children = data.children;
    this.status = data.status ?? false;
    this.quoteTypeChildrenCount = data.quoteTypeChildrenCount ?? 0;

    Object.freeze(this);
  }

  /**
   * Map translations from API response
   */
  static mapTranslations(translations: unknown, key: string = 'title'): Record<string, string> {
    if (!translations) {
      return {};
    }

    if (Array.isArray(translations)) {
      return translations.reduce<Record<string, string>>((result, translation) => {
        const item = translation as Record<string, string>;

        const locale = item.locale;
        const value = item[key];

        if (locale && value) {
          result[locale] = value;
        }

        return result;
      }, {});
    }

    const value = translations as {
      title?: Record<string, string>;
      description?: Record<string, string>;
    };

    return value?.[key as 'title' | 'description'] ?? {};
  }

  /**
   * Get plain title from API response
   */
  static getPlainTitle(json: Record<string, unknown>): string | undefined {
    const title = json.title;

    if (typeof title === 'string') {
      return title;
    }

    if (Array.isArray(title)) {
      const enTitle = title.find(
        (item) =>
          typeof item === 'object' &&
          item !== null &&
          (item as Record<string, unknown>).locale === 'en',
      ) as Record<string, unknown> | undefined;

      const arTitle = title.find(
        (item) =>
          typeof item === 'object' &&
          item !== null &&
          (item as Record<string, unknown>).locale === 'ar',
      ) as Record<string, unknown> | undefined;

      const firstTitle = title[0] as Record<string, unknown> | undefined;

      return (
        (enTitle?.title as string) || (arTitle?.title as string) || (firstTitle?.title as string)
      );
    }

    return undefined;
  }

  /**
   * Get plain description from API response
   */
  static getPlainDescription(json: Record<string, unknown>): string | undefined {
    const description = json.description;

    if (typeof description === 'string') {
      return description;
    }

    if (Array.isArray(description)) {
      const enDescription = description.find(
        (item) =>
          typeof item === 'object' &&
          item !== null &&
          (item as Record<string, unknown>).locale === 'en',
      ) as Record<string, unknown> | undefined;

      const arDescription = description.find(
        (item) =>
          typeof item === 'object' &&
          item !== null &&
          (item as Record<string, unknown>).locale === 'ar',
      ) as Record<string, unknown> | undefined;

      const firstDescription = description[0] as Record<string, unknown> | undefined;

      return (
        (enDescription?.description as string) ||
        (arDescription?.description as string) ||
        (firstDescription?.description as string)
      );
    }

    return undefined;
  }

  static fromJson(json: Record<string, unknown>): QuoteTypeModel {
    if (!json) {
      throw new Error('Cannot create QuoteTypeModel from null or undefined');
    }

    return new QuoteTypeModel({
      id: json.id as number | undefined,

      title: QuoteTypeModel.getPlainTitle(json),

      description: QuoteTypeModel.getPlainDescription(json),

      translations: {
        title: QuoteTypeModel.mapTranslations(json.translations ?? json.title, 'title'),

        description: QuoteTypeModel.mapTranslations(
          json.translations ?? json.description,
          'description',
        ),
      },

      e_c_subject_id: json.e_c_subject_id as number | undefined,

      branches: Array.isArray(json.branches)
        ? json.branches.map((branch: unknown) => BranchesModel.fromJson(branch))
        : [],

      children: Array.isArray(json.children)
        ? json.children.map((child: unknown) =>
            QuoteTypeModel.fromJson(child as Record<string, unknown>),
          )
        : [],

      status: json.status as boolean | undefined,

      quoteTypeChildrenCount: (json.quote_type_children_count as number | undefined) ?? 0,
    });
  }

  static example: QuoteTypeModel = new QuoteTypeModel({
    id: 1,

    translations: {
      title: {
        en: 'Quote Type',
        ar: 'نوع العرض',
      },

      description: {
        en: 'Quote Type Description',
        ar: 'وصف نوع العرض',
      },
    },

    branches: [BranchesModel.example],

    children: [],
  });
}
