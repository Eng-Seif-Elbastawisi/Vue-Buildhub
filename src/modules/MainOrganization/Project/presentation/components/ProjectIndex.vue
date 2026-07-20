<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
  import Pagination from '@/shared/HelpersComponents/Pagination.vue';
  import TableSkelaton from '@/shared/HelpersComponents/TableSkelaton.vue';
  import DeleteDialog from '@/base/Presentation/Dialogs/MainDialogs/DeleteDialog.vue';
  import { useUserStore } from '@/stores/user';
  import { DepartmentTypeEnum } from '@/modules/shared/Department/core/constants/Type.enum';

  import type ProjectModel from '../../core/models/project.model';
  import DeleteProjectParams from '../../core/params/delete.project.params';
  import IndexProjectParams from '../../core/params/index.project.params';
  import ProjectController from '../controllers/project.controller';

  import { ConvertStatus, getConvertStatusNameKey } from '../../core/constants/convert.status.enum';

  interface ProjectIndexProps {
    statuses?: ConvertStatus[] | null;
  }

  const props = withDefaults(defineProps<ProjectIndexProps>(), {
    statuses: () => [ConvertStatus.WAITING_PREVIEW, ConvertStatus.WAITING_PREVIEW_RESULT],
  });

  const controller = ProjectController.getInstance();

  const state = computed(() => controller.listState.value);

  const route = useRoute();
  const router = useRouter();

  const { user } = useUserStore();

  const perPage = ref(10);

  const parseServiceType = (routeServiceType: unknown): DepartmentTypeEnum[] => {
    const values = Array.isArray(routeServiceType)
      ? routeServiceType
      : routeServiceType
        ? [routeServiceType]
        : [];

    return values
      .flatMap((value) => String(value).split(','))
      .map(Number)
      .filter(
        (value): value is DepartmentTypeEnum =>
          value === DepartmentTypeEnum.DESIGN ||
          value === DepartmentTypeEnum.SUPERVISION ||
          value === DepartmentTypeEnum.BOTH,
      );
  };

  const serviceType = computed<DepartmentTypeEnum[]>(() =>
    parseServiceType(route.query.service_type),
  );

  const hideEditAndDeleteActions = computed(() => {
    return (
      serviceType.value.includes(DepartmentTypeEnum.DESIGN) ||
      serviceType.value.includes(DepartmentTypeEnum.SUPERVISION)
    );
  });

  const isPendingPage = computed(() => {
    return (
      Array.isArray(props.statuses) &&
      props.statuses.length === 1 &&
      props.statuses[0] === ConvertStatus.PENDING
    );
  });

  const headers = computed<TableHeader[]>(() => {
    const baseHeaders: TableHeader[] = [
      {
        key: 'title',
        label: 'title',
        width: '18%',
        sortable: true,
      },
      {
        key: 'client',
        label: 'client',
        width: '16%',
      },
      {
        key: 'projectType',
        label: 'project.Type',
        width: '16%',
      },
    ];

    if (!isPendingPage.value) {
      baseHeaders.push(
        {
          key: 'previewDate',
          label: 'preview_date',
          width: '13%',
        },
        {
          key: 'totalArea',
          label: 'total_area',
          width: '12%',
        },
        {
          key: 'totalPrice',
          label: 'total_price',
          width: '12%',
        },
      );
    }

    baseHeaders.push(
      {
        key: 'status',
        label: 'status',
        width: '13%',
      },
      {
        key: 'createdAt',
        label: 'createdAt',
        width: '13%',
      },
    );

    return baseHeaders;
  });

  const fetchProjects = async (page: number = 1) => {
    await controller.fetchList(
      new IndexProjectParams(
        '',
        route.query.page ? Number(route.query.page) : page,
        perPage.value,
        1,
        null,
        props.statuses,
        serviceType.value,
      ),
    );
  };

  const onPageChange = async (page: number) => {
    await router.push({
      query: {
        ...route.query,
        page: String(page),
      },
    });

    await fetchProjects(page);
  };

  const onPerPageChange = async (count: number) => {
    perPage.value = count;

    await router.push({
      query: {
        ...route.query,
        page: '1',
      },
    });

    await fetchProjects(1);
  };

  const deleteProject = async (id: number) => {
    /**
     * حماية إضافية حتى لا يتم الحذف برمجيًا
     * في صفحات التصميم أو الإشراف.
     */
    if (hideEditAndDeleteActions.value) return;

    await controller.delete(
      new DeleteProjectParams({
        projectId: id,
      }),
    );

    await fetchProjects();
  };

  onMounted(async () => {
    await fetchProjects();
  });

  watch(
    () => route.query.service_type,
    async () => {
      await fetchProjects();
    },
  );
</script>

