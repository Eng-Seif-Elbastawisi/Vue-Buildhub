import { computed, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  DataLoading,
  DataSuccess,
} from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import type { FieldError } from '@/base/Presentation/Utils/classValidation';
import TitleInterface from '@/base/Data/Models/titleInterface';
import { dialogManager } from '@/base/Presentation/Dialogs/dialog.manager';
import EmployeeController from '@/modules/MainOrganization/employee/presentation/controllers/employee.controller';
import IndexEmployeeParams from '@/modules/MainOrganization/employee/core/params/index.employee.params';
import ProjectItemController from '@/modules/MainOrganization/ProjectItem/presentation/controllers/project.Item.controller';
import IndexProjectItemParams from '@/modules/MainOrganization/ProjectItem/core/params/index.project.Item.params';
import type ProjectItemModel from '@/modules/MainOrganization/ProjectItem/core/models/project.Item.model';
import AssignProjectDepartmentItemTaskParams, {
  type TaskAssignmentAttachment,
  type TaskAssignmentForm,
} from '../../core/params/assign.project.department.item.task.params';
import TaskAssignmentController from '../controllers/task.assignment.controller';
import { TaskDurationType } from '../../core/constants/taskDurationType.enum';

type UploadedTaskAssignmentFile = {
  name: string;
  type: string;
  size: string;
  base64: string;
  file?: File;
};

type NamedEntity = {
  id?: number | string;
  name?: string;
  title?: string | Array<Record<string, unknown>>;
};

type ResultWithError = {
  error?: {
    displayMessage?: string;
    title?: string;
    validationErrors?: Record<string, string[]>;
  } | null;
};

const toRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const toPositiveInteger = (value: unknown): number | null => {
  const numberValue = Number(value);

  return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : null;
};

const getLocalizedTitle = (value?: string | Array<Record<string, unknown>> | null): string => {
  if (typeof value === 'string') return value;
  if (!Array.isArray(value)) return '';

  const localized =
    value.find((entry) => entry.locale === 'en') ??
    value.find((entry) => entry.locale === 'ar') ??
    value[0];

  return String(localized?.title ?? localized?.name ?? '');
};

const getEntityName = (entity?: NamedEntity | null): string => {
  if (!entity) return '';

  return entity.name ?? getLocalizedTitle(entity.title) ?? (entity.id ? `#${entity.id}` : '');
};

const getProjectItemOptionTitle = (projectItem: ProjectItemModel | Record<string, unknown>) => {
  const record = toRecord(projectItem) ?? {};
  const item = (projectItem as ProjectItemModel).item ?? record.item;
  const itemName = getEntityName(item as NamedEntity) || String(record.item_id_title ?? '');
  const project = toRecord(record.project);
  const projectName =
    (projectItem as ProjectItemModel).project_title ??
    String(record.project_title ?? project?.title ?? project?.name ?? '');

  return [itemName, projectName].filter(Boolean).join(' - ');
};

const getUploadedFileSignature = (uploadedFile: UploadedTaskAssignmentFile): string => {
  if (uploadedFile.file) {
    return [
      uploadedFile.file.name,
      uploadedFile.file.size,
      uploadedFile.file.type,
      uploadedFile.file.lastModified,
    ].join('|');
  }

  return [uploadedFile.name, uploadedFile.size, uploadedFile.type, uploadedFile.base64].join('|');
};

const isDataUrlFile = (uploadedFile: UploadedTaskAssignmentFile): boolean => {
  return uploadedFile.base64.startsWith('data:');
};

const normalizeValidationField = (field: string): string => field.replace(/\[(\d+)\]/g, '.$1');

const buildAttachment = (uploadedFile: UploadedTaskAssignmentFile): TaskAssignmentAttachment => ({
  file: uploadedFile.base64,
  alt: '',
  link: null,
  name: uploadedFile.name,
  type: uploadedFile.type,
  size: uploadedFile.size,
  signature: getUploadedFileSignature(uploadedFile),
});

const getAttachmentKeys = (attachment: TaskAssignmentAttachment): string[] => {
  return attachment.signature ? [attachment.signature, attachment.file] : [attachment.file];
};

