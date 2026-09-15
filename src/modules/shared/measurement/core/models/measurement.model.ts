export default class MeasurementModel {
  public readonly id?: number;

  public readonly title: string;

  public readonly status: boolean;

  public readonly symbol: string;

  public readonly translations: {
    title: Record<string, string>;
    symbol: Record<string, string>;
  };

  public readonly code: string;

  public readonly precision: number;

  constructor(data: {
    id?: number;

    title?: string;
    status?: boolean;

    symbol?: string;

    translations?: {
      title: Record<string, string>;
      symbol: Record<string, string>;
    };

    code?: string;

    precision?: number;
  }) {
    this.id = data.id;

    this.translations = data.translations ?? {
      title: {
        en: data.title ?? '',
        ar: data.title ?? '',
      },

      symbol: {
        en: data.symbol ?? '',
        ar: data.symbol ?? '',
      },
    };

    this.title =
      data.title ??
      this.translations.title.en ??
      Object.values(this.translations.title)[0] ??
      '';

    this.status = data.status ?? false;

    this.symbol =
      data.symbol ??
      this.translations.symbol.en ??
      Object.values(this.translations.symbol)[0] ??
      '';

    this.code = data.code ?? '';

    this.precision = data.precision ?? 0;

    Object.freeze(this);
  }

  static mapTranslations(
    value: unknown,
  ): Record<string, string> {
    if (!value) {
      return {};
    }

    if (typeof value === 'string') {
      return {
        en: value,
        ar: value,
      };
    }

    if (!Array.isArray(value)) {
      return value as Record<string, string>;
    }

    return value.reduce<Record<string, string>>(
      (result, translation) => {
        const item = translation as Record<string, string>;

        if (item.locale) {
          const translationValue =
            item.title ??
            item.symbol ??
            item.value;

          if (translationValue) {
            result[item.locale] = translationValue;
          }
        }

        return result;
      },
      {},
    );
  }

  static fromJson(json: any): MeasurementModel {
    if (!json) {
      throw new Error(
        'Cannot create MeasurementModel from null or undefined',
      );
    }

    const titleTranslations =
      MeasurementModel.mapTranslations(json.title);

    const symbolTranslations =
      MeasurementModel.mapTranslations(json.symbol);

    return new MeasurementModel({
      id: json.id,

      title: json.title,
 
      status: json.status,
      
      symbol: json.symbol,

      translations: {
        title: titleTranslations,

        symbol: symbolTranslations,
      },

      code: json.code,

      precision: json.precision,
    });
  }

  static example: MeasurementModel = new MeasurementModel({
    id: 1,

    title: 'Kilogram',

    status: true,

    symbol: 'kg',

    translations: {
      title: {
        en: 'Kilogram',
        ar: 'كيلوجرام',
      },

      symbol: {
        en: 'kg',
        ar: 'كجم',
      },
    },

    code: 'KG',

    precision: 2,
  });
}