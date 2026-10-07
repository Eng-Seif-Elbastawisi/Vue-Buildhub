import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { validId } from '../constants/schedule.constants';
export default class ScheduleOwnerParams implements Params {
  static readonly validation = new ClassValidation().setRules({
    quoteId: { required: true, custom: validId },
    groupId: { custom: validId },
    order: { custom: validId },
  });
  public quoteId: number;
  public groupId?: number;
  public order?: number;
  constructor(quoteId: number, groupId?: number, order?: number) {
    this.quoteId = quoteId;
    this.groupId = groupId;
    this.order = order;
  }
  toMap(): Record<string, unknown> {
    return {
      quote_id: this.quoteId,
      ...(this.groupId === undefined ? {} : { project_timeline_id: this.groupId }),
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
