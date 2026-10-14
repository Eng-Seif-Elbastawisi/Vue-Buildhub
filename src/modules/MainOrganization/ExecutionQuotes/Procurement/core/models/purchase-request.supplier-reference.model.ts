// Supplier master mapping requires phone/materials/specialization; this relation only has id/name.
export default class PurchaseRequestSupplierReferenceModel {
  readonly id: number;
  readonly name: string | null;
  constructor(id: number, name: string | null) {
    this.id = id;
    this.name = name;
  }
  static fromJson(payload: Record<string, number | string | null | undefined>): PurchaseRequestSupplierReferenceModel {

    return new PurchaseRequestSupplierReferenceModel(
      payload.id as number,
      (payload.title as string | null | undefined) ?? null,
    );
  }
}
