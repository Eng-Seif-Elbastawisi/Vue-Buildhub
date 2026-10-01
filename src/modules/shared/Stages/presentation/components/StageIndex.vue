<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
  import { deleteSelectedRows } from '@/shared/HelpersComponents/deleteSelectedRows';
  import Pagination from '@/shared/HelpersComponents/Pagination.vue';
  import IndexPageHeader from '@/shared/IndexPageHeader/IndexPageHeader.vue';
  import { useRoute, useRouter } from 'vue-router';
  import { debounce } from '@/base/Presentation/Utils/debouced';

  import IndexStageParams from '../../core/params/index.stage.params';
  import StageController from '../controllers/stage.controller';
  import DeleteStageParams from '../../core/params/delete.stage.params';
  import ChangeStageOrderParams from '../../core/params/change.stage.order.params';
  import type StageModel from '../../core/models/stage.model';
  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';

  import EditIcon from '@/shared/icons/EditIcon.vue';
  import DeleteDialog from '@/base/Presentation/Dialogs/MainDialogs/DeleteDialog.vue';
  import IndexAddIcon from '@/shared/icons/IndexAddIcon.vue';
  import ChangeStatusButton from '@/modules/MainOrganization/ChangeStatus/presentation/components/ChangeStatusButton.vue';
  import { StatusTypeEnum } from '@/modules/MainOrganization/ChangeStatus/core/constant/change_status.type.enum';
  import { useI18n } from 'vue-i18n';
  const controller = StageController.getInstance();

  const state = computed(() => controller.listState.value);

  const router = useRouter();
  const { t } = useI18n();
  const route = useRoute();

  const headers: TableHeader[] = [
    {
      key: 'title',
      label: 'title',
      width: '95%',
      sortable: true,
    },
    {
      key: 'stageChildrenCount',
      label: t('measurement.children_count'),
      width: '15%',
      sortable: true,
    },
  ];

  const perPage = ref(10);
  const word = ref('');
  const sortBy = ref<string>();
  const sortDirection = ref<'asc' | 'desc'>();
  const sortableFields: Record<string, string> = {
    title: 'title',
    stageChildrenCount: 'stage_children_count',
  };
  const activeSortKey = computed(() => {
    if (!sortBy.value) return undefined;

    return (
      Object.entries(sortableFields).find(([, serverField]) => serverField === sortBy.value)?.[0] ??
      sortBy.value
    );
  });

  const fetchStages = async (page: number = 1, searchWord: string = '') => {
    await controller.fetchList(
      new IndexStageParams({
        word: searchWord,
        page,
        perPage: perPage.value,
        parentId: null,
        sortBy: sortBy.value,
        sortDirection: sortDirection.value,
      }),
    );
  };

  const updateRouteQuery = (page: number) =>
    router.push({
      query: {
        ...route.query,
        page: String(page),
        word: word.value || undefined,
        sort_by: sortBy.value,
        sort_direction: sortDirection.value,
      },
    });

  const onSort = (key: string, direction: 'asc' | 'desc') => {
    sortBy.value = sortableFields[key] ?? key;
    sortDirection.value = direction;
    void updateRouteQuery(1);
    void fetchStages(1, word.value);
  };

  const Search = debounce(() => {
    void updateRouteQuery(1);

    void fetchStages(1, word.value);
  });

  const onPageChange = (page: number) => {
    void fetchStages(page, word.value);

    void updateRouteQuery(page);
  };

  const onPerPageChange = (count: number) => {
    perPage.value = count;

    void fetchStages(1, word.value);
    void updateRouteQuery(1);
  };

  const deleteStage = async (id: number) => {
    await controller.delete(new DeleteStageParams(id));

    await fetchStages(route.query.page ? Number(route.query.page) : 1, word.value);
  };

  const deleteSelectedStages = (stages: StageModel[]) =>
    deleteSelectedRows(
      stages,
      (id) => controller.delete(new DeleteStageParams(id)),
      () => fetchStages(route.query.page ? Number(route.query.page) : 1, word.value),
    );

  const routePrefix = computed(() =>
    route.path?.startsWith('/admin') ? '/admin' : '/organization',
  );

  const formRoute = computed(() => `${routePrefix.value}/stages/add`);

  const subStagesRoute = (stageId: number) => `${routePrefix.value}/stages/${stageId}/sub-stages`;

  const onReorder = async ({
    movedItem,
    toIndex,
  }: {
    items: StageModel[];
    movedItem: StageModel;
    fromIndex: number;
    toIndex: number;
  }) => {
    if (!movedItem?.id) return;

    const page = route.query.page ? Number(route.query.page) : 1;
    const newOrder = (page - 1) * perPage.value + toIndex + 1;

    const result = await controller.changeOrder(
      new ChangeStageOrderParams({
        stageId: movedItem.id,
        order: newOrder,
      }),
    );

    if (result instanceof DataSuccess) {
      await fetchStages(page, word.value);
    }
  };

  onMounted(async () => {
    word.value = route.query.word ? String(route.query.word) : '';
    sortBy.value = route.query.sort_by ? String(route.query.sort_by) : undefined;
    sortDirection.value =
      route.query.sort_direction === 'asc' || route.query.sort_direction === 'desc'
        ? route.query.sort_direction
        : undefined;

    await fetchStages(route.query.page ? Number(route.query.page) : 1, word.value);
  });
