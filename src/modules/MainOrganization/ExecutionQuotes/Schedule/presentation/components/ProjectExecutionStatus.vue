<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import Dialog from 'primevue/dialog';
  import {
    DataLoading,
    DataSuccess,
  } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import EmployeeController from '@/modules/MainOrganization/employee/presentation/controllers/employee.controller';
  import IndexEmployeeParams from '@/modules/MainOrganization/employee/core/params/index.employee.params';
  import type TitleInterface from '@/base/Data/Models/titleInterface';
  import { ProjectWorkStatus } from '../../core/constants/project.work-status';
  import ChangeProjectConfigurationWorkStatusParams from '../../core/params/change.project.configuration.work-status.params';
  import ScheduleOwnerParams from '../../core/params/schedule.owner.params';
  import ScheduleController from '../controllers/schedule.controller';

  const props = defineProps<{ quoteId: number }>();
  const emit = defineEmits<{ configure: [] }>();
  const controller = ScheduleController.getInstance();
  const employeeController = EmployeeController.getInstance();
  const employeeParams = new IndexEmployeeParams('', 1, 20, 1);
  const configurationState = computed(() => controller.settingsState.value);
  const configuration = computed(() =>
    configurationState.value instanceof DataSuccess ? configurationState.value.data : null,
  );
  const busy = computed(() => controller.projectExecutionBusy.value);
  const mutation = computed(() => controller.projectExecutionState.value);
  const mutationMessages = computed(() => {
    const error = mutation.value.error;
    return error
      ? [error.displayMessage, ...Object.values(error.validationErrors ?? {}).flat()]
      : [];
  });
  const showStart = ref(false);
  const employee = ref<TitleInterface<number | string> | null>(null);
  const invalid = ref(false);
  const submitting = ref(false);
  const statusKey = computed(() => {
    const status = configuration.value?.workStatus;
    return status === null
      ? 'project_execution.not_started'
      : status === undefined
        ? 'schedule.not_available'
        : `project_execution.status_${status}`;
  });

  watch(
    () => props.quoteId,
    () => {
      showStart.value = false;
      employee.value = null;
      invalid.value = false;
      submitting.value = false;
    },
  );

  async function changeStatus(status: ProjectWorkStatus, employeeId?: number) {
    if (busy.value || submitting.value) return;
    const quoteId = props.quoteId;
    submitting.value = true;
    try {
      const result = await controller.changeProjectConfigurationWorkStatus(
        new ChangeProjectConfigurationWorkStatusParams(quoteId, status, employeeId),
      );
      if (quoteId === props.quoteId && result instanceof DataSuccess) {
        showStart.value = false;
        employee.value = null;
      }
    } finally {
      if (quoteId === props.quoteId) submitting.value = false;
    }
  }

  function start() {
    if (!configuration.value || busy.value || submitting.value) return;
    if (configuration.value.workStatus === null || !configuration.value.responsibleEmployeeId) {
      controller.clearProjectExecutionFeedback();
      invalid.value = false;
      showStart.value = true;
    } else void changeStatus(ProjectWorkStatus.START);
  }

  function updateEmployee(
    value: TitleInterface<number | string> | TitleInterface<number | string>[] | null,
  ) {
    employee.value = Array.isArray(value) ? null : value;
    if (employee.value) invalid.value = false;
  }

  function submitStart() {
    if (busy.value || submitting.value) return;
    invalid.value = !employee.value?.id;
    if (invalid.value || !employee.value) return;
    void changeStatus(ProjectWorkStatus.START, Number(employee.value.id));
  }
</script>

