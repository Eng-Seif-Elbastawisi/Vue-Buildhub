import TitleInterface from '@/base/Data/Models/titleInterface';
import { ProjectItemPriceEnum } from '../constant/project.item.Price.enum';

export default class ProjectItemModel {
  public readonly id?: number;
  public readonly price: number;
  public readonly quantity: number;
  public readonly final_price: number;

  public readonly item: TitleInterface<number>;
  public readonly pricing_method: ProjectItemPriceEnum;

  public readonly project_id?: number;
  public readonly project_title?: string;

  public readonly project_floor_id?: number | null;
  public readonly project_floor_number?: number | null;

  public readonly project_floor_space_id?: number | null;
  public readonly project_floor_space_title?: string | null;

  public readonly created_at?: string;

  constructor(data: {
    id?: number;
    price: number;
    quantity: number;
    final_price: number;
    item: TitleInterface<number>;
    pricing_method: ProjectItemPriceEnum;
    project_id?: number;
    project_title?: string;
    project_floor_id?: number | null;
    project_floor_number?: number | null;
    project_floor_space_id?: number | null;
    project_floor_space_title?: string | null;
    created_at?: string;
  }) {
    this.id = data.id;
    this.price = data.price;
    this.quantity = data.quantity;
    this.final_price = data.final_price;
    this.item = data.item;
    this.pricing_method = data.pricing_method;
    this.project_id = data.project_id;
    this.project_title = data.project_title;
    this.project_floor_id = data.project_floor_id;
    this.project_floor_number = data.project_floor_number;
    this.project_floor_space_id = data.project_floor_space_id;
    this.project_floor_space_title = data.project_floor_space_title;
    this.created_at = data.created_at;

    Object.freeze(this);
  }

  static fromJson(json: Record<string, any>): ProjectItemModel {
    if (!json) {
      throw new Error('Cannot create ProjectItemModel from null or undefined');
    }

    return new ProjectItemModel({
      id: json.id,

      price: Number(json.price ?? 0),
      quantity: Number(json.quantity ?? 0),
      final_price: Number(json.final_price ?? 0),

      item: new TitleInterface({
        id: Number(json.item?.id ?? json.item_id ?? 0),
        title: json.item?.title ?? json.item_id_title ?? '-',
      }),

      pricing_method: Number(json.pricing_method) as ProjectItemPriceEnum,

      project_id: json.project?.id,
      project_title: json.project?.title,

      project_floor_id: json.project_floor?.id ?? null,
      project_floor_number: json.project_floor?.floor_number ?? null,

      project_floor_space_id: json.project_floor_space?.id ?? null,
      project_floor_space_title: json.project_floor_space?.space?.title ?? null,

      created_at: json.created_at,
    });
  }

  static example: ProjectItemModel = new ProjectItemModel({
    id: 1,
    price: 390,
    quantity: 1,
    final_price: 390,
    item: new TitleInterface({ id: 5, title: 'Item 1' }),
    pricing_method: ProjectItemPriceEnum.GENERAL_ITEM,
    project_id: 13,
    project_title: 'Project',
    project_floor_id: null,
    project_floor_number: null,
    project_floor_space_id: null,
    project_floor_space_title: null,
    created_at: '2026-07-05 12:37:26',
  });
}