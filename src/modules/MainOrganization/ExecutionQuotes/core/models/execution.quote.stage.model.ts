import TitleInterface from '@/base/Data/Models/titleInterface';

import ExecutionQuoteStageItemModel from './execution.quote.stage-item.model';
import ExecutionQuoteSubStageModel from './execution.quote.sub.stage.model';

export default class ExecutionQuoteStageModel {
  public readonly id?: number;
  public readonly quoteId?: number;
  public readonly projectId?: number;
  public readonly stageId?: number;
  public readonly subStageId?: number;
  public readonly stage?: TitleInterface<number>;
  public readonly subStage?: ExecutionQuoteSubStageModel[];
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
    subStage?: ExecutionQuoteSubStageModel[];
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
    this.clientPrice = data.clientPrice;
    this.percentage = data.percentage;
    this.totalPrice = data.totalPrice;
    this.createdAt = data.createdAt;

    Object.freeze(this);
  }

  static fromJson(
    data: Record<string, unknown | null | undefined | number | Record<string, unknown>[] | Record<string, unknown>>,
  ): ExecutionQuoteStageModel {
    const stage = data.stage as Record<string, unknown> | undefined;
    const subStages = data.sub_stages as Record<string, unknown>[];

    return new ExecutionQuoteStageModel({
      id: data.id == null ? undefined : Number(data.id),
      quoteId: data.quote_id == null ? undefined : Number(data.quote_id),
      projectId: data.project_id == null ? undefined : Number(data.project_id),
      stageId: data.stage_id == null ? undefined : Number(data.stage_id),
      subStageId: data.sub_stage_id == null ? undefined : Number(data.sub_stage_id),
      stage: stage
        ? new TitleInterface<number>({
          id: Number(stage.id),
          title: stage.title as string | undefined,
        })
        : undefined,
      subStage: subStages.length > 0
        ? subStages.map((subStage) => ExecutionQuoteSubStageModel.fromJson(subStage))
        : [],
      clientPrice: data.client_price as number | undefined,
      percentage: data.percentage as number | undefined,
      totalPrice: data.total_price as number | undefined,
      createdAt: data.created_at as string | undefined,
    });
  }

}
