import type TitleModel from '@/base/Core/Models/titleModel';
import ProjectTimelineSubStageModel, { mappedLabel } from './project.timeline.sub-stage.model';
import { responseObject } from './schedule.response';
export default class ProjectTimelineStageModel {
  readonly parentId?: number | null;
  readonly id: number;
  readonly quoteStageId: number;
  readonly title: string;
  readonly children: ProjectTimelineSubStageModel[];
  readonly stage?: TitleModel;
  readonly subStage?: TitleModel | null;
  readonly createdAt?: string | null;
  constructor(stage: {
    parentId?: number | null;
    id: number;
    quoteStageId: number;
    title: string | null;
    children: ProjectTimelineSubStageModel[];
    stage?: TitleModel;
    subStage?: TitleModel | null;
    createdAt?: string | null;
  }) {
    this.parentId = stage.parentId;
    this.id = stage.id;
    this.quoteStageId = stage.quoteStageId;
    this.title = stage.title;
    this.children = stage.children;
    this.stage = stage.stage;
    this.subStage = stage.subStage;
    this.createdAt = stage.createdAt;
  }
  static fromJson(value: unknown): ProjectTimelineStageModel {
    const payload = responseObject(value);
    const label = mappedLabel(payload.stage);
    // Use the QuoteStage association ID, rather than the nested master Stage ID.
    return new ProjectTimelineStageModel({
      parentId: payload.parent_id as number | null | undefined,
      id: payload.id as number,
      quoteStageId: payload.quote_stage_id as number,
      title: label.title as string,
      stage: label as TitleModel,
      subStage: payload.sub_stage ? mappedLabel(payload.sub_stage) : null,
      createdAt: payload.created_at as string | null | undefined,
      children: payload.children.length > 0 && Array.isArray(payload.children) ? payload.children?.map((child: unknown) =>
        ProjectTimelineSubStageModel.fromJson(child),
      ) : [],
    });
  }
}
