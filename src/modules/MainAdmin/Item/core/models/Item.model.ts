import TitleInterface from '@/base/Data/Models/titleInterface';
import { ItemStatusEnum } from '../constant/item.status.enum';
import { ItemTypeEnum } from '../constant/item.type.enum copy';

export default class ItemModel {
  public readonly id?: number;
  public readonly type: ItemTypeEnum;
  public readonly status: ItemStatusEnum;
  public readonly stage_id: TitleInterface<number>;
  public readonly department_id: TitleInterface<number>;
  public readonly measurement_unit_id: TitleInterface<number>;
  public readonly price: number;
  public readonly notes: string;
  public readonly translations: { title: Record<string, string> };

  constructor(data: {
    id?: number;
    translations: { title: Record<string, string> };
    type: ItemTypeEnum;
    status: ItemStatusEnum;
    stage_id: TitleInterface<number>;
    department_id: TitleInterface<number>;
    measurement_unit_id: TitleInterface<number>;
    price: number;
    notes: string;
  }) {
    this.id = data.id;
    this.translations = data.translations;
    this.type = data.type;
    this.status = data.status;
    this.stage_id = data.stage_id;
    this.department_id = data.department_id;
    this.measurement_unit_id = data.measurement_unit_id;
    this.price = data.price;
    this.notes = data.notes;
    Object.freeze(this);
  }

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

  static fromJson(json: Record<string, unknown>): ItemModel {
    if (!json) throw new Error('Cannot create LocationModel from null or undefined');

    return new ItemModel({
      id: json.id as number | undefined,
      translations: { title: ItemModel.mapTranslations(json.translations) },
      type: json.type as ItemTypeEnum,
      status: json.status as ItemStatusEnum,
      stage_id: new TitleInterface({
        id: json.stage_id as number,
        title: json.stage_id_title as string,
      }),
      department_id: new TitleInterface({
        id: json.department_id as number,
        title: json.department_id_title as string,
      }),
      measurement_unit_id: new TitleInterface({
        id: json.measurement_unit_id as number,
        title: json.measurement_unit_id_title as string,
      }),
      price: json.price as number,
      notes: json.notes as string,
    });
  }

  static example: ItemModel = new ItemModel({
    id: 10,
    translations: { title: { ar: 'مادة', en: 'Material' } },
    type: ItemTypeEnum.MANUFACTURING,
    status: ItemStatusEnum.MAIN,
    stage_id: new TitleInterface({ id: 10, title: 'Stage 1' }),
    department_id: new TitleInterface({ id: 10, title: 'Department 1' }),
    measurement_unit_id: new TitleInterface({ id: 10, title: 'Measurement Unit 1' }),
    price: 10,
    notes: 'notes',
  });
}
