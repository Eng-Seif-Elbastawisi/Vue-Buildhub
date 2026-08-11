import type Params from '@/base/Core/Params/params';
import { ClassValidation, ValidationError } from '@/base/Presentation/Utils/classValidation';
import { translate } from '@/locales/i18n';
import { requiredSelectRule } from '@/base/Presentation/Utils/input_title';
import {
  isValidProjectPricingDiscount,
  type ProjectPricingDiscountEnum,
} from '../constant/project.pricing.discount.enum';

export default class EditProjectPricingParams implements Params {
  public project_pricing_id?: number;
  public total_tax?: number;
  public discount_type?: ProjectPricingDiscountEnum;
  public discount_value?: number;

  public static readonly validation = new ClassValidation().setRules({
    // project_pricing_id: { required: true },
    // total_tax: { required: true },
    discount_type: requiredSelectRule(),
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
    const validationResult = EditProjectPricingParams.validation.validate(this);

    if (isValidProjectPricingDiscount(this.discount_type, this.discount_value)) {
      return validationResult;
    }

    return {
      isValid: false,
      errors: [
        ...validationResult.errors,
        {
          field: 'discount_value',
          message: translate('project_pricing.discount_percentage_range_error'),
        },
      ],
    };
  }

  validateOrThrow() {
    const validationResult = this.validate();

    if (!validationResult.isValid) {
      new ValidationError(validationResult.errors).openDialog();
    }
  }
}
