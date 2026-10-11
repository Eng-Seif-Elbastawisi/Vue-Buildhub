import TitleModel from '@/base/Core/Models/titleModel';
import { responseObject } from './schedule.response';
import { validId } from '../constants/schedule.constants';
export function mappedLabel(value: unknown): TitleModel | null | undefined {
  if (value === null || value === undefined) return value;
  const label = responseObject(value);
  if (
    typeof label.id !== 'number' ||
    !validId(label.id) ||
    typeof (label.title ?? label.name) !== 'string'
  )
    throw new Error('schedule.invalid_response');
  return TitleModel.fromMap(label);
}
export default class ProjectTimelineSubStageModel {
  readonly subStageId: number;
  readonly title: string;
  readonly stage?: TitleModel | null;
  readonly subStage?: TitleModel;
  readonly createdAt?: string | null;
  constructor(child: {
    subStageId: number;
    title: string;
    stage?: TitleModel | null;
    subStage?: TitleModel;
    createdAt?: string | null;
  }) {
    this.subStageId = child.subStageId;
    this.title = child.title;
    this.stage = child.stage;
    this.subStage = child.subStage;
    this.createdAt = child.createdAt;
  }
  static fromJson(value: unknown): ProjectTimelineSubStageModel {
    const payload = responseObject(value);
    const subStage = mappedLabel(payload.sub_stage);
    if (
      typeof payload.id !== 'number' ||
      !validId(payload.id) ||
      !subStage ||
      typeof subStage.title !== 'string' ||
      (payload.created_at !== undefined &&
        payload.created_at !== null &&
        typeof payload.created_at !== 'string')
    )
      throw new Error('schedule.invalid_response');
    return new ProjectTimelineSubStageModel({
      subStageId: payload.id,
      title: subStage.title,
      subStage,
      stage: mappedLabel(payload.stage),
      createdAt: payload.created_at,
    });
  }
}
