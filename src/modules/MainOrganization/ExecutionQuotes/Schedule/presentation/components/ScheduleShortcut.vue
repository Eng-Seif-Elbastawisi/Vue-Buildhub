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
  const props = defineProps<{ quoteId: number }>();
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
    <h2>{{ $t('schedule.workspace') }}</h2>
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
  </section>
</template>
<style scoped lang="scss">
  .schedule-shortcuts h2 {
    margin-block: 0 1rem;
    color: var(--title-card-color);
    font-size: 1.15rem;
  }
</style>
