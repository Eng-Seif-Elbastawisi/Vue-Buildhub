import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { type ProjectPricingDiscountEnum } from '../constant/project.pricing.discount.enum';

export default class EditProjectPricingParams implements Params {
  public project_pricing_id?: number;
  public total_tax?: number;
  public discount_type?: ProjectPricingDiscountEnum;
  public discount_value?: number;

  public static readonly validation = new ClassValidation().setRules({
    // project_pricing_id: { required: true },
    // total_tax: { required: true },
    // discount_type: { required: true },
    // discount_value: { required: true },
  });

  constructor(data: {
    project_pricing_id?: number;
    total_tax?: number;
    discount_type?: ProjectPricingDiscountEnum;
    discount_value?: number;
  }) {
    this.project_pricing_id = data.project_pricing_id;
    this.total_tax = data.total_tax;
    this.discount_type = data.discount_type;
    this.discount_value = data.discount_value;
  }

  toMap(): Record<string, unknown> {
    return {
      project_pricing_id: this.project_pricing_id,
      total_tax: this.total_tax,
      discount_type: this.discount_type,
      discount_value: this.discount_value,
    };
  }

  validate() {
    return EditProjectPricingParams.validation.validate(this);
  }

  validateOrThrow() {
    return EditProjectPricingParams.validation.validateOrThrow(this);
  }
}
