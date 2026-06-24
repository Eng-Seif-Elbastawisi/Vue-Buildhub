import { ItemStatusEnum } from '../constant/item.status.enum';
import { ItemTypeEnum } from '../constant/item.type.enum copy';
import ItemModel from './Item.model';

export default class ItemShowModel {
  public readonly id?: number;
  public readonly type?: ItemTypeEnum;
  public readonly status?: ItemStatusEnum;
  public readonly stage_id?: number;
  public readonly department_id?: number;
  public readonly measurement_unit_id?: number;
  public readonly price?: number;
  public readonly notes?: string;
  public readonly translations: { title: Record<string, string> };

  constructor(data: {
    id?: number;
    type?: ItemTypeEnum;
    status?: ItemStatusEnum;
    stage_id?: number;
    department_id?: number;
    measurement_unit_id?: number;
    price?: number;
    notes?: string;
    translations: { title: Record<string, string> };
  }) {
    this.id = data.id;
    this.type = data.type;
    this.status = data.status;
    this.stage_id = data.stage_id;
    this.department_id = data.department_id;
    this.measurement_unit_id = data.measurement_unit_id;
    this.price = data.price;
    this.notes = data.notes;
    this.translations = data.translations;
    Object.freeze(this);
  }

  static fromJson(json: Record<string, unknown>): ItemShowModel {
    if (!json) throw new Error('Invalid ItemShowModel data');

    return new ItemShowModel({
      id: json.id as number | undefined,
      type: json.type as ItemTypeEnum | undefined,
      status: json.status as ItemStatusEnum | undefined,
      stage_id: json.stage_id as number | undefined,
      department_id: json.department_id as number | undefined,
      measurement_unit_id: json.measurement_unit_id as number | undefined,
      price: json.price as number | undefined,
      notes: json.notes as string | undefined,
      translations: { title: ItemModel.mapTranslations(json.title) },
    });
  }

  static example: ItemShowModel = new ItemShowModel({
    id: 1,
    type: ItemTypeEnum.MANUFACTURING,
    status: ItemStatusEnum.MAIN,
    stage_id: 1,
    department_id: 1,
    measurement_unit_id: 1,
    price: 1,
    notes: 'notes',
    translations: { title: { ar: 'مادة', en: 'Material' } },
  });
}
