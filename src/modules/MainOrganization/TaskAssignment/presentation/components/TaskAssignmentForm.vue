<script setup lang="ts">
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
  import { computed, nextTick, reactive, ref, watch } from 'vue';

  import { useI18n } from 'vue-i18n';
  import {
    attachmentGallery,
    attachmentKind,
    toGalleryAttachment,
  } from '@/shared/AttachmentGallery/attachmentGallery';

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

  type SelectValue = TitleInterface<number> | TitleInterface<number>[] | null | undefined;

  interface FormState {
    employees: TitleInterface<number>[];
    employeeReviewer: TitleInterface<number> | null;
    durationType: TitleInterface<number> | null;
    duration: number | null;
    notes: string;
    hasAttached: boolean;
    attachments: TaskAssignmentAttachment[];
  }

  const props = defineProps<{
    projectDepartmentItemId: number;
    loading?: boolean;
  }>();

  const emit = defineEmits<{
    updateData: [params: AssignProjectDepartmentItemTaskParams];
  }>();

  const { t } = useI18n();

  const employeeController = EmployeeController.getInstance();

  const employeeParams = new IndexEmployeeParams('', 1, 100, 0, EmployeeType.EMPLOYEE);

  const employeeReviewerParams = new IndexEmployeeParams('', 1, 100, 0, EmployeeType.REVIEWER);

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
   * تغيير القيمة يجبر Vue على إزالة
   * HandleFilesUpload القديم وإنشاء نسخة جديدة.
   *
   * ده مهم لأن المكوّن يحتفظ بقائمة الملفات
   * داخليًا حتى بعد حذفها من form.attachments.
   */
  const uploaderKey = ref(0);

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

  const getSingleOption = (selectedOption: SelectValue): TitleInterface<number> | null => {
    return Array.isArray(selectedOption) ? (selectedOption[0] ?? null) : (selectedOption ?? null);
  };

  const getMultipleOptions = (selectedOptions: SelectValue): TitleInterface<number>[] => {
    if (Array.isArray(selectedOptions)) {
      return selectedOptions;
    }

    return selectedOptions ? [selectedOptions] : [];
  };

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
   * استخراج معرف ثابت للملف.
   */
  const getUploadedFileSignature = (uploadedFile: UploadedFile): string => {
    return String(
      uploadedFile.id ?? `${uploadedFile.name}-${uploadedFile.size}-${uploadedFile.type}`,
    );
  };

  const createAttachment = (uploadedFile: UploadedFile): TaskAssignmentAttachment | null => {
    const file = uploadedFile.base64?.trim();

    if (!file) {
      return null;
    }

    const signature = getUploadedFileSignature(uploadedFile);

    const existingAttachment = form.attachments.find(
      (attachment) => String(attachment.signature) === signature,
    );

    return {
      file,

      alt: existingAttachment?.alt ?? '',

      link: existingAttachment?.link ?? null,

      name: uploadedFile.name,

      type: uploadedFile.type,

      size: uploadedFile.size,

      signature,
    };
  };

  /**
   * إزالة الملفات المتكررة في حالة إن
   * HandleFilesUpload أرسل نفس الملف أكثر من مرة.
   */
  const removeDuplicateAttachments = (
    attachments: TaskAssignmentAttachment[],
  ): TaskAssignmentAttachment[] => {
    const uniqueAttachments = new Map<string, TaskAssignmentAttachment>();

    attachments.forEach((attachment) => {
      const signature = String(
        attachment.signature ?? `${attachment.name}-${attachment.size}-${attachment.type}`,
      );

      uniqueAttachments.set(signature, attachment);
    });

    return Array.from(uniqueAttachments.values());
  };

  /**
   * HandleFilesUpload يرسل القائمة الكاملة
   * الموجودة داخله.
   */
  const addAttachments = (files: UploadedFile[]): void => {
    const attachments = files
      .map(createAttachment)
      .filter((attachment): attachment is TaskAssignmentAttachment => attachment !== null);

    form.attachments = removeDuplicateAttachments(attachments);
  };

  /**
   * إعادة إنشاء uploader بعد الحذف،
   * حتى يمسح القائمة القديمة المحفوظة داخله.
   */
  const resetUploader = async (): Promise<void> => {
    uploaderKey.value++;

    await nextTick();
  };

  const removeAttachment = async (index: number): Promise<void> => {
    if (index < 0 || index >= form.attachments.length) {
      return;
    }

    form.attachments.splice(index, 1);

    /**
     * المكوّن الداخلي كان محتفظًا بالملف المحذوف.
     * إعادة إنشائه تمنع رجوع الملف عند الرفع التالي.
     */
    await resetUploader();
  };

  const isImageAttachment = (attachment: TaskAssignmentAttachment): boolean =>
    attachmentKind({
      url: attachment.file,
      name: attachment.name || '',
      mimeType: attachment.type,
    }) === 'image';

  const getAttachmentName = (attachment: TaskAssignmentAttachment, index: number): string => {
    if (attachment.name) {
      return attachment.name;
    }

    const mimeType = attachment.file.match(/^data:([^;]+);/)?.[1];

    const extension = mimeType?.split('/').pop();

    return extension ? `attachment-${index + 1}.${extension}` : `attachment-${index + 1}`;
  };

  const updateData = (): void => {
    emit(
      'updateData',
      new AssignProjectDepartmentItemTaskParams({
        project_department_item_id: props.projectDepartmentItemId,

        employee_ids: form.employees.map((employee) => employee.id),

        employee_review_id: form.employeeReviewer?.id ?? null,

        duration_type: (form.durationType?.id as TaskDurationType) ?? null,

        duration: form.duration,

        notes: form.notes,

        has_attached: form.hasAttached,

        /**
         * إنشاء نسخة جديدة حتى لا يحتفظ
         * الـ Params بنفس reference القديم.
         */
        attachments: form.attachments.map((attachment) => ({
          ...attachment,
        })),
      }),
    );
  };

  /**
   * تنظيف الفورم عند الانتقال إلى بند آخر.
   */
  const resetForm = async (): Promise<void> => {
    form.employees = [];
    form.employeeReviewer = null;
    form.durationType = null;
    form.duration = null;
    form.notes = '';
    form.hasAttached = false;
    form.attachments = [];

    await resetUploader();
  };

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

  watch(
    () => props.projectDepartmentItemId,
    async (newProjectDepartmentItemId, oldProjectDepartmentItemId) => {
      /**
       * عند فتح Dialog لبند مختلف،
       * لا نترك بيانات البند السابق محفوظة.
       */
      if (
        oldProjectDepartmentItemId !== undefined &&
        newProjectDepartmentItemId !== oldProjectDepartmentItemId
      ) {
        await resetForm();
      }

      updateData();
    },
  );
