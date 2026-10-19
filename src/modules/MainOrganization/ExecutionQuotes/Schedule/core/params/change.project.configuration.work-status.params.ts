import type Params from '@/base/Core/Params/params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
import { validId } from '../constants/schedule.constants';
import { isProjectWorkStatus, type ProjectWorkStatus } from '../constants/project.work-status';

export default class ChangeProjectConfigurationWorkStatusParams implements Params {
  static readonly validation = new ClassValidation().setRules({
    quoteId: { required: true, custom: validId },
    workStatus: { required: true, custom: isProjectWorkStatus },
    responsibleEmployeeId: { custom: validId },
  });

  public readonly quoteId: number;
  public readonly workStatus: ProjectWorkStatus;
  public readonly responsibleEmployeeId?: number;

  constructor(quoteId: number, workStatus: ProjectWorkStatus, responsibleEmployeeId?: number) {
    this.quoteId = quoteId;
    this.workStatus = workStatus;
    this.responsibleEmployeeId = responsibleEmployeeId;
  }

  toMap() {
    return {
      quote_id: this.quoteId,
      work_status: this.workStatus,
      ...(this.responsibleEmployeeId === undefined
        ? {}
        : { responsible_employee_id: this.responsibleEmployeeId }),
    };
  }

  validate() {
    return ChangeProjectConfigurationWorkStatusParams.validation.validate(this);
  }

  validateOrThrow() {
    ChangeProjectConfigurationWorkStatusParams.validation.validateOrThrow(this);
  }
}
