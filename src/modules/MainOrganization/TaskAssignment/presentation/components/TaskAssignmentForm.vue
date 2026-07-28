<script setup lang="ts">
  import { computed, reactive, watch } from 'vue';
  import { useI18n } from 'vue-i18n';

  import type TitleInterface from '@/base/Data/Models/titleInterface';

  import HandleFilesUpload, { type UploadedFile } from '@/shared/FormInputs/HandleFilesUpload.vue';

  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';

  import EmployeeController from '@/modules/MainOrganization/employee/presentation/controllers/employee.controller';

  import IndexEmployeeParams from '@/modules/MainOrganization/employee/core/params/index.employee.params';

  import { EmployeeType } from '@/modules/MainOrganization/employee/core/constants/type.enum';

  import { getTypeNameKey, TaskDurationType } from '../../core/constants/taskDurationType.enum';

  import AssignProjectDepartmentItemTaskParams, {
    type TaskAssignmentAttachment,
  } from '../../core/params/assign.project.department.item.task.params';

  /**
   * Select value returned from UpdatedCustomInputSelect.
   */
  type SelectValue = TitleInterface<number> | TitleInterface<number>[] | null | undefined;

  /**
   * Local form state.
   *
   * project_department_item_id is intentionally NOT stored here.
   * It comes directly from the selected TaskApprovedIndex table row.
   */
  interface FormState {
    employees: TitleInterface<number>[];
    employeeReviewer: TitleInterface<number> | null;
    durationType: TitleInterface<number> | null;
    duration: number | null;
    notes: string;
    hasAttached: boolean;
    attachments: TaskAssignmentAttachment[];
  }

  /**
   * Props
   */
  const props = defineProps<{
    projectDepartmentItemId: number;
    loading?: boolean;
  }>();

  /**
   * Emits
   *
   * Always emit the Params class itself,
   * not a plain object.
   */
  const emit = defineEmits<{
    updateData: [params: AssignProjectDepartmentItemTaskParams];
  }>();

  const { t } = useI18n();

  /**
   * ============================================
   * Employee Controller
   * ============================================
   */
  const employeeController = EmployeeController.getInstance();

  /**
   * Normal employees.
   */
  const employeeParams = new IndexEmployeeParams('', 1, 100, 0, EmployeeType.EMPLOYEE);

  /**
   * Reviewer employees.
   */
  const employeeReviewerParams = new IndexEmployeeParams('', 1, 100, 0, EmployeeType.REVIEWER);

  /**
   * ============================================
   * Form
   * ============================================
   */
  const form = reactive<FormState>({
    employees: [],
    employeeReviewer: null,
    durationType: null,
    duration: null,
    notes: '',
    hasAttached: false,
    attachments: [],
  });

  /**
   * ============================================
   * Duration Types
   * ============================================
   */
  const durationTypes: TaskDurationType[] = [
    TaskDurationType.DAY,
    TaskDurationType.WEEK,
    TaskDurationType.MONTH,
    TaskDurationType.YEAR,
  ];

  const durationTypeOptions = computed<TitleInterface<number>[]>(() => {
    return durationTypes.map((durationType) => ({
      id: durationType,
      title: t(getTypeNameKey(durationType)),
    }));
  });

  /**
   * ============================================
   * Select Helpers
   * ============================================
   */
  const getSingleOption = (selectedOption: SelectValue): TitleInterface<number> | null => {
    return Array.isArray(selectedOption) ? (selectedOption[0] ?? null) : (selectedOption ?? null);
  };

  const getMultipleOptions = (selectedOptions: SelectValue): TitleInterface<number>[] => {
    if (Array.isArray(selectedOptions)) {
      return selectedOptions;
    }

    return selectedOptions ? [selectedOptions] : [];
  };

  /**
   * ============================================
   * Select Handlers
   * ============================================
   */
  const setEmployees = (selectedOptions: SelectValue): void => {
    form.employees = getMultipleOptions(selectedOptions);
  };

  const setEmployeeReviewer = (selectedOption: SelectValue): void => {
    form.employeeReviewer = getSingleOption(selectedOption);
  };

  const setDurationType = (selectedOption: SelectValue): void => {
    form.durationType = getSingleOption(selectedOption);
  };

  /**
   * ============================================
   * Attachments
   * ============================================
   */

  /**
   * Convert UploadedFile returned from
   * HandleFilesUpload into backend attachment shape.
   *
   * IMPORTANT:
   * uploadedFile.file = native JavaScript File object.
   * uploadedFile.base64 = data:image/...;base64,...
   *
   * Backend expects the Base64 string.
   */
  const createAttachment = (uploadedFile: UploadedFile): TaskAssignmentAttachment | null => {
    const file = uploadedFile.base64?.trim();

    if (!file) {
      return null;
    }

    /**
     * Preserve existing alt/link values
     * when HandleFilesUpload emits the full
     * file list again after adding another file.
     */
    const existingAttachment = form.attachments.find(
      (attachment) => attachment.signature === uploadedFile.id,
    );

    return {
      file,

      alt: existingAttachment?.alt ?? '',

      link: existingAttachment?.link ?? null,

      name: uploadedFile.name,

      type: uploadedFile.type,

      size: uploadedFile.size,

      signature: uploadedFile.id,
    };
  };

  /**
   * HandleFilesUpload emits its complete
   * current files array.
   *
   * Therefore replace the current attachment list
   * instead of blindly pushing items and creating
   * duplicates.
   */
  const addAttachments = (files: UploadedFile[]): void => {
    form.attachments = files
      .map(createAttachment)
      .filter((attachment): attachment is TaskAssignmentAttachment => attachment !== null);
  };

  const removeAttachment = (index: number): void => {
    form.attachments.splice(index, 1);
  };

  /**
   * Check if attachment is an image
   * to show image preview.
   */
  const isImageAttachment = (attachment: TaskAssignmentAttachment): boolean => {
    return (
      attachment.type?.startsWith('image/') === true || attachment.file.startsWith('data:image/')
    );
  };

  /**
   * Get attachment display name.
   */
  const getAttachmentName = (attachment: TaskAssignmentAttachment, index: number): string => {
    if (attachment.name) {
      return attachment.name;
    }

    const mimeType = attachment.file.match(/^data:([^;]+);/)?.[1];

    const extension = mimeType?.split('/').pop();

    return extension ? `attachment-${index + 1}.${extension}` : `attachment-${index + 1}`;
  };

  /**
   * ============================================
   * Params
   * ============================================
   */
  const updateData = (): void => {
    emit(
      'updateData',

      new AssignProjectDepartmentItemTaskParams({
        /**
         * Comes directly from the selected
         * TaskApprovedIndex table row.
         */
        project_department_item_id: props.projectDepartmentItemId,

        /**
         * TitleInterface uses id.
         */
        employee_ids: form.employees.map((employee) => employee.id),

        employee_review_id: form.employeeReviewer?.id ?? null,

        duration_type: (form.durationType?.id as TaskDurationType) ?? null,

        duration: form.duration,

        notes: form.notes,

        /**
         * Independent checkbox value.
         *
         * It does NOT control attachments.
         */
        has_attached: form.hasAttached,

        /**
         * Independent attachment array.
         */
        attachments: form.attachments,
      }),
    );
  };

  /**
   * Update Params whenever any form value changes.
   */
  watch(
    form,
    () => {
      updateData();
    },
    {
      deep: true,
      immediate: true,
    },
  );

  /**
   * When another task row opens the Dialog,
   * rebuild Params with the new
   * project_department_item_id.
   */
  watch(
    () => props.projectDepartmentItemId,

    () => {
      updateData();
    },
  );
