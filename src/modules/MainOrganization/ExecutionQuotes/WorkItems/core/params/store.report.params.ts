import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { positiveId, dateOnly, type SiteSafetyStatus } from '../constants/work-items.constants';
export default class StoreReportParams implements Params {
  public projectTimelineStageId: number;
  public date: string;
  public notes: string | null;
  public siteSafetyStatus: SiteSafetyStatus;
  constructor(
    projectTimelineStageId: number,
    date: string,
    notes: string | null,
    siteSafetyStatus: SiteSafetyStatus,
  ) {
    this.projectTimelineStageId = projectTimelineStageId;
    this.date = date;
    this.notes = notes;
    this.siteSafetyStatus = siteSafetyStatus;
  }
  private static validation = new ClassValidation().setRules({
    projectTimelineStageId: { required: true, custom: positiveId },
    date: { required: true, custom: dateOnly },
    siteSafetyStatus: {
      required: true,
      custom: (status: unknown) => [1, 2, 3].includes(Number(status)) && typeof status === 'number',
    },
  });
  toMap() {
    return {
      project_timeline_stage_id: this.projectTimelineStageId,
      date: this.date,
      notes: this.notes,
      site_safety_status: this.siteSafetyStatus,
    };
  }
  validate() {
    return StoreReportParams.validation.validate(this);
  }
  validateOrThrow() {
    StoreReportParams.validation.validateOrThrow(this);
  }
}
