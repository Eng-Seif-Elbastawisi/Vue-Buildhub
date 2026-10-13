import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { positiveId, dateOnly } from '../constants/work-items.constants';
export default class StoreTaskParams implements Params {
  public projectTimelineStageId: number;
  public title: string;
  public employeeId: number | null;
  public endDate: string | null;
  constructor(
    projectTimelineStageId: number,
    title: string,
    employeeId: number | null = null,
    endDate: string | null = null,
  ) {
    this.projectTimelineStageId = projectTimelineStageId;
    this.title = title;
    this.employeeId = employeeId;
    this.endDate = endDate;
  }
  private static validation = new ClassValidation().setRules({
    projectTimelineStageId: { required: true, custom: positiveId },
    title: { required: true },
    employeeId: { custom: positiveId },
    endDate: { custom: dateOnly },
  });
  toMap() {
    return {
      project_timeline_stage_id: this.projectTimelineStageId,
      title: this.title.trim(),
      employee_id: this.employeeId,
      end_date: this.endDate,
    };
  }
  validate() {
    return StoreTaskParams.validation.validate(this);
  }
  validateOrThrow() {
    StoreTaskParams.validation.validateOrThrow(this);
  }
}