const getExistingAttachmentKeys = (attachments: TaskAssignmentAttachment[]): Set<string> => {
  return new Set(attachments.flatMap((attachment) => getAttachmentKeys(attachment)));
};

const getNewAttachments = (
  uploadedFiles: UploadedTaskAssignmentFile[],
  existingAttachments: TaskAssignmentAttachment[],
): TaskAssignmentAttachment[] => {
  const existingKeys = getExistingAttachmentKeys(existingAttachments);

  return uploadedFiles
    .filter(isDataUrlFile)
    .map((uploadedFile) => buildAttachment(uploadedFile))
    .filter((attachment) => {
      const attachmentKeys = getAttachmentKeys(attachment);
      const duplicate = attachmentKeys.some((attachmentKey) => existingKeys.has(attachmentKey));

      if (!duplicate) {
        attachmentKeys.forEach((attachmentKey) => existingKeys.add(attachmentKey));
      }

      return !duplicate;
    });
};

export const useTaskAssignmentForm = () => {
  const { t } = useI18n();
  const taskAssignmentController = TaskAssignmentController.getInstance();
  const employeeController = EmployeeController.getInstance();
  const projectItemController = ProjectItemController.getInstance();

  const selectedProjectDepartmentItem = ref<TitleInterface<number> | null>(null);
  const selectedEmployees = ref<TitleInterface<number>[]>([]);
  const assignmentForm = reactive<TaskAssignmentForm>({
    project_department_item_id: null,
    employee_ids: [],
    notes: '',
    has_attached: false,
    attachments: [],
    duration_type: null,
    duration: null,
    employee_review_id: null,
  });
  const selectedEmployeeReviewer = ref<TitleInterface<number> | null>(null);
  const selectedDurationType = ref<TitleInterface<number> | null>(null);
  const assignmentSubmitting = ref(false);
  const attachmentsProcessing = ref(false);
  const attachmentsUploadKey = ref(0);
  const assignmentValidationErrors = ref<Record<string, string>>({});
  const assignmentGeneralError = ref('');

  const employeesLoading = computed(
    () => employeeController.listState.value instanceof DataLoading,
  );
  const projectDepartmentItemsLoading = computed(
    () => projectItemController.listState.value instanceof DataLoading,
  );

  const projectDepartmentItemOptions = computed<TitleInterface<number>[]>(() => {
    const state = projectItemController.listState.value as { data?: unknown };
    const data = state.data;

    if (!Array.isArray(data)) return [];

    return data
      .map((projectItem) => {
        const record = toRecord(projectItem);
        const id = toPositiveInteger((projectItem as ProjectItemModel).id ?? record?.id);
        if (!id) return null;

        return new TitleInterface<number>({
          id,
          title: getProjectItemOptionTitle(projectItem as ProjectItemModel) || `#${id}`,
        });
      })
      .filter((item): item is TitleInterface<number> => item !== null);
  });

  const employeeOptions = computed<TitleInterface<number>[]>(() => {
    const state = employeeController.listState.value as { data?: unknown };
    const data = state.data;

    if (!Array.isArray(data)) return [];

    return data
      .map((employee) => {
        const employeeRecord = toRecord(employee);
        const id = toPositiveInteger(employeeRecord?.id);
        if (!id) return null;

        return new TitleInterface<number>({
          id,
          title: String(employeeRecord?.name ?? employeeRecord?.title ?? `#${id}`),
        });
      })
      .filter((item): item is TitleInterface<number> => item !== null);
  });

  const durationTypeOptions = computed<TitleInterface<number>[]>(() => [
    new TitleInterface<number>({
      id: TaskDurationType.DAY,
      title: t('task_assignment.duration_types.day'),
    }),
    new TitleInterface<number>({
      id: TaskDurationType.WEEK,
      title: t('task_assignment.duration_types.week'),
    }),
    new TitleInterface<number>({
      id: TaskDurationType.MONTH,
      title: t('task_assignment.duration_types.month'),
    }),
    new TitleInterface<number>({
      id: TaskDurationType.YEAR,
      title: t('task_assignment.duration_types.year'),
    }),
  ]);

  const mapValidationErrors = (errors: FieldError[]): Record<string, string> => {
    return Object.fromEntries(errors.map((error) => [error.field, error.message]));
  };

  const mapServerValidationErrors = (errors?: Record<string, string[]>): Record<string, string> => {
    if (!errors) return {};

    return Object.fromEntries(
      Object.entries(errors).map(([field, messages]) => [field, messages[0] ?? '']),
    );
  };

  const getResultMessage = (result: ResultWithError) => {
    return (
      result.error?.displayMessage || result.error?.title || t('task_assignment.unexpected_error')
    );
  };

  const clearValidationFields = (fields: string[]): void => {
    const normalizedFields = fields.map(normalizeValidationField);

    assignmentValidationErrors.value = Object.fromEntries(
      Object.entries(assignmentValidationErrors.value).filter(([field]) => {
        const normalizedField = normalizeValidationField(field);

        return !normalizedFields.some(
          (targetField) =>
            normalizedField === targetField || normalizedField.startsWith(`${targetField}.`),
        );
      }),
    );
  };

  const syncHasAttached = (): void => {
    assignmentForm.has_attached = assignmentForm.attachments.length > 0;
  };

  const updateSelectedProjectDepartmentItem = (
    value: TitleInterface<number> | TitleInterface<number>[] | null,
  ): void => {
    const selected = Array.isArray(value) ? null : value;

    selectedProjectDepartmentItem.value = selected;
    assignmentForm.project_department_item_id = selected ? Number(selected.id) : null;
    assignmentValidationErrors.value = {
      ...assignmentValidationErrors.value,
      project_department_item_id: '',
    };
  };

  const updateSelectedEmployees = (
    value: TitleInterface<number> | TitleInterface<number>[] | null,
  ): void => {
    const values = Array.isArray(value) ? value : [];
    const uniqueIds = Array.from(new Set(values.map((employee) => Number(employee.id))));

    selectedEmployees.value = uniqueIds
      .map((employeeId) => values.find((employee) => Number(employee.id) === employeeId))
      .filter((employee): employee is TitleInterface<number> => employee !== undefined);
    assignmentForm.employee_ids = uniqueIds;
    assignmentValidationErrors.value = {
      ...assignmentValidationErrors.value,
      employee_ids: '',
    };
  };

  const updateSelectedEmployeeReviewer = (
    value: TitleInterface<number> | TitleInterface<number>[] | null,
  ): void => {
    const selected = Array.isArray(value) ? null : value;

    selectedEmployeeReviewer.value = selected;
    assignmentForm.employee_review_id = selected ? Number(selected.id) : null;
    assignmentValidationErrors.value = {
      ...assignmentValidationErrors.value,
      employee_review_id: '',
    };
  };

  const updateDurationType = (
    value: TitleInterface<number> | TitleInterface<number>[] | null,
  ): void => {
    const selected = Array.isArray(value) ? null : value;

    selectedDurationType.value = selected;
    assignmentForm.duration_type = selected ? (Number(selected.id) as TaskDurationType) : null;
    assignmentValidationErrors.value = {
      ...assignmentValidationErrors.value,
      duration_type: '',
    };
  };

  const updateDuration = (value: number | null): void => {
    assignmentForm.duration = value;
    assignmentValidationErrors.value = {
      ...assignmentValidationErrors.value,
      duration: '',
    };
  };

  const addAttachmentsFromUpload = async (
    uploadedFiles: UploadedTaskAssignmentFile[],
  ): Promise<void> => {
    if (attachmentsProcessing.value) return;

    attachmentsProcessing.value = true;

    try {
      const newAttachments = getNewAttachments(uploadedFiles, assignmentForm.attachments);

      assignmentForm.attachments.push(...newAttachments);
      syncHasAttached();
      clearValidationFields(['attachments']);
    } finally {
      attachmentsUploadKey.value += 1;
      attachmentsProcessing.value = false;
    }
  };

  const removeAttachment = (attachmentIndex: number): void => {
    assignmentForm.attachments.splice(attachmentIndex, 1);
    syncHasAttached();
    clearValidationFields(['attachments']);
    attachmentsUploadKey.value += 1;
  };

  const updateAttachmentAlt = (attachmentIndex: number, alt: string): void => {
    const attachment = assignmentForm.attachments[attachmentIndex];
    if (!attachment) return;

    attachment.alt = alt;
    clearValidationFields([`attachments.${attachmentIndex}.alt`]);
  };

  const updateAttachmentLink = (attachmentIndex: number, link: string): void => {
    const attachment = assignmentForm.attachments[attachmentIndex];
    if (!attachment) return;

    attachment.link = link.trim() || null;
    clearValidationFields([`attachments.${attachmentIndex}.link`]);
  };

  const resetAssignmentForm = (): void => {
    selectedProjectDepartmentItem.value = null;
    selectedEmployees.value = [];
    assignmentForm.project_department_item_id = null;
    assignmentForm.employee_ids = [];
    assignmentForm.notes = '';
    assignmentForm.has_attached = false;
    assignmentForm.attachments = [];
    assignmentForm.duration_type = null;
    assignmentForm.duration = null;
    assignmentForm.employee_review_id = null;
    selectedEmployeeReviewer.value = null;
    selectedDurationType.value = null;
    assignmentValidationErrors.value = {};
    assignmentGeneralError.value = '';
    attachmentsUploadKey.value += 1;
  };

  const submitTaskAssignment = async (): Promise<boolean> => {
    if (assignmentSubmitting.value || attachmentsProcessing.value) return false;

    syncHasAttached();
    const params = new AssignProjectDepartmentItemTaskParams(assignmentForm);
    const validation = params.validate();

    assignmentValidationErrors.value = mapValidationErrors(validation.errors);
    assignmentGeneralError.value = '';

    if (!validation.isValid) {
      dialogManager.toastWarning(
        validation.errors[0]?.message ?? t('task_assignment.validation.fix_errors'),
      );
      return false;
    }

    assignmentSubmitting.value = true;

    try {
      const result = await taskAssignmentController.assignProjectDepartmentItemTask(params);

      if (result instanceof DataSuccess) {
        dialogManager.toastSuccess(result.message || t('task_assignment.create_success'));
        resetAssignmentForm();
        return true;
      }

      assignmentValidationErrors.value = mapServerValidationErrors(result.error?.validationErrors);
      assignmentGeneralError.value = getResultMessage(result);
      dialogManager.toastError(assignmentGeneralError.value);

      return false;
    } catch {
      assignmentGeneralError.value = t('task_assignment.unexpected_error');
      dialogManager.toastError(assignmentGeneralError.value);

      return false;
    } finally {
      assignmentSubmitting.value = false;
    }
  };

  const initializeTaskAssignmentForm = async (): Promise<void> => {
    await Promise.all([
      employeeController.fetchList(new IndexEmployeeParams('', 1, 100, 0)),
      projectItemController.fetchList(new IndexProjectItemParams('', 1, 100, 0)),
    ]);
  };

  onMounted(() => {
    void initializeTaskAssignmentForm();
  });

  return {
    assignmentForm,
    assignmentSubmitting,
    attachmentsProcessing,
    attachmentsUploadKey,
    assignmentGeneralError,
    assignmentValidationErrors,
    selectedProjectDepartmentItem,
    selectedEmployees,
    projectDepartmentItemOptions,
    employeeOptions,
    durationTypeOptions,
    employeesLoading,
    projectDepartmentItemsLoading,
    selectedEmployeeReviewer,
    selectedDurationType,
    submitTaskAssignment,
    resetAssignmentForm,
    updateSelectedProjectDepartmentItem,
    updateSelectedEmployees,
    updateSelectedEmployeeReviewer,
    updateDurationType,
    updateDuration,
    addAttachmentsFromUpload,
    removeAttachment,
    updateAttachmentAlt,
    updateAttachmentLink,
    initializeTaskAssignmentForm,
  };
};
