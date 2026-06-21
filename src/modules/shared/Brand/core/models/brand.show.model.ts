import { EquipmentTypeEnum } from '../constant/equipment.type.enum';
export default class BrandShowModel {
  public readonly id?: number;
  public readonly title?: string;
  public readonly equipment?: EquipmentTypeEnum;

  constructor(data: { id?: number; title?: string; equipment?: EquipmentTypeEnum }) {
    this.id = data.id;
    this.title = data.title;
    this.equipment = data.equipment;
    Object.freeze(this);
  }

  static fromJson(json: any): BrandShowModel {
    if (!json) throw new Error('Invalid BrandShowModel data');

    return new BrandShowModel({
      id: json.id,
      title: json.title,
      equipment: json.equipment,
    });
  }

  static example: BrandShowModel = new BrandShowModel({
    id: 1,
    title: 'title',
    equipment: EquipmentTypeEnum.materials,
  });
}
