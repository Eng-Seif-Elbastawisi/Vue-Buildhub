<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
  import { deleteSelectedRows } from '@/shared/HelpersComponents/deleteSelectedRows';
  import Pagination from '@/shared/HelpersComponents/Pagination.vue';
  import TableSkelaton from '@/shared/HelpersComponents/TableSkelaton.vue';
  import type MaterialsModel from '../../core/models/materials.model';
  import DeleteMaterialParams from '../../core/params/delete.materials.params';
  import IndexMaterialParams from '../../core/params/index.materials.params';
  import MaterialController from '../controllers/materials.controller';
  import { useUserStore } from '@/stores/user';
  import DeleteDialog from '@/base/Presentation/Dialogs/MainDialogs/DeleteDialog.vue';
  import IndexAddIcon from '@/shared/icons/IndexAddIcon.vue';
  import { debounce } from '@/base/Presentation/Utils/debouced';
  import type MaterialStatsModel from '../../core/models/material.stats.model';
  import MaterialStatsCard from './cards/MaterialStatsCard.vue';
  import ChangeStatusButton from '@/modules/MainOrganization/ChangeStatus/presentation/components/ChangeStatusButton.vue';
  import { StatusTypeEnum } from '@/modules/MainOrganization/ChangeStatus/core/constant/change_status.type.enum';
  // import MaterialStatsController from '../controllers/material.stats.controller';

  const controller = MaterialController.getInstance();
  const state = computed(() => controller.listState.value);
  const router = useRouter();
  const route = useRoute();
  // const { locale, t } = useI18n();
  const perPage = ref(10);
  const word = ref('');

  const headers: TableHeader[] = [
    { key: 'title', label: 'title', width: '50%', sortable: true },
    // { key: 'brandId', label: 'brand', width: '20%' },
    { key: 'price', label: 'price', width: '50%' },
    // { key: 'unit', label: 'unit', width: '20%' },
  ];

  // const unitLabels = Object.fromEntries(
  //   Object.entries(UnitTypeEnum).map(([name, id]) => [id, name]),
  // );
  // const titleFor = (item: MaterialsModel) =>
  //   item.translations.title[locale.value] ?? item.translations.title.en ?? '-';
  // const unitFor = (item: MaterialsModel) => t(`material.units.${unitLabels[item.unit]}`);

  // const statsController = MaterialStatsController.getInstance();

  const fetchMaterials = async (page: number = 1, searchWord: string = '') => {
    await controller.fetchList(
      new IndexMaterialParams(
        searchWord,
        route.query.page ? Number(route.query.page) : page,
        perPage.value,
        1,
      ),
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
    fetchMaterials(1, word.value);
  });
  const onPageChange = (page: number) => {
    void fetchMaterials(page);
    void router.push({
      query: { ...route.query, page: String(page), word: word.value || undefined },
    });
  };

  const onPerPageChange = (count: number) => {
    perPage.value = count;
    void fetchMaterials(1);
  };

  const deleteMaterial = async (id: number) => {
    await controller.delete(new DeleteMaterialParams({ material_id: id }));
    await fetchMaterials();
  };
  const materialStats = ref<MaterialStatsModel>();
  const stats = async () => {
    materialStats.value = await controller.fetchStats(
      new IndexMaterialParams(
        word.value,
        route.query.page ? Number(route.query.page) : 1,
        perPage.value,
        1,
      ),
    );
  };

  onMounted(async () => {
    word.value = route.query.word ? String(route.query.word) : '';

    await fetchMaterials(route.query.page ? Number(route.query.page) : 1, word.value);

    await stats();
  });

  const deleteSelectedMaterials = (materials: MaterialsModel[]) =>
    deleteSelectedRows(
      materials,
      (id) => controller.delete(new DeleteMaterialParams({ material_id: id })),
      fetchMaterials,
    );

  const { user } = useUserStore();
</script>

<template>
  <div class="material-page">
    <div class="material-header">
      <div>
        <h4>{{ $t('material.list_title') }}</h4>
        <p>{{ $t('material.list_description') }}</p>
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
            :placeholder="$t('search_materials')"
            class="search-input"
            type="text"
            @input="Search"
          />
        </div>
        <router-link
          class="btn btn-primary"
          :to="user?.type === 1 ? '/admin/material/add' : '/organization/material/add'"
        >
          <IndexAddIcon /> {{ $t('material') }}
        </router-link>
      </div>
    </div>

    <MaterialStatsCard :stats="materialStats" />

    <DataStatusBuilder :controller="state" :on-retry="async () => await fetchMaterials()">
      <template #success="{ data }">
        <AppTable
          :headers="headers"
          :items="data as MaterialsModel[]"
          :bulk-delete="deleteSelectedMaterials"
          selectable
          show-index
          hoverable
          striped
        >
          <template #cell-title="{ item }">{{ item.title }}</template>
          <!-- <template #cell-brandId="{ item }">{{ brandFor(item) }}</template> -->
          <template #cell-price="{ item }">{{ item.price }}</template>
          <template #actions="{ item }">
            <div class="row-actions">
              <ChangeStatusButton
                :id="item.id!"
                :key="`${item.id}-${item.status}`"
                :initial-is-active="item.status"
                :type="StatusTypeEnum.MATERIAL"
                @reload="fetchMaterials"
              />

              <router-link
                class="action-btn edit"
                :to="
                  user?.type === 1
                    ? `/admin/material/edit/${item.id}`
                    : `/organization/material/edit/${item.id}`
                "
                :title="$t('material.edit')"
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
                :title="$t('Are you sure you want to remove this Material?')"
                :message="$t('This action cannot be undone.')"
                :hasbtn="true"
                @delete="deleteMaterial(item.id!)"
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
              <!-- <DeleteDialog
                :title="$t('material.delete_title')"
                :message="$t('material.delete_message')"
                :hasbtn="true"
                @delete="deleteMaterial(item.id!)"
              >
                <template #btn><IndexDelete /></template>
              </DeleteDialog> -->
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
          <h3>{{ $t('material.empty_title') }}</h3>
          <p>{{ $t('material.empty_description') }}</p>
          <router-link
            class="btn btn-primary"
            :to="user?.type === 1 ? '/admin/material/add' : '/organization/material/add'"
            >{{ $t('material.add') }}</router-link
          >
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
  .toolbar {
    justify-content: space-between;
    width: 100%;
  }

  .material-header {
    flex-direction: column !important;
  }

  .material-page,
  .material-header,
  .row-actions {
    display: flex;
    flex-direction: row;
  }

  .material-page {
    flex-direction: column;
    gap: 1.5rem;
  }

  .material-header {
    align-items: start;
    justify-content: space-between;
    gap: 1rem;
  }

  .material-header p,
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
  }
</style>
