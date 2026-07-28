import type Params from '@/base/Core/Params/params';
import type { TaskDurationType } from './../constants/taskDurationType.enum';
import {
  ClassValidation,
  type FieldError,
  ValidationError,
} from '@/base/Presentation/Utils/classValidation';
import { requiredSelectRule } from '@/base/Presentation/Utils/input_title';
import { translate } from '@/locales/i18n';

export interface TaskAssignmentAttachmentPayload {
  file: string;
  alt: string;
  link: string | null;
}

export interface TaskAssignmentAttachment extends TaskAssignmentAttachmentPayload {
  name?: string;
  type?: string;
  size?: string;
  signature?: string;
}

export interface TaskAssignmentForm {
  project_department_item_id: number | string | null;
  employee_ids: Array<number | string>;
  notes?: string;
  has_attached?: boolean;
  attachments?: TaskAssignmentAttachment[];
  duration_type?: TaskDurationType | null;
  duration?: number | string | null;
  employee_review_id?: number | string | null;
}

const normalizeId = (rawId: unknown): number | null => {
  const id = Number(rawId);

  return Number.isInteger(id) && id > 0 ? id : null;
};

const normalizeAttachment = (attachment: TaskAssignmentAttachment): TaskAssignmentAttachment => ({
  ...attachment,
  file: attachment.file.trim(),
  alt: attachment.alt.trim(),
  link: attachment.link?.trim() || null,
});

const isDataUrl = (fileDataUrl: string): boolean => {
  return /^data:[^;]+;base64,/i.test(fileDataUrl);
};

const isValidOptionalUrl = (linkUrl: string | null): boolean => {
  if (!linkUrl) {
    return true;
  }

  try {
    new URL(linkUrl);

    return true;
  } catch {
    return false;
  }
};

export default class AssignProjectDepartmentItemTaskParams implements Params {
  public readonly project_department_item_id: number | null;
  public readonly employee_ids: number[];
  public readonly notes: string;
  public readonly has_attached: boolean;
  public readonly attachments: TaskAssignmentAttachment[];
  public readonly duration_type: TaskDurationType | null;
  public readonly duration: number | null;
  public readonly employee_review_id: number | null;

  public static readonly validation = new ClassValidation().setRules({
    project_department_item_id: requiredSelectRule(),

    employee_ids: {
      required: true,
      custom: (selectedEmployees) =>
        (Array.isArray(selectedEmployees) && selectedEmployees.length > 0) ||
        translate('task_assignment.validation.employee_required'),
    },

    duration_type: {
      required: true,
    },

    duration: {
      required: true,
      min: 1,
    },
  });

  constructor(form: TaskAssignmentForm) {
    this.project_department_item_id = normalizeId(form.project_department_item_id);

    this.employee_ids = [
      ...new Set(form.employee_ids.map(normalizeId).filter((id): id is number => id !== null)),
    ];

    this.notes = form.notes?.trim() ?? '';

    // Kept independent from attachments; the checkbox owns this flag.
    this.has_attached = Boolean(form.has_attached);

    this.attachments = (form.attachments ?? []).map(normalizeAttachment);

    this.duration_type = form.duration_type ?? null;

    this.duration = normalizeId(form.duration);

    this.employee_review_id = normalizeId(form.employee_review_id);
  }

  toMap() {
    return {
      project_department_item_id: this.project_department_item_id,
      employee_ids: this.employee_ids,
      notes: this.notes,
      has_attached: this.has_attached,

      attachments: this.attachments.map(({ file, alt, link }) => ({
        file,
        alt,
        link,
      })),

      duration_type: this.duration_type,
      duration: this.duration,
      employee_review_id: this.employee_review_id,
    };
  }

  private getAttachmentErrors(): FieldError[] {
    return this.attachments.flatMap((attachment, index): FieldError[] => {
      const errors: FieldError[] = [];

      if (!isDataUrl(attachment.file)) {
        errors.push({
          field: `attachments.${index}.file`,
          message: translate('task_assignment.validation.attachment_file_required'),
        });
      }

      if (!isValidOptionalUrl(attachment.link)) {
        errors.push({
          field: `attachments.${index}.link`,
          message: translate('task_assignment.validation.invalid_attachment_link'),
        });
      }

      return errors;
    });
  }

  validate() {
    const validation = AssignProjectDepartmentItemTaskParams.validation.validate(this);

    const errors = [...validation.errors, ...this.getAttachmentErrors()];

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validateOrThrow(): void {
    const validation = this.validate();

    if (!validation.isValid) {
      const validationError = new ValidationError(validation.errors);
      validationError.openDialog();
    }
  }
}
