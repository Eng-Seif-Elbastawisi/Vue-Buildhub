<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRouter } from 'vue-router';
  import Dialog from 'primevue/dialog';

  import type TitleInterface from '@/base/Data/Models/titleInterface';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';

  import IndexEmployeeParams from '@/modules/MainOrganization/employee/core/params/index.employee.params';
  import EmployeeController from '@/modules/MainOrganization/employee/presentation/controllers/employee.controller';

  import AddFinalProjectFloorResultParams from '../../core/params/final.result.project.floor.params';
  import { Status } from '../../core/constants/status.enum';
  import { NotificationType } from '../../core/constants/notificationType.enum';

  const emit = defineEmits<{
    submitFinalResult: [params: AddFinalProjectFloorResultParams];
  }>();

  const props = defineProps<{
    projectId?: number;
    projectPreviewId: number;
    loading?: boolean;
  }>();

  const { t } = useI18n();
  const router = useRouter();

  const employeeController = EmployeeController.getInstance();
  const pricingResponsibleParams = new IndexEmployeeParams('', 1, 100, 0, 4);

  const dialogVisible = ref(false);
  const notReadyDialogVisible = ref(false);

  const selectedStatus = ref<TitleInterface<Status> | null>(null);
  const selectedPricingResponsible = ref<TitleInterface<number> | null>(null);
  const selectedNotificationType = ref<TitleInterface<NotificationType> | null>(null);
  const notificationMessage = ref('');

  const statusOptions = computed<TitleInterface<Status>[]>(() => [
    {
      id: Status.READY_FOR_PRICING,
      title: t('ProjectFloor.ready_for_pricing'),
    },
    {
      id: Status.NEED_ADDITIONAL_VISIT,
      title: t('ProjectFloor.need_additional_visit'),
    },
    {
      id: Status.NOT_READY_FOR_COMPLETION,
      title: t('ProjectFloor.not_ready_for_completion'),
    },
  ]);

  const notificationTypeOptions = computed<TitleInterface<NotificationType>[]>(() => [
    {
      id: NotificationType.NORMAL,
      title: t('ProjectFloor.notification_normal'),
    },
    {
      id: NotificationType.URGENT,
      title: t('ProjectFloor.notification_urgent'),
    },
    {
      id: NotificationType.LOW,
      title: t('ProjectFloor.notification_low'),
    },
  ]);

  const pricingResponsibleOptions = computed<TitleInterface<number>[]>(() => {
    const state = employeeController.listState.value as any;

    const data =
      state?.data ??
      state?.data?.data ??
      state?.response?.data ??
      state?.response?.data?.data ??
      [];

    if (!Array.isArray(data)) return [];

    return data.map((item) => ({
      id: Number(item.id),
      title: item.name ?? item.title ?? `#${item.id}`,
    }));
  });

  const isReadyForPricing = computed(() => {
    return selectedStatus.value?.id === Status.READY_FOR_PRICING;
  });

  const canSubmit = computed(() => {
    return (
      !!selectedStatus.value &&
      !!selectedPricingResponsible.value &&
      !!selectedNotificationType.value &&
      notificationMessage.value.trim().length > 0
    );
  });

  const resetDialogFields = () => {
    selectedPricingResponsible.value = null;
    selectedNotificationType.value = null;
    notificationMessage.value = '';
  };
  const goBackToPreviewStep = async () => {
    await router.push({
      name: 'add-project_preview',
      query: {
        project_id: props.projectId,
      },
    });
  };

  const updateStatus = async (value: TitleInterface<Status>) => {
    selectedStatus.value = value;

    if (value.id === Status.READY_FOR_PRICING) {
      resetDialogFields();
      dialogVisible.value = true;
      return;
    }

    if (value.id === Status.NEED_ADDITIONAL_VISIT) {
      await goBackToPreviewStep();
      return;
    }

    if (value.id === Status.NOT_READY_FOR_COMPLETION) {
      notReadyDialogVisible.value = true;
    }
  };

  const closeDialog = () => {
    dialogVisible.value = false;
  };

  const submitFinalResult = () => {
    if (
      !selectedStatus.value ||
      !selectedPricingResponsible.value ||
      !selectedNotificationType.value
    ) {
      return;
    }

    emit(
      'submitFinalResult',
      new AddFinalProjectFloorResultParams({
        project_preview_id: props.projectPreviewId,
        status: selectedStatus.value.id as Status,
        pricing_responsible_id: Number(selectedPricingResponsible.value.id),
        notification_type: selectedNotificationType.value.id as NotificationType,
        notification_message: notificationMessage.value,
      }),
    );

    dialogVisible.value = false;
  };

  onMounted(async () => {
    await employeeController.fetchList(pricingResponsibleParams);
  });
</script>

