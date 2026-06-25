<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRoute, useRouter } from 'vue-router';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
  import Pagination from '@/shared/HelpersComponents/Pagination.vue';
  import TableSkelaton from '@/shared/HelpersComponents/TableSkelaton.vue';
  import DeleteDialog from '@/base/Presentation/Dialogs/MainDialogs/DeleteDialog.vue';
  import type ItemModel from '../../core/models/Item.model';
  import DeleteItemParams from '../../core/params/delete.Item.params';
  import { useUserStore } from '@/stores/user';
  import ItemController from '../controllers/Item.controller';
  import IndexItemParams from '../../core/params/index.Item.params';
  import { debounce } from '@/base/Presentation/Utils/debouced';
  import IndexAddIcon from '@/shared/icons/IndexAddIcon.vue';

  const controller = ItemController.getInstance();
  const state = computed(() => controller.listState.value);
  const router = useRouter();
  const route = useRoute();
  const { locale } = useI18n();
  const perPage = ref(10);
  const word = ref('');

  const headers: TableHeader[] = [
    { key: 'title', label: 'title', width: '35%', sortable: true },
    { key: 'notes', label: 'notes', width: '30%' },
    { key: 'price', label: 'price', width: '30%' },
    // { key: 'type', label: 'type', width: '30%' },
  ];

  //const typeLabels = Object.fromEntries(
  // Object.entries(ItemTypeEnum).map(([name, id]) => [id, name]),
  //);
  const titleFor = (item: ItemModel) =>
    item.translations.title[locale.value] ?? item.translations.title.en ?? '-';
  //const typeFor = (item: ItemModel) => t(`item.types.`);

  const fetchItems = async (page: number = 1, searchWord: string = '') => {
    await controller.fetchList(
      new IndexItemParams(
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

    fetchItems(1, word.value);
  });

  const onPageChange = (page: number) => {
    void fetchItems(page);
    void router.push({
      query: { ...route.query, page: String(page), word: word.value || undefined },
    });
  };

  const onPerPageChange = (count: number) => {
    perPage.value = count;
    void fetchItems(1);
  };

  const deleteItem = async (id: number) => {
    await controller.delete(new DeleteItemParams({ item_id: id }));
    await fetchItems();
  };

  onMounted(async () => {
    word.value = route.query.word ? String(route.query.word) : '';
    await fetchItems(route.query.page ? Number(route.query.page) : 1, word.value);
  });
  const { user } = useUserStore();
</script>

<template>
  <div class="item-page">
    <div class="item-header">
      <div>
        <h4>{{ $t('item.index.title') }}</h4>
        <p>{{ $t('item.index.description') }}</p>
      </div>
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
          placeholder="Search by country name or code…"
          class="search-input"
          type="text"
          @input="Search"
        />
      </div>
      <div class="action-buttons">
        <router-link
          class="btn btn-primary"
          :to="user?.type === 1 ? '/mainportal/item/add' : '/organization/item/add'"
        >
          <IndexAddIcon /> {{ $t('item.add') }}
        </router-link>
      </div>
    </div>

    <DataStatusBuilder :controller="state" :on-retry="async () => await fetchItems()">
      <template #success="{ data }">
        <AppTable
          :headers="headers"
          :items="data as ItemModel[]"
          selectable
          show-index
          hoverable
          striped
        >
          <template #cell-translations="{ item }">{{ titleFor(item) }}</template>
          <!-- <template #cell-type="{ item }">{{ typeFor(item) }}</template> -->
          <template #actions="{ item }">
            <div class="row-actions">
              <router-link
                class="action-btn edit"
                :to="
                  user?.type === 1
                    ? `/mainportal/item/edit/${item.id}`
                    : `/organization/item/edit/${item.id}`
                "
                :title="$t('item.edit')"
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
                :title="$t('Are you sure you want to remove this item?')"
                :message="$t('This action cannot be undone.')"
                :hasbtn="true"
                @delete="deleteItem(item.id!)"
              >
                <template #btn>
                  <button class="action-btn delete" title="Delete">
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
          <h3>{{ $t('item.empty_title') }}</h3>
          <p>{{ $t('item.empty_description') }}</p>
          <router-link class="btn btn-primary" to="/item/add">{{ $t('item.add') }}</router-link>
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
  .material-page,
  .material-header,
  .row-actions {
    display: flex;
  }

  .material-page {
    flex-direction: column;
    gap: 1.5rem;
  }

  .material-header {
    align-items: center;
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
