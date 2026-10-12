<script setup lang="ts">
  import { computed, onBeforeUnmount, ref, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import { DataLoading } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import ProjectWorkspaceNav from '../../../presentation/components/ProjectWorkspaceNav.vue';
  import WorkItemsController from '../controllers/work-items.controller';
  import { positiveId, WorkActivityType } from '../../core/constants/work-items.constants';
  import WorkItemSection from './WorkItemSection.vue';
  import TaskFormDialog from './TaskFormDialog.vue';
  import DailyReportFormDialog from './DailyReportFormDialog.vue';
  import MeetingIssueFormDialog from './MeetingIssueFormDialog.vue';
  const route = useRoute();
  const { t } = useI18n();
  const controller = WorkItemsController.getInstance();
  const quoteId = computed(() => Number(route.params.id));
  const taskOpen = ref(false);
  const reportOpen = ref(false);
  const activityOpen = ref(false);
  const initialType = ref<WorkActivityType>(WorkActivityType.Meeting);
  const filter = ref<number>(0);
  const tasks = computed(() => controller.tasksState.value.data ?? []);
  const reports = computed(() => controller.reportsState.value.data ?? []);
  const activities = computed(() =>
    (controller.activitiesState.value.data ?? []).filter(
      (record) => !filter.value || record.type === filter.value,
    ),
  );
  const tasksLoading = computed(() => controller.tasksState.value instanceof DataLoading);
  const reportsLoading = computed(() => controller.reportsState.value instanceof DataLoading);
  const activitiesLoading = computed(() => controller.activitiesState.value instanceof DataLoading);
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
      taskOpen.value = false;
      reportOpen.value = false;
      activityOpen.value = false;
      filter.value = 0;
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
      <WorkItemSection
        :title="$t('work_items.tasks')"
        icon="pi pi-check-square"
        :count="controller.tasksState.value.data?.length"
        :loading="tasksLoading"
        :error="
          controller.tasksState.value.error
            ? $t(controller.tasksState.value.error.displayMessage)
            : undefined
        "
        :empty="!tasks.length"
        :empty-message="$t('work_items.tasks_empty')"
        @retry="controller.loadTasks()"
      >
        <ul class="work-items-records">
          <li v-for="task in tasks" :key="task.id">
            <h3>{{ task.title }}</h3>
            <p class="work-items-stage-label">{{ stageLabel(task.projectTimelineStageId) }}</p>
            <dl>
              <div>
                <dt>{{ $t('work_items.assigned_employee') }}</dt>
                <dd>{{ task.assignedEmployee?.name ?? $t('work_items.unassigned') }}</dd>
              </div>
              <div>
                <dt>{{ $t('work_items.end_date') }}</dt>
                <dd>{{ task.endDate ?? $t('work_items.no_date') }}</dd>
              </div>
              <div>
                <dt>{{ $t('work_items.created_by') }}</dt>
                <dd>{{ task.employee.name }}</dd>
              </div>
              <div>
                <dt>{{ $t('work_items.created_at') }}</dt>
                <dd>{{ task.createdAt ?? $t('work_items.no_date') }}</dd>
              </div>
            </dl>
          </li>
        </ul>
      </WorkItemSection>
      <WorkItemSection
        :title="$t('work_items.reports')"
        icon="pi pi-file-edit"
        :count="controller.reportsState.value.data?.length"
        :loading="reportsLoading"
        :error="
          controller.reportsState.value.error
            ? $t(controller.reportsState.value.error.displayMessage)
            : undefined
        "
        :empty="!reports.length"
        :empty-message="$t('work_items.reports_empty')"
        @retry="controller.loadReports()"
      >
        <ul class="work-items-records">
          <li v-for="report in reports" :key="report.id">
            <div class="work-items-record-heading">
              <h3>{{ report.date }}</h3>
              <span
                class="work-items-badge"
                :class="`work-items-safety-${report.siteSafetyStatus}`"
                >{{ $t(`work_items.safety_${report.siteSafetyStatus}`) }}</span
              >
            </div>
            <p class="work-items-stage-label">{{ stageLabel(report.projectTimelineStageId) }}</p>
            <p class="work-items-notes">{{ report.notes ?? $t('work_items.no_notes') }}</p>
            <dl>
              <div>
                <dt>{{ $t('work_items.created_by') }}</dt>
                <dd>{{ report.employee.name }}</dd>
              </div>
            </dl>
          </li>
        </ul>
      </WorkItemSection>
      <WorkItemSection
        :title="$t('work_items.activities')"
        icon="pi pi-comments"
        :count="controller.activitiesState.value.data ? activities.length : undefined"
        :loading="activitiesLoading"
        :error="
          controller.activitiesState.value.error
            ? $t(controller.activitiesState.value.error.displayMessage)
            : undefined
        "
        :empty="!activities.length"
        :empty-message="$t('work_items.activities_empty')"
        @retry="controller.loadActivities()"
      >
        <template #filters
          ><div class="work-items-filters" role="group" :aria-label="$t('work_items.filter_type')">
            <button
              v-for="type in [0, 1, 2, 3, 4]"
              :key="type"
              type="button"
              :aria-pressed="filter === type"
              @click="filter = type"
            >
              {{ $t(type ? `work_items.type_${type}` : 'work_items.all') }}
            </button>
          </div></template
        >
        <ul class="work-items-records">
          <li v-for="activity in activities" :key="activity.id">
            <div class="work-items-record-heading">
              <h3>{{ activity.title }}</h3>
              <span class="work-items-badge" :class="`work-items-type-${activity.type}`">{{
                $t(`work_items.type_${activity.type}`)
              }}</span>
            </div>
            <p class="work-items-stage-label">{{ stageLabel(activity.projectTimelineStageId) }}</p>
            <p v-if="activity.type !== WorkActivityType.Meeting" class="work-items-notes">
              {{ activity.description ?? $t('work_items.no_notes') }}
            </p>
            <dl>
              <div v-if="activity.type === WorkActivityType.Meeting">
                <dt>{{ $t('work_items.meeting_date') }}</dt>
                <dd>{{ activity.date ?? $t('work_items.no_date') }}</dd>
              </div>
              <div v-if="activity.assignedEmployee">
                <dt>{{ $t('work_items.assigned_employee') }}</dt>
                <dd>{{ activity.assignedEmployee.name }}</dd>
              </div>
              <div>
                <dt>{{ $t('work_items.created_by') }}</dt>
                <dd>{{ activity.employee.name }}</dd>
              </div>
            </dl>
          </li>
        </ul>
      </WorkItemSection>
    </template>
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
