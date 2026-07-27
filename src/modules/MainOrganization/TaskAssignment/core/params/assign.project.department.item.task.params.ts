import type Params from '@/base/Core/Params/params';
import { type TaskDurationType } from './../constants/taskDurationType.enum';
import {
  ClassValidation,
  ValidationError,
  type FieldError,
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
  project_department_item_id: number | null;
  employee_ids: number[];
  notes: string;
  has_attached: boolean;
  attachments: TaskAssignmentAttachment[];
  duration_type: TaskDurationType | null;
  duration: number | null;
  employee_review_id: number | null;
}

const normalizePositiveId = (value: unknown): number | null => {
  const numberValue = Number(value);

  return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : null;
};

const normalizeText = (value: unknown): string => {
  return typeof value === 'string' ? value.trim() : '';
};

const normalizeOptionalLink = (value: unknown): string | null => {
  const link = normalizeText(value);

  return link || null;
};

const isValidUrl = (value: string): boolean => {
  try {
    const url = new URL(value);

    return Boolean(url.protocol && url.host);
  } catch {
    return false;
  }
};

const isDataUrl = (value: string): boolean => /^data:[^;]+;base64,/i.test(value);

const normalizeAttachment = (attachment: Partial<TaskAssignmentAttachment>) => ({
  file: normalizeText(attachment.file),
  alt: normalizeText(attachment.alt),
  link: normalizeOptionalLink(attachment.link),
  name: attachment.name,
  type: attachment.type,
  size: attachment.size,
  signature: attachment.signature,
});

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
      custom: (value) =>
        (Array.isArray(value) && value.length > 0) ||
        translate('task_assignment.validation.employee_required'),
    },
    duration_type: { required: true },
    duration: { required: true, min: 1 },
  });

  constructor(form: {
    project_department_item_id: number | null;
    employee_ids: Array<number | string>;
    notes?: string;
    has_attached?: boolean;
    attachments?: Partial<TaskAssignmentAttachment>[];
    duration_type?: TaskDurationType | null;
    duration?: number | null;
    employee_review_id?: number | null;
  }) {
    this.project_department_item_id = normalizePositiveId(form.project_department_item_id);
    this.employee_ids = Array.from(
      new Set(
        form.employee_ids
          .map((employeeId) => normalizePositiveId(employeeId))
          .filter((employeeId): employeeId is number => employeeId !== null),
      ),
    );
    this.notes = normalizeText(form.notes);
    this.attachments = (form.attachments ?? [])
      .map((attachment) => normalizeAttachment(attachment))
      .filter(
        (attachment) =>
          Boolean(attachment.file) || Boolean(attachment.alt) || attachment.link !== null,
      );
    this.has_attached = this.attachments.length > 0;
    this.duration_type = form.duration_type ?? null;
    this.duration = normalizePositiveId(form.duration);
    this.employee_review_id = normalizePositiveId(form.employee_review_id);
  }

  toMap(): Record<
    string,
    boolean | number | number[] | string | TaskAssignmentAttachmentPayload[] | null
  > {
    return {
      project_department_item_id: this.project_department_item_id,
      employee_ids: this.employee_ids,
      notes: this.notes,
      has_attached: this.has_attached,
      attachments: this.attachments.map((attachment) => ({
        file: attachment.file,
        alt: attachment.alt,
        link: attachment.link,
      })),
      duration_type: this.duration_type,
      duration: this.duration,
      employee_review_id: this.employee_review_id,
    };
  }

  private getAttachmentErrors(): FieldError[] {
    return this.attachments.flatMap((attachment, index) => {
      const errors: FieldError[] = [];

      if (!isDataUrl(attachment.file)) {
        errors.push({
          field: `attachments.${index}.file`,
          message: translate('task_assignment.validation.attachment_file_required'),
        });
      }

      if (attachment.link && !isValidUrl(attachment.link)) {
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

  validateOrThrow() {
    const { isValid, errors } = this.validate();

    if (!isValid) {
      const validationError = new ValidationError(errors);
      validationError.openDialog();
    }
  }
}
