import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { validId } from '../constants/schedule.constants';
export default class ChangeProjectTimelineOrderParams implements Params {
  static readonly validation = new ClassValidation().setRules({
    projectTimelineId: { required: true, custom: validId },
    order: { required: true, custom: validId },
  });
  public projectTimelineId: number;
  public order: number;
  constructor(projectTimelineId: number, order: number) {
    this.projectTimelineId = projectTimelineId;
    this.order = order;
  }
  toMap() {
    return { project_timeline_id: this.projectTimelineId, order: this.order };
  }
  validate() {
    return ChangeProjectTimelineOrderParams.validation.validate(this);
  }
  validateOrThrow() {
    ChangeProjectTimelineOrderParams.validation.validateOrThrow(this);
  }
}
