/**
 * Employee model representing an employee entity
 */
export default class TranslationModel {
  public readonly title?: Record<string, string>;
  public readonly description?: Record<string, string>;

  constructor(data: { title?: Record<string, string>; description?: Record<string, string> }) {
    this.title = data.title;
    this.description = data.description;

    Object.freeze(this);
  }

  /**
   * Create EmployeeModel from API response
   * @param json - Raw JSON data from API
   * @returns EmployeeModel instance
   */
  static fromJson(json: any): TranslationModel {
    if (!json) {
      throw new Error('Cannot create TranslationModel from null or undefined');
    }

    return new TranslationModel({
      title: TranslationModel.normalizeLocaleField(json.title, 'title'),
      description: TranslationModel.normalizeLocaleField(json.description, 'description'),
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

  static example: TranslationModel = new TranslationModel({
    title: {
      ar: 'خدمة العملاء',
      en: 'customer services',
    },
    description: {
      ar: 'الدعم الفني',
      en: 'technical support',
    },
  });
}
