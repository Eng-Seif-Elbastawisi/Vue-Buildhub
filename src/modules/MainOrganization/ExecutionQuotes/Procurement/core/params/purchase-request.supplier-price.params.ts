import { ClassValidation, ValidationError } from '@/base/Presentation/Utils/classValidation';
import { DurationType } from '@/modules/shared/Package/core/constants/duration.type.enum';
import { validId } from '../../../Schedule/core/constants/schedule.constants';
export default class PurchaseRequestSupplierPriceParams {
  public supplierId: number;
  public price: number;
  public duration: number;
  public durationType: number;
  constructor(supplierId: number, price: number, duration: number, durationType: number) {
    this.supplierId = supplierId;
    this.price = price;
    this.duration = duration;
    this.durationType = durationType;
  }
  private static validation = new ClassValidation().setRules({
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
