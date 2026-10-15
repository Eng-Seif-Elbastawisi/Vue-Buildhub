import type Params from '@/base/Core/Params/params';
import { ClassValidation, ValidationError } from '@/base/Presentation/Utils/classValidation';
import { validId } from '../../../Schedule/core/constants/schedule.constants';
import PurchaseRequestReceiptItemParams, {
  decimalCents,
} from './purchase-request-receipt-item.params';

export default class StorePurchaseRequestReceiptParams implements Params {
  readonly purchaseRequestId: number;
  readonly employeeId?: number | null;
  readonly date: string;
  readonly items: PurchaseRequestReceiptItemParams[];
  constructor(fields: {
    purchaseRequestId: number;
    employeeId?: number | null;
    date: string;
    items: PurchaseRequestReceiptItemParams[];
  }) {
    this.purchaseRequestId = fields.purchaseRequestId;
    this.employeeId = fields.employeeId;
    this.date = fields.date;
    this.items = fields.items;
  }
  private static validation = new ClassValidation().setRules({
    purchaseRequestId: { required: true, custom: validId },
    date: {
      required: true,
      custom: (value: unknown) => {
        if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
        const date = new Date(`${value}T00:00:00Z`);
        return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
      },
    },
    items: { required: true, custom: (value: unknown) => Array.isArray(value) && value.length > 0 },
  });
  toMap() {
    return {
      purchase_request_id: this.purchaseRequestId,
      ...(this.employeeId === undefined ? {} : { employee_id: this.employeeId }),
      date: this.date,
      items: this.items.map((item) => item.toMap()),
    };
  }
  validate() {
    const errors = StorePurchaseRequestReceiptParams.validation.validate(this).errors;
    if (this.employeeId !== undefined && this.employeeId !== null && !validId(this.employeeId))
      errors.push({ field: 'employeeId', message: 'material_receipt.invalid_employee' });
    const ids = new Set<number>();
    this.items.forEach((item, index) => {
      if (!(item instanceof PurchaseRequestReceiptItemParams)) {
        errors.push({ field: `items.${index}`, message: 'material_receipt.invalid_item' });
        return;
      }
      errors.push(
        ...item
          .validate()
          .errors.map((error) => ({ ...error, field: `items.${index}.${error.field}` })),
      );
      if (ids.has(item.purchaseRequestItemId))
        errors.push({
          field: `items.${index}.purchaseRequestItemId`,
          message: 'material_receipt.duplicate_item',
        });
      ids.add(item.purchaseRequestItemId);
    });
    return { isValid: errors.length === 0, errors };
  }
  validateOrThrow() {
    const result = this.validate();
    if (!result.isValid) new ValidationError(result.errors).openDialog();
  }
  static fromEntries(fields: {
    purchaseRequestId: number;
    employeeId?: number | null;
    date: string;
    entries: { purchaseRequestItemId: number; quantity: string; remainingQuantity: string }[];
  }) {
    const items: PurchaseRequestReceiptItemParams[] = [];
    const errors: string[] = [];
    const ids = new Set<number>();
    fields.entries.forEach((entry) => {
      if (
        entry.quantity.trim() === '' ||
        entry.quantity === '0' ||
        entry.quantity === '0.0' ||
        entry.quantity === '0.00'
      )
        return;
      const cents = decimalCents(entry.quantity);
      const remaining = decimalCents(entry.remainingQuantity);
      if (
        cents === null ||
        cents <= 0 ||
        remaining === null ||
        cents > remaining ||
        ids.has(entry.purchaseRequestItemId)
      ) {
        errors.push('material_receipt.invalid_quantity');
        return;
      }
      ids.add(entry.purchaseRequestItemId);
      items.push(
        new PurchaseRequestReceiptItemParams(entry.purchaseRequestItemId, Number(entry.quantity)),
      );
    });
    const params = new StorePurchaseRequestReceiptParams({ ...fields, items });
    return { params, errors };
  }
}
