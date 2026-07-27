<script setup lang="ts">
  import { computed, reactive } from 'vue';

  import type TitleInterface from '@/base/Data/Models/titleInterface';
  import HandleFilesUpload, { type UploadedFile } from '@/shared/FormInputs/HandleFilesUpload.vue';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';

  import EmployeeController from '@/modules/MainOrganization/employee/presentation/controllers/employee.controller';
  import IndexEmployeeParams from '@/modules/MainOrganization/employee/core/params/index.employee.params';
  import { EmployeeType } from '@/modules/MainOrganization/employee/core/constants/type.enum';

  import type { TaskDurationType } from '../../core/constants/taskDurationType.enum';
  import type {
    TaskAssignmentAttachment,
    TaskAssignmentForm,
  } from '../../core/params/assign.project.department.item.task.params';

  type SelectValue = TitleInterface<number> | TitleInterface<number>[] | null;

  type UploadedAttachment = UploadedFile & {
    file?: string;
    base64?: string;
    content?: string;
    alt?: string;
    link?: string | null;
    name?: string;
    type?: string;
    size?: string | number;
    signature?: string;
  };

  interface FormState {
    projectDepartmentItem: TitleInterface<number> | null;
    employees: TitleInterface<number>[];
    employeeReviewer: TitleInterface<number> | null;
    durationType: TitleInterface<number> | null;
    duration: number | null;
    notes: string;
    hasAttached: boolean;
    attachments: TaskAssignmentAttachment[];
  }

  const props = defineProps<{
    projectDepartmentItemOptions: TitleInterface<number>[];
    durationTypeOptions: TitleInterface<number>[];

    projectDepartmentItemsLoading: boolean;
    employeesLoading: boolean;
    assignmentSubmitting: boolean;

    assignmentValidationErrors: Record<string, string>;
    assignmentGeneralError: string;
  }>();

  const emit = defineEmits<{
    submit: [form: TaskAssignmentForm];
  }>();

  const employeeController = EmployeeController.getInstance();

  const employeeParams = new IndexEmployeeParams('', 1, 100, 0, EmployeeType.EMPLOYEE);

  const employeeReviewerParams = new IndexEmployeeParams('', 1, 100, 0, EmployeeType.REVIEWER);

  const form = reactive<FormState>({
    projectDepartmentItem: null,
    employees: [],
    employeeReviewer: null,
    durationType: null,
    duration: null,
    notes: '',
    hasAttached: false,
    attachments: [],
  });

  const getSingleOption = (value: SelectValue): TitleInterface<number> | null => {
    return Array.isArray(value) ? (value[0] ?? null) : value;
  };

  const getMultipleOptions = (value: SelectValue): TitleInterface<number>[] => {
    if (Array.isArray(value)) {
      return value;
    }

    return value ? [value] : [];
  };

  const setProjectDepartmentItem = (value: SelectValue): void => {
    form.projectDepartmentItem = getSingleOption(value);
  };

  const setEmployees = (value: SelectValue): void => {
    form.employees = getMultipleOptions(value);
  };

  const setEmployeeReviewer = (value: SelectValue): void => {
    form.employeeReviewer = getSingleOption(value);
  };

  const setDurationType = (value: SelectValue): void => {
    form.durationType = getSingleOption(value);
  };

  const toStringValue = (value: unknown): string => {
    return typeof value === 'string' ? value.trim() : '';
  };

  const toOptionalString = (value: unknown): string | undefined => {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }

    return String(value);
  };

  const createAttachment = (uploadedFile: UploadedFile): TaskAssignmentAttachment | null => {
    const uploadedAttachment = uploadedFile as UploadedAttachment;

    const file = toStringValue(
      uploadedAttachment.file ?? uploadedAttachment.base64 ?? uploadedAttachment.content,
    );

    if (!file) {
      return null;
    }

    return {
      file,
      alt: toStringValue(uploadedAttachment.alt),
      link: toStringValue(uploadedAttachment.link) || null,
      name: toOptionalString(uploadedAttachment.name),
      type: toOptionalString(uploadedAttachment.type),
      size: toOptionalString(uploadedAttachment.size),
      signature: toOptionalString(uploadedAttachment.signature),
    };
  };

  const addAttachments = (files: UploadedFile[]): void => {
    const attachments = files
      .map(createAttachment)
      .filter((attachment): attachment is TaskAssignmentAttachment => attachment !== null);

    form.attachments.push(...attachments);
  };

  const removeAttachment = (index: number): void => {
    form.attachments.splice(index, 1);
  };

  const isImageAttachment = (attachment: TaskAssignmentAttachment): boolean => {
    return (
      attachment.type?.startsWith('image/') === true || attachment.file.startsWith('data:image/')
    );
  };

  const getAttachmentName = (attachment: TaskAssignmentAttachment, index: number): string => {
    if (attachment.name) {
      return attachment.name;
    }

    const mimeType = attachment.file.match(/^data:([^;]+);/)?.[1];

    const extension = mimeType?.split('/').pop();

    return extension ? `attachment-${index + 1}.${extension}` : `attachment-${index + 1}`;
  };

  const isSubmitDisabled = computed(() => {
    return (
      props.assignmentSubmitting ||
      props.projectDepartmentItemsLoading ||
      props.employeesLoading ||
      !props.projectDepartmentItemOptions.length
    );
  });

  const createPayload = (): TaskAssignmentForm => {
    return {
      project_department_item_id: form.projectDepartmentItem?.value ?? null,

      employee_ids: form.employees.map((employee) => employee.value),

      employee_review_id: form.employeeReviewer?.value ?? null,

      duration_type: (form.durationType?.value as TaskDurationType) ?? null,

      duration: form.duration,
      notes: form.notes.trim(),
      has_attached: form.hasAttached,

      attachments: form.attachments.map(({ file, alt, link }) => ({
        file,
        alt: alt.trim(),
        link: link?.trim() || null,
      })),
    };
  };

  const handleSubmit = (): void => {
    emit('submit', createPayload());
  };
