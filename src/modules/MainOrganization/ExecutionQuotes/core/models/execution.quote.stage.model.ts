import TitleInterface from '@/base/Data/Models/titleInterface';

import ExecutionQuoteStageItemModel from './execution.quote.stage-item.model';

export default class ExecutionQuoteStageModel {
  public readonly id?: number;
  public readonly quoteId?: number;
  public readonly projectId?: number;
  public readonly stageId?: number;
  public readonly subStageId?: number;
  public readonly stage?: TitleInterface<number>;
  public readonly subStage?: TitleInterface<number>;
  public readonly items: ExecutionQuoteStageItemModel[];
  public readonly clientPrice?: number;
  public readonly percentage?: number;
  public readonly totalPrice?: number;
  public readonly createdAt?: string;

  constructor(data: {
    id?: number;
    quoteId?: number;
    projectId?: number;
    stageId?: number;
    subStageId?: number;
    stage?: TitleInterface<number>;
    subStage?: TitleInterface<number>;
    items?: ExecutionQuoteStageItemModel[];
    clientPrice?: number;
    percentage?: number;
    totalPrice?: number;
    createdAt?: string;
  }) {
    this.id = data.id;
    this.quoteId = data.quoteId;
    this.projectId = data.projectId;
    this.stageId = data.stageId;
    this.subStageId = data.subStageId;
    this.stage = data.stage;
    this.subStage = data.subStage;
    this.items = data.items ?? [];
    this.clientPrice = data.clientPrice;
    this.percentage = data.percentage;
    this.totalPrice = data.totalPrice;
    this.createdAt = data.createdAt;

    Object.freeze(this);
  }

  static fromJson(
    quoteStage: Record<string, unknown>,
    stageGroup: Record<string, unknown> = quoteStage,
  ): ExecutionQuoteStageModel {
    const stage = quoteStage.stage as Record<string, unknown> | undefined;
    const subStage = (stageGroup.sub_stage ?? quoteStage.sub_stage) as
      Record<string, unknown> | undefined;
    const items = Array.isArray(stageGroup.items ?? quoteStage.items)
      ? ((stageGroup.items ?? quoteStage.items) as Record<string, unknown>[])
      : [];
    const stageId = stage?.id ?? quoteStage.stage_id;
    const subStageId = subStage?.id ?? stageGroup.sub_stage_id ?? quoteStage.sub_stage_id;
    const clientPrice = stageGroup.client_price ?? quoteStage.client_price;
    const percentage = stageGroup.percentage ?? quoteStage.percentage;

    return new ExecutionQuoteStageModel({
      id: quoteStage.id == null ? undefined : Number(quoteStage.id),
      quoteId: quoteStage.quote_id == null ? undefined : Number(quoteStage.quote_id),
      projectId: quoteStage.project_id == null ? undefined : Number(quoteStage.project_id),
      stageId: stageId == null ? undefined : Number(stageId),
      subStageId: subStageId == null ? undefined : Number(subStageId),
      stage: stage
        ? new TitleInterface<number>({
            id: Number(stage.id),
            title: stage.title as string | undefined,
          })
        : undefined,
      subStage: subStage
        ? new TitleInterface<number>({
            id: Number(subStage.id),
            title: subStage.title as string | undefined,
          })
        : undefined,
      items: items.map(ExecutionQuoteStageItemModel.fromJson),
      clientPrice: clientPrice == null ? undefined : Number(clientPrice),
      percentage: percentage == null ? undefined : Number(percentage),
      totalPrice: stageGroup.total_price == null ? undefined : Number(stageGroup.total_price),
      createdAt: (stageGroup.created_at ?? quoteStage.created_at) as string | undefined,
    });
  }

  static fromList(rawStages: unknown): ExecutionQuoteStageModel[] {
    if (!Array.isArray(rawStages)) return [];

    return (rawStages as Record<string, unknown>[]).flatMap((quoteStage) => {
      const stageGroups =
        Array.isArray(quoteStage.sub_stages) && quoteStage.sub_stages.length
          ? (quoteStage.sub_stages as Record<string, unknown>[])
          : [quoteStage];

      return stageGroups.map((stageGroup) =>
        ExecutionQuoteStageModel.fromJson(quoteStage, stageGroup),
      );
    });
  }
}
