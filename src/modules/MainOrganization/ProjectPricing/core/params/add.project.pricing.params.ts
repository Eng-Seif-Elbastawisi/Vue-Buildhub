import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { type ProjectPricingDiscountEnum } from '../constant/project.pricing.discount.enum';

export default class AddProjectPricingParams implements Params {
  public total_tax?: number;
  public discount_type?: ProjectPricingDiscountEnum;
  public discount_value?: number;
  public project_id?: number;

  public static readonly validation = new ClassValidation().setRules({
    total_tax: { required: true },
    discount_type: { required: true },
    discount_value: { required: true },
    project_id: { required: true },
  });

  constructor(data: {
    total_tax?: number;
    discount_type?: ProjectPricingDiscountEnum;
    discount_value?: number;
    project_id?: number;
  }) {
    this.total_tax = data.total_tax;
    this.discount_type = data.discount_type;
    this.discount_value = data.discount_value;
    this.project_id = data.project_id;
  }

  toMap(): Record<string, unknown> {
    return {
      total_tax: this.total_tax,
      discount_type: this.discount_type,
      discount_value: this.discount_value,
      project_id: this.project_id,
    };
  }

  validate() {
    return AddProjectPricingParams.validation.validate(this);
  }

  validateOrThrow() {
    return AddProjectPricingParams.validation.validateOrThrow(this);
  }
}
