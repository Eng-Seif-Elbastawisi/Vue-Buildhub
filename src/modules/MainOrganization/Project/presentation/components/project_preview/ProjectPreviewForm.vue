<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue';
  import DatePicker from 'primevue/datepicker';

  import type TitleInterface from '@/base/Data/Models/titleInterface';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import IndexEmployeeParams from '@/modules/MainOrganization/employee/core/params/index.employee.params';
  import EmployeeController from '@/modules/MainOrganization/employee/presentation/controllers/employee.controller';
  import { EmployeeType } from '@/modules/MainOrganization/employee/core/constants/type.enum';
  import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';

  import type ProjectPreviewShowModel from '../../../core/models/project.preview.show.model';
  import AddProjectPreviewParams from '../../../core/params/add.project.preview.params';
  import { NotificationType } from '@/modules/MainOrganization/Project/core/constants/notificationType.enum';
  import { Status } from '@/modules/MainOrganization/Project/core/constants/status.enum';
  import { useI18n } from 'vue-i18n';

  const emit = defineEmits<{
    updateData: [params: AddProjectPreviewParams];
  }>();

  const { t } = useI18n();

  const props = withDefaults(
    defineProps<{
      projectPreview?: ProjectPreviewShowModel;
      projectId?: number;
      loading?: boolean;
      isEdit?: boolean;
      validationErrors?: Record<string, string>;
    }>(),
    {
      projectPreview: undefined,
      projectId: undefined,
      loading: false,
      isEdit: false,
      validationErrors: () => ({}),
    },
  );

  const selectedEngineer = ref<TitleInterface<number> | null>(null);
  const selectedPricingResponsible = ref<TitleInterface<number> | null>(null);
  const selectedNotificationType = ref<TitleInterface<NotificationType> | null>(null);
  const selectedStatus = ref<TitleInterface<Status> | null>(null);

  // Values sent to API
  const previewDate = ref<string>('');
  const previewTime = ref<string>('');

  // Values used by PrimeVue DatePicker
  const selectedPreviewDate = ref<Date | null>(null);
  const selectedPreviewTime = ref<Date | null>(null);

  const siteLink = ref<string>('');
  const address = ref<string>('');
  const notificationMessage = ref<string>('');

  const employeeController = EmployeeController.getInstance();

  const notificationTypeOptions = computed<TitleInterface<NotificationType>[]>(() => [
    { id: NotificationType.LOW, title: t('project.notification_low') },
    { id: NotificationType.NORMAL, title: t('project.notification_normal') },
    { id: NotificationType.URGENT, title: t('project.notification_urgent') },
  ]);

  const statusOptions = computed<TitleInterface<Status>[]>(() => [
    { id: Status.NEED_ADDITIONAL_VISIT, title: t('project.status_need_additional_visit') },
    { id: Status.NOT_READY_FOR_COMPLETION, title: t('project.status_not_ready_for_completion') },
    { id: Status.READY_FOR_PRICING, title: t('project.status_ready_for_pricing') },
  ]);

  const engineerParams = new IndexEmployeeParams('', 1, 100, 0, EmployeeType.ENGINEER);

  type PrimeDateValue = Date | string | Date[] | (Date | null)[] | null | undefined;

  const normalizeDateValue = (value: PrimeDateValue): Date | null => {
    if (!value) return null;

    if (Array.isArray(value)) {
      return value[0] ?? null;
    }

    return value instanceof Date ? value : null;
  };

  const formatDateForApi = (value: Date | null): string => {
    if (!value) return '';

    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const parseApiDate = (value?: string | null): Date | null => {
    if (!value) return null;

    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    if (!year || !month || !day) return null;

    const date = new Date(year, month - 1, day);

    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return null;
    }

    return date;
  };

  const formatTimeForApi = (value: Date | null): string => {
    if (!value) return '';

    const hours = String(value.getHours()).padStart(2, '0');
    const minutes = String(value.getMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
  };

  const parseApiTime = (value?: string | null): Date | null => {
    if (!value) return null;

    const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?/.exec(value.trim());
    if (!match) return null;

    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    const seconds = Number(match[3] ?? 0);

    if (
      Number.isNaN(hours) ||
      Number.isNaN(minutes) ||
      Number.isNaN(seconds) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59 ||
      seconds < 0 ||
      seconds > 59
    ) {
      return null;
    }

    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(seconds);
    date.setMilliseconds(0);

    return date;
  };

  const updatePreviewDate = (value: PrimeDateValue) => {
    const dateValue = typeof value === 'string' ? parseApiDate(value) : normalizeDateValue(value);

    selectedPreviewDate.value = dateValue;
    previewDate.value = formatDateForApi(dateValue);

    updateData();
  };

  const updatePreviewTime = (value: PrimeDateValue) => {
    const timeValue = typeof value === 'string' ? parseApiTime(value) : normalizeDateValue(value);

    selectedPreviewTime.value = timeValue;
    previewTime.value = formatTimeForApi(timeValue);

    updateData();
  };

  const getOptionalTextValue = (
    value: string,
    originalValue?: string | null,
  ): string | undefined => {
    if (props.isEdit && originalValue == null && value === '') return undefined;

    return value;
  };

  const updateData = () => {
    emit(
      'updateData',
      new AddProjectPreviewParams({
        project_id: props.projectId ?? props.projectPreview?.project_id,
        engineer_id: selectedEngineer.value?.id ? Number(selectedEngineer.value.id) : undefined,
        preview_date: previewDate.value,
        preview_time: previewTime.value,
        site_link: getOptionalTextValue(siteLink.value, props.projectPreview?.site_link),
        address: getOptionalTextValue(address.value, props.projectPreview?.address),
        notification_type:
          (selectedNotificationType.value?.id as NotificationType | undefined) ??
          (props.isEdit ? undefined : NotificationType.LOW),
        status:
          (selectedStatus.value?.id as Status | undefined) ??
          (props.isEdit ? undefined : Status.NEED_ADDITIONAL_VISIT),
        pricing_responsible_id: selectedPricingResponsible.value?.id
          ? Number(selectedPricingResponsible.value.id)
          : undefined,
        notification_message: getOptionalTextValue(
          notificationMessage.value,
          props.projectPreview?.notification_message,
        ),
      }),
    );
  };

  const updateEngineer = (value: TitleInterface<number> | null) => {
    selectedEngineer.value = value;
    updateData();
  };

  const setDefaultSelectValues = () => {
    if (props.isEdit) return;

    selectedNotificationType.value ??=
      notificationTypeOptions.value.find((item) => item.id === NotificationType.LOW) ?? null;
    selectedStatus.value ??=
      statusOptions.value.find((item) => item.id === Status.NEED_ADDITIONAL_VISIT) ?? null;
  };

  onMounted(() => {
    setDefaultSelectValues();
    updateData();
  });

  watch(
    () => props.projectPreview,
    (projectPreview) => {
      if (!projectPreview) return;

      const engineerId = projectPreview.engineer?.id ?? projectPreview.engineer_id;
      const pricingResponsibleId =
        projectPreview.pricing_responsible?.id ?? projectPreview.pricing_responsible_id;

      selectedEngineer.value = engineerId
        ? {
            id: engineerId,
            title: projectPreview.engineer?.title ?? `#${engineerId}`,
          }
        : null;

      selectedPricingResponsible.value = pricingResponsibleId
        ? {
            id: pricingResponsibleId,
            title: projectPreview.pricing_responsible?.title ?? `#${pricingResponsibleId}`,
          }
        : null;

      selectedNotificationType.value =
        projectPreview.notification_type == null
          ? null
          : (notificationTypeOptions.value.find(
              (item) => item.id === projectPreview.notification_type,
            ) ?? null);

      selectedStatus.value =
        projectPreview.status == null
          ? null
          : (statusOptions.value.find((item) => item.id === projectPreview.status) ?? null);

      selectedPreviewDate.value = parseApiDate(projectPreview.preview_date);
      selectedPreviewTime.value = parseApiTime(projectPreview.preview_time);

      previewDate.value = formatDateForApi(selectedPreviewDate.value);
      previewTime.value = formatTimeForApi(selectedPreviewTime.value);

      siteLink.value = projectPreview.site_link ?? '';
      address.value = projectPreview.address ?? '';
      notificationMessage.value = projectPreview.notification_message ?? '';

      updateData();
    },
    { immediate: true },
  );

  watch(
    () => props.projectId,
    () => {
      updateData();
    },
  );
</script>

<template>
  <section
    class="project-preview-form-page form-section"
    :class="{ disabled: loading }"
    :data-mode="isEdit ? 'edit' : 'add'"
    :aria-busy="loading"
  >
    <header class="form-section__header">
      <span class="form-section__icon" aria-hidden="true">
        <i class="pi pi-file-edit"></i>
      </span>

      <div class="form-section__heading">
        <h3>{{ $t('project.preview_title') }}</h3>
        <p>{{ $t('project.preview_description') }}</p>
      </div>
    </header>

    <div class="form-grid form-grid--three">
      <div class="field-block field-block--third">
        <div class="field-label-row">
          <label class="field-label" for="engineer_id">
            {{ $t('project.preview_engineer') }}
            <span class="field-required" aria-hidden="true">*</span>
          </label>
          <FieldHelpIcon
            :label="$t('project.preview_engineer')"
            field-name="engineer"
            field-id="engineer_id"
          />
        </div>

        <UpdatedCustomInputSelect
          id="engineer_id"
          :model-value="selectedEngineer"
          :controller="employeeController"
          :params="engineerParams"
          :placeholder="$t('project.preview_engineer_placeholder')"
          required
          @update:model-value="updateEngineer"
        />
        <small v-if="validationErrors.engineer_id" class="field-error">
          {{ validationErrors.engineer_id }}
        </small>
      </div>

      <div class="field-block field-block--third">
        <div class="field-label-row">
          <label class="field-label" for="preview_date">
            {{ $t('project.preview_date') }}
            <span class="field-required" aria-hidden="true">*</span>
          </label>
          <FieldHelpIcon
            :label="$t('project.preview_date')"
            field-name="date"
            field-id="preview_date"
          />
        </div>

        <DatePicker
          input-id="preview_date"
          :model-value="selectedPreviewDate"
          date-format="yy-mm-dd"
          show-icon
          icon-display="input"
          :manual-input="false"
          class="prime-date-picker"
          input-class="field-input"
          :invalid="Boolean(validationErrors.preview_date)"
          @update:model-value="updatePreviewDate"
        />
        <small v-if="validationErrors.preview_date" class="field-error">
          {{ validationErrors.preview_date }}
        </small>
      </div>

      <div class="field-block field-block--third">
        <div class="field-label-row">
          <label class="field-label" for="preview_time">
            {{ $t('project.preview_time') }}
            <span class="field-required" aria-hidden="true">*</span>
          </label>
          <FieldHelpIcon
            :label="$t('project.preview_time')"
            field-name="time"
            field-id="preview_time"
          />
        </div>

        <DatePicker
          input-id="preview_time"
          :model-value="selectedPreviewTime"
          time-only
          hour-format="24"
          show-icon
          icon-display="input"
          :manual-input="false"
          class="prime-date-picker"
          input-class="field-input"
          :invalid="Boolean(validationErrors.preview_time)"
          @update:model-value="updatePreviewTime"
        />
        <small v-if="validationErrors.preview_time" class="field-error">
          {{ validationErrors.preview_time }}
        </small>
      </div>

      <div class="field-block field-block--half">
        <div class="field-label-row">
          <label class="field-label" for="site_link">
            {{ $t('project.site_link') }}
          </label>
          <FieldHelpIcon
            :label="$t('project.site_link')"
            field-name="site_link"
            field-id="site_link"
          />
        </div>

        <div class="field-control">
          <i class="field-control__icon pi pi-link" aria-hidden="true"></i>
          <input
            id="site_link"
            v-model="siteLink"
            class="field-input field-input--url"
            type="url"
            :placeholder="$t('project.site_link_placeholder')"
            :aria-invalid="Boolean(validationErrors.site_link)"
            :aria-describedby="validationErrors.site_link ? 'site_link-error' : undefined"
            @input="updateData"
          />
        </div>
        <small v-if="validationErrors.site_link" id="site_link-error" class="field-error">
          {{ validationErrors.site_link }}
        </small>
      </div>

      <div class="field-block field-block--half">
        <div class="field-label-row">
          <label class="field-label" for="address">
            {{ $t('address') }}
          </label>
          <FieldHelpIcon :label="$t('address')" field-name="address" field-id="address" />
        </div>

        <textarea
          id="address"
          v-model="address"
          class="field-input field-textarea field-textarea--compact"
          rows="1"
          :placeholder="$t('project.preview_address_placeholder')"
          :aria-invalid="Boolean(validationErrors.address)"
          :aria-describedby="validationErrors.address ? 'address-error' : undefined"
          @input="updateData"
        />
        <small v-if="validationErrors.address" id="address-error" class="field-error">
          {{ validationErrors.address }}
        </small>
      </div>

      <div class="field-block field-block--full">
        <div class="field-label-row">
          <label class="field-label" for="notification_message">
            {{ $t('notification_message') }}
          </label>
          <FieldHelpIcon
            :label="$t('notification_message')"
            field-name="notification_message"
            field-id="notification_message"
          />
        </div>

        <textarea
          id="notification_message"
          v-model="notificationMessage"
          class="field-input field-textarea"
          rows="4"
          :placeholder="$t('project.preview_notification_message_placeholder')"
          :aria-invalid="Boolean(validationErrors.notification_message)"
          :aria-describedby="
            validationErrors.notification_message ? 'notification_message-error' : undefined
          "
          @input="updateData"
        />
        <small
          v-if="validationErrors.notification_message"
          id="notification_message-error"
          class="field-error"
        >
          {{ validationErrors.notification_message }}
        </small>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
  .form-section {
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow: visible;
    border: 1px solid var(--border-weak);
    border-radius: var(--card-radius);
    background: var(--bg-card);
    box-shadow: var(--shadow-sm);

    &.disabled {
      pointer-events: none;
      opacity: 0.72;
    }
  }

  .form-section__header {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    padding: clamp(1rem, 2vw, 1.5rem);
    border-bottom: 1px solid var(--border-weak);
  }

  .form-section__icon {
    display: inline-grid;
    flex: 0 0 auto;
    width: 2.75rem;
    height: 2.75rem;
    place-items: center;
    border: 1px solid var(--workflow-accent-12, var(--border-weak));
    border-radius: var(--radius-md);
    background: var(--workflow-accent-soft, var(--PrimaryColor-light));
    color: var(--PrimaryColor);
    font-size: 1.15rem;
  }

  .form-section__heading {
    min-width: 0;
  }

  .form-section__heading h3,
  .form-section__heading p {
    margin: 0;
  }

  .form-section__heading h3 {
    color: var(--gray-900);
    font-family: 'Bold', var(--font-family);
    font-size: var(--xl-size-base);
    line-height: 1.4;
  }

  .form-section__heading p {
    margin-top: 0.25rem;
    color: var(--gray-500);
    font-size: var(--sm-size);
    line-height: 1.65;
  }

  .form-grid {
    display: grid;
    gap: 1.25rem 1.125rem;
    align-items: start;
    padding: clamp(1rem, 2vw, 1.5rem);
  }

  .form-grid--three {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }

  .field-block {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 0.625rem;
  }

  .field-block--third {
    grid-column: span 2;
  }

  .field-block--half {
    grid-column: span 3;
  }

  .field-block--full {
    grid-column: 1 / -1;
  }

  .field-label-row {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    min-height: 1.5rem;
  }

  .field-label {
    color: var(--gray-800);
    font-family: 'Medium', var(--font-family);
    font-size: var(--sm-size);
    line-height: 1.45;
  }

  .field-required {
    margin-inline-start: 0.15rem;
    color: var(--danger);
  }

  .field-control {
    position: relative;
    min-width: 0;
    direction: ltr;
  }

  .field-control__icon {
    position: absolute;
    z-index: 1;
    top: 50%;
    inset-inline-end: 1rem;
    color: var(--gray-500);
    font-size: 0.95rem;
    pointer-events: none;
    transform: translateY(-50%);
  }

  .field-input {
    width: 100%;
    min-height: var(--workflow-control-height, var(--control-height));
    padding: 0.75rem 1rem;
    border: 1px solid var(--border-strong);
    border-radius: var(--control-radius);
    background: var(--bg-main);
    color: var(--gray-800);
    outline: none;
    font-family: 'Medium', var(--font-family);
    font-weight: 400;
    font-size: var(--sm-size);
    line-height: 1.5;
    transition:
      border-color var(--transition-fast),
      box-shadow var(--transition-fast),
      background-color var(--transition-fast);
  }

  .field-input:hover:not(:disabled) {
    border-color: var(--gray-400);
  }

  .field-input:focus-visible {
    border-color: var(--PrimaryColor);
    box-shadow: var(--focus-ring);
  }

  .field-input::placeholder {
    color: var(--gray-400);
    opacity: 1;
  }

  .field-input--url {
    padding-inline-end: 2.75rem;
    text-align: start;
    unicode-bidi: isolate;
  }

  .field-error {
    display: block;
    margin: 0;
    color: var(--danger-dark);
    font-family: 'Medium', var(--font-family);
    font-size: var(--xs-size);
    line-height: 1.5;
  }

  .prime-date-picker {
    width: 100%;
  }

  :deep(.p-datepicker-input) {
    width: 100%;
    min-height: var(--workflow-control-height, var(--control-height));
    padding: 0.75rem 1rem;
    border: 1px solid var(--border-strong);
    border-radius: var(--control-radius);
    background: var(--bg-main);
    color: var(--gray-800);
    outline: none;
    font-family: 'Medium', var(--font-family);
    font-weight: 400;
    font-size: var(--sm-size);
    transition:
      border-color var(--transition-fast),
      box-shadow var(--transition-fast);
  }

  :deep(.p-datepicker-input:hover:not(:disabled)) {
    border-color: var(--gray-400);
  }

  :deep(.p-datepicker-input:focus-visible) {
    border-color: var(--PrimaryColor);
    box-shadow: var(--focus-ring);
  }

  :deep(.p-datepicker-dropdown) {
    border-start-end-radius: var(--control-radius);
    border-end-end-radius: var(--control-radius);
    color: var(--gray-500);
  }

  :deep(.p-select) {
    width: 100%;
    min-height: var(--workflow-control-height, var(--control-height));
    border-color: var(--border-strong);
    border-radius: var(--control-radius);
    background: var(--bg-main);
    box-shadow: none;
  }

  :deep(.p-select:hover:not(.p-disabled)) {
    border-color: var(--gray-400);
  }

  :deep(.p-select:focus-within) {
    border-color: var(--PrimaryColor);
    box-shadow: var(--focus-ring);
  }

  :deep(.p-select-label) {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    color: var(--gray-800);
    font-family: 'Medium', var(--font-family);
    font-size: var(--sm-size);
  }

  :deep(.p-select-label.p-placeholder) {
    color: var(--gray-400);
  }

  .field-textarea {
    min-height: 7rem;
    resize: vertical;
  }

  .field-textarea--compact {
    min-height: var(--workflow-control-height, var(--control-height));
    border-radius: var(--control-radius);
  }

  .form-section :deep(.input-label) {
    display: none;
  }

  @media (max-width: 992px) {
    .form-grid--three {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .field-block--third,
    .field-block--half {
      grid-column: span 1;
    }

    .field-block--full {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: 640px) {
    .form-section__header,
    .form-grid {
      padding: 1rem;
    }

    .form-section__header {
      align-items: flex-start;
    }

    .form-grid--three {
      grid-template-columns: 1fr;
    }

    .field-block--third,
    .field-block--half,
    .field-block--full {
      grid-column: span 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .field-input,
    :deep(.p-datepicker-input) {
      transition: none;
    }
  }
</style>
