<script setup lang="ts">
  import { computed, ref } from 'vue';
  import Dialog from 'primevue/dialog';
  import {
    DataLoading,
    DataSuccess,
  } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import ScheduleOwnerParams from '../../core/params/schedule.owner.params';
  import ScheduleController from '../controllers/schedule.controller';
  import SchedulePage from './SchedulePage.vue';
  import ScheduleSequenceBoard from './ScheduleSequenceBoard.vue';
  import ScheduleTimeline from './ScheduleTimeline.vue';
  import ScheduleSettingsDialog from './ScheduleSettingsDialog.vue';
  import ScheduleConfigurationDialog from './ScheduleConfigurationDialog.vue';
  import ScheduleApprovalDialog from './ScheduleApprovalDialog.vue';
  import ScheduleWorkStatusDialog from './ScheduleWorkStatusDialog.vue';
  import ScheduleWorkHistoryDialog from './ScheduleWorkHistoryDialog.vue';
  import { TimelineApprovalStatus } from '../../core/constants/timeline.status';
  import type ScheduleGroupModel from '../../core/models/schedule.group.model';

  const controller = ScheduleController.getInstance();
  const state = computed(() => controller.listState.value);
  const groups = computed(() => (state.value instanceof DataSuccess ? state.value.data : null));
  const settings = computed(() =>
    controller.settingsState.value instanceof DataSuccess
      ? controller.settingsState.value.data
      : null,
  );
  const showSettings = ref(false);
  const showConfiguration = ref(false);
  const deleteId = ref<number | null>(null);
  const approvalTarget = ref<
    typeof TimelineApprovalStatus.APPROVED | typeof TimelineApprovalStatus.CANCEL | null
  >(null);
  const workId = ref<number | null>(null);
  const historyId = ref<number | null>(null);
  const workGroup = computed(() =>
    groups.value?.find((group: ScheduleGroupModel) => group.id === workId.value),
  );
  const historyGroup = computed(() =>
    groups.value?.find((group: ScheduleGroupModel) => group.id === historyId.value),
  );

  function reset() {
    showSettings.value = false;
    showConfiguration.value = false;
    deleteId.value = null;
    approvalTarget.value = null;
    workId.value = null;
    historyId.value = null;
  }
  async function load(quoteId: number) {
    await Promise.all([
      controller.fetchList(new ScheduleOwnerParams(quoteId)),
      controller.readSettings(new ScheduleOwnerParams(quoteId)),
    ]);
  }
  async function deleteGroup(quoteId: number) {
    if (deleteId.value === null || controller.busy.value) return;
    const deletion = await controller.delete(new ScheduleOwnerParams(quoteId, deleteId.value));
    if (deletion instanceof DataSuccess && controller.ownerState.value.data?.id === quoteId)
      deleteId.value = null;
  }
