import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { type ProjectItemPriceEnum } from '../constant/project.item.Price.enum';

export default class EditProjectItemParams implements Params {
  public project_item_id?: number;
  public price?: number;
  public quantity?: number;
  public item_id?: number;
  public pricing_method?: ProjectItemPriceEnum;
  public project_floor_id?: number;

  public static readonly validation = new ClassValidation().setRules({
    // project_item_id: { required: true },
    // price: { required: true },
    // quantity: { required: true },
    // item_id: { required: true },
    // pricing_method: { required: true },
    // project_floor_id: { required: true },
  });

  constructor(data: {
    project_item_id?: number;
    price?: number;
    quantity?: number;
    item_id?: number;
    pricing_method?: ProjectItemPriceEnum;
    project_floor_id?: number;
  }) {
    this.project_item_id = data.project_item_id;
    this.price = data.price;
    this.quantity = data.quantity;
    this.item_id = data.item_id;
    this.pricing_method = data.pricing_method;
    this.project_floor_id = data.project_floor_id;
  }

  toMap(): Record<string, unknown> {
    return {
      project_item_id: this.project_item_id,
      price: this.price,
      quantity: this.quantity,
      item_id: this.item_id,
      pricing_method: this.pricing_method,
      project_floor_id: this.project_floor_id,
    };
  }

  validate() {
    return EditProjectItemParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditProjectItemParams.validation.validateOrThrow(this);
  }
}
