import type Params from '@/base/Core/Params/params';
import { ClassValidation, ValidationError } from '@/base/Presentation/Utils/classValidation';
import { translate } from '@/locales/i18n';
import { requiredSelectRule } from '@/base/Presentation/Utils/input_title';
import {
  isValidProjectPricingDiscount,
  type ProjectPricingDiscountEnum as ProjectPricingDiscountType,
} from '../constant/project.pricing.discount.enum';

export default class AddProjectPricingParams implements Params {
  public total_tax?: number;
  public discount_type?: ProjectPricingDiscountType;
  public discount_value?: number;
  public project_id?: number;

  public static readonly validation = new ClassValidation().setRules({
    total_tax: { required: true },
    discount_type: requiredSelectRule(),
    discount_value: { required: true },
    project_id: { required: true },
  });

  constructor(data: {
    total_tax?: number;
    discount_type?: ProjectPricingDiscountType;
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
    const validationResult = AddProjectPricingParams.validation.validate(this);

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
