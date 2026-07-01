import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { type ProjectItemPriceEnum } from '../constant/project.item.Price.enum';

export default class AddProjectItemParams implements Params {
  public price?: number;
  public quantity?: number;
  public item_id?: number;
  public pricing_method?: ProjectItemPriceEnum;
  public project_floor_id?: number;
  public static readonly validation = new ClassValidation().setRules({
    price: { required: true },
    quantity: { required: true },
    item_id: { required: true },
    pricing_method: { required: true },
    // project_floor_id: { required: true },
  });
  constructor(data: {
    price?: number;
    quantity?: number;
    item_id?: number;
    pricing_method?: ProjectItemPriceEnum;
    project_floor_id?: number;
  }) {
    this.price = data.price;
    this.quantity = data.quantity;
    this.item_id = data.item_id;
    this.pricing_method = data.pricing_method;
    this.project_floor_id = data.project_floor_id;
  }
  toMap(): Record<string, unknown> {
    return {
      price: this.price,
      quantity: this.quantity,
      item_id: this.item_id,
      pricing_method: this.pricing_method,
      project_floor_id: this.project_floor_id,
    };
  }
  validate() {
    return AddProjectItemParams.validation.validate(this);
  }
  validateOrThrow() {
    return AddProjectItemParams.validation.validateOrThrow(this);
  }
}
