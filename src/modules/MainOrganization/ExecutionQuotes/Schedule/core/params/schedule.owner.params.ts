import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { isWorkStatus, type TimelineWorkStatus } from '../constants/timeline.status';
import { validId } from '../constants/schedule.constants';
export default class ScheduleOwnerParams implements Params {
  static readonly validation = new ClassValidation().setRules({
    quoteId: { required: true, custom: validId },
    groupId: { custom: validId },
    order: { custom: validId },
    workStatus: { custom: isWorkStatus },
  });
  public quoteId: number;
  public groupId?: number;
  public order?: number;
  public workStatus?: TimelineWorkStatus;
  constructor(quoteId: number, groupId?: number, order?: number, workStatus?: TimelineWorkStatus) {
    this.workStatus = workStatus;
    this.quoteId = quoteId;
    this.groupId = groupId;
    this.order = order;
  }
  toMap(): Record<string, unknown> {
    return {
      ...(this.groupId === undefined
        ? { quote_id: this.quoteId }
        : { project_timeline_id: this.groupId }),
      ...(this.workStatus === undefined ? {} : { work_status: this.workStatus }),
      ...(this.order === undefined ? {} : { order: this.order }),
    };
  }
  validate() {
    return ScheduleOwnerParams.validation.validate(this);
  }
  validateOrThrow() {
    ScheduleOwnerParams.validation.validateOrThrow(this);
  }
}
