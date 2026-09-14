<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
  import { deleteSelectedRows } from '@/shared/HelpersComponents/deleteSelectedRows';
  import Pagination from '@/shared/HelpersComponents/Pagination.vue';
  import { useRoute, useRouter } from 'vue-router';
  import { debounce } from '@/base/Presentation/Utils/debouced';

  import IndexStageParams from '../../core/params/index.stage.params';
  import StageController from '../controllers/stage.controller';
  import DeleteStageParams from '../../core/params/delete.stage.params';
  import type StageModel from '../../core/models/stage.model';
  import ShowStageParams from '../../core/params/show.stage.params';

  import EditIcon from '@/shared/icons/EditIcon.vue';
  import DeleteDialog from '@/base/Presentation/Dialogs/MainDialogs/DeleteDialog.vue';
  import IndexAddIcon from '@/shared/icons/IndexAddIcon.vue';
  import { useUserStore } from '@/stores/user';

  const controller = StageController.getInstance();

  const state = computed(() => controller.listState.value);

  const router = useRouter();
  const route = useRoute();

  const { user } = useUserStore();

  const headers: TableHeader[] = [
    {
      key: 'title',
      label: 'title',
      width: '95%',
      sortable: true,
    },
  ];

  const perPage = ref(10);
  const word = ref('');

  const fetchStages = async (page: number = 1, searchWord: string = '') => {
    await controller.fetchList(
      new IndexStageParams(
        searchWord,
        route.query.page ? Number(route.query.page) : page,
        perPage.value,
      ),
    );
  };

  const Search = debounce(() => {
    router.push({
      query: {
        ...route.query,
        page: 1,
        word: word.value || undefined,
      },
    });

    void fetchStages(1, word.value);
  });

  const onPageChange = (page: number) => {
    void fetchStages(page);

    void router.push({
      query: {
        ...route.query,
        page: String(page),
        word: word.value || undefined,
      },
    });
  };

  const onPerPageChange = (count: number) => {
    perPage.value = count;

    void fetchStages(1, word.value);
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

  const showStage = async (id: number) => {
    await controller.fetchOne(
      new ShowStageParams({
        id,
        allLocales: true,
      }),
    );
  };

  onMounted(async () => {
    word.value = route.query.word ? String(route.query.word) : '';

    await fetchStages(route.query.page ? Number(route.query.page) : 1, word.value);
  });
</script>

<template>
  <div class="stage-page">
    <header class="page-header">
      <div class="page-info">
        <h4>{{ $t('stage.list_title') }}</h4>
        <p>{{ $t('stage.list_description') }}</p>
      </div>

      <div class="toolbar">
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

        <router-link class="btn btn-primary" :to="formRoute">
          <IndexAddIcon />
          {{ $t('stage.add') }}
        </router-link>
      </div>
    </header>

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
            selectable
            show-index
            hoverable
            striped
          >
            <template #cell-title="{ item }">
              {{ item?.title }}
            </template>

            <template #actions="{ item }">
              <div class="row-actions">
                <button class="action-btn edit" :title="$t('Edit')" @click="showStage(item.id!)">
                  <EditIcon />
                </button>

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
        <div class="table-loading">Loading...</div>
      </template>
    </DataStatusBuilder>
  </div>
</template>

<style scoped lang="scss">
  .stage-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .page-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  .page-info {
    flex-shrink: 0;
  }

  .page-info h4 {
    margin: 0;
  }

  .page-info p {
    margin: 0.35rem 0 0;
    color: var(--gray-5);
  }

  .toolbar {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-left: auto;
  }

  .search-field {
    display: flex;
    align-items: center;
  }

  .search-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .search-input {
    width: 100%;
  }

  .row-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 3rem 1rem;
    text-align: center;
  }

  .empty-state p {
    color: var(--gray-5);
    margin: 0;
  }

  .table-loading {
    padding: 2rem;
    text-align: center;
    color: var(--gray-5);
  }

  @media (max-width: 768px) {
    .page-header {
      flex-direction: column;
      align-items: stretch;
    }

    .toolbar {
      width: 100%;
      margin-left: 0;
    }

    .search-field {
      flex: 1;
    }
  }
</style>