</script>

<template>
  <div class="stages-index-page">
    <IndexPageHeader :title="$t('stage.list_title')" :subtitle="$t('stage.list_description')">
      <template #search>
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
            :placeholder="$t('search_stages')"
            class="search-input"
            type="text"
            @input="Search"
          />
        </div>
      </template>
      <template #actions>
        <router-link class="btn btn-primary" :to="formRoute">
          <IndexAddIcon />
          {{ $t('stage.add') }}
        </router-link>
      </template>
    </IndexPageHeader>

    <DataStatusBuilder
      :controller="state"
      :on-retry="
        async () => await fetchStages(route.query.page ? Number(route.query.page) : 1, word)
      "
    >
      <template #success="{ data }">
        <div class="table-frame">
          <AppTable
            :headers="headers"
            :items="data as StageModel[]"
            :bulk-delete="deleteSelectedStages"
            :initial-sort-key="activeSortKey"
            :initial-sort-direction="sortDirection"
            show-index
            hoverable
            striped
            reorderable
            @sort="onSort"
            @reorder="onReorder"
          >
            <template #cell-title="{ item }">
              {{ item?.title }}
            </template>
            <template #cell-stageChildrenCount="{ item }">
              {{ item?.stageChildrenCount }}
            </template>

            <template #actions="{ item }">
              <div class="row-actions">
                <ChangeStatusButton
                  :id="item.id!"
                  :key="`${item.id}-${item.status}`"
                  :initial-is-active="Boolean(item.status)"
                  :type="StatusTypeEnum.STAGE"
                  @reload="
                    async () =>
                      await fetchStages(route.query.page ? Number(route.query.page) : 1, word)
                  "
                />
                <!-- Sub Stages -->
                <router-link
                  class="action-btn show"
                  :to="subStagesRoute(item.id)"
                  :title="$t('sub_stage.list_title')"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M8 6h13" />
                    <path d="M8 12h13" />
                    <path d="M8 18h13" />
                    <path d="M3 6h.01" />
                    <path d="M3 12h.01" />
                    <path d="M3 18h.01" />
                  </svg>
                </router-link>

                <!-- Edit -->
                <router-link class="action-btn edit" :to="`${routePrefix}/stages/edit/${item.id}`">
                  <EditIcon />
                </router-link>

                <!-- Delete -->
                <DeleteDialog
                  :title="$t('Are you sure you want to remove this stage?')"
                  :message="$t('This action cannot be undone.')"
                  :hasbtn="true"
                  @delete="deleteStage(item.id!)"
                >
                  <template #btn>
                    <button class="action-btn delete" :title="$t('Delete')">
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
        </div>

        <Pagination
          :pagination="controller.pagination.value"
          @change-page="onPageChange"
          @count-per-page="onPerPageChange"
        />
      </template>

      <template #empty>
        <div class="empty-state">
          <svg
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1"
            stroke-linecap="round"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>

          <h3>{{ $t('stage.empty_title') }}</h3>

          <p>{{ $t('stage.empty_description') }}</p>

          <router-link :to="formRoute" class="btn btn-primary">
            <IndexAddIcon />
            {{ $t('stage.add') }}
          </router-link>
        </div>
      </template>

      <template #loader>
        <div class="loading-state">Loading...</div>
      </template>
    </DataStatusBuilder>
  </div>
</template>

<style scoped lang="scss">
  .stages-index-page {
    display: flex;
    flex-direction: column;
    gap: var(--page-section-gap);
    width: 100%;
    min-width: 0;
  }
</style>
