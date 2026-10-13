import TitleModel from '@/base/Core/Models/titleModel';
import { responseObject, responseId, responseText, nullableText } from './work-items.response';
function label(payload: unknown): TitleModel | null {
  if (payload === null || payload === undefined) return null;
  const record = responseObject(payload);
  responseId(record.id);
  responseText(record.title);
  return TitleModel.fromMap(record);
}
export default class ShopDrawingTimelineStageModel {
  readonly projectTimelineStageId: number;
  readonly stage: TitleModel | null;
  readonly subStage: TitleModel | null;
  readonly createdAt: string | null;
  constructor(fields: {
    projectTimelineStageId: number;
    stage: TitleModel | null;
    subStage: TitleModel | null;
    createdAt: string | null;
  }) {
    this.projectTimelineStageId = fields.projectTimelineStageId;
    this.stage = fields.stage;
    this.subStage = fields.subStage;
    this.createdAt = fields.createdAt;
  }
  static fromJson(payload: unknown) {
    const record = responseObject(payload);
    return new ShopDrawingTimelineStageModel({
      projectTimelineStageId: responseId(record.id),
      stage: label(record.stage),
      subStage: label(record.sub_stage),
      createdAt: nullableText(record.created_at),
    });
  }
}
