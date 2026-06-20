import { EquipmentTypeEnum } from "../constant/equipment.type.enum";

export default class SuppliersModel {
  public readonly id?: number;
  public readonly title: string;
  public readonly equipment: EquipmentTypeEnum;
  constructor(data: {
    id?: number;
    title: string;
    equipment: EquipmentTypeEnum;
  }) {
    this.id = data.id;
    this.title = data.title;
    this.equipment = data.equipment;
    Object.freeze(this);
  }

  static fromJson(json: any): SuppliersModel {
    if (!json) {
      throw new Error('Cannot create SuppliersModel from null or undefined');
    }

    return new SuppliersModel({
      id: json.id,
      title: json.title,
      equipment: json.equipment,
    });
  }

  static example: SuppliersModel = new SuppliersModel({
    id: 10,
    title: 'Geberit',
    equipment: EquipmentTypeEnum.equipment,
  });
}
