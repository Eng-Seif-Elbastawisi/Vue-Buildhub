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

  function reset() {
    showSettings.value = false;
    showConfiguration.value = false;
    deleteId.value = null;
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
              @delete="deleteId = $event"
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
