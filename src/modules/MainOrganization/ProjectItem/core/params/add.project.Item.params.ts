import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { ProjectItemPriceEnum } from '../constant/project.item.Price.enum';
import { type FloorNumber } from '@/modules/MainOrganization/ProjectFloor/core/constants/floor.number.enum';
export default class AddProjectItemParams implements Params {
  public project_id: number = 0;
  public price?: number;
  public quantity?: number;
  public item_id?: number;
  public pricing_method?: ProjectItemPriceEnum;
  public project_floor_id?: FloorNumber;
  public project_floor_space_id?: number;

  public static readonly validation = new ClassValidation().setRules({
    project_id: { required: true },
    quantity: { required: true },
    item_id: { required: true },
    pricing_method: { required: true },
  });

  constructor(data: {
    project_id?: number;
    price?: number;
    quantity?: number;
    item_id?: number;
    pricing_method?: ProjectItemPriceEnum;
    project_floor_id?: FloorNumber;
    project_floor_space_id?: number;
  }) {
    this.project_id = data.project_id ?? 0;
    this.price = data.price;
    this.quantity = data.quantity;
    this.item_id = data.item_id;
    this.pricing_method = data.pricing_method;
    this.project_floor_id = data.project_floor_id;
    this.project_floor_space_id = data.project_floor_space_id;
  }

  toMap(): Record<string, unknown> {
    const map: Record<string, unknown> = {
      project_id: this.project_id,
      item_id: this.item_id,
      quantity: this.quantity,
      pricing_method: this.pricing_method,
    };

    if (this.pricing_method === ProjectItemPriceEnum.GENERAL_ITEM) {
      map.price = this.price;
    }

    if (this.pricing_method === ProjectItemPriceEnum.SPACE_RELATED) {
      map.project_floor_space_id = this.project_floor_space_id;
    }

    if (this.pricing_method === ProjectItemPriceEnum.FULL_FLOOR_RELATED) {
      map.price = this.price;
      map.project_floor_id = this.project_floor_id;
    }

    return map;
  }

  validate() {
    return AddProjectItemParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddProjectItemParams.validation.validateOrThrow(this);
  }
}
