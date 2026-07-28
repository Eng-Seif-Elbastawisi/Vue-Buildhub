import type Params from '@/base/Core/Params/params';
import type { TaskEmployeeStatusEnum } from '../constants/task.employee.status.enum';
export interface TaskStatusAttachmentItem {
  file: File;
  alt?: string;
  link?: string | null;
}

export default class SetTaskEmployeeStatusParams implements Params {
  public readonly project_department_item_id: number | string;
  public readonly status: TaskEmployeeStatusEnum;
  public readonly employee_id?: number;
  public readonly notes?: string;
  public readonly attachments?: TaskStatusAttachmentItem[];

  constructor(data: {
    project_department_item_id: number | string;
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

  /**
   * Build a multipart FormData payload.
   *
   * Scalar fields are appended as strings.
   * Each attachment is expanded into:
   *   attachments[i][file] = File
   *   attachments[i][alt]  = string  (if present)
   *   attachments[i][link] = string  (if present)
   */
  toFormData(): FormData {
    const fd = new FormData();

    fd.append(
      'project_department_item_id',
      String(this.project_department_item_id),
    );

    fd.append('status', String(this.status));

    if (this.employee_id !== undefined) {
      fd.append('employee_id', String(this.employee_id));
    }

    if (this.notes) {
      fd.append('notes', this.notes);
    }

    if (this.attachments) {
      this.attachments.forEach((att, i) => {
        fd.append(`attachments[${i}][file]`, att.file);

        if (att.alt !== undefined) {
          fd.append(`attachments[${i}][alt]`, att.alt);
        }

        if (att.link != null) {
          fd.append(`attachments[${i}][link]`, att.link);
        }
      });
    }

    return fd;
  }
}