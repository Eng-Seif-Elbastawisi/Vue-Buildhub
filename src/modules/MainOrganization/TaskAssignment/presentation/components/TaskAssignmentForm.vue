<script setup lang="ts">
  import type TitleInterface from '@/base/Data/Models/titleInterface';
  import HandleFilesUpload, { type UploadedFile } from '@/shared/FormInputs/HandleFilesUpload.vue';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import type { TaskAssignmentAttachment } from '../../core/params/assign.project.department.item.task.params';

  const props = defineProps<{
    selectedProjectDepartmentItem: TitleInterface<number> | null;
    selectedEmployees: TitleInterface<number>[];
    selectedEmployeeReviewer: TitleInterface<number> | null;
    selectedDurationType: TitleInterface<number> | null;
    projectDepartmentItemOptions: TitleInterface<number>[];
    employeeOptions: TitleInterface<number>[];
    durationTypeOptions: TitleInterface<number>[];
    projectDepartmentItemsLoading: boolean;
    employeesLoading: boolean;
    assignmentSubmitting: boolean;
    attachmentsProcessing: boolean;
    attachmentsUploadKey: number;
    assignmentValidationErrors: Record<string, string>;
    assignmentGeneralError: string;
    notes: string;
    duration: number | null;
    attachments: TaskAssignmentAttachment[];
  }>();

  const emit = defineEmits<{
    (
      event: 'update-project-department-item',
      value: TitleInterface<number> | TitleInterface<number>[] | null,
    ): void;
    (
      event: 'update-employees',
      value: TitleInterface<number> | TitleInterface<number>[] | null,
    ): void;
    (
      event: 'update-employee-reviewer',
      value: TitleInterface<number> | TitleInterface<number>[] | null,
    ): void;
    (
      event: 'update-duration-type',
      value: TitleInterface<number> | TitleInterface<number>[] | null,
    ): void;
    (event: 'update-duration', value: number | null): void;
    (event: 'update-notes', value: string): void;
    (event: 'add-attachments', files: UploadedFile[]): void;
    (event: 'remove-attachment', index: number): void;
    (event: 'update-attachment-alt', index: number, alt: string): void;
    (event: 'update-attachment-link', index: number, link: string): void;
    (event: 'submit'): void;
  }>();

  const normalizeErrorField = (field: string): string => field.replace(/\[(\d+)\]/g, '.$1');

  const getValidationError = (field: string): string => {
    const normalizedTarget = normalizeErrorField(field);

    return (
      Object.entries(props.assignmentValidationErrors).find(
        ([errorField]) => normalizeErrorField(errorField) === normalizedTarget,
      )?.[1] ?? ''
    );
  };

  const getAttachmentError = (index: number, field: 'file' | 'alt' | 'link'): string => {
    return getValidationError(`attachments.${index}.${field}`);
  };

  const isImageAttachment = (attachment: TaskAssignmentAttachment): boolean => {
    return attachment.type?.startsWith('image/') || attachment.file.startsWith('data:image/');
  };

  const getAttachmentName = (attachment: TaskAssignmentAttachment, index: number): string => {
    if (attachment.name) return attachment.name;

    const mime = attachment.file.match(/^data:([^;]+);/)?.[1];
    const extension = mime?.split('/').pop();

    return extension ? `attachment-${index + 1}.${extension}` : `attachment-${index + 1}`;
  };
</script>

