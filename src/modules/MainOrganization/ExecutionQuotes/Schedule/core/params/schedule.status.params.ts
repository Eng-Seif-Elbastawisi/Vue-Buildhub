import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { validId } from '../constants/schedule.constants';
import {
  isApprovalStatus,
  isWorkReason,
  isWorkStatus,
  type TimelineApprovalStatus,
  type TimelineWorkReason,
  type TimelineWorkStatus,
} from '../constants/timeline.status';

export class ChangeTimelineApprovalParams implements Params {
  static readonly validation = new ClassValidation().setRules({
    quoteId: { required: true, custom: validId },
    timelineStatus: { required: true, custom: isApprovalStatus },
  });
  public quoteId: number;
  public timelineStatus: TimelineApprovalStatus;
  public timelineNote?: string | null;
  constructor(
    quoteId: number,
    timelineStatus: TimelineApprovalStatus,
    timelineNote?: string | null,
  ) {
    this.quoteId = quoteId;
    this.timelineStatus = timelineStatus;
    this.timelineNote = timelineNote;
  }
  toMap() {
    return {
      quote_id: this.quoteId,
      timeline_status: this.timelineStatus,
      ...(this.timelineNote === undefined ? {} : { timeline_note: this.timelineNote }),
    };
  }
  validate() {
    return ChangeTimelineApprovalParams.validation.validate(this);
  }
  validateOrThrow() {
    ChangeTimelineApprovalParams.validation.validateOrThrow(this);
  }
}

export class ChangeTimelineWorkStatusParams implements Params {
  static readonly validation = new ClassValidation().setRules({
    projectTimelineId: { required: true, custom: validId },
    workStatus: { required: true, custom: isWorkStatus },
    reason: { custom: isWorkReason },
  });
  public projectTimelineId: number;
  public workStatus: TimelineWorkStatus;
  public reason?: TimelineWorkReason | null;
  public note?: string | null;
  constructor(
    projectTimelineId: number,
    workStatus: TimelineWorkStatus,
    reason?: TimelineWorkReason | null,
    note?: string | null,
  ) {
    this.projectTimelineId = projectTimelineId;
    this.workStatus = workStatus;
    this.reason = reason;
    this.note = note;
  }
  toMap() {
    return {
      project_timeline_id: this.projectTimelineId,
      work_status: this.workStatus,
      ...(this.reason === undefined ? {} : { reason: this.reason }),
      ...(this.note === undefined ? {} : { note: this.note }),
    };
  }
  validate() {
    return ChangeTimelineWorkStatusParams.validation.validate(this);
  }
  validateOrThrow() {
    ChangeTimelineWorkStatusParams.validation.validateOrThrow(this);
  }
}
