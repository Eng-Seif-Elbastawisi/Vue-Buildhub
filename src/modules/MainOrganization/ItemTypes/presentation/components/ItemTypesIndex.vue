<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
import { deleteSelectedRows } from '@/shared/HelpersComponents/deleteSelectedRows';
import Pagination from '@/shared/HelpersComponents/Pagination.vue';
import TableSkelaton from '@/shared/HelpersComponents/TableSkelaton.vue';
import type ItemTypesModel from '../../core/models/item.types.model';
import DeleteItemTypesParams from '../../core/params/delete.item.types.params';
import IndexItemTypesParams from '../../core/params/index.item.types.params';
import ItemTypesController from '../controllers/item.types.controller';
import { useUserStore } from '@/stores/user';
import DeleteDialog from '@/base/Presentation/Dialogs/MainDialogs/DeleteDialog.vue';
import { debounce } from '@/base/Presentation/Utils/debouced';
import IndexAddIcon from '@/shared/icons/IndexAddIcon.vue';
import ChangeStatusButton from '@/modules/MainOrganization/ChangeStatus/presentation/components/ChangeStatusButton.vue';
import { StatusTypeEnum } from '@/modules/MainOrganization/ChangeStatus/core/constant/change_status.type.enum';

const controller = ItemTypesController.getInstance();
const state = computed(() => controller.listState.value);
const route = useRoute();
const router = useRouter();
const perPage = ref(10);
const word = ref('');
const headers: TableHeader[] = [
  { key: 'title', label: 'title', width: '90%', sortable: true },
  // { key: 'ItemTypes', label: 'project.type', width: '35%' },
];
const fetchItemTypess = async (page: number = 1, searchWord: string = '') =>
  controller.fetchList(
    new IndexItemTypesParams(
      searchWord,
      route.query.page ? Number(route.query.page) : page,
      perPage.value,
      1,
    ),
  );
const onPageChange = (page: number) => {
  void fetchItemTypess(page);
  void router.push({
    query: { ...route.query, page: String(page), word: word.value || undefined },
  });
};
const Search = debounce(() => {
  router.push({
    query: {
      ...route.query,
      page: Number(route.query.page ?? 1),
      word: word.value || undefined,
    },
  });

  fetchItemTypess(1, word.value);
});
const onPerPageChange = (count: number) => {
  perPage.value = count;
  void fetchItemTypess(1);
};
const deleteItemTypes = async (id: number) => {
  await controller.delete(new DeleteItemTypesParams({ itemTypesId: id }));
  await fetchItemTypess();
};
const deleteSelectedItemTypess = (itemTypess: ItemTypesModel[]) =>
  deleteSelectedRows(
    itemTypess,
    (id) => controller.delete(new DeleteItemTypesParams({ itemTypesId: id })),
    fetchItemTypess,
  );
onMounted(async () => {
  word.value = route.query.word ? String(route.query.word) : '';
  await fetchItemTypess();
});
const { user } = useUserStore();
</script>

<template>
  <div class="ItemTypes-page">
    <header class="page-header">
      <div>
        <h4>{{ $t('ItemTypes.list_title') }}</h4>
        <p>{{ $t('ItemTypes.list_description') }}</p>
      </div>
      <div class="toolbar">
        <div class="search-field">
          <span class="search-icon">
            <svg
width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input
v-model="word" :placeholder="$t('search_itemTypess')" class="search-input" type="text"
            @input="Search" />
        </div>
        <router-link
class="btn btn-primary"
          :to="user?.type === 1 ? '/organization/item_types/add' : '/organization/item_types/add'">
          <IndexAddIcon />{{ $t('ItemTypes') }}
        </router-link>
      </div>
    </header>
    <DataStatusBuilder
:controller="state" :on-retry="async () => {
        await fetchItemTypess();
      }
      ">
      <template #success="{ data }">
        <AppTable
:headers="headers" :items="data as ItemTypesModel[]" :bulk-delete="deleteSelectedItemTypess"
          selectable show-index hoverable striped>
          <template #actions="{ item }">
            <div class="row-actions">


              <ChangeStatusButton
:id="item.id!" :initial-is-active="Boolean(item.status)"
                :type="StatusTypeEnum.ITEM_TYPE" @reload="fetchItemTypess" />


              <router-link
class="action-btn edit" :to="user?.type === 1
                  ? `/organization/item_types/edit/${item.id}`
                  : `/organization/item_types/edit/${item.id}`
                ">
                <svg
width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </router-link>
              <DeleteDialog
:title="$t('Are you sure you want to remove this itemTypes?')"
                :message="$t('This action cannot be undone.')" :hasbtn="true" @delete="deleteItemTypes(item.id!)">
                <template #btn>
                  <button class="action-btn delete" :title="$t('Delete')">
                    <svg
width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                      stroke-linecap="round" stroke-linejoin="round">
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </button>
                </template>
              </DeleteDialog>
              <!-- <DeleteDialog
                :title="$t('project.delete_title')"
                :message="$t('project.delete_message')"
                :hasbtn="true"
                @delete="deleteProject(item.id!)"
                ><template #btn><IndexDelete /></template
              ></DeleteDialog> -->
            </div>
          </template>
        </AppTable>
        <Pagination
:pagination="controller.pagination.value" @change-page="onPageChange"
          @count-per-page="onPerPageChange" />
      </template>
      <template #empty>
        <div class="empty-state">
          <h3>{{ $t('ItemTypes.empty_title') }}</h3>
          <p>{{ $t('ItemTypes.empty_description') }}</p>
          <router-link
class="btn btn-primary"
            :to="user?.type === 1 ? '/organization/item_types/add' : '/organization/item_types/add'">
            <IndexAddIcon />{{ $t('ItemTypes.add') }}
          </router-link>
        </div>
      </template>
      <template #loader>
        <TableSkelaton :rows="5" :columns="headers.length" :has-actions="true" :show-index="true" :selectable="true" />
      </template>
    </DataStatusBuilder>
  </div>
</template>

<style scoped lang="scss">
.ItemTypes-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.page-header,
.row-actions {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: start;
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
</style>
