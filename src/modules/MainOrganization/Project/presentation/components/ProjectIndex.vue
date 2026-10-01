<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRoute, useRouter } from 'vue-router';

  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import type TitleInterface from '@/base/Data/Models/titleInterface';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
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
  import { debounce } from '@/base/Presentation/Utils/debouced';
import { deleteSelectedRows } from '@/shared/HelpersComponents/deleteSelectedRows';

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
  const { locale, t } = useI18n();

  const showServiceTypeFilter = computed(() => route.name === 'project');

  const { user } = useUserStore();

  const perPage = ref(10);
  const word = ref('');
  const sortBy = ref<string>((route.query.sort_by as string) || undefined);
  const sortDirection = ref<'asc' | 'desc'>((route.query.sort_direction as 'asc' | 'desc') || undefined);

  const sortableFields: Record<string, string> = {
    title: 'title',
    client: 'client_id',
    projectType: 'project_type_id',
    previewDate: 'preview_date',
    totalArea: 'total_area',
    totalPrice: 'total_price',
    status: 'status',
    createdAt: 'created_at',
  };

  const activeSortKey = computed(() => {
    if (!sortBy.value) return undefined;
    return (
      Object.entries(sortableFields).find(([, serverField]) => serverField === sortBy.value)?.[0] ??
      sortBy.value
    );
  });

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

  const serviceTypeFilterValue = computed(() => serviceType.value.join(','));
  const hasCompositeServiceTypeFilter = computed(() => serviceType.value.length > 1);

  const serviceTypeLabel = (type?: number) => {
    switch (type) {
      case DepartmentTypeEnum.DESIGN:
        return t('Project.service_types.designOnly');
      case DepartmentTypeEnum.SUPERVISION:
        return t('Project.service_types.executionOnly');
      case DepartmentTypeEnum.BOTH:
        return t('Project.service_types.both');
      default:
        return '-';
    }
  };

  const activeServiceTypeFilterLabel = computed(() =>
    serviceType.value.map(serviceTypeLabel).join(', '),
  );

  const serviceTypeFilterOptions = computed<TitleInterface<string | number>[]>(() => [
    { id: '', title: t('project.service_type_all') },
    ...(hasCompositeServiceTypeFilter.value
      ? [{ id: serviceTypeFilterValue.value, title: activeServiceTypeFilterLabel.value }]
      : []),
    { id: DepartmentTypeEnum.DESIGN, title: serviceTypeLabel(DepartmentTypeEnum.DESIGN) },
    {
      id: DepartmentTypeEnum.SUPERVISION,
      title: serviceTypeLabel(DepartmentTypeEnum.SUPERVISION),
    },
    { id: DepartmentTypeEnum.BOTH, title: serviceTypeLabel(DepartmentTypeEnum.BOTH) },
  ]);

  const selectedServiceTypeFilter = computed<TitleInterface<string | number>>(() =>
    serviceTypeFilterOptions.value.find(
      (option) => String(option.id) === serviceTypeFilterValue.value,
    ) ?? serviceTypeFilterOptions.value[0]!,
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

  const pageHeaderTitle = computed(() => {
    void locale.value;
    const breadcrumb = route.meta.breadcrumb;

    return typeof breadcrumb === 'string'
      ? t(breadcrumb)
      : t(isPendingPage.value ? 'requests' : 'request.list_title');
  });

  const pageHeaderDescription = computed(() =>
    t(
      route.meta.pageHeaderDescription ??
        (isPendingPage.value ? 'requests_description' : 'request.list_description'),
    ),
  );

  const pageHeaderActionLabel = computed(() =>
    t(route.meta.pageHeaderActionLabel ?? 'request.add'),
  );

  const headers = computed<TableHeader[]>(() => {
    const baseHeaders: TableHeader[] = [
      {
        key: 'title',
        label: 'project.name',
        width: '18%',
        sortable: true,
      },
      {
        key: 'client',
        label: 'client',
        width: '16%',
        sortable: true,
      },
      {
        key: 'projectType',
        label: 'project.Type',
        width: '16%',
        sortable: true,
      },
      {
        key: 'serviceType',
        label: 'service_type',
        width: '14%',
      },
    ];

    if (!isPendingPage.value) {
      baseHeaders.push(
        {
          key: 'previewDate',
          label: 'preview_date',
          width: '13%',
          sortable: true,
        },
        {
          key: 'totalArea',
          label: 'total_area',
          width: '12%',
          sortable: true,
        },
        {
          key: 'totalPrice',
          label: 'total_price',
          width: '12%',
          sortable: true,
        },
      );
    }

    baseHeaders.push(
      {
        key: 'status',
        label: 'status',
        width: '13%',
        sortable: true,
      },
      {
        key: 'createdAt',
        label: 'createdAt',
        width: '13%',
        sortable: true,
      },
    );

    return baseHeaders;
  });

  const fetchProjects = async (page: number = 1, searchWord: string = '') => {
    await controller.fetchList(
      new IndexProjectParams(
        searchWord,
        route.query.page ? Number(route.query.page) : page,
        perPage.value,
        1,
        null,
        props.statuses,
        serviceType.value,
        sortBy.value,
        sortDirection.value,
      ),
    );
  };

  const onSort = (key: string, direction: 'asc' | 'desc') => {
    sortBy.value = sortableFields[key] ?? key;
    sortDirection.value = direction;
    router.push({
      query: {
        ...route.query,
        page: 1,
        sort_by: sortBy.value,
        sort_direction: sortDirection.value,
      },
    });
    void fetchProjects(1, word.value);
  };

  const Search = debounce(() => {
    router.push({
      query: {
        ...route.query,
        page: Number(route.query.page ?? 1),
        word: word.value || undefined,
        sort_by: sortBy.value,
        sort_direction: sortDirection.value,
      },
    });
    fetchProjects(1, word.value);
  });

  const onServiceTypeFilterChange = async (
    selection: TitleInterface<string | number> | TitleInterface<string | number>[] | null,
  ) => {
    const selectedOption = Array.isArray(selection) ? selection[0] : selection;
    const selectedValue = selectedOption?.id === undefined ? '' : String(selectedOption.id);

    await router.push({
      query: {
        ...route.query,
        page: '1',
        service_type: selectedValue || undefined,
      },
    });
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

  const deleteSelectedProjects = async (projects: ProjectModel[]) =>
    deleteSelectedRows(projects, (id) => controller.delete(new DeleteProjectParams({projectId: id})), fetchProjects);

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
        <h4>
          {{ pageHeaderTitle }}
        </h4>

        <p>
          {{ pageHeaderDescription }}
        </p>
        <div class="toolbar">
          <div class="toolbar__filters">
            <div class="search-field">
              <span class="search-icon">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </span>
              <input
                v-model="word"
                :placeholder="$t('search_request')"
                class="search-input"
                type="text"
                @input="Search"
              />
            </div>

            <div v-if="showServiceTypeFilter" class="service-type-filter">
              <UpdatedCustomInputSelect
                id="project_service_type_filter"
                :model-value="selectedServiceTypeFilter"
                :static-options="serviceTypeFilterOptions"
                label="service_type"
                :placeholder="$t('project.service_type_all')"
                :reload="false"
                :show-help="false"
                @update:model-value="onServiceTypeFilterChange"
              />
            </div>
          </div>
          <router-link
            class="btn btn-primary"
            :to="user?.isMaster ? '/admin/Project/add' : '/organization/Project/add'"
          >
            {{ pageHeaderActionLabel }}
          </router-link>
        </div>
      </div>
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
          :sort-by="activeSortKey"
          :sort-direction="sortDirection"
          selectable
          show-index
           :bulk-delete="deleteSelectedProjects"
          hoverable
          striped
          @sort="onSort"
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

          <template #cell-serviceType="{ item }">
            <span class="service-type-badge">
              {{ serviceTypeLabel(item?.serviceType) }}
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
              <!-- زر عمل مقايسة تنفيذ لمشاريع التنفيذ فقط -->
              <router-link
                v-if="Number(item.serviceType) === 2"
                class="action-btn execution-btn"
                :to="
                  user?.isMaster
                    ? `/admin/execution-quotes/add?project_id=${item.id}`
                    : `/organization/execution-quotes/add?project_id=${item.id}`
                "
                :title="$t('execution_quote.add')"
              >
                <i class="pi pi-calculator"></i>
              </router-link>

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

              <!-- إخفاء التعديل في Design وSupervision وعندما تكون الحالة WAITING_PREVIEW_RESULT -->
              <router-link
                v-if="!hideEditAndDeleteActions && item.status !== ConvertStatus.WAITING_PREVIEW_RESULT"
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
  @use '../styles/project_status_badge' as project-status-badge;

  @include project-status-badge.project-status-badges;

  .toolbar {
    margin-top: 1rem;
  }

  .page-header > div {
    width: 100%;
  }

  .Project-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .toolbar {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: flex-end;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .toolbar__filters {
    display: flex;
    align-items: flex-end;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .service-type-filter {
    min-width: 12rem;

    :deep(.input-select) {
      min-height: 2.75rem;
    }
  }

  .service-type-badge {
    display: inline-flex;
    width: fit-content;
    padding: 0.3rem 0.6rem;
    border-radius: var(--radius-full);
    background: var(--PrimaryColor-light);
    color: var(--PrimaryColor);
    font-size: var(--xs-size);
    font-weight: 700;
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

  .empty-state {
    padding: 3rem 1rem;
    text-align: center;
  }

  @media (max-width: 640px) {
    .toolbar,
    .toolbar__filters,
    .search-field,
    .service-type-filter,
    .toolbar .btn-primary {
      width: 100%;
    }
  }
</style>
