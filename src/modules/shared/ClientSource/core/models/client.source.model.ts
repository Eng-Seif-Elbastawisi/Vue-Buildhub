export default class ClientSourceModel {
  public readonly id?: number;
  public readonly title: string;
  public readonly translations: { title: Record<string, string> };

  constructor(data: {
    id?: number;
    translations?: { title: Record<string, string> };
    title?: string;
  }) {
    this.id = data.id;
    this.translations = data.translations ?? { title: { en: data.title ?? '' } };
    this.title =
      data.title ?? this.translations.title.en ?? Object.values(this.translations.title)[0] ?? '';
    Object.freeze(this);
  }

  /**
   * Create CountryModel from API response
   * @param json - Raw JSON data from API
   * @returns CountryModel instance
   */
  static mapTranslations(translations: unknown, key: string = 'title'): Record<string, string> {
    if (!Array.isArray(translations)) {
      const value = translations as { title?: Record<string, string> } | undefined;
      return value?.title ?? (translations as Record<string, string>) ?? {};
    }

    return translations.reduce<Record<string, string>>((result, translation) => {
      const item = translation as Record<string, string>;
      if (item.locale && item[key]) result[item.locale] = item[key];
      return result;
    }, {});
  }

  static fromJson(json: any): ClientSourceModel {
    if (!json) {
      throw new Error('Cannot create ClientSourceModel from null or undefined');
    }

    return new ClientSourceModel({
      id: json.id,
      title: json.client_source_title ?? json.title,
      translations: { title: ClientSourceModel.mapTranslations(json.title) },
    });
  }

  static example: ClientSourceModel = new ClientSourceModel({
    id: 1,
    translations: { title: { en: 'title', ar: 'title' } },
  });
}
