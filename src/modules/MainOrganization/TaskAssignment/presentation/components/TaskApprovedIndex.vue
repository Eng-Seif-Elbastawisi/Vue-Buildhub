<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
  import Pagination from '@/shared/HelpersComponents/Pagination.vue';
  import TableSkelaton from '@/shared/HelpersComponents/TableSkelaton.vue';

  import TaskAssignmentController from '../controllers/task.assignment.controller';
  import FetchApprovedTasksParams from '../../core/params/fetch.approved.tasks.params';
  import TaskAssignmentApprovedTaskModel from '../../core/models/task.assignment.approved-task.model';

  interface ApprovedTaskTableRow {
    id: number;
    title: string;
    projectName: string;
    departmentName: string;
    departmentItemName: string;
    reviewerName: string;
    duration: string;
    statusLabel: string;
    attachmentsCount: number;
  }

  const controller = TaskAssignmentController.getInstance();

  const route = useRoute();
  const router = useRouter();

  const perPage = ref(10);

  const state = computed(() => controller.listState.value);

  const currentPage = computed(() => {
    const page = Number(route.query.page);

    return Number.isInteger(page) && page > 0 ? page : 1;
  });

  const headers: TableHeader[] = [
    {
      key: 'title',
      label: 'task_assignment.table.title',
      width: '16%',
      sortable: true,
    },
    {
      key: 'projectName',
      label: 'task_assignment.table.project',
      width: '16%',
      sortable: true,
    },
    {
      key: 'departmentName',
      label: 'task_assignment.table.department',
      width: '14%',
      sortable: true,
    },
    {
      key: 'departmentItemName',
      label: 'task_assignment.table.department_item',
      width: '16%',
      sortable: true,
    },
    {
      key: 'reviewerName',
      label: 'task_assignment.table.reviewer',
      width: '14%',
    },
    {
      key: 'duration',
      label: 'task_assignment.table.duration',
      width: '8%',
    },
    {
      key: 'statusLabel',
      label: 'task_assignment.table.status',
      width: '8%',
    },
    {
      key: 'attachmentsCount',
      label: 'task_assignment.table.attachments',
      width: '8%',
    },
  ];

  const normalizeTask = (
    task: TaskAssignmentApprovedTaskModel | Record<string, unknown>,
  ): TaskAssignmentApprovedTaskModel => {
    if (task instanceof TaskAssignmentApprovedTaskModel) {
      return task;
    }

    return TaskAssignmentApprovedTaskModel.fromJson(task);
  };

  const mapTaskToTableRow = (task: TaskAssignmentApprovedTaskModel): ApprovedTaskTableRow => ({
    id: task.id,
    title: task.title || '-',
    projectName: task.projectName || '-',
    departmentName: task.departmentName || '-',
    departmentItemName: task.departmentItemName || '-',
    reviewerName: task.reviewerName || '-',
    duration: task.durationDisplay || '-',
    statusLabel: task.statusLabel || '-',
    attachmentsCount: task.attachmentsCount,
  });

  const getTableItems = (
    data: Array<TaskAssignmentApprovedTaskModel | Record<string, unknown>>,
  ): ApprovedTaskTableRow[] => {
    return data.map(normalizeTask).map(mapTaskToTableRow);
  };

  const fetchApprovedTasks = async (page: number = currentPage.value): Promise<void> => {
    await controller.fetchApprovedTasks(
      new FetchApprovedTasksParams({
        page,
        perPage: perPage.value,
        isAssign: 0,
      }),
    );
  };
  const onPageChange = async (page: number): Promise<void> => {
    await router.push({
      query: {
        ...route.query,
        page: String(page),
      },
    });

    await fetchApprovedTasks(page);
  };

  const onPerPageChange = async (count: number): Promise<void> => {
    perPage.value = count;

    await router.push({
      query: {
        ...route.query,
        page: '1',
      },
    });

    await fetchApprovedTasks(1);
  };

  onMounted(() => {
    void fetchApprovedTasks();
  });
</script>

<template>
  <div class="task-assignment-approved-page">
    <header class="page-header">
      <div>
        <h4>
          {{ $t('task_assignment.approved_tasks.title') }}
        </h4>

        <p>
          {{ $t('task_assignment.approved_tasks.description') }}
        </p>
      </div>

      <RouterLink
        class="btn btn-primary"
        :to="{
          name: 'mainorganization-task-assignment-create',
        }"
      >
        {{ $t('task_assignment.create') }}
      </RouterLink>
    </header>

    <DataStatusBuilder :controller="state" :on-retry="fetchApprovedTasks">
      <template #success="{ data }">
        <AppTable :headers="headers" :items="getTableItems(data)" show-index hoverable striped>
          <template #statusLabel="{ item }">
            <span class="task-status">
              {{ item.statusLabel }}
            </span>
          </template>

          <template #attachmentsCount="{ item }">
            <span class="attachments-count">
              <i class="pi pi-paperclip" aria-hidden="true" />

              {{ item.attachmentsCount }}
            </span>
          </template>
        </AppTable>

        <Pagination
          :pagination="controller.pagination.value"
          @change-page="onPageChange"
          @count-per-page="onPerPageChange"
        />
      </template>

      <template #empty>
        <div class="empty-state">
          <h3>
            {{ $t('task_assignment.approved_tasks.empty_title') }}
          </h3>

          <p>
            {{ $t('task_assignment.approved_tasks.empty_description') }}
          </p>

          <RouterLink
            class="btn btn-primary"
            :to="{
              name: 'mainorganization-task-assignment-create',
            }"
          >
            {{ $t('task_assignment.create') }}
          </RouterLink>
        </div>
      </template>

      <template #loader>
        <TableSkelaton
          :rows="5"
          :columns="headers.length"
          :has-actions="false"
          :show-index="true"
          :selectable="false"
        />
      </template>
    </DataStatusBuilder>
  </div>
</template>

<style scoped lang="scss">
  .task-assignment-approved-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .page-header p,
  .empty-state p {
    color: var(--gray-5);
  }

  .empty-state {
    padding: 3rem 1rem;
    text-align: center;
  }

  .task-status,
  .attachments-count {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
  }

  .attachments-count {
    justify-content: center;
  }
</style>
