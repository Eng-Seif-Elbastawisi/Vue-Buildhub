import type Params from '@/base/Core/Params/params';
import { ClassValidation, ValidationError } from '@/base/Presentation/Utils/classValidation';
import { validId } from '../../../Schedule/core/constants/schedule.constants';
import { decimalCents } from './purchase-request-receipt-item.params';
import PurchaseRequestDisbursementItemParams from './purchase-request-disbursement-item.params';

export default class StorePurchaseRequestDisbursementParams implements Params {
  readonly quoteId: number;
  readonly receiverId: number;
  readonly type?: 1;
  readonly date: string;
  readonly notes?: string | null;
  readonly items: PurchaseRequestDisbursementItemParams[];

  constructor(fields: {
    quoteId: number;
    receiverId: number;
    type?: 1;
    date: string;
    notes?: string | null;
    items: PurchaseRequestDisbursementItemParams[];
  }) {
    this.quoteId = fields.quoteId;
    this.receiverId = fields.receiverId;
    this.type = fields.type;
    this.date = fields.date;
    this.notes = fields.notes;
    this.items = fields.items;
  }

  private static validation = new ClassValidation().setRules({
    quoteId: { required: true, custom: validId },
    receiverId: { required: true, custom: validId },
    date: {
      required: true,
      custom: (value: unknown) => {
        if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
        const parsed = new Date(`${value}T00:00:00Z`);
        return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
      },
    },
    items: { required: true, custom: (value: unknown) => Array.isArray(value) && value.length > 0 },
  });

  toMap() {
    return {
      quote_id: this.quoteId,
      receiver_id: this.receiverId,
      ...(this.type === undefined ? {} : { type: this.type }),
      date: this.date,
      ...(this.notes === undefined ? {} : { notes: this.notes }),
      items: this.items.map((item) => item.toMap()),
    };
  }

  validate() {
    const errors = StorePurchaseRequestDisbursementParams.validation.validate(this).errors;
    if (this.type !== undefined && this.type !== 1)
      errors.push({ field: 'type', message: 'material_disbursement.invalid_type' });
    if (this.notes !== undefined && this.notes !== null && typeof this.notes !== 'string')
      errors.push({ field: 'notes', message: 'material_disbursement.invalid_notes' });
    const ids = new Set<number>();
    this.items.forEach((item, index) => {
      if (!(item instanceof PurchaseRequestDisbursementItemParams)) {
        errors.push({ field: `items.${index}`, message: 'material_disbursement.invalid_item' });
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
          message: 'material_disbursement.duplicate_item',
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
    quoteId: number;
    receiverId: number;
    date: string;
    notes?: string | null;
    entries: {
      purchaseRequestItemId: number;
      selected: boolean;
      quantity: string;
      availableQuantity: string;
    }[];
  }) {
    const items: PurchaseRequestDisbursementItemParams[] = [];
    const errors: string[] = [];
    const ids = new Set<number>();
    fields.entries.forEach((entry) => {
      if (!entry.selected) return;
      const value = entry.quantity.trim();
      if (value === '' || /^0(?:\.0{1,2})?$/.test(value)) return;
      const cents = decimalCents(value);
      const available = decimalCents(entry.availableQuantity);
      if (
        cents === null ||
        cents <= 0 ||
        available === null ||
        cents > available ||
        ids.has(entry.purchaseRequestItemId) ||
        !validId(entry.purchaseRequestItemId)
      ) {
        errors.push('material_disbursement.invalid_quantity');
        return;
      }
      ids.add(entry.purchaseRequestItemId);
      items.push(
        new PurchaseRequestDisbursementItemParams(entry.purchaseRequestItemId, Number(value)),
      );
    });
    const params = new StorePurchaseRequestDisbursementParams({ ...fields, items });
    return { params, errors };
  }
}
