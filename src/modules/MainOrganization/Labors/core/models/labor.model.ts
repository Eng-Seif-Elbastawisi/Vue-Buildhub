import { UnitTypeEnum } from '@/modules/shared/Materials/core/constant/unit.type.enum';

/**
 * Employee model representing an employee entity
 */
export default class LaborModel {
  public readonly id?: number;
  public readonly title: string;
  public readonly price?: number;
  public readonly unit?: UnitTypeEnum;
  

  constructor(data: {
    id?: number;
    title: string;
    price?: number;
    unit?: UnitTypeEnum;
  }) {
    this.id = data.id;
    this.title = data.title;
    this.price = data.price;
    this.unit = data.unit;

    Object.freeze(this);
  }

  static fromJson(json: Record<string, unknown>): LaborModel {
    if (!json) {
      throw new Error('Cannot create LaborModel from null or undefined');
    }

    return new LaborModel({
      id: Number(json.id ?? json.admin_id),
      title: (json.title as string) || '',
      price: Number(json.price),
      unit: UnitTypeEnum[json.unit as keyof typeof UnitTypeEnum] || UnitTypeEnum.meter,
    });
  }

  static example: LaborModel = new LaborModel({
    id: 1,
    title: 'Mohamed Saad',
    price: 10,
    unit: UnitTypeEnum.meter,
  });
}