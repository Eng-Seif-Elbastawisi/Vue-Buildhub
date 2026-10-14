
import {
  type DurationType as DurationUnit,
} from '@/modules/shared/Package/core/constants/duration.type.enum';
export default class PurchaseOrderPriceModel {
  public readonly id: number;
  public readonly price: string;
  public readonly duration: number;
  public readonly durationType: DurationUnit;
  constructor(id: number, price: string, duration: number, durationType: DurationUnit) {
    this.id = id;
    this.price = price;
    this.duration = duration;
    this.durationType = durationType;
  }
  static fromJson(payload: Record<string, unknown>): PurchaseOrderPriceModel {
    return new PurchaseOrderPriceModel(
      payload.id as number,
      payload.price as string,
      payload.duration as number,
      payload.duration_type as DurationUnit,
    );
  }
}
