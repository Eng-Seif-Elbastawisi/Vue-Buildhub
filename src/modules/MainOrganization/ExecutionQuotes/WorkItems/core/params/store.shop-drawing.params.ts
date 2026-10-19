import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { positiveId, dateOnly } from '../constants/work-items.constants';
export default class StoreShopDrawingQuoteParams implements Params {
  readonly fields: {
    quoteId: number;
    title: string;
    date: string | null;
    versionNumber: string;
    file: string | null;
    projectTimelineStageIds: number[];
    projectFloorSpaceId?: number | null;
  };
  constructor(fields: {
    quoteId: number;
    title: string;
    date: string | null;
    versionNumber: string;
    file: string | null;
    projectTimelineStageIds: number[];
    projectFloorSpaceId?: number | null;
  }) {
    this.fields = fields;
  }
  private static validation = new ClassValidation().setRules({
    projectFloorSpaceId: { custom: positiveId },
    quoteId: { required: true, custom: positiveId },
    title: { required: true },
    date: { custom: dateOnly },
    file: { custom: (file: unknown) => typeof file === 'string' },
    versionNumber: { required: true },
    projectTimelineStageIds: {
      required: true,
      custom: (ids: unknown) =>
        Array.isArray(ids) &&
        ids.length > 0 &&
        ids.every(positiveId) &&
        new Set(ids).size === ids.length,
    },
  });
  toMap() {
    return {
      quote_id: this.fields.quoteId,
      ...(this.fields.projectFloorSpaceId == null
        ? {}
        : { project_floor_space_id: this.fields.projectFloorSpaceId }),
      title: this.fields.title.trim(),
      date: this.fields.date,
      version_number: this.fields.versionNumber.trim(),
      file: this.fields.file,
      project_timeline_stage_ids: [...this.fields.projectTimelineStageIds],
    };
  }
  validate() {
    return StoreShopDrawingQuoteParams.validation.validate(this.fields);
  }
  validateOrThrow() {
    StoreShopDrawingQuoteParams.validation.validateOrThrow(this.fields);
  }
}
