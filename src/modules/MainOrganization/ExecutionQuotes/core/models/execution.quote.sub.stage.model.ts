import TitleInterface from '@/base/Data/Models/titleInterface';

import ExecutionQuoteStageItemModel from './execution.quote.stage-item.model';

export default class ExecutionQuoteSubStageModel {
  public readonly id?: number;
  public readonly subStage?: TitleInterface<number>;
  public readonly items: ExecutionQuoteStageItemModel[];
  public readonly clientPrice?: number | null;
  public readonly percentage?: number;
  public readonly totalPrice?: number;
  public readonly createdAt?: string;

  constructor(data: {
    id?: number;
    subStage?: TitleInterface<number>;
    items?: ExecutionQuoteStageItemModel[];
    clientPrice?: number | null;
    percentage?: number;
    totalPrice?: number;
    createdAt?: string;
  }) {
    this.id = data.id;

    this.subStage = data.subStage;
    this.items = data.items ?? [];
    this.clientPrice = data.clientPrice;
    this.percentage = data.percentage;
    this.totalPrice = data.totalPrice;
    this.createdAt = data.createdAt;

    Object.freeze(this);
  }

  static fromJson(data: Record<string, unknown>): ExecutionQuoteSubStageModel {
    const subStage = data.sub_stage as Record<string, unknown> | undefined;
    return new ExecutionQuoteSubStageModel({
      id: data.id == null ? undefined : Number(data.id),
      subStage: subStage
        ? new TitleInterface<number>({
          id: Number(subStage.id),
          title: subStage.title as string | undefined,
        })
        : undefined,
      items: Array.isArray(data.items)
        ? (data.items as Record<string, unknown>[]).map(ExecutionQuoteStageItemModel.fromJson)
        : [],
      clientPrice: data.client_price == null ? data.client_price : Number(data.client_price),
      percentage: data.percentage == null ? undefined : Number(data.percentage),
      totalPrice: data.total_price == null ? undefined : Number(data.total_price),
      createdAt: data.created_at as string | undefined,
    });
  }
}
