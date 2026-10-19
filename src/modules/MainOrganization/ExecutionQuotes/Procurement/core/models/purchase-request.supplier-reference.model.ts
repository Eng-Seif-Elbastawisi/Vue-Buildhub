import { validId } from '../../../Schedule/core/constants/schedule.constants';

// Offer summaries use title; keep the existing name accessor for lookup consumers.
export default class PurchaseRequestSupplierReferenceModel {
  readonly id: number;
  readonly title: string | null;
  get name() {
    return this.title;
  }
  constructor(id: number, title: string | null) {
    this.id = id;
    this.title = title;
  }
  static fromJson(payload: unknown): PurchaseRequestSupplierReferenceModel {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload))
      throw new Error('procurement.offers.invalid_response');
    const supplier = payload as Record<string, unknown>;
    const title = supplier.title ?? supplier.name ?? null;
    if (
      typeof supplier.id !== 'number' ||
      !validId(supplier.id) ||
      (title !== null && typeof title !== 'string')
    )
      throw new Error('procurement.offers.invalid_response');
    return new PurchaseRequestSupplierReferenceModel(supplier.id as number, title as string | null);
  }
}