</script>

<template>
  <StandardFormLayout
    embedded
    class="task-assignment-form"
    :class="{
      'task-assignment-form--loading': props.loading,
    }"
  >
    <div class="task-assignment-form__grid">
      <!-- Employees -->
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

      <!-- Reviewer -->
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

      <!-- Duration Type -->
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

      <!-- Duration -->
      <div class="task-assignment-form__field">
        <label class="task-assignment-form__label" for="duration">
          <span class="text-red-500"> * </span>

          {{ $t('task_assignment.form.duration.label') }}
        </label>

        <input
          id="duration"
          v-model.number="form.duration"
          class="field-input workspace-control"
          type="number"
          min="1"
          step="1"
          :disabled="loading"
          :placeholder="$t('task_assignment.form.duration.placeholder')"
        />
      </div>

      <!-- Notes -->
      <div class="task-assignment-form__field task-assignment-form__field--full">
        <label class="task-assignment-form__label" for="task_assignment_notes">
          {{ $t('task_assignment.notes') }}
        </label>

        <textarea
          id="task_assignment_notes"
          v-model="form.notes"
          class="task-assignment-form__textarea workspace-control"
          :disabled="loading"
          :placeholder="$t('task_assignment.notes_placeholder')"
        />
      </div>

      <!-- Has Attached -->
      <div class="task-assignment-form__field">
        <label class="task-assignment-form__checkbox" for="has_attached">
          <input id="has_attached" v-model="form.hasAttached" type="checkbox" :disabled="loading" />

          <span>
            {{ $t('task_assignment.form.has_attached.label') }}
          </span>
        </label>
      </div>

      <!-- Attachments -->
      <div class="task-assignment-form__field task-assignment-form__field--full">
        <section class="task-assignment-attachments">
          <div class="task-assignment-attachments__header">
            <div>
              <h2>{{ $t('task_assignment.form.attachments.label') }} ({{ $t('optional') }} )</h2>

              <p>
                {{ $t('task_assignment.form.attachments.description') }}
              </p>
            </div>
          </div>

          <!--
            key مهم لمسح الحالة الداخلية للمكوّن
            بعد حذف attachment.
          -->
          <HandleFilesUpload
            :key="uploaderKey"
            label="task_assignment.form.attachments.add"
            :multiple="true"
            :hidepreview="true"
            :show-help="false"
            :disabled="loading"
            @change="addAttachments"
          />

          <div v-if="!form.attachments.length" class="task-assignment-attachments__empty">
            {{ $t('task_assignment.form.attachments.empty') }}
          </div>

          <div v-else class="task-assignment-attachments__list">
            <article
              v-for="(attachment, index) in form.attachments"
              :key="attachment.signature ?? `${attachment.file}-${index}`"
              class="task-assignment-attachment"
            >
              <button
                type="button"
                class="task-assignment-attachment__preview"
                :aria-label="getAttachmentName(attachment, index)"
                @click="attachmentGallery.open(form.attachments.map(toGalleryAttachment), index)"
              >
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
              </button>

              <!-- Alt -->
              <div class="task-assignment-attachment__fields">
                <label :for="`attachment_alt_${index}`">
                  {{ $t('task_assignment.form.attachments.alt') }}
                </label>

                <input
                  :id="`attachment_alt_${index}`"
                  v-model="attachment.alt"
                  class="task-assignment-form__input workspace-control"
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
                  class="task-assignment-form__input workspace-control"
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
  </StandardFormLayout>
</template>

<style lang="scss">
@use '../styles/task_assignment';
</style>
