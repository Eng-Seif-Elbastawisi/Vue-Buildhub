import TitleInterface from '@/base/Data/Models/titleInterface';

export default class ExecutionQuoteStageItemModel {
  public readonly id?: number;
  public readonly itemType?: number;
  public readonly itemableId?: number;
  public readonly itemableType?: string;
  public readonly itemable?: TitleInterface<number>;
  public readonly expectedPrice?: number;
  public readonly quantity?: number;
  public readonly unitId?: number;
  public readonly measurementUnit?: TitleInterface<number>;

  constructor(data: {
    id?: number;
    itemType?: number;
    itemableId?: number;
    itemableType?: string;
    itemable?: TitleInterface<number>;
    expectedPrice?: number;
    quantity?: number;
    unitId?: number;
    measurementUnit?: TitleInterface<number>;
  }) {
    this.id = data.id;
    this.itemType = data.itemType;
    this.itemableId = data.itemableId;
    this.itemableType = data.itemableType;
    this.itemable = data.itemable;
    this.expectedPrice = data.expectedPrice;
    this.quantity = data.quantity;
    this.unitId = data.unitId;
    this.measurementUnit = data.measurementUnit;

    Object.freeze(this);
  }

  static fromJson(json: Record<string, unknown>): ExecutionQuoteStageItemModel {
    const itemable = json.itemable as Record<string, unknown> | undefined;
    const measurementUnit = json.measurement_unit as Record<string, unknown> | undefined;
    const unitId = measurementUnit?.id ?? json.unit;

    return new ExecutionQuoteStageItemModel({
      id: json.id == null ? undefined : Number(json.id),
      itemType: json.item_type == null ? undefined : Number(json.item_type),
      itemableId: json.itemable_id == null ? undefined : Number(json.itemable_id),
      itemableType: json.itemable_type as string | undefined,
      itemable: itemable
        ? new TitleInterface<number>({
            id: Number(itemable.id),
            title: itemable.title as string | undefined,
          })
        : undefined,
      expectedPrice: json.expected_price == null ? undefined : Number(json.expected_price),
      quantity: json.quantity == null ? undefined : Number(json.quantity),
      unitId: unitId == null ? undefined : Number(unitId),
      measurementUnit: measurementUnit
        ? new TitleInterface<number>({
            id: Number(measurementUnit.id),
            title: measurementUnit.title as string | undefined,
          })
        : undefined,
    });
  }
}