<template>
  <section
    class="project-execution"
    :aria-label="$t('project_execution.title')"
    :aria-busy="busy || configurationState instanceof DataLoading"
  >
    <header class="project-execution__header">
      <div>
        <span class="schedule__eyebrow">{{ $t('project_execution.title') }}</span>
        <strong
          v-if="configuration"
          class="project-execution__status"
          :class="`project-execution__status--${configuration.workStatus ?? 'unstarted'}`"
          >{{ $t(statusKey) }}</strong
        >
      </div>
      <div v-if="configuration" class="schedule__actions">
        <AppButton
          v-if="configuration.workStatus === null"
          :disabled="busy || submitting"
          @click="start"
          >{{ $t('project_execution.start') }}</AppButton
        >
        <template v-else-if="configuration.workStatus === ProjectWorkStatus.START">
          <AppButton
            theme="secondary"
            :disabled="busy || submitting"
            @click="changeStatus(ProjectWorkStatus.HOLD)"
            >{{ $t('project_execution.hold') }}</AppButton
          >
          <AppButton
            theme="danger"
            :disabled="busy || submitting"
            @click="changeStatus(ProjectWorkStatus.STOP)"
            >{{ $t('project_execution.stop') }}</AppButton
          >
        </template>
        <AppButton
          v-else-if="
            configuration.workStatus === ProjectWorkStatus.HOLD ||
            configuration.workStatus === ProjectWorkStatus.STOP
          "
          :disabled="busy || submitting"
          @click="start"
          >{{ $t('project_execution.resume') }}</AppButton
        >
      </div>
    </header>
    <p v-if="configurationState instanceof DataLoading" role="status">
      {{ $t('project_execution.loading') }}
    </p>
    <template v-else-if="configurationState instanceof DataSuccess && !configuration">
      <p>{{ $t('project_execution.configuration_required') }}</p>
      <AppButton theme="secondary" @click="emit('configure')">{{
        $t('schedule.settings')
      }}</AppButton>
    </template>
    <template v-if="configuration">
      <dl class="schedule__summary">
        <div>
          <dt>{{ $t('project_execution.employee') }}</dt>
          <dd>{{ configuration.responsibleEmployee?.name ?? $t('schedule.not_available') }}</dd>
        </div>
        <div>
          <dt>{{ $t('schedule.planned_start') }}</dt>
          <dd>{{ configuration.startDate ?? $t('schedule.not_available') }}</dd>
        </div>
        <div v-if="configuration.deliveryDate">
          <dt>{{ $t('project_execution.delivery_date') }}</dt>
          <dd>{{ configuration.deliveryDate }}</dd>
        </div>
      </dl>
    </template>
    <div v-if="configurationState.error" role="alert">
      <p>{{ $t(configurationState.error.displayMessage) }}</p>
      <AppButton
        theme="secondary"
        @click="controller.readSettings(new ScheduleOwnerParams(quoteId))"
        >{{ $t('schedule.retry') }}</AppButton
      >
    </div>
    <div v-if="mutation.error && !showStart" role="alert">
      <p v-for="(message, index) in mutationMessages" :key="index">{{ $t(message) }}</p>
    </div>
    <p v-if="mutation instanceof DataSuccess" role="status">
      {{ mutation.message ?? $t('project_execution.saved') }}
    </p>
    <p v-if="controller.projectExecutionRefreshFailed.value" role="alert">
      {{ $t('schedule.saved_refresh_failed') }}
    </p>

    <Dialog
      v-if="showStart"
      :visible="true"
      modal
      class="workspace-dialog"
      :header="$t('project_execution.dialog_title')"
      :closable="!busy && !submitting"
      :close-on-escape="!busy && !submitting"
      :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'"
      @update:visible="!busy && !submitting && (showStart = false)"
    >
      <form class="schedule__status-form" @submit.prevent="submitStart">
        <div class="field-group" :class="{ schedule__invalid: invalid }">
          <UpdatedCustomInputSelect
            id="project-execution-employee"
            :model-value="employee"
            :controller="employeeController"
            :params="employeeParams"
            :label="$t('project_execution.employee')"
            :placeholder="$t('project_execution.choose_employee')"
            :disabled="busy || submitting"
            required
            @update:model-value="updateEmployee"
          />
          <small v-if="invalid" role="alert">{{ $t('project_execution.employee_required') }}</small>
        </div>
        <div class="project-execution__requirements">
          <p>{{ $t('project_execution.requirements') }}</p>
          <ul>
            <li>{{ $t('project_execution.payment_requirement') }}</li>
            <li>{{ $t('project_execution.drawing_requirement') }}</li>
          </ul>
        </div>
        <div v-if="mutation.error" role="alert">
          <p v-for="(message, index) in mutationMessages" :key="index">{{ $t(message) }}</p>
        </div>
        <div class="schedule__actions schedule__dialog-actions">
          <AppButton
            type="button"
            theme="secondary"
            :disabled="busy || submitting"
            @click="showStart = false"
            >{{ $t('schedule.cancel') }}</AppButton
          >
          <AppButton type="submit" :loading="busy || submitting">{{
            $t('project_execution.start')
          }}</AppButton>
        </div>
      </form>
    </Dialog>
  </section>
</template>

<style scoped lang="scss">
  .project-execution {
    display: grid;
    gap: var(--bh-space-4);
    padding: var(--bh-space-5);
    border: 1px solid var(--bh-line);
    border-radius: var(--bh-radius-card);
    background: var(--bh-surface);
  }

  .project-execution__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: var(--bh-space-4);
  }

  .project-execution__status {
    display: block;
    margin-block-start: var(--bh-space-2);
    color: var(--bh-text);
  }

  .project-execution__status--1 {
    color: var(--primary-green);
  }

  .project-execution__requirements {
    color: var(--bh-muted);
  }

  .project-execution__requirements ul {
    padding-inline-start: var(--bh-space-5);
    list-style: disc;
  }

  .project-execution__requirements li + li {
    margin-block-start: var(--bh-space-2);
  }
</style>
