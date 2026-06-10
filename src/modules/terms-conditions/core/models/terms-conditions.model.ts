import TranslationModel from '@/modules/about/core/models/translation.model';

/**
 * Country model representing a nation's geographical and cultural data
 */
export default class TermsConditionsModel {
  public readonly translations?: TranslationModel;
  public readonly id?: number;
  public readonly title?: Record<string, string> | string;
  public readonly description?: Record<string, string> | string;

  constructor(data: {
    translations?: TranslationModel;
    id?: number;
    title?: Record<string, string> | string;
    description?: Record<string, string> | string;
  }) {
    this.translations = data.translations;
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;

    Object.freeze(this);
  }

  /**
   * Create CountryModel from API response
   * @param json - Raw JSON data from API
   * @returns FaqsModel instance
   */
  static fromJson(json: any): TermsConditionsModel {
    if (!json) {
      throw new Error('Cannot create FaqsModel from null or undefined');
    }

    return new TermsConditionsModel({
      translations: json?.translations ? TranslationModel.fromJson(json.translations) : undefined,
      id: json?.id,
      title:
        typeof json.title === 'string'
          ? json.title
          : TermsConditionsModel.normalizeLocaleField(json.title, 'title'),
      description:
        typeof json.description === 'string'
          ? json.description
          : TermsConditionsModel.normalizeLocaleField(json.description, 'description'),
    });
  }

  private static normalizeLocaleField(raw: unknown, valueKey: string): Record<string, string> {
    if (Array.isArray(raw)) {
      return (raw as Array<Record<string, string>>).reduce(
        (acc, item) => {
          if (item?.locale) acc[item.locale] = item[valueKey] ?? '';
          return acc;
        },
        {} as Record<string, string>,
      );
    }
    if (raw && typeof raw === 'object') return raw as Record<string, string>;
    return {};
  }

  static example: TermsConditionsModel = new TermsConditionsModel({
    translations: new TranslationModel({
      title: {
        ar: 'terms_conditions_ar',
        en: 'terms_conditions_en',
      },
      description: {
        ar: 'lorem ipsum dolor sit amet consectetur adipiscing elit',
        en: 'lorem ipsum dolor sit amet consectetur adipiscing elit',
      },
    }),
    id: 5,
    title: 'terms_conditions_title',
    description: 'terms_conditions_description',
  });
}
