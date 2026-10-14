import type Params from '@/base/Core/Params/params';
import { ClassValidation, ValidationError } from '@/base/Presentation/Utils/classValidation';
import { validId } from '../../../Schedule/core/constants/schedule.constants';
import type PurchaseRequestSupplierPriceParams from './purchase-request.supplier-price.params';
export default class StorePurchaseRequestPricesParams implements Params {
  public purchaseRequestId: number;
  public suppliers: PurchaseRequestSupplierPriceParams[];
  constructor(purchaseRequestId: number, suppliers: PurchaseRequestSupplierPriceParams[]) {
    this.purchaseRequestId = purchaseRequestId;
    this.suppliers = suppliers;
  }
  private static validation = new ClassValidation().setRules({
    purchaseRequestId: { required: true, custom: validId },
  });
  toMap() {
    return {
      purchase_request_id: this.purchaseRequestId,
      suppliers: this.suppliers.map((supplier) => supplier.toMap()),
    };
  }
  validate() {
    const errors = StorePurchaseRequestPricesParams.validation.validate(this).errors;
    const ids = new Set<number>();
    this.suppliers.forEach((supplier, index) => {
      errors.push(
        ...supplier
          .validate()
          .errors.map((error) => ({ ...error, field: `suppliers.${index}.${error.field}` })),
      );
      if (ids.has(supplier.supplierId))
        errors.push({
          field: `suppliers.${index}.supplierId`,
          message: 'procurement.offers.duplicate_supplier',
        });
      ids.add(supplier.supplierId);
    });
    return { isValid: errors.length === 0, errors };
  }
  validateOrThrow() {
    const result = this.validate();
    if (!result.isValid) new ValidationError(result.errors).openDialog();
  }
}
