<script setup lang="ts">
  import { computed, ref, watch } from 'vue';

  import type TitleInterface from '@/base/Data/Models/titleInterface';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import IndexEmployeeParams from '@/modules/MainOrganization/employee/core/params/index.employee.params';
  import EmployeeController from '@/modules/MainOrganization/employee/presentation/controllers/employee.controller';

  import type ProjectPreviewShowModel from '../../../core/models/project.preview.show.model';
  import AddProjectPreviewParams from '../../../core/params/add.project.preview.params';
  import { NotificationType } from '@/modules/MainOrganization/Project/core/constants/notificationType.enum';
  import { Status } from '@/modules/MainOrganization/Project/core/constants/status.enum';
  import { useI18n } from 'vue-i18n';

  const emit = defineEmits<{
    updateData: [params: AddProjectPreviewParams];
  }>();

  const { t } = useI18n();

  const props = defineProps<{
    projectPreview?: ProjectPreviewShowModel;
    projectId?: number;
    loading?: boolean;
    isEdit?: boolean;
  }>();

  const selectedEngineer = ref<TitleInterface<number> | null>(null);
  const selectedPricingResponsible = ref<TitleInterface<number> | null>(null);
  const selectedNotificationType = ref<TitleInterface<NotificationType> | null>(null);
  const status = ref<TitleInterface<Status> | null>(null);

  const previewDate = ref<string>('');
  const previewTime = ref<string>('');
  const siteLink = ref<string>('');
  const address = ref<string>('');
  const notification_message = ref<string>('');

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

  // employee type = 2
  const engineerParams = new IndexEmployeeParams('', 1, 100, 0, 2);

  // employee type = 4
  const pricingResponsibleParams = new IndexEmployeeParams('', 1, 100, 0, 4);

  const updateData = () => {
    emit(
      'updateData',
      new AddProjectPreviewParams({
        project_id: props.projectId,
        engineer_id: selectedEngineer.value?.id ? Number(selectedEngineer.value.id) : undefined,
        preview_date: previewDate.value,
        preview_time: previewTime.value,
        site_link: siteLink.value,
        address: address.value,
        notification_type: selectedNotificationType.value?.id ?? NotificationType.LOW,
        status: status.value?.id ?? Status.NEED_ADDITIONAL_VISIT,
        pricing_responsible_id: selectedPricingResponsible.value?.id
          ? Number(selectedPricingResponsible.value.id)
          : undefined,
        notification_message: notification_message.value,
      }),
    );
  };

  const updateEngineer = (value: TitleInterface<number> | null) => {
    selectedEngineer.value = value;
    updateData();
  };

  const updatePricingResponsible = (value: TitleInterface<number> | null) => {
    selectedPricingResponsible.value = value;
    updateData();
  };

  const updateNotificationType = (value: TitleInterface<NotificationType> | null) => {
    selectedNotificationType.value = value;
    updateData();
  };

  const updateStatus = (value: TitleInterface<Status> | null) => {
    status.value = value;
    updateData();
  };

  watch(
    () => props.projectPreview,
    (projectPreview) => {
      if (!projectPreview) return;

      const projectData = projectPreview as any;

      selectedEngineer.value = projectData.engineer
        ? {
            id: projectData.engineer.id,
            title: projectData.engineer.title,
          }
        : null;

      selectedPricingResponsible.value = projectData.pricing_responsible
        ? {
            id: projectData.pricing_responsible.id,
            title: projectData.pricing_responsible.title || projectData.pricing_responsible.name,
          }
        : null;

      selectedNotificationType.value =
        notificationTypeOptions.value.find((item) => item.id === projectData.notification_type) ??
        notificationTypeOptions.value.find((item) => item.id === NotificationType.LOW) ??
        null;

      status.value =
        statusOptions.value.find((item) => item.id === projectData.status) ??
        statusOptions.value.find((item) => item.id === Status.NEED_ADDITIONAL_VISIT) ??
        null;

      previewDate.value = projectData.preview_date ?? '';
      previewTime.value = projectData.preview_time ?? '';
      siteLink.value = projectData.site_link ?? '';
      address.value = projectData.address ?? '';
      notification_message.value = projectData.notification_message ?? '';

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
  <section class="form-section" :class="{ disabled: loading }" dir="rtl">
    <header>
      <h3>{{ $t('project.preview_title') }}</h3>
      <p>{{ $t('project.preview_description') }}</p>
    </header>

    <div class="form-grid form-grid--three">
      <div class="field-block">
        <div class="field-label-row">
          <span class="label-icon">👷</span>
          <label class="field-label" for="engineer_id">
            {{ $t('project.preview_engineer') }}
          </label>
        </div>

        <UpdatedCustomInputSelect
          id="engineer_id"
          :model-value="selectedEngineer"
          :controller="employeeController"
          :params="engineerParams"
          :placeholder="$t('project.preview_engineer_placeholder')"
          @update:model-value="updateEngineer"
        />
      </div>

      <div class="field-block">
        <div class="field-label-row">
          <span class="label-icon">📅</span>
          <label class="field-label" for="preview_date">
            {{ $t('project.preview_date') }}
          </label>
        </div>

        <input
          id="preview_date"
          v-model="previewDate"
          class="field-input"
          type="date"
          @input="updateData"
        />
      </div>

      <div class="field-block">
        <div class="field-label-row">
          <span class="label-icon">⏰</span>
          <label class="field-label" for="preview_time">
            {{ $t('project.preview_time') }}
          </label>
        </div>

        <input
          id="preview_time"
          v-model="previewTime"
          class="field-input"
          type="time"
          @input="updateData"
        />
      </div>

      <div class="field-block">
        <div class="field-label-row">
          <span class="label-icon">🔗</span>
          <label class="field-label" for="site_link">
            {{ $t('project.site_link') }}
          </label>
        </div>

        <input
          id="site_link"
          v-model="siteLink"
          class="field-input"
          type="url"
          :placeholder="$t('project.site_link_placeholder')"
          @input="updateData"
        />
      </div>

      <div class="field-block">
        <div class="field-label-row">
          <span class="label-icon">💰</span>
          <label class="field-label" for="pricing_responsible_id">
            {{ $t('project.pricing_responsible') }}
          </label>
        </div>

        <UpdatedCustomInputSelect
          id="pricing_responsible_id"
          :model-value="selectedPricingResponsible"
          :controller="employeeController"
          :params="pricingResponsibleParams"
          :placeholder="$t('project.pricing_responsible_placeholder')"
          @update:model-value="updatePricingResponsible"
        />
      </div>

      <div class="field-block">
        <div class="field-label-row">
          <span class="label-icon">🔔</span>
          <label class="field-label" for="notification_type">
            {{ $t('project.notification_type') }}
          </label>
        </div>

        <UpdatedCustomInputSelect
          id="notification_type"
          :model-value="selectedNotificationType"
          :static-options="notificationTypeOptions"
          :placeholder="$t('project.notification_type_placeholder')"
          @update:model-value="updateNotificationType"
        />
      </div>

      <div class="field-block">
        <div class="field-label-row">
          <span class="label-icon">📌</span>
          <label class="field-label" for="status">
            {{ $t('status') }}
          </label>
        </div>

        <UpdatedCustomInputSelect
          id="status"
          :model-value="status"
          :static-options="statusOptions"
          :placeholder="$t('status_placeholder')"
          @update:model-value="updateStatus"
        />
      </div>

      <div class="field-block col-span-3">
        <div class="field-label-row">
          <span class="label-icon">📍</span>
          <label class="field-label" for="address">
            {{ $t('address') }}
          </label>
        </div>

        <textarea
          id="address"
          v-model="address"
          class="field-input field-textarea"
          :placeholder="$t('project.preview_address_placeholder')"
          @input="updateData"
        />
      </div>

      <div class="field-block col-span-3">
        <div class="field-label-row">
          <span class="label-icon">✉️</span>
          <label class="field-label" for="notification_message">
            {{ $t('notification_message') }}
          </label>
        </div>

        <textarea
          id="notification_message"
          v-model="notification_message"
          class="field-input field-textarea"
          :placeholder="$t('project.preview_notification_message_placeholder')"
          @input="updateData"
        />
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
  .form-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;

    &.disabled {
      pointer-events: none;
      opacity: 0.7;
    }
  }

  header p {
    color: var(--gray-5);
  }

  .form-grid {
    display: grid;
    gap: 1rem;
    align-items: end;
  }

  .form-grid--three {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .field-block {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .field-label-row {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    min-height: 24px;
  }

  .label-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    min-width: 22px;
    height: 22px;
    line-height: 1;
    border-radius: 50%;
    background: var(--PrimaryColor-light);
    color: var(--PrimaryColor);
    font-size: 0.78rem;
  }

  .field-label {
    font-family: 'Medium';
    font-size: var(--sm-size);
    color: var(--gray-6);
  }

  .field-input {
    width: 100%;
    min-height: 46px;
    padding: 12px 16px;
    border: 1px solid var(--border-weak);
    border-radius: 28px;
    background: var(--white);
    outline: none;
    transition: all 0.25s ease;
    font-family: 'Medium';
    font-weight: 400;
    font-size: var(--sm-size);
    color: var(--bread-crumb-color-span);
  }

  .field-input:focus {
    border-color: var(--PrimaryColor);
  }

  .field-textarea {
    min-height: 110px;
    resize: vertical;
    border-radius: 18px;
  }

  .col-span-3 {
    grid-column: span 3;
  }

  @media (max-width: 992px) {
    .form-grid--three {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .col-span-3 {
      grid-column: span 2;
    }
  }

  @media (max-width: 768px) {
    .form-grid--three {
      grid-template-columns: 1fr;
    }

    .col-span-3 {
      grid-column: span 1;
    }
  }

  .form-section :deep(.input-label) {
    display: none;
  }
</style>
