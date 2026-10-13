<script setup lang="ts">
  import { computed, onBeforeUnmount, ref, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import ProjectWorkspaceNav from '../../../presentation/components/ProjectWorkspaceNav.vue';
  import WorkItemsController from '../controllers/work-items.controller';
  import { positiveId, WorkActivityType } from '../../core/constants/work-items.constants';
  import EngineerTasksList from './EngineerTasksList.vue';
  import DailyReportsList from './DailyReportsList.vue';
  import WorkActivitiesList from './WorkActivitiesList.vue';
  import ShopDrawingsList from './ShopDrawingsList.vue';
  import ShopDrawingFormDialog from './ShopDrawingFormDialog.vue';
  import TaskFormDialog from './TaskFormDialog.vue';
  import DailyReportFormDialog from './DailyReportFormDialog.vue';
  import MeetingIssueFormDialog from './MeetingIssueFormDialog.vue';
  const route = useRoute();
  const { t } = useI18n();
  const controller = WorkItemsController.getInstance();
  const quoteId = computed(() => Number(route.params.id));
  const drawingOpen = ref(false);
  const taskOpen = ref(false);
  const reportOpen = ref(false);
  const activityOpen = ref(false);
  const initialType = ref<WorkActivityType>(WorkActivityType.Meeting);
  function stageLabel(id: number) {
    return (
      controller.stages.value.find((stage) => stage.id === id)?.title ??
      t('work_items.stage_reference', { id })
    );
  }
  function openActivity(type: WorkActivityType) {
    initialType.value = type;
    activityOpen.value = true;
  }
  watch(
    quoteId,
    (id) => {
      drawingOpen.value = false;
      taskOpen.value = false;
      reportOpen.value = false;
      activityOpen.value = false;
      controller.activate(id);
      if (positiveId(id)) void controller.load();
    },
    { immediate: true },
  );
  onBeforeUnmount(() => controller.release());
</script>
<template>
  <div class="work-items-page">
    <ProjectWorkspaceNav :quote-id="quoteId" active="work-items" />
    <header class="work-items-header">
      <div>
        <h1>{{ $t('work_items.title') }}</h1>
        <p>{{ $t('work_items.subtitle') }}</p>
      </div>
      <div class="work-items-actions">
        <AppButton theme="secondary" :disabled="!positiveId(quoteId)" @click="drawingOpen = true">{{
          $t('work_items.new_drawing')
        }}</AppButton>
        <AppButton :disabled="!positiveId(quoteId)" @click="taskOpen = true">{{
          $t('work_items.new_task')
        }}</AppButton
        ><AppButton theme="secondary" :disabled="!positiveId(quoteId)" @click="reportOpen = true">{{
          $t('work_items.daily_report')
        }}</AppButton
        ><AppButton
          theme="secondary"
          :disabled="!positiveId(quoteId)"
          @click="openActivity(WorkActivityType.Issue)"
          >{{ $t('work_items.new_issue') }}</AppButton
        ><AppButton
          theme="secondary"
          :disabled="!positiveId(quoteId)"
          @click="openActivity(WorkActivityType.Meeting)"
          >{{ $t('work_items.new_meeting') }}</AppButton
        >
      </div>
    </header>
    <p v-if="!positiveId(quoteId)" role="alert">{{ $t('work_items.invalid_quote') }}</p>
    <template v-else>
      <EngineerTasksList
        :key="`tasks-${quoteId}`"
        :state="controller.tasksState.value"
        :stage-label="stageLabel"
        @retry="controller.loadTasks()"
      />
      <DailyReportsList
        :key="`reports-${quoteId}`"
        :state="controller.reportsState.value"
        :stage-label="stageLabel"
        @retry="controller.loadReports()"
      />
      <WorkActivitiesList
        :key="`activities-${quoteId}`"
        :state="controller.activitiesState.value"
        :stage-label="stageLabel"
        @retry="controller.loadActivities()"
      />
      <ShopDrawingsList
        :key="`drawings-${quoteId}`"
        :state="controller.drawingsState.value"
        @retry="controller.loadDrawings()"
      />
    </template>
    <ShopDrawingFormDialog :key="`drawing-${quoteId}`" v-model:visible="drawingOpen" />
    <TaskFormDialog :key="`task-${quoteId}`" v-model:visible="taskOpen" />
    <DailyReportFormDialog :key="`report-${quoteId}`" v-model:visible="reportOpen" />
    <MeetingIssueFormDialog
      :key="`activity-${quoteId}`"
      v-model:visible="activityOpen"
      :initial-type="initialType"
    />
  </div>
</template>
<style lang="scss">
  @use '../styles/work-items';
</style>
