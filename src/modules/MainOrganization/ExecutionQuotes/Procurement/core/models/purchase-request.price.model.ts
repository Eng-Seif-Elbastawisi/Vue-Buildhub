import {
  DurationType,
  type DurationType as DurationUnit,
} from '@/modules/shared/Package/core/constants/duration.type.enum';
import PurchaseRequestSupplierReferenceModel from './purchase-request.supplier-reference.model';
export default class PurchaseRequestPriceModel {
  readonly id: number;
  readonly purchaseRequestId: number;
  readonly supplier: PurchaseRequestSupplierReferenceModel | null;
  readonly price: string | null;
  readonly duration: number | null;
  readonly durationType: DurationUnit | null;
  readonly createdAt: string | null;
  constructor(fields: {
    id: number;
    purchaseRequestId: number;
    supplier: PurchaseRequestSupplierReferenceModel | null;
    price: string | null;
    duration: number | null;
    durationType: DurationUnit | null;
    createdAt: string | null;
  }) {
    this.id = fields.id;
    this.purchaseRequestId = fields.purchaseRequestId;
    this.supplier = fields.supplier;
    this.price = fields.price;
    this.duration = fields.duration;
    this.durationType = fields.durationType;
    this.createdAt = fields.createdAt;
  }
  static fromJson(payload: unknown): PurchaseRequestPriceModel {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload))
      throw new Error('procurement.offers.invalid_response');
    const record = payload as Record<string, unknown>;
    if (
      ![record.id, record.purchase_request_id].every(
        (value) => typeof value === 'number' && Number.isSafeInteger(value) && value > 0,
      ) ||
      (record.price != null &&
        (typeof record.price !== 'string' || !/^\d+(\.\d+)?$/.test(record.price))) ||
      (record.duration != null &&
        (typeof record.duration !== 'number' ||
          !Number.isSafeInteger(record.duration) ||
          record.duration < 0)) ||
      (record.duration_type != null &&
        !Object.values(DurationType).some((unit) => unit === record.duration_type)) ||
      (record.created_at != null && typeof record.created_at !== 'string')
    )
      throw new Error('procurement.offers.invalid_response');
    return new PurchaseRequestPriceModel({
      id: record.id as number,
      purchaseRequestId: record.purchase_request_id as number,
      supplier:
        record.supplier == null
          ? null
          : PurchaseRequestSupplierReferenceModel.fromJson(record.supplier),
      price: (record.price as string | null | undefined) ?? null,
      duration: (record.duration as number | null | undefined) ?? null,
      durationType: (record.duration_type as DurationUnit | null | undefined) ?? null,
      createdAt: (record.created_at as string | null | undefined) ?? null,
    });
  }
}
