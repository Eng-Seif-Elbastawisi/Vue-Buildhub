<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import IndexPageHeader from '@/shared/IndexPageHeader/IndexPageHeader.vue';
  import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
  import { deleteSelectedRows } from '@/shared/HelpersComponents/deleteSelectedRows';
  import Pagination from '@/shared/HelpersComponents/Pagination.vue';
  import TableSkelaton from '@/shared/HelpersComponents/TableSkelaton.vue';
  import DeleteDialog from '@/base/Presentation/Dialogs/MainDialogs/DeleteDialog.vue';
  import { debounce } from '@/base/Presentation/Utils/debouced';
  import IndexAddIcon from '@/shared/icons/IndexAddIcon.vue';
  import ShowIcon from '@/shared/icons/ShowIcon.vue';
  import EditIcon from '@/shared/icons/EditIcon.vue';
  import type ContractorModel from '../../core/models/contractor.model';
  import DeleteContractorParams from '../../core/params/delete.contractor.params';
  import IndexContractorParams from '../../core/params/index.contractor.params';
  import ContractorController from '../controllers/contractor.controller';

  const controller = ContractorController.getInstance();
  const state = computed(() => controller.listState.value);
  const route = useRoute();
  const router = useRouter();
  const perPage = ref(10);
  const word = ref('');
  const headers: TableHeader[] = [
    { key: 'name', label: 'Contractor.name', width: '90%', sortable: true },
  ];

  const fetchContractors = (page = 1, searchWord = word.value) =>
    controller.fetchList(new IndexContractorParams(searchWord, page, perPage.value, 1));

  const onPageChange = (page: number) => {
    void fetchContractors(page);
    void router.push({
      query: { ...route.query, page: String(page), word: word.value || undefined },
    });
  };

  const search = debounce(() => {
    void router.push({ query: { ...route.query, page: '1', word: word.value || undefined } });
    void fetchContractors(1);
  });

  const onPerPageChange = (count: number) => {
    perPage.value = count;
    void fetchContractors(1);
  };

  const deleteContractor = async (id: number) => {
    await controller.delete(new DeleteContractorParams(id));
    await fetchContractors();
  };

  const deleteSelectedContractors = (contractors: ContractorModel[]) =>
    deleteSelectedRows(
      contractors,
      (id) => controller.delete(new DeleteContractorParams(id)),
      fetchContractors,
    );

  onMounted(() => {
    word.value = String(route.query.word ?? '');
    void fetchContractors(Number(route.query.page ?? 1));
  });
</script>

<template>
  <div class="contractor-page">
    <IndexPageHeader
      :title="$t('Contractor.list_title')"
      :subtitle="$t('Contractor.list_description')"
    >
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
            class="search-input"
            type="text"
            :placeholder="$t('Contractor.search')"
            @input="search"
          />
        </div>
      </template>
      <template #actions>
        <router-link class="btn btn-primary" to="/organization/contractors/add">
          <IndexAddIcon />{{ $t('Contractor.add') }}
        </router-link>
      </template>
    </IndexPageHeader>
    <DataStatusBuilder :controller="state" :on-retry="() => fetchContractors()">
      <template #success="{ data }">
        <AppTable
          :headers="headers"
          :items="data as ContractorModel[]"
          :bulk-delete="deleteSelectedContractors"
          selectable
          show-index
          hoverable
          striped
        >
          <template #actions="{ item }">
            <div class="row-actions">
         
              <router-link
                class="action-btn edit"
                :title="$t('Contractor.edit')"
                :to="`/organization/contractors/edit/${item.id}`"
              >
                <EditIcon />
              </router-link>
              <DeleteDialog
                :title="$t('Contractor.delete_confirm')"
                :message="$t('This action cannot be undone.')"
                :hasbtn="true"
                @delete="deleteContractor(item.id!)"
              >
                <template #btn>
                  <button class="action-btn delete" type="button" :title="$t('Delete')">
                    <i class="pi pi-trash" aria-hidden="true" />
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
          <h3>{{ $t('Contractor.empty_title') }}</h3>
          <p>{{ $t('Contractor.empty_description') }}</p>
          <router-link class="btn btn-primary" to="/organization/contractors/add">
            <IndexAddIcon />{{ $t('Contractor.add') }}
          </router-link>
        </div>
      </template>
      <template #loader>
        <TableSkelaton
          :rows="5"
          :columns="headers.length"
          :has-actions="true"
          show-index
          selectable
        />
      </template>
    </DataStatusBuilder>
  </div>
</template>

<style scoped lang="scss">
  .contractor-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .row-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 3rem 1rem;
    text-align: center;
  }

  .empty-state p {
    color: var(--gray-5);
  }
</style>