</script>

<template>
  <div
    class="task-assignment-form"
    :class="{
      'task-assignment-form--loading': props.loading,
    }"
  >
    <div class="task-assignment-form__grid">
      <!-- ================================= -->
      <!-- Employees -->
      <!-- ================================= -->

      <div class="task-assignment-form__field">
        <UpdatedCustomInputSelect
          id="employee_ids"
          :model-value="form.employees"
          label="task_assignment.employees"
          :placeholder="$t('task_assignment.employees_placeholder')"
          :type="2"
          :reload="false"
          :disabled="loading"
          :controller="employeeController"
          :params="employeeParams"
          required
          @update:model-value="setEmployees"
        />
      </div>

      <!-- ================================= -->
      <!-- Reviewer -->
      <!-- ================================= -->

      <div class="task-assignment-form__field">
        <UpdatedCustomInputSelect
          id="employee_review_id"
          :model-value="form.employeeReviewer"
          label="task_assignment.form.employee_review.label"
          :placeholder="$t('task_assignment.form.employee_review.placeholder')"
          :reload="false"
          :disabled="loading"
          :controller="employeeController"
          :params="employeeReviewerParams"
          @update:model-value="setEmployeeReviewer"
        />
      </div>

      <!-- ================================= -->
      <!-- Duration Type -->
      <!-- ================================= -->

      <div class="task-assignment-form__field">
        <UpdatedCustomInputSelect
          id="duration_type"
          :model-value="form.durationType"
          label="task_assignment.form.duration_type.label"
          :placeholder="$t('task_assignment.form.duration_type.placeholder')"
          :static-options="durationTypeOptions"
          :reload="false"
          :disabled="loading"
          required
          @update:model-value="setDurationType"
        />
      </div>

      <!-- ================================= -->
      <!-- Duration -->
      <!-- ================================= -->

      <div class="task-assignment-form__field">
        <label class="task-assignment-form__label" for="duration">
          <span class="text-red-500"> * </span>

          {{ $t('task_assignment.form.duration.label') }}
        </label>

        <input
          id="duration"
          v-model.number="form.duration"
          class="task-assignment-form__input w-full"
          type="number"
          min="1"
          step="1"
          :disabled="loading"
          :placeholder="$t('task_assignment.form.duration.placeholder')"
        />
      </div>

      <!-- ================================= -->
      <!-- Has Attached -->
      <!-- ================================= -->

      <div class="task-assignment-form__field">
        <label class="task-assignment-form__checkbox" for="has_attached">
          <input id="has_attached" v-model="form.hasAttached" type="checkbox" :disabled="loading" />

          <span>
            {{ $t('task_assignment.form.has_attached.label') }}
          </span>
        </label>
      </div>

      <!-- ================================= -->
      <!-- Notes -->
      <!-- ================================= -->

      <div class="task-assignment-form__field task-assignment-form__field--full">
        <label class="task-assignment-form__label" for="task_assignment_notes">
          {{ $t('task_assignment.notes') }}
        </label>

        <textarea
          id="task_assignment_notes"
          v-model="form.notes"
          class="task-assignment-form__textarea"
          :disabled="loading"
          :placeholder="$t('task_assignment.notes_placeholder')"
        />
      </div>

      <!-- ================================= -->
      <!-- Attachments -->
      <!-- ================================= -->

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

          <!-- Upload -->

          <HandleFilesUpload
            label="task_assignment.form.attachments.add"
            :multiple="true"
            :hidepreview="true"
            :show-help="false"
            @change="addAttachments"
          />

          <!-- Empty -->

          <div v-if="!form.attachments.length" class="task-assignment-attachments__empty">
            {{ $t('task_assignment.form.attachments.empty') }}
          </div>

          <!-- Attachments List -->

          <div v-else class="task-assignment-attachments__list">
            <article
              v-for="(attachment, index) in form.attachments"
              :key="attachment.signature ?? `${attachment.file}-${index}`"
              class="task-assignment-attachment"
            >
              <!-- Preview -->

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

              <!-- Alt -->

              <div class="task-assignment-attachment__fields">
                <label :for="`attachment_alt_${index}`">
                  {{ $t('task_assignment.form.attachments.alt') }}
                </label>

                <input
                  :id="`attachment_alt_${index}`"
                  v-model="attachment.alt"
                  class="task-assignment-form__input"
                  type="text"
                  :disabled="loading"
                  :placeholder="$t('task_assignment.form.attachments.alt_placeholder')"
                />
              </div>

              <!-- Link -->

              <div class="task-assignment-attachment__fields">
                <label :for="`attachment_link_${index}`">
                  {{ $t('task_assignment.form.attachments.link') }}
                </label>

                <input
                  :id="`attachment_link_${index}`"
                  v-model="attachment.link"
                  class="task-assignment-form__input"
                  type="url"
                  :disabled="loading"
                  :placeholder="$t('task_assignment.form.attachments.link_placeholder')"
                />
              </div>

              <!-- Remove -->

              <button
                type="button"
                class="task-assignment-attachment__remove"
                :disabled="loading"
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
  </div>
</template>

<style lang="scss">
  @use '../styles/task_assignment';
</style>