<template>
  <div class="Project-page">
    <header class="page-header">
      <div>
        <template v-if="isPendingPage">
          <h4>
            {{ $t('requests') }}
          </h4>

          <p>
            {{ $t('requests_description') }}
          </p>
        </template>

        <template v-else>
          <h4>
            {{ $t('Project.list_title') }}
          </h4>

          <p>
            {{ $t('Project.list_description') }}
          </p>
        </template>
      </div>

      <router-link
        class="btn btn-primary"
        :to="user?.isMaster ? '/admin/Project/add' : '/organization/Project/add'"
      >
        {{ $t('Project.add') }}
      </router-link>
    </header>

    <DataStatusBuilder
      :controller="state"
      :on-retry="
        async () => {
          await fetchProjects();
        }
      "
    >
      <template #success="{ data }">
        <AppTable
          :headers="headers"
          :items="data as ProjectModel[]"
          selectable
          show-index
          hoverable
          striped
        >
          <template #cell-client="{ item }">
            <span>
              {{ item?.client?.name || '-' }}
            </span>
          </template>

          <template #cell-projectType="{ item }">
            <span>
              {{ item?.projectType?.title || '-' }}
            </span>
          </template>

          <template v-if="!isPendingPage" #cell-previewDate="{ item }">
            <span>
              {{ item?.previewDate || '-' }}
            </span>
          </template>

          <template v-if="!isPendingPage" #cell-totalArea="{ item }">
            <span>
              {{ item?.totalArea || '-' }}
            </span>
          </template>

          <template v-if="!isPendingPage" #cell-totalPrice="{ item }">
            <span>
              {{ item?.totalPrice || '-' }}
            </span>
          </template>

          <template #cell-status="{ item }">
            <span v-if="item.status" class="status-badge" :class="`status-${item.status}`">
              {{ $t(getConvertStatusNameKey(item.status)) }}
            </span>

            <span v-else>-</span>
          </template>

          <template #actions="{ item }">
            <div class="row-actions">
              <!-- زر العرض يظل ظاهرًا دائمًا -->
              <router-link
                class="action-btn edit"
                :to="
                  user?.isMaster
                    ? `/admin/Project/show/${item.id}`
                    : `/organization/Project/show/${item.id}`
                "
                :title="$t('show')"
              >
                <i class="pi pi-eye"></i>
              </router-link>

              <!-- إخفاء التعديل في Design وSupervision -->
              <router-link
                v-if="!hideEditAndDeleteActions"
                class="action-btn edit"
                :to="
                  user?.isMaster
                    ? `/admin/Project/edit/${item.id}`
                    : `/organization/Project/edit/${item.id}`
                "
                :title="$t('edit')"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />

                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </router-link>

              <!-- إخفاء الحذف في Design وSupervision -->
              <DeleteDialog
                v-if="!hideEditAndDeleteActions"
                :title="$t('Are you sure you want to remove this project?')"
                :message="$t('This action cannot be undone.')"
                :hasbtn="true"
                @delete="deleteProject(item.id!)"
              >
                <template #btn>
                  <button type="button" class="action-btn delete" :title="$t('Delete')">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M3 6h18" />

                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />

                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </button>
                </template>
              </DeleteDialog>
            </div>
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
          <template v-if="isPendingPage">
            <h3>
              {{ $t('requests_empty_title') }}
            </h3>

            <p>
              {{ $t('requests_empty_description') }}
            </p>
          </template>

          <template v-else>
            <h3>
              {{ $t('project.empty_title') }}
            </h3>

            <p>
              {{ $t('project.empty_description') }}
            </p>
          </template>

          <router-link
            class="btn btn-primary"
            :to="user?.isMaster ? '/admin/Project/add' : '/organization/Project/add'"
          >
            {{ $t('Project.add') }}
          </router-link>
        </div>
      </template>

      <template #loader>
        <TableSkelaton
          :rows="5"
          :columns="headers.length"
          :has-actions="true"
          :show-index="true"
          :selectable="true"
        />
      </template>
    </DataStatusBuilder>
  </div>
</template>

<style scoped lang="scss">
  .Project-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .page-header,
  .row-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .page-header p,
  .empty-state p {
    color: var(--gray-5);
  }

  .row-actions {
    justify-content: flex-start;
  }

  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    padding: 0;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-sm);
    background: var(--bg-main);
    color: var(--gray-400);
    cursor: pointer;
    text-decoration: none;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);

    &:hover {
      transform: translateY(-2px);
    }

    &.edit:hover {
      border-color: var(--PrimaryColor);
      color: var(--PrimaryColor);
      background: var(--PrimaryColor-light);
      box-shadow: 0 3px 10px rgba(99, 102, 241, 0.2);
    }

    &.delete:hover {
      border-color: var(--Red);
      color: var(--Red);
      background: var(--danger-light);
      box-shadow: 0 3px 10px rgba(220, 38, 38, 0.15);
    }
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.4rem 0.75rem;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 600;
    white-space: nowrap;
  }

  .status-1 {
    color: var(--warning-dark);
    background-color: var(--warning-light);
  }

  .status-2 {
    color: var(--blue-primary);
    background-color: var(--info-light);
  }

  .status-3 {
    color: var(--success-dark);
    background-color: var(--success-light);
  }

  .status-4 {
    color: var(--success-dark);
    background-color: var(--warning);
  }

  .status-5 {
    color: var(--low-color);
    background-color: var(--PrimaryColor-light);
  }

  .empty-state {
    padding: 3rem 1rem;
    text-align: center;
  }
</style>