<template>
  <section class="final-results-card" :class="{ disabled: loading }">
    <div class="section-head">
      <div class="section-head__icon">✅</div>

      <div>
        <h4>{{ $t('ProjectFloor.final_result') }}</h4>
        <p>{{ $t('ProjectFloor.final_result_description') }}</p>
      </div>
    </div>

    <div class="result-tabs">
      <button
        v-for="option in statusOptions"
        :key="option.id"
        type="button"
        class="result-tab"
        :class="{ active: selectedStatus?.id === option.id }"
        @click="updateStatus(option)"
      >
        <span class="result-tab__icon">
          {{
            option.id === Status.READY_FOR_PRICING
              ? '💰'
              : option.id === Status.NEED_ADDITIONAL_VISIT
                ? '🔁'
                : '⚠️'
          }}
        </span>

        <span>{{ option.title }}</span>
      </button>
    </div>

    <Dialog
      v-model:visible="dialogVisible"
      modal
      :draggable="false"
      :style="{ width: '70vw', maxWidth: '96vw' }"
      class="final-result-dialog"
    >
      <template #header>
        <div class="dialog-header">
          <span class="dialog-header__icon">
            {{ isReadyForPricing ? '💰' : '✅' }}
          </span>

          <div>
            <h4>{{ selectedStatus?.title }}</h4>
            <p>{{ $t('ProjectFloor.ready_for_pricing_description') }}</p>
          </div>
        </div>
      </template>

      <div class="dialog-body">
        <div class="dialog-grid">
          <div class="dialog-field">
            <span class="field-help-label-row field-help-label-row--block">
              <label class="field-label">
                {{ $t('ProjectFloor.pricing_responsible') }}
              </label>
              <FieldHelpIcon
                :label="$t('ProjectFloor.pricing_responsible')"
                field-name="engineer"
                field-id="pricing_responsible_id"
              />
            </span>

            <UpdatedCustomInputSelect
              id="pricing_responsible_id"
              :model-value="selectedPricingResponsible"
              :static-options="pricingResponsibleOptions"
              :placeholder="$t('ProjectFloor.pricing_responsible_placeholder')"
              @update:model-value="selectedPricingResponsible = $event"
            />
          </div>

          <div class="dialog-field">
            <span class="field-help-label-row field-help-label-row--block">
              <label class="field-label">
                {{ $t('ProjectFloor.notification_type') }}
              </label>
              <FieldHelpIcon :label="$t('ProjectFloor.notification_type')" field-name="type" />
            </span>

            <div class="notification-tabs">
              <button
                v-for="option in notificationTypeOptions"
                :key="option.id"
                type="button"
                class="notification-tab"
                :class="{ active: selectedNotificationType?.id === option.id }"
                @click="selectedNotificationType = option"
              >
                {{
                  option.id === NotificationType.URGENT
                    ? '🚨'
                    : option.id === NotificationType.LOW
                      ? '⬇️'
                      : '🔔'
                }}

                <span>{{ option.title }}</span>
              </button>
            </div>
          </div>
        </div>

        <div class="dialog-field">
          <span class="field-help-label-row field-help-label-row--block">
            <label class="field-label" for="notification_message">
              {{ $t('ProjectFloor.notification_message') }}
            </label>
            <FieldHelpIcon
              :label="$t('ProjectFloor.notification_message')"
              field-name="notes"
              field-id="notification_message"
            />
          </span>

          <textarea
            id="notification_message"
            v-model="notificationMessage"
            class="field-input field-textarea"
            :placeholder="$t('ProjectFloor.notification_message_placeholder')"
          />
        </div>
      </div>

      <template #footer>
        <div class="dialog-actions">
          <button type="button" class="dialog-btn dialog-btn--secondary" @click="closeDialog">
            {{ $t('cancel') }}
          </button>

          <button
            type="button"
            class="dialog-btn dialog-btn--primary"
            :disabled="!canSubmit || loading"
            @click="submitFinalResult"
          >
            {{ $t('ProjectFloor.send_to_pricing') }}
          </button>
        </div>
      </template>
    </Dialog>

    <Dialog
      v-model:visible="notReadyDialogVisible"
      modal
      :draggable="false"
      :style="{ width: '560px', maxWidth: '95vw' }"
      class="not-ready-dialog"
    >
      <template #header>
        <div class="dialog-header">
          <span class="dialog-header__icon">⚠️</span>

          <div>
            <h4>{{ $t('ProjectFloor.not_ready_for_completion') }}</h4>
            <p>{{ $t('ProjectFloor.not_ready_message') }}</p>
          </div>
        </div>
      </template>

      <div class="not-ready-body">
        {{ $t('ProjectFloor.not_ready_details') }}
      </div>

      <template #footer>
        <div class="dialog-actions">
          <button
            type="button"
            class="dialog-btn dialog-btn--primary"
            @click="notReadyDialogVisible = false"
          >
            {{ $t('ok') }}
          </button>
        </div>
      </template>
    </Dialog>
  </section>
