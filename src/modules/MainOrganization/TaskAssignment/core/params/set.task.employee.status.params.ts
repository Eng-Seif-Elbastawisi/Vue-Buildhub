import type Params from '@/base/Core/Params/params';
import type { TaskEmployeeStatusEnum } from '../constants/task.employee.status.enum';
export interface TaskStatusAttachmentItem {
  file: string;
  alt: string;
  link: string | null;
}

export default class SetTaskEmployeeStatusParams implements Params {
  public readonly project_department_item_id: number;
  public readonly status: TaskEmployeeStatusEnum;
  public readonly employee_id?: number;
  public readonly notes?: string;
  public readonly attachments?: TaskStatusAttachmentItem[];

  constructor(data: {
    project_department_item_id: number;
    status: TaskEmployeeStatusEnum;
    employee_id?: number;
    notes?: string;
    attachments?: TaskStatusAttachmentItem[];
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
      attachments: this.attachments,
    };
  }
}