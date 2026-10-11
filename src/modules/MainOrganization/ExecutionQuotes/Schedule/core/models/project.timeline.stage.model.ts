import type TitleModel from '@/base/Core/Models/titleModel';
import ProjectTimelineSubStageModel, { mappedLabel } from './project.timeline.sub-stage.model';
import { responseObject } from './schedule.response';
import { validId } from '../constants/schedule.constants';
export default class ProjectTimelineStageModel {
  readonly quoteStageId: number;
  readonly title: string;
  readonly children: ProjectTimelineSubStageModel[];
  readonly stage?: TitleModel;
  readonly subStage?: TitleModel | null;
  readonly createdAt?: string | null;
  constructor(stage: {
    quoteStageId: number;
    title: string;
    children: ProjectTimelineSubStageModel[];
    stage?: TitleModel;
    subStage?: TitleModel | null;
    createdAt?: string | null;
  }) {
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
      typeof payload.id !== 'number' ||
      !validId(payload.id) ||
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
      quoteStageId: payload.id,
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