</template>

<style scoped lang="scss">
  .final-results-card {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.15rem;
    border: 1px solid rgba(148, 163, 184, 0.22);
    border-radius: 26px;
    background: rgba(255, 255, 255, 0.92);
    box-shadow: 0 14px 35px rgba(15, 23, 42, 0.045);

    &.disabled {
      pointer-events: none;
      opacity: 0.7;
    }
  }

  .section-head {
    display: flex;
    align-items: flex-start;
    gap: 0.85rem;

    h4 {
      margin: 0;
      color: #111827;
      font-family: 'Bold';
      font-size: 1rem;
    }

    p {
      margin: 0.25rem 0 0;
      color: #64748b;
      font-size: var(--xs-size);
      line-height: 1.7;
    }
  }

  .section-head__icon,
  .dialog-header__icon {
    display: inline-flex;
    width: 42px;
    min-width: 42px;
    height: 42px;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(160, 98, 39, 0.14);
    border-radius: 16px;
    background: var(--PrimaryColor-light);
    color: var(--PrimaryColor);
  }

  .result-tabs {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.85rem;
  }

  .result-tab {
    display: flex;
    min-height: 62px;
    align-items: center;
    justify-content: center;
    gap: 0.55rem;
    padding: 0.85rem 1rem;
    border: 1px solid rgba(148, 163, 184, 0.22);
    border-radius: 18px;
    background: #fff;
    color: #334155;
    cursor: pointer;
    font-family: 'Medium';
    transition: all 0.25s ease;

    &:hover,
    &.active {
      border-color: var(--PrimaryColor);
      background: var(--PrimaryColor-light);
      color: var(--PrimaryColor);
      box-shadow: 0 0 0 1px var(--PrimaryColor);
    }
  }

  .result-tab__icon {
    line-height: 1;
  }

  .dialog-header {
    display: flex;
    align-items: flex-start;
    gap: 0.85rem;

    h4 {
      margin: 0;
      color: #111827;
      font-family: 'Bold';
    }

    p {
      margin: 0.25rem 0 0;
      color: #64748b;
      font-size: var(--xs-size);
      line-height: 1.7;
    }
  }

  .dialog-body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-top: 0.5rem;
  }

  .dialog-grid {
    display: grid;
    gap: 1rem;
  }

  .dialog-field {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
  }

  .field-label {
    color: #334155;
    font-family: 'Medium';
    font-size: var(--sm-size);
  }

  .field-input {
    width: 100%;
    min-height: 46px;
    padding: 0.75rem 0.9rem;
    border: 1px solid rgba(148, 163, 184, 0.26);
    border-radius: 16px;
    background: #fff;
    outline: none;
    transition: all 0.25s ease;
    color: #111827;
    font-family: 'Medium';
    font-size: var(--sm-size);

    &:focus {
      border-color: var(--PrimaryColor);
      box-shadow: 0 0 0 3px var(--PrimaryColor-light);
    }
  }

  .field-textarea {
    min-height: 150px;
    resize: vertical;
    line-height: 1.8;
  }

  .notification-tabs {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.65rem;
  }

  .notification-tab {
    display: flex;
    min-height: 46px;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    border: 1px solid rgba(148, 163, 184, 0.22);
    border-radius: 15px;
    background: #fff;
    color: #334155;
    cursor: pointer;
    font-family: 'Medium';
    transition: all 0.25s ease;
    font-size: var(--md-size);

    &:hover,
    &.active {
      border-color: var(--PrimaryColor);
      background: var(--PrimaryColor-light);
      color: var(--PrimaryColor);
    }
  }

  .not-ready-body {
    padding: 1rem;
    border: 1px solid rgba(220, 38, 38, 0.12);
    border-radius: 18px;
    background: rgba(220, 38, 38, 0.06);
    color: #991b1b;
    font-family: 'Medium';
    line-height: 1.8;
  }

  .dialog-actions {
    display: flex;
    width: 100%;
    justify-content: flex-end;
    gap: 0.75rem;
  }

  .dialog-btn {
    min-height: 44px;
    min-width: 130px;
    padding: 0 1.15rem;
    border: 0;
    border-radius: 14px;
    cursor: pointer;
    font-family: 'Medium';
    transition: all 0.25s ease;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.55;
    }
  }

  .dialog-btn--secondary {
    background: #f8fafc;
    color: #334155;
  }

  .dialog-btn--primary {
    background: linear-gradient(135deg, var(--PrimaryColor), #7a4318);
    color: #fff;
  }

  @media (max-width: 768px) {
    .result-tabs,
    .dialog-grid,
    .notification-tabs {
      grid-template-columns: 1fr;
    }

    .dialog-actions {
      flex-direction: column;
    }

    .dialog-btn {
      width: 100%;
    }
  }
</style>
