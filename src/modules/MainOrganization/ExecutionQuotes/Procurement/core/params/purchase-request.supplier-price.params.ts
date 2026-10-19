import { ClassValidation, ValidationError } from '@/base/Presentation/Utils/classValidation';
import { DurationType } from '@/modules/shared/Package/core/constants/duration.type.enum';
import { validId } from '../../../Schedule/core/constants/schedule.constants';
export default class PurchaseRequestSupplierPriceParams {
  public supplierId: number;
  public price: number;
  public duration: number;
  public durationType: number;
  public attachment?: string;
  constructor(
    supplierId: number,
    price: number,
    duration: number,
    durationType: number,
    attachment?: string,
  ) {
    this.attachment = attachment;
    this.supplierId = supplierId;
    this.price = price;
    this.duration = duration;
    this.durationType = durationType;
  }
  private static validation = new ClassValidation().setRules({
    attachment: {
      custom: (value: unknown) => typeof value === 'string' && /^data:[^;]+;base64,.+/.test(value),
    },
    supplierId: { required: true, custom: validId },
    price: {
      required: true,
      custom: (value: unknown) => typeof value === 'number' && Number.isFinite(value) && value >= 0,
    },
    duration: {
      required: true,
      custom: (value: unknown) =>
        typeof value === 'number' && Number.isSafeInteger(value) && value >= 0,
    },
    durationType: {
      required: true,
      custom: (value: unknown) => Object.values(DurationType).some((unit) => unit === value),
    },
  });
  toMap() {
    return {
      id: this.supplierId,
      ...(this.attachment === undefined ? {} : { attachment: this.attachment }),
      price: this.price,
      duration: this.duration,
      duration_type: this.durationType,
    };
  }
  validate() {
    return PurchaseRequestSupplierPriceParams.validation.validate(this);
  }
  validateOrThrow() {
    const result = this.validate();
    if (!result.isValid) new ValidationError(result.errors).openDialog();
  }
}
