import TitleInterface from '@/base/Data/Models/titleInterface';
import { ProjectItemPriceEnum } from '../constant/project.item.Price.enum';

export default class ProjectItemModel {
  public readonly id?: number;
  public readonly price: number;
  public readonly quantity: number;
  public readonly item_id: TitleInterface<number>;
  public readonly pricing_method: ProjectItemPriceEnum;
  public readonly project_floor_id: number;

  constructor(data: {
    id?: number;
    price: number;
    quantity: number;
    item_id: TitleInterface<number>;
    pricing_method: ProjectItemPriceEnum;
    project_floor_id: number;
  }) {
    this.id = data.id;
    this.price = data.price;
    this.quantity = data.quantity;
    this.item_id = data.item_id;
    this.pricing_method = data.pricing_method;
    this.project_floor_id = data.project_floor_id;
    Object.freeze(this);
  }

  static fromJson(json: Record<string, unknown>): ProjectItemModel {
    if (!json) throw new Error('Cannot create ProjectItemModel from null or undefined');

    return new ProjectItemModel({
      id: json.id as number | undefined,
      price: json.price as number,
      quantity: json.quantity as number,
      item_id: new TitleInterface({
        id: json.item_id as number,
        title: json.item_id_title as string,
      }),
      pricing_method: json.pricing_method as ProjectItemPriceEnum,
      project_floor_id: json.project_floor_id as number,
    });
  }

  static example: ProjectItemModel = new ProjectItemModel({
    id: 10,
    price: 10,
    quantity: 10,
    item_id: new TitleInterface({ id: 10, title: 'Item 1' }),
    pricing_method: ProjectItemPriceEnum.GENERAL_ITEM,
    project_floor_id: 10,
  });
}