</script>
<template>
  <SchedulePage mode="index" @ready="load" @reset="reset">
    <template #default="{ quoteId, indexRoute, reload }">
      <header class="schedule__page-title">
        <span class="schedule__heading-icon"
          ><i class="pi pi-calendar" aria-hidden="true"></i
        ></span>
        <h1>{{ $t('schedule.title') }}</h1>
      </header>
      <section class="schedule__approval" :aria-label="$t('schedule.timeline_approval')">
        <div>
          <span class="schedule__eyebrow">{{ $t('schedule.timeline_approval') }}</span>
          <strong class="schedule__approval-status">{{
            controller.ownerState.value.data?.timelineStatus == null
              ? $t('schedule.not_available')
              : $t(`schedule.approval_${controller.ownerState.value.data.timelineStatus}`)
          }}</strong>
          <span v-if="controller.ownerState.value.data?.approvedByEmployee?.title">
            {{
              $t('schedule.approved_by_id', {
                id: controller.ownerState.value.data.approvedByEmployee.title,
              })
            }}
          </span>
          <!-- {{ console.log(groups) }} -->
          <!-- {{ controller.ownerState.value?.data?.approvedByEmployee }} -->
          <p v-if="controller.ownerState.value.data?.timelineNote">
            {{ controller.ownerState.value.data.timelineNote }}
          </p>
        </div>
        <div
          v-if="controller.ownerState.value.data?.timelineStatus === TimelineApprovalStatus.PENDING"
          class="schedule__approval-controls"
        >
          <div class="schedule__approval-actions">
            <AppButton
              type="button"
              theme="secondary"
              action-tone="approve"
              :disabled="controller.busy.value"
              @click="approvalTarget = TimelineApprovalStatus.APPROVED"
              >{{ $t('schedule.accept') }}</AppButton
            >
            <AppButton
              type="button"
              theme="danger"
              :disabled="controller.busy.value"
              @click="approvalTarget = TimelineApprovalStatus.CANCEL"
              >{{ $t('schedule.reject') }}</AppButton
            >
          </div>
        </div>
      </section>
      <div class="schedule__actions schedule__tools">
        <AppButton :to="`${indexRoute}/add`" :disabled="controller.busy.value" icon="left">
          <template #icon><i class="pi pi-plus" aria-hidden="true"></i></template>
          {{ $t('schedule.create') }}
        </AppButton>
        <AppButton
          theme="secondary"
          :disabled="!settings"
          icon="left"
          @click="showConfiguration = true"
        >
          <template #icon><i class="pi pi-sliders-h" aria-hidden="true"></i></template>
          {{ $t('schedule.configuration') }}
        </AppButton>
        <AppButton
          theme="secondary"
          icon="left"
          :disabled="controller.busy.value || controller.settingsState.value instanceof DataLoading"
          @click="showSettings = true"
        >
          <template #icon><i class="pi pi-cog" aria-hidden="true"></i></template>
          {{ $t('schedule.settings') }}
        </AppButton>
      </div>
      <dl class="schedule__summary">
        <div>
          <dt>
            <i class="pi pi-calendar" aria-hidden="true"></i>{{ $t('schedule.planned_start') }}
          </dt>
          <dd>
            {{
              settings?.startDate ??
              controller.overviewState.value.data?.startDate ??
              $t('schedule.not_available')
            }}
          </dd>
        </div>
        <div>
          <dt><i class="pi pi-flag" aria-hidden="true"></i>{{ $t('schedule.finish') }}</dt>
          <dd>{{ controller.calculatedFinish.value ?? $t('schedule.not_available') }}</dd>
        </div>
        <div>
          <dt><i class="pi pi-sitemap" aria-hidden="true"></i>{{ $t('schedule.group_count') }}</dt>
          <dd>
            {{
              controller.overviewState.value.data?.count ??
              groups?.length ??
              $t('schedule.not_available')
            }}
          </dd>
        </div>
      </dl>
      <p v-if="controller.settingsState.value.error" role="alert">
        {{ $t(controller.settingsState.value.error.displayMessage) }}
      </p>
      <DataStatusBuilder :controller="state" :on-retry="reload">
        <template #success>
          <p v-if="groups?.length === 0" class="schedule__empty">
            <i class="pi pi-calendar-plus" aria-hidden="true"></i>{{ $t('schedule.empty') }}
          </p>
          <template v-if="groups">
            <ScheduleSequenceBoard
              :groups="groups"
              :base-path="indexRoute"
              :quote-id="quoteId"
              :timeline-approved="
                controller.ownerState.value.data?.timelineStatus === TimelineApprovalStatus.APPROVED
              "
              @delete="deleteId = $event"
              @manage-work="workId = $event"
              @view-history="historyId = $event"
            />
            <ScheduleTimeline :groups="groups" />
          </template>
        </template>
        <template #empty>
          <p class="schedule__empty">
            <i class="pi pi-calendar-plus" aria-hidden="true"></i>{{ $t('schedule.empty') }}
          </p>
        </template>
      </DataStatusBuilder>
      <p v-if="controller.mutationState.value.error" role="alert">
        {{ $t(controller.mutationState.value.error.displayMessage) }}
      </p>
      <p v-if="controller.refreshFailed.value" role="alert">
        {{ $t('schedule.saved_refresh_failed') }}
      </p>
      <p v-if="controller.approvalState.value instanceof DataSuccess" role="status">
        {{ $t('schedule.approval_saved') }}
      </p>
      <p v-if="controller.workStatusState.value instanceof DataSuccess" role="status">
        {{ $t('schedule.work_saved') }}
      </p>
      <ScheduleApprovalDialog
        v-if="approvalTarget !== null"
        :quote-id="quoteId"
        :target-status="approvalTarget"
        @close="approvalTarget = null"
      />
      <ScheduleWorkStatusDialog
        v-if="workGroup"
        :key="workGroup.id"
        :group="workGroup"
        @close="workId = null"
      />
      <ScheduleWorkHistoryDialog
        v-if="historyGroup"
        :key="historyGroup.id"
        :group="historyGroup"
        @close="historyId = null"
      />
      <ScheduleConfigurationDialog
        v-if="showConfiguration && settings"
        :settings="settings"
        @close="showConfiguration = false"
      />
      <ScheduleSettingsDialog
        v-if="showSettings"
        :key="quoteId"
        :quote-id="quoteId"
        :settings="settings"
        :readable="true"
        @close="showSettings = false"
      />
      <Dialog
        class="workspace-dialog"
        :visible="deleteId !== null"
        modal
        :header="$t('schedule.delete')"
        :closable="!controller.busy.value"
        @update:visible="deleteId = null"
      >
        <p>{{ $t('schedule.confirm_delete') }}</p>
        <AppButton theme="danger" :loading="controller.busy.value" @click="deleteGroup(quoteId)">{{
          $t('schedule.delete')
        }}</AppButton>
        <AppButton theme="secondary" :disabled="controller.busy.value" @click="deleteId = null">{{
          $t('schedule.cancel')
        }}</AppButton>
      </Dialog>
    </template>
  </SchedulePage>
</template>
