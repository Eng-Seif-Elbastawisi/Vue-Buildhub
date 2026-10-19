<script setup lang="ts">
  import { computed, onBeforeUnmount, watch } from 'vue';
  import Dialog from 'primevue/dialog';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import {
    DataLoading,
    DataSuccess,
  } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import type ScheduleGroupModel from '../../core/models/schedule.group.model';
  import ScheduleController from '../controllers/schedule.controller';

  const props = defineProps<{ group: ScheduleGroupModel }>();
  const emit = defineEmits<{ close: [] }>();
  const controller = ScheduleController.getInstance();
  const entries = computed(
    () =>
      controller.historyState.value.data?.slice().sort((a, b) => {
        const aTime = Date.parse(a.createdAt.replace(' ', 'T'));
        const bTime = Date.parse(b.createdAt.replace(' ', 'T'));
        return (
          (Number.isFinite(bTime) ? bTime : 0) - (Number.isFinite(aTime) ? aTime : 0) || b.id - a.id
        );
      }) ?? [],
  );
  watch(
    () => props.group.id,
    (id) => {
      void controller.readHistory(id);
    },
    { immediate: true },
  );
  onBeforeUnmount(() => controller.closeHistory());
</script>
<template>
  <Dialog
    class="workspace-dialog schedule-history-dialog"
    :visible="true"
    modal
    :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'"
    :header="$t('schedule.work_history_title', { title: group.title })"
    @update:visible="emit('close')"
  >
    <p v-if="controller.historyState.value instanceof DataLoading" role="status">
      {{ $t('schedule.loading') }}
    </p>
    <div v-else-if="controller.historyState.value.error" role="alert">
      <p>{{ $t(controller.historyState.value.error.displayMessage) }}</p>
      <AppButton type="button" theme="secondary" @click="controller.readHistory(group.id)">{{
        $t('schedule.retry')
      }}</AppButton>
    </div>
    <p
      v-else-if="controller.historyState.value instanceof DataSuccess && !entries.length"
      role="status"
    >
      {{ $t('schedule.no_work_history') }}
    </p>
    <ol v-else-if="entries.length" class="schedule__history-list">
      <li v-for="entry in entries" :key="entry.id">
        <time :datetime="entry.createdAt.replace(' ', 'T')">{{ entry.createdAt }}</time>
        <strong>{{ $t(`schedule.work_${entry.status}`) }}</strong>
        <span v-if="entry.reason !== null"
          >{{ $t('schedule.reason') }}: {{ $t(`schedule.reason_${entry.reason}`) }}</span
        >
        <span
          >{{ $t('schedule.changed_by') }}:
          {{ entry.organizationEmployee?.name || $t('schedule.not_available') }}</span
        >
        <p v-if="entry.note !== null">{{ entry.note }}</p>
      </li>
    </ol>
    <div class="schedule__actions schedule__dialog-actions">
      <AppButton type="button" theme="secondary" @click="emit('close')">{{
        $t('schedule.close')
      }}</AppButton>
    </div>
  </Dialog>
</template>
