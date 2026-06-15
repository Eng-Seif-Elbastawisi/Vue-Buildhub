import TitleInterface from '@/base/Data/Models/titleInterface';
export default class SuppliersShowModel {
  public readonly id?: number;
  public readonly phone?: string;
  public readonly materials?: string;
  public readonly Supplier?: string;
  public readonly spacification?: string;

  constructor(data: {
    id?: number;
    phone?: string;
    materials?: string;
    Supplier?: string;
    spacification?: string;
  }) {
    this.id = data.id;
    this.phone = data.phone;
    this.materials = data.materials;
    this.Supplier = data.Supplier;
    this.spacification = data.spacification;
    Object.freeze(this);
  }

  static mapTranslations = (translations: any[], key: string = 'value') => {
    const result: Record<string, string> = {};
    if (Array.isArray(translations)) {
      translations.forEach((t: any) => {
        if (t.locale && t[key]) {
          result[t.locale] = t[key];
        }
      });
    }
    return result;
  };

  static fromJson(json: any): SuppliersShowModel {
    if (!json) throw new Error('Invalid SuppliersShowModel data');

    return new SuppliersShowModel({
      id: json.id,
      phone: json.phone,
      materials: json.materials,
      Supplier: json.Supplier,
      spacification: json.spacification,
    });
  }

  static example: SuppliersShowModel = new SuppliersShowModel({
    id: 1,
    phone: 'phone',
    materials: 'materials',
    Supplier: 'Supplier',
    spacification: 'spacification',
  });

  static getLocalizedData<T extends Record<string, any>>(
    obj: T,
    locale: string,
  ): TitleInterface<number> {
    const result: TitleInterface<number> = {
      id: obj.id,
    };

    Object.keys(obj).forEach((key) => {
      const value = obj[key];

      if (Array.isArray(value)) {
        const localizedItem = value.find((item) => item.locale === locale);

        if (localizedItem) {
          const { locale: _, ...rest } = localizedItem;

          Object.assign(result, rest);
        }
      }
    });

    return result;
  }
}
