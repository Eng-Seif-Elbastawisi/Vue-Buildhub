import type Params from '@/base/Core/Params/params';
import type { TaskEmployeeStatusEnum } from '../constants/task.employee.status.enum';
import type ProjectAttachmentParams from './project.attachment.params';
import { ClassValidation } from '@/base/Presentation/Utils/classValidation';
export default class SetTaskEmployeeStatusParams implements Params {
  public readonly project_department_item_id: number | string;
  public readonly status: TaskEmployeeStatusEnum;
  public readonly employee_id?: number;
  public readonly notes?: string;
  public readonly attachments?: ProjectAttachmentParams[];

  public static readonly validation = new ClassValidation().setRules({
    project_department_item_id: { required: true },
    status: { required: true },
    employee_id: { required: false },
    notes: { required: false },
    attachments: { required: false },
  });

  constructor(data: {
    project_department_item_id: number | string;
    status: TaskEmployeeStatusEnum;
    employee_id?: number;
    notes?: string;
    attachments?: ProjectAttachmentParams[];
  }) {
    this.project_department_item_id =
      data.project_department_item_id;

    this.status = data.status;
    this.employee_id = data.employee_id;
    this.notes = data.notes;
    this.attachments = data.attachments;
  }

  toMap(): Record<string, unknown> {
    return {
      project_department_item_id: this.project_department_item_id,
      status: this.status,
      employee_id: this.employee_id,
      notes: this.notes,
      attachments: this.attachments?.map((att) => att.toMap()),
    };
  }
  validate() {
    return SetTaskEmployeeStatusParams.validation.validate(this);
  }

  validateOrThrow() {
    return SetTaskEmployeeStatusParams.validation.validateOrThrow(this);
  }
}