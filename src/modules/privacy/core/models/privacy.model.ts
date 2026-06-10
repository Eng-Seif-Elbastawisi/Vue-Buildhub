export default class PrivacyModel {
  public readonly id: number;
  public readonly title: Record<string, string>;
  public readonly description: Record<string, string>;

  constructor(data: {
    id: number;
    title: Record<string, string>;
    description: Record<string, string>;
  }) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;

    Object.freeze(this);
  }

  static fromJson(json: any): PrivacyModel {
    if (!json) {
      throw new Error('Cannot create PrivacyModel from null or undefined');
    }

    return new PrivacyModel({
      id: json.id,
      title: typeof json.title === 'string'
        ? json.title
        : PrivacyModel.normalizeLocaleField(json.title, 'title'),
      description: typeof json.description === 'string'
        ? json.description
        : PrivacyModel.normalizeLocaleField(json.description, 'description'),
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

  static example: PrivacyModel = new PrivacyModel({
    id: 1,
    title: {
      en: 'lorem ipsum dolor sit amet consectetur adipiscing elit',
      ar: 'lorem ipsum dolor sit amet consectetur adipiscing elit',
    },
    description: {
      en: 'lorem ipsum dolor sit amet consectetur adipiscing elit',
      ar: 'lorem ipsum dolor sit amet consectetur adipiscing elit',
    },
  });
}
