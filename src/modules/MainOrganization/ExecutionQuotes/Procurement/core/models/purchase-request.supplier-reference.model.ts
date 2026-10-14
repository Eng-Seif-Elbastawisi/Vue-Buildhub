// Supplier master mapping requires phone/materials/specialization; this relation only has id/name.
export default class PurchaseRequestSupplierReferenceModel {
  readonly id: number;
  readonly name: string | null;
  constructor(id: number, name: string | null) {
    this.id = id;
    this.name = name;
  }
  static fromJson(payload: unknown) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload))
      throw new Error('procurement.offers.invalid_response');
    const record = payload as Record<string, unknown>;
    if (
      typeof record.id !== 'number' ||
      !Number.isSafeInteger(record.id) ||
      record.id <= 0 ||
      (record.name != null && typeof record.name !== 'string')
    )
      throw new Error('procurement.offers.invalid_response');
    return new PurchaseRequestSupplierReferenceModel(
      record.id,
      (record.name as string | null | undefined) ?? null,
    );
  }
}
