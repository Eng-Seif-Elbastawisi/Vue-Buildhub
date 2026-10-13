<script setup lang="ts">
  import { computed, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import {
    DataLoading,
    DataSuccess,
  } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import { validId } from '../../core/constants/schedule.constants';
  import ScheduleController from '../controllers/schedule.controller';
  import { schedulePath } from '../schedule.routes';
  import ProjectManagementShortcut from './ProjectManagementShortcut.vue';
  const props = defineProps<{ quoteId: number; compact?: boolean }>();
  const route = useRoute();
  const { t } = useI18n();
  const controller = ScheduleController.getInstance();
  const state = computed(() => controller.overviewState.value);
  const metrics = computed(() => [
    { label: t('schedule.status'), value: state.value.data?.status },
    { label: t('schedule.group_count'), value: state.value.data?.count },
    { label: t('schedule.start'), value: state.value.data?.startDate?.slice(0, 10) },
    { label: t('schedule.finish'), value: state.value.data?.endDate?.slice(0, 10) },
  ]);
  watch(
    () => props.quoteId,
    (quoteId) => {
      if (!validId(quoteId)) {
        controller.release();
        return;
      }
      controller.activate(quoteId);
      void controller.readOverview(quoteId);
    },
    { immediate: true },
  );
</script>
<template>
  <section class="schedule-shortcuts" :aria-label="$t('schedule.workspace')">
    <h2 v-if="!compact">{{ $t('schedule.workspace') }}</h2>
    <ProjectManagementShortcut
      :title="$t('schedule.title')"
      :description="$t('schedule.shortcut_description')"
      icon="pi pi-calendar"
      :to="schedulePath(route.path, quoteId)"
      :metrics="metrics"
      :status="state.data?.status"
      :state="
        state instanceof DataLoading
          ? 'loading'
          : state.error
            ? 'error'
            : state instanceof DataSuccess
              ? 'available'
              : 'unavailable'
      "
    />
    <section
      v-if="state instanceof DataSuccess && state.data?.projectTimelines.length"
      class="schedule-shortcuts__timeline"
      :aria-label="$t('schedule.timeline')"
    >
      <header class="schedule__section-heading">
        <span class="schedule__heading-icon"><i class="pi pi-file" aria-hidden="true"></i></span>
        <h3>{{ $t('schedule.timeline') }}</h3>
      </header>
      <details
        v-for="(group, index) in state.data.projectTimelines"
        :key="group.id"
        class="schedule__overview-group"
        open
      >
        <summary>
          <span class="schedule__sequence-number">{{ String(index + 1).padStart(2, '0') }}</span>
          <strong>{{ group.title }}</strong>
          <span class="schedule__overview-dates"
            >{{ group.startDate ?? $t('schedule.not_available') }} —
            {{ group.finishDate ?? $t('schedule.not_available') }}</span
          >
          <i class="pi pi-chevron-down" aria-hidden="true"></i>
        </summary>
        <ScheduleStageTable :stages="group.stages" />
      </details>
    </section>
  </section>
</template>
<style scoped lang="scss">
  .schedule-shortcuts {
    display: grid;
    gap: 1.25rem;
    min-width: 0;
  }

  .schedule-shortcuts h2 {
    margin-block: 0 1rem;
    color: var(--title-card-color);
    font-size: 1.15rem;
  }
</style>
