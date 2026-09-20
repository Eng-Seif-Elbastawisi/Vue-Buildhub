<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRoute, useRouter } from 'vue-router';
  import type TitleInterface from '@/base/Data/Models/titleInterface';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import ChangeStatusButton from '@/modules/MainOrganization/ChangeStatus/presentation/components/ChangeStatusButton.vue';
  import { StatusTypeEnum } from '@/modules/MainOrganization/ChangeStatus/core/constant/change_status.type.enum';
  import DeleteDialog from '@/base/Presentation/Dialogs/MainDialogs/DeleteDialog.vue';
  import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
  import Pagination from '@/shared/HelpersComponents/Pagination.vue';
  import TableSkelaton from '@/shared/HelpersComponents/TableSkelaton.vue';
  import type LaborModel from '../../core/models/labor.model';
  import DeleteLaborParams from '../../core/params/delete.labor.params';
  import IndexLaborParams from '../../core/params/index.labor.params';
  import LaborController from '../controllers/labor.controller';
  import { useUserStore } from '@/stores/user';
  import IndexAddIcon from '@/shared/icons/IndexAddIcon.vue';
  import { debounce } from '@/base/Presentation/Utils/debouced';

  const controller = LaborController.getInstance();
  const state = computed(() => controller.listState.value);
  const router = useRouter();
  const route = useRoute();
  const { t } = useI18n();
  const perPage = ref(10);
  const word = ref('');
  type ActiveFilterId = '' | '0' | '1';
  const activeFilterOptions = computed<TitleInterface<ActiveFilterId>[]>(() => [
    { id: '', title: t('labor.all_statuses') },
    { id: '1', title: t('labor.active') },
    { id: '0', title: t('labor.inactive') },
  ]);
  const activeFilter = ref<TitleInterface<ActiveFilterId> | null>(null);
  const activeFilterId = computed<ActiveFilterId>(() => {
    const selectedId = activeFilter.value?.id;
    return selectedId === '0' || selectedId === '1' ? selectedId : '';
  });
  const activeParam = computed(() => {
    if (activeFilterId.value === '1') return 1;
    if (activeFilterId.value === '0') return 0;
    return undefined;
  });

  const headers: TableHeader[] = [
    { key: 'title', label: 'labor.name', width: '50%', sortable: true },
    { key: 'price', label: 'labor.price', width: '50%' },
  ];

  const fetchLabors = async (page: number = 1) => {
    await controller.fetchList(
      new IndexLaborParams({
        word: word.value,
        pageNumber: page,
        perPage: perPage.value,
        withPage: 1,
        active: activeParam.value,
      }),
    );
  };

  const parseRoutePage = (queryPage: unknown): number => {
    const pageNumber = Number(queryPage);
    return Number.isInteger(pageNumber) && pageNumber > 0 ? pageNumber : 1;
  };

  const updateRouteQuery = (page: number) =>
    router.push({
      query: {
        ...route.query,
        page: String(page),
        word: word.value || undefined,
        active: activeFilterId.value || undefined,
      },
    });

  const search = debounce(() => {
    void updateRouteQuery(1);
    void fetchLabors(1);
  });

  const onPageChange = (page: number) => {
    void fetchLabors(page);
    void updateRouteQuery(page);
  };

  const onPerPageChange = (count: number) => {
    perPage.value = count;
    void fetchLabors(1);
  };

  const onActiveFilterChange = () => {
    void updateRouteQuery(1);
    void fetchLabors(1);
  };

  const deleteLabor = async (id: number) => {
    await controller.delete(new DeleteLaborParams(id));
    await fetchLabors(1);
  };

  onMounted(async () => {
    word.value = route.query.word ? String(route.query.word) : '';
    const routeActiveFilter =
      route.query.active === '0' || route.query.active === '1' ? route.query.active : '';
    activeFilter.value =
      activeFilterOptions.value.find((option) => option.id === routeActiveFilter) ?? null;
    await fetchLabors(parseRoutePage(route.query.page));
  });
  const { user } = useUserStore();
</script>

<template>
  <div class="labor-page">
    <div class="labor-header">
      <div>
        <h4>{{ $t('labor.list_title') }}</h4>
        <p>{{ $t('labor.list_description') }}</p>
      </div>
      <div class="toolbar">
        <div class="toolbar-filters">
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
              :placeholder="$t('labor.search_placeholder')"
              class="search-input"
              type="text"
              @input="search"
            />
          </div>

          <div class="status-filter">
            <UpdatedCustomInputSelect
              id="labor-active-filter"
              v-model="activeFilter"
              label="labor.status_filter"
              :placeholder="$t('labor.all_statuses')"
              :reload="false"
              :show-help="false"
              :static-options="activeFilterOptions"
              @update:model-value="onActiveFilterChange"
            />
          </div>
        </div>
        <router-link
          class="btn btn-primary"
          :to="user?.type === 1 ? '/admin/labor/add' : '/organization/labor/add'"
        >
          <IndexAddIcon /> {{ $t('labor.add') }}
        </router-link>
      </div>
    </div>

    <DataStatusBuilder :controller="state" :on-retry="async () => await fetchLabors()">
      <template #success="{ data }">
        <AppTable
          :headers="headers"
          :items="data as LaborModel[]"
          selectable
          show-index
          hoverable
          striped
        >
          <template #actions="{ item }">
            <div class="row-actions">
              <ChangeStatusButton
                :id="item.id!"
                :key="`${item.id}-${item.status}`"
                :initial-is-active="item.status"
                :type="StatusTypeEnum.LABOR"
                @reload="fetchLabors"
              />

              <router-link
                class="action-btn edit"
                :to="
                  user?.type === 1
                    ? `/admin/labor/edit/${item.id}`
                    : `/organization/labor/edit/${item.id}`
                "
                :title="$t('labor.edit')"
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
              <DeleteDialog
                :title="$t('labor.delete_title')"
                :message="$t('labor.delete_message')"
                :hasbtn="true"
                @delete="deleteLabor(item.id!)"
              >
                <template #btn>
                  <button class="action-btn delete" :title="$t('common.delete')">
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
          <h3>{{ $t('labor.empty_title') }}</h3>
          <p>{{ $t('labor.empty_description') }}</p>
          <router-link
            class="btn btn-primary"
            :to="user?.type === 1 ? '/admin/labor/add' : '/organization/labor/add'"
          >
            {{ $t('labor.add') }}
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
  .labor-header {
    flex-direction: column !important;
  }

  .labor-page,
  .labor-header,
  .row-actions {
    display: flex;
  }

  .toolbar {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1rem;
  }

  .toolbar-filters {
    display: flex;
    align-items: flex-end;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .status-filter {
    min-width: 11rem;
  }

  .labor-page {
    flex-direction: column;
    gap: 1.5rem;
  }

  .labor-header {
    justify-content: space-between;
    gap: 1rem;
  }

  .labor-header p,
  .empty-state p {
    color: var(--gray-5);
  }

  .row-actions {
    align-items: center;
    gap: 0.75rem;
  }

  .empty-state {
    padding: 3rem 1rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }

  @media (max-width: 768px) {
    .toolbar,
    .toolbar-filters {
      align-items: stretch;
      flex-direction: column;
    }

    .status-filter {
      width: 100%;
    }
  }
</style>
