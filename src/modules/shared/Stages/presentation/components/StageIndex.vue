<script setup lang="ts">
  import { onMounted, ref, computed } from 'vue';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
  import Pagination from '@/shared/HelpersComponents/Pagination.vue';
  import { useRoute, useRouter } from 'vue-router';
  import { debounce } from '@/base/Presentation/Utils/debouced';
  import IndexStageParams from '../../core/params/index.stage.params';
  import StageController from '../controllers/stage.controller';
  import DeleteStageParams from '../../core/params/delete.stage.params';
  import type StageModel from '../../core/models/stage.model'; // eslint-disable-line @typescript-eslint/no-unused-vars
  import StageAdd from './StageAdd.vue';
  import ShowStageParams from '../../core/params/show.stage.params';
  import EditIcon from '@/shared/icons/EditIcon.vue';
  import DeleteDialog from '@/base/Presentation/Dialogs/MainDialogs/DeleteDialog.vue';

  // Controller instance
  const controller = StageController.getInstance();
  const state = computed(() => controller.listState.value);
  const router = useRouter();
  const route = useRoute();

  // Table headers
  const headers: TableHeader[] = [{ key: 'title', label: 'Title', width: '95%', sortable: true }];

  // Pagination state
  const perPage = ref(10);
  const word = ref('');

  const fetchStages = async (page: number = 1, word: string = '') => {
    await controller.fetchList(
      new IndexStageParams(word, route.query.page ? Number(route.query.page) : page, perPage.value),
    );
  };

  const Search = debounce(() => {
    router.push({
      query: {
        ...route.query,
        page: Number(route.query.page ?? 1),
        word: word.value || undefined,
      },
    });

    fetchStages(1, word.value);
  });

  const onPageChange = (page: number) => {
    fetchStages(page);
    router.push({
      query: {
        ...route.query,
        page: String(page),
        word: word.value,
      },
    });
  };

  const onPerPageChange = (count: number) => {
    perPage.value = count;
    fetchStages(1);
  };

  onMounted(async () => {
    if (route.query.word) {
      word.value = String(route.query.word);
    }

    await fetchStages(route.query.page ? Number(route.query.page) : 1, word.value);
  });

  const deleteCountry = async (id: number) => {
    await controller.delete(new DeleteStageParams(id));
    await fetchStages();
  };

  const routePrefix = computed(() =>
    route.path?.startsWith('/admin') ? '/admin' : '/organization',
  );
  const formRoute = computed(() => `${routePrefix.value}/stages/add`);

  const SelectedRow = ref<StageModel[]>([]);
  const setSelectef = (items: StageModel[]) => {
    SelectedRow.value = items;
  };

  const deleteSelected = () => {
    SelectedRow.value.forEach((item) => {
      deleteCountry(item.id!);
    });
  };
  const EditMode = ref(false);
  const selectedStage = computed(() =>
    EditMode.value ? (controller.itemData.value ?? undefined) : undefined,
  );

  const ShowStage = async (id: number) => {
    await controller.fetchOne(new ShowStageParams({ id, allLocales: true }));
    EditMode.value = true;
  };
  const formKey = ref(0);
  const onStageSaved = async () => {
    EditMode.value = false;
    formKey.value++;
    await fetchStages();
  };
</script>

<template>
  <div class="stage-page">
    <div class="index-header">
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
            :placeholder="$t('search_by_country_name_or_code')"
            class="search-input"
            type="text"
            @input="Search"
          />
        </div>
      </div>
      <div class="flex gap-10">
        <button v-if="SelectedRow.length > 0" class="btn-add" @click="deleteSelected">
          <span>{{ $t('delete') }}</span>
        </button>
      </div>
    </div>
    <StageAdd :key="formKey" :stage="selectedStage" @saved="onStageSaved" />

    <!-- ═══ Table ═══ -->
    <DataStatusBuilder :controller="state" :on-retry="async () => await fetchStages()">
      <template #success="{ data }">
        <div class="table-frame">
          <AppTable
            :headers="headers"
            :items="data as StageModel[]"
            selectable
            show-index
            hoverable
            striped
            @selection-change="setSelectef"
          >
            <template #cell-name="{ item }">
              {{ item?.title }}
            </template>

            <template #actions="{ item }">
              <div class="row-actions">
                <button class="action-btn edit" :title="$t('Edit')" @click="ShowStage(item.id!)">
                  <EditIcon />
                </button>
                <DeleteDialog
                  :title="$t('Are you sure you want to remove this stage?')"
                  :message="$t('This action cannot be undone.')"
                  :hasbtn="true"
                  @delete="deleteCountry(item.id!)"
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
          <h3>{{ $t('no_emails_yet') }}</h3>
          <p>{{ $t('add_first_employee_email') }}</p>
          <router-link :to="formRoute" class="btn-add empty-cta">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>{{ $t('add_email') }}</span>
          </router-link>
        </div>
      </template>
    </DataStatusBuilder>
  </div>
</template>