</script>

<template>
  <form class="task-assignment-form" @submit.prevent="handleSubmit">
    <div class="task-assignment-form__grid">
      <!-- Project department item -->
      <div class="task-assignment-form__field">
        <UpdatedCustomInputSelect
          id="project_department_item_id"
          :model-value="form.projectDepartmentItem"
          label="task_assignment.project_department_item"
          :placeholder="$t('task_assignment.project_department_item_placeholder')"
          :static-options="projectDepartmentItemOptions"
          :reload="false"
          :disabled="projectDepartmentItemsLoading"
          required
          @update:model-value="setProjectDepartmentItem"
        />

        <small v-if="!projectDepartmentItemOptions.length" class="task-assignment-form__hint">
          {{ $t('task_assignment.no_project_department_items') }}
        </small>

        <small
          v-if="assignmentValidationErrors.project_department_item_id"
          class="task-assignment-form__error"
        >
          {{ assignmentValidationErrors.project_department_item_id }}
        </small>
      </div>

      <!-- Employees -->
      <div class="task-assignment-form__field">
        <UpdatedCustomInputSelect
          id="employee_ids"
          :model-value="form.employees"
          label="task_assignment.employees"
          :placeholder="$t('task_assignment.employees_placeholder')"
          :type="2"
          :reload="false"
          :disabled="employeesLoading"
          :controller="employeeController"
          :params="employeeParams"
          required
          @update:model-value="setEmployees"
        />

        <small v-if="assignmentValidationErrors.employee_ids" class="task-assignment-form__error">
          {{ assignmentValidationErrors.employee_ids }}
        </small>
      </div>

      <!-- Employee reviewer -->
      <div class="task-assignment-form__field">
        <UpdatedCustomInputSelect
          id="employee_review_id"
          :model-value="form.employeeReviewer"
          label="task_assignment.form.employee_review.label"
          :placeholder="$t('task_assignment.form.employee_review.placeholder')"
          :reload="false"
          :disabled="employeesLoading"
          :controller="employeeController"
          :params="employeeReviewerParams"
          @update:model-value="setEmployeeReviewer"
        />

        <small
          v-if="assignmentValidationErrors.employee_review_id"
          class="task-assignment-form__error"
        >
          {{ assignmentValidationErrors.employee_review_id }}
        </small>
      </div>

      <!-- Duration type -->
      <div class="task-assignment-form__field">
        <UpdatedCustomInputSelect
          id="duration_type"
          :model-value="form.durationType"
          label="task_assignment.form.duration_type.label"
          :placeholder="$t('task_assignment.form.duration_type.placeholder')"
          :static-options="durationTypeOptions"
          :reload="false"
          required
          @update:model-value="setDurationType"
        />

        <small v-if="assignmentValidationErrors.duration_type" class="task-assignment-form__error">
          {{ assignmentValidationErrors.duration_type }}
        </small>
      </div>

      <!-- Duration -->
      <div class="task-assignment-form__field">
        <label class="task-assignment-form__label" for="duration">
          <span class="text-red-500">*</span>

          {{ $t('task_assignment.form.duration.label') }}
        </label>

        <input
          id="duration"
          v-model.number="form.duration"
          class="task-assignment-form__input w-full"
          type="number"
          min="1"
          step="1"
          :placeholder="$t('task_assignment.form.duration.placeholder')"
        />

        <small v-if="assignmentValidationErrors.duration" class="task-assignment-form__error">
          {{ assignmentValidationErrors.duration }}
        </small>
      </div>

      <!-- Has attached -->
      <div class="task-assignment-form__field">
        <label class="task-assignment-form__checkbox" for="has_attached">
          <input id="has_attached" v-model="form.hasAttached" type="checkbox" />

          <span>
            {{ $t('task_assignment.form.has_attached.label') }}
          </span>
        </label>

        <small v-if="assignmentValidationErrors.has_attached" class="task-assignment-form__error">
          {{ assignmentValidationErrors.has_attached }}
        </small>
      </div>

      <!-- Notes -->
      <div class="task-assignment-form__field task-assignment-form__field--full">
        <label class="task-assignment-form__label" for="task_assignment_notes">
          {{ $t('task_assignment.notes') }}
        </label>

        <textarea
          id="task_assignment_notes"
          v-model="form.notes"
          class="task-assignment-form__textarea"
          :placeholder="$t('task_assignment.notes_placeholder')"
        />

        <small v-if="assignmentValidationErrors.notes" class="task-assignment-form__error">
          {{ assignmentValidationErrors.notes }}
        </small>
      </div>

      <!-- Attachments -->
      <div class="task-assignment-form__field task-assignment-form__field--full">
        <section class="task-assignment-attachments">
          <div class="task-assignment-attachments__header">
            <div>
              <h2>
                {{ $t('task_assignment.form.attachments.label') }}
              </h2>

              <p>
                {{ $t('task_assignment.form.attachments.description') }}
              </p>
            </div>
          </div>

          <HandleFilesUpload
            label="task_assignment.form.attachments.add"
            :multiple="true"
            :hidepreview="true"
            :show-help="false"
            @change="addAttachments"
          />

          <small v-if="assignmentValidationErrors.attachments" class="task-assignment-form__error">
            {{ assignmentValidationErrors.attachments }}
          </small>

          <div v-if="!form.attachments.length" class="task-assignment-attachments__empty">
            {{ $t('task_assignment.form.attachments.empty') }}
          </div>

          <div v-else class="task-assignment-attachments__list">
            <article
              v-for="(attachment, index) in form.attachments"
              :key="attachment.signature ?? `${attachment.file}-${index}`"
              class="task-assignment-attachment"
            >
              <div class="task-assignment-attachment__preview">
                <img
                  v-if="isImageAttachment(attachment)"
                  :src="attachment.file"
                  :alt="attachment.alt || getAttachmentName(attachment, index)"
                />

                <span v-else class="task-assignment-attachment__file-icon">
                  <i class="pi pi-file" aria-hidden="true" />
                </span>

                <span class="task-assignment-attachment__meta">
                  <strong>
                    {{ getAttachmentName(attachment, index) }}
                  </strong>

                  <small>
                    {{
                      attachment.size ||
                      attachment.type ||
                      $t('task_assignment.form.attachments.file')
                    }}
                  </small>
                </span>
              </div>

              <div class="task-assignment-attachment__fields">
                <label :for="`attachment_alt_${index}`">
                  {{ $t('task_assignment.form.attachments.alt') }}
                </label>

                <input
                  :id="`attachment_alt_${index}`"
                  v-model="attachment.alt"
                  class="task-assignment-form__input"
                  type="text"
                  :placeholder="$t('task_assignment.form.attachments.alt_placeholder')"
                />
              </div>

              <div class="task-assignment-attachment__fields">
                <label :for="`attachment_link_${index}`">
                  {{ $t('task_assignment.form.attachments.link') }}
                </label>

                <input
                  :id="`attachment_link_${index}`"
                  v-model="attachment.link"
                  class="task-assignment-form__input"
                  type="url"
                  :placeholder="$t('task_assignment.form.attachments.link_placeholder')"
                />
              </div>

              <button
                type="button"
                class="task-assignment-attachment__remove"
                :aria-label="$t('task_assignment.form.attachments.remove')"
                :title="$t('task_assignment.form.attachments.remove')"
                @click="removeAttachment(index)"
              >
                <i class="pi pi-trash" aria-hidden="true" />
              </button>
            </article>
          </div>
        </section>
      </div>
    </div>

    <p v-if="assignmentGeneralError" class="task-assignment-form__error" role="alert">
      {{ assignmentGeneralError }}
    </p>

    <footer class="task-assignment-form__actions">
      <AppButton
        type="submit"
        icon="left"
        :loading="assignmentSubmitting"
        :disabled="isSubmitDisabled"
        :title="$t('task_assignment.submit')"
      >
        <template #icon>
          <i class="pi pi-send" aria-hidden="true" />
        </template>

        {{ $t('task_assignment.submit') }}
      </AppButton>
    </footer>
  </form>
</template>