<template>
  <form class="task-assignment-form" @submit.prevent="emit('submit')">
    <div class="task-assignment-form__grid">
      <div class="task-assignment-form__field">
        <UpdatedCustomInputSelect
          id="project_department_item_id"
          :model-value="selectedProjectDepartmentItem"
          label="task_assignment.project_department_item"
          :placeholder="$t('task_assignment.project_department_item_placeholder')"
          :static-options="projectDepartmentItemOptions"
          :reload="false"
          :disabled="projectDepartmentItemsLoading"
          required
          @update:model-value="emit('update-project-department-item', $event)"
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

      <div class="task-assignment-form__field">
        <UpdatedCustomInputSelect
          id="employee_ids"
          :model-value="selectedEmployees"
          label="task_assignment.employees"
          :placeholder="$t('task_assignment.employees_placeholder')"
          :static-options="employeeOptions"
          :type="2"
          :reload="false"
          :disabled="employeesLoading"
          required
          @update:model-value="emit('update-employees', $event)"
        />

        <small v-if="!employeeOptions.length" class="task-assignment-form__hint">
          {{ $t('task_assignment.no_employees') }}
        </small>
        <small v-if="assignmentValidationErrors.employee_ids" class="task-assignment-form__error">
          {{ assignmentValidationErrors.employee_ids }}
        </small>
      </div>

      <div class="task-assignment-form__field">
        <UpdatedCustomInputSelect
          id="employee_review_id"
          :model-value="selectedEmployeeReviewer"
          label="task_assignment.form.employee_review.label"
          :placeholder="$t('task_assignment.form.employee_review.placeholder')"
          :static-options="employeeOptions"
          :reload="false"
          :disabled="employeesLoading"
          @update:model-value="emit('update-employee-reviewer', $event)"
        />

        <small
          v-if="assignmentValidationErrors.employee_review_id"
          class="task-assignment-form__error"
        >
          {{ assignmentValidationErrors.employee_review_id }}
        </small>
      </div>

      <div class="task-assignment-form__field">
        <UpdatedCustomInputSelect
          id="duration_type"
          :model-value="selectedDurationType"
          label="task_assignment.form.duration_type.label"
          :placeholder="$t('task_assignment.form.duration_type.placeholder')"
          :static-options="durationTypeOptions"
          :reload="false"
          required
          @update:model-value="emit('update-duration-type', $event)"
        />

        <small v-if="assignmentValidationErrors.duration_type" class="task-assignment-form__error">
          {{ assignmentValidationErrors.duration_type }}
        </small>
      </div>

      <div class="task-assignment-form__field">
        <label class="task-assignment-form__label" for="duration">
          <span class="text-red-500">*</span> {{ $t('task_assignment.form.duration.label') }}
        </label>
        <input
          id="duration"
          class="task-assignment-form__input w-full"
          type="number"
          :value="duration"
          min="1"
          step="1"
          :placeholder="$t('task_assignment.form.duration.placeholder')"
          style="
            border-radius: 50px;
            border: 1px solid #d9dbe9;
            padding: 0.5rem 1rem;
            outline: none;
            background: transparent;
          "
          @input="
            emit('update-duration', Number(($event.target as HTMLInputElement).value) || null)
          "
        />
        <small v-if="assignmentValidationErrors.duration" class="task-assignment-form__error">
          {{ assignmentValidationErrors.duration }}
        </small>
      </div>

      <div class="task-assignment-form__field task-assignment-form__field--full">
        <label class="task-assignment-form__label" for="task_assignment_notes">
          {{ $t('task_assignment.notes') }}
        </label>

        <textarea
          id="task_assignment_notes"
          class="task-assignment-form__textarea"
          :value="notes"
          :placeholder="$t('task_assignment.notes_placeholder')"
          @input="emit('update-notes', ($event.target as HTMLTextAreaElement).value)"
        ></textarea>

        <small v-if="assignmentValidationErrors.notes" class="task-assignment-form__error">
          {{ assignmentValidationErrors.notes }}
        </small>
      </div>

      <div class="task-assignment-form__field task-assignment-form__field--full">
        <section class="task-assignment-attachments">
          <div class="task-assignment-attachments__header">
            <div>
              <h2>{{ $t('task_assignment.form.attachments.label') }}</h2>
              <p>{{ $t('task_assignment.form.attachments.description') }}</p>
            </div>

            <span v-if="attachmentsProcessing" class="task-assignment-attachments__processing">
              <i class="pi pi-spin pi-spinner" aria-hidden="true"></i>
              {{ $t('loading') }}
            </span>
          </div>

          <HandleFilesUpload
            :key="attachmentsUploadKey"
            label="task_assignment.form.attachments.add"
            :multiple="true"
            :hidepreview="true"
            :show-help="false"
            @change="emit('add-attachments', $event)"
          />

          <small v-if="assignmentValidationErrors.attachments" class="task-assignment-form__error">
            {{ assignmentValidationErrors.attachments }}
          </small>

          <div v-if="!attachments.length" class="task-assignment-attachments__empty">
            {{ $t('task_assignment.form.attachments.empty') }}
          </div>

          <div v-else class="task-assignment-attachments__list">
            <article
              v-for="(attachment, index) in attachments"
              :key="attachment.signature ?? attachment.file"
              class="task-assignment-attachment"
            >
              <div class="task-assignment-attachment__preview">
                <img
                  v-if="isImageAttachment(attachment)"
                  :src="attachment.file"
                  :alt="attachment.alt || getAttachmentName(attachment, index)"
                />
                <span v-else class="task-assignment-attachment__file-icon">
                  <i class="pi pi-file" aria-hidden="true"></i>
                </span>

                <span class="task-assignment-attachment__meta">
                  <strong>{{ getAttachmentName(attachment, index) }}</strong>
                  <small>{{
                    attachment.size ||
                    attachment.type ||
                    $t('task_assignment.form.attachments.file')
                  }}</small>
                </span>
              </div>

              <div class="task-assignment-attachment__fields">
                <label :for="`task_assignment_attachment_alt_${index}`">
                  {{ $t('task_assignment.form.attachments.alt') }}
                </label>
                <input
                  :id="`task_assignment_attachment_alt_${index}`"
                  class="task-assignment-form__input"
                  type="text"
                  :value="attachment.alt"
                  :placeholder="$t('task_assignment.form.attachments.alt_placeholder')"
                  @input="
                    emit('update-attachment-alt', index, ($event.target as HTMLInputElement).value)
                  "
                />
                <small v-if="getAttachmentError(index, 'alt')" class="task-assignment-form__error">
                  {{ getAttachmentError(index, 'alt') }}
                </small>
              </div>

              <div class="task-assignment-attachment__fields">
                <label :for="`task_assignment_attachment_link_${index}`">
                  {{ $t('task_assignment.form.attachments.link') }}
                </label>
                <input
                  :id="`task_assignment_attachment_link_${index}`"
                  class="task-assignment-form__input"
                  type="url"
                  :value="attachment.link ?? ''"
                  :placeholder="$t('task_assignment.form.attachments.link_placeholder')"
                  @input="
                    emit('update-attachment-link', index, ($event.target as HTMLInputElement).value)
                  "
                />
                <small v-if="getAttachmentError(index, 'link')" class="task-assignment-form__error">
                  {{ getAttachmentError(index, 'link') }}
                </small>
              </div>

              <button
                type="button"
                class="task-assignment-attachment__remove"
                :aria-label="$t('task_assignment.form.attachments.remove')"
                :title="$t('task_assignment.form.attachments.remove')"
                @click="emit('remove-attachment', index)"
              >
                <i class="pi pi-trash" aria-hidden="true"></i>
              </button>

              <small v-if="getAttachmentError(index, 'file')" class="task-assignment-form__error">
                {{ getAttachmentError(index, 'file') }}
              </small>
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
        :loading="assignmentSubmitting"
        :disabled="
          !projectDepartmentItemOptions.length ||
          !employeeOptions.length ||
          projectDepartmentItemsLoading ||
          employeesLoading ||
          attachmentsProcessing ||
          assignmentSubmitting
        "
        icon="left"
        :title="$t('task_assignment.submit')"
      >
        <template #icon>
          <i class="pi pi-send" aria-hidden="true"></i>
        </template>
        {{ $t('task_assignment.submit') }}
      </AppButton>
    </footer>
  </form>
</template>
