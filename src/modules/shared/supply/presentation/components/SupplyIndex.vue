<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
  import Pagination from '@/shared/HelpersComponents/Pagination.vue';
  import TableSkelaton from '@/shared/HelpersComponents/TableSkelaton.vue';
  import type SupplyModel from '../../core/models/supply.model';
  import DeleteSupplyParams from '../../core/params/delete.supply.params';
  import IndexSupplyParams from '../../core/params/index.supply.params';
  import SupplyController from '../controllers/supply.controller';
  import { useUserStore } from '@/stores/user';
  import DeleteDialog from '@/base/Presentation/Dialogs/MainDialogs/DeleteDialog.vue';
  import { debounce } from '@/base/Presentation/Utils/debouced';
  import IndexAddIcon from '@/shared/icons/IndexAddIcon.vue';

  const controller = SupplyController.getInstance();
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
  // const titleFor = (item: SupplyModel) =>
  //   item.translations.title[locale.value] ?? item.translations.title.en ?? '-';
  // const unitFor = (item: SupplyModel) => t(`supply.units.${unitLabels[item.unit]}`);

  const fetchSupply = async (page: number = 1, searchWord: string = '') => {
    await controller.fetchList(
      new IndexSupplyParams(
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
    fetchSupply(1, word.value);
  });

  const onPageChange = (page: number) => {
    void fetchSupply(page);
    void router.push({
      query: { ...route.query, page: String(page), word: word.value || undefined },
    });
  };

  const onPerPageChange = (count: number) => {
    perPage.value = count;
    void fetchSupply(1);
  };

  const deleteSupply = async (id: number) => {
    await controller.delete(new DeleteSupplyParams({ supply_id: id }));
    await fetchSupply();
  };

  onMounted(async () => {
    word.value = route.query.word ? String(route.query.word) : '';
    await fetchSupply(route.query.page ? Number(route.query.page) : 1, word.value);
  });
  const { user } = useUserStore();
</script>

<template>
  <div class="supply-page">
    <div class="supply-header">
      <div>
        <h4>{{ $t('supply.list_title') }}</h4>
        <p>{{ $t('supply.list_description') }}</p>
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
            :placeholder="$t('search_supplies')"
            class="search-input"
            type="text"
            @input="Search"
          />
        </div>
        <router-link
          class="btn btn-primary"
          :to="user?.isMaster ? '/admin/supply/add' : '/organization/supply/add'"
        >
          <IndexAddIcon />{{ $t('supply') }}</router-link
        >
      </div>
    </div>

    <DataStatusBuilder :controller="state" :on-retry="async () => await fetchSupply()">
      <template #success="{ data }">
        <AppTable
          :headers="headers"
          :items="data as SupplyModel[]"
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
              <router-link
                class="action-btn edit"
                :to="
                  user?.isMaster
                    ? `/admin/supply/edit/${item.id}`
                    : `/organization/supply/edit/${item.id}`
                "
                :title="$t('supply.edit')"
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
                :title="$t('supply.delete_title')"
                :message="$t('supply.delete_message')"
                :hasbtn="true"
                @delete="deleteSupply(item.id!)"
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
                :title="$t('supply.delete_title')"
                :message="$t('supply.delete_message')"
                :hasbtn="true"
                @delete="deleteSupply(item.id!)"
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
          <h3>{{ $t('supply.empty_title') }}</h3>
          <p>{{ $t('supply.empty_description') }}</p>
          <router-link
            class="btn btn-primary"
            :to="user?.isMaster ? '/admin/supply/add' : '/organization/supply/add'"
            >{{ $t('supply.add') }}</router-link
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
    display: flex;
    justify-content: space-between;
    width: 100%;
  }

  .supply-page,
  .supply-header,
  .row-actions {
    display: flex;
  }

  .supply-page {
    flex-direction: column;
    gap: 1.5rem;
  }

  .supply-header {
    align-items: start;
    flex-direction: column;
    justify-content: space-between;
    gap: 1rem;
  }

  .supply-header p,
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
