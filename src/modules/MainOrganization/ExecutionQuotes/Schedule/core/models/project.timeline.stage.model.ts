import type TitleModel from '@/base/Core/Models/titleModel';
import ProjectTimelineSubStageModel, { mappedLabel } from './project.timeline.sub-stage.model';
import { responseObject } from './schedule.response';
import { validId } from '../constants/schedule.constants';
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
    title: string;
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
    if (
      (payload.parent_id !== undefined &&
        payload.parent_id !== null &&
        (typeof payload.parent_id !== 'number' || !validId(payload.parent_id))) ||
      typeof payload.id !== 'number' ||
      !validId(payload.id) ||
      typeof payload.quote_stage_id !== 'number' ||
      !validId(payload.quote_stage_id) ||
      !label ||
      typeof label.title !== 'string' ||
      !Array.isArray(payload.children) ||
      (payload.created_at !== undefined &&
        payload.created_at !== null &&
        typeof payload.created_at !== 'string')
    )
      throw new Error('schedule.invalid_response');
    // Use the QuoteStage association ID, rather than the nested master Stage ID.
    return new ProjectTimelineStageModel({
      parentId: payload.parent_id as number | null | undefined,
      id: payload.id,
      quoteStageId: payload.quote_stage_id,
      title: label.title,
      stage: label,
      subStage: mappedLabel(payload.sub_stage),
      createdAt: payload.created_at,
      children: payload.children.map((child: unknown) =>
        ProjectTimelineSubStageModel.fromJson(child),
      ),
    });
  }
}
