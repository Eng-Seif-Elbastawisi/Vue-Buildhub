<script setup lang="ts">
  import { onMounted, ref, computed } from 'vue';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
  import Pagination from '@/shared/HelpersComponents/Pagination.vue';
  import { useRoute, useRouter } from 'vue-router';
  import { debounce } from '@/base/Presentation/Utils/debouced';
  import DletedAccountsController from '../controllers/DeleteAccounts/deleted.accounts.controller';
  import IndexDeleteAccountsParams from '../../core/params/index.delete.accounts.params';
  import type DeleteAccountsModel from '../../core/models/delete.accountes.model';
  import DeletedReasonesDialog from '../subComponent/DeletedReasonesDialog.vue';
  import EmptyDeletedAccounts from '../../../../assets/images/EmptyDeletedAccounts.gif';
  import IndexSearchIcon from '@/shared/icons/IndexSearchIcon.vue';
  import FilterDialog from '@/shared/HelpersComponents/FilterDialog/FilterDialog.vue';

  // Controller instance
  const controller = DletedAccountsController.getInstance();
  const state = computed(() => controller.listState.value);
  const router = useRouter();
  const route = useRoute();

  // Table headers
  const headers: TableHeader[] = [
    { key: 'date', label: 'remove Date', width: '25%', sortable: true },
    { key: 'name', label: 'student name', width: '25%' },
    { key: 'reason', label: 'reason', width: '25%' },
    { key: 'notes', label: 'notes', width: '25%' },
  ];

  // Pagination state
  const perPage = ref(10);
  const word = ref('');

  const fetchStages = async (page: number = 1, word: string = '') => {
    await controller.fetchList(
      new IndexDeleteAccountsParams(
        word,
        route.query.page ? Number(route.query.page) : page,
        perPage.value,
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

  // Fetch emails on component mount
  onMounted(async () => {
    if (route.query.word) {
      word.value = String(route.query.word);
    }

    await fetchStages(route.query.page ? Number(route.query.page) : 1, word.value);
  });
  const SelectedRow = ref<DeleteAccountsModel[]>([]);
  const setSelectef = (items: DeleteAccountsModel[]) => {
    SelectedRow.value = items;
  };
  const FilterDialogShow = ref<boolean>(false);
  const ApplayFilter = () => {
    FilterDialogShow.value = false;
  };
  const CloseFiletrDialog = () => {
    FilterDialogShow.value = false;
  };
</script>

<template>
  <div class="deleted-accounts-page">
    <div class="header-container">
      <div class="header-container-text">
        <h5>{{ $t('Students Left the App') }}</h5>
        <p>{{ $t('These students have removed the app, so they are no longer listed here') }}</p>
      </div>
      <DeletedReasonesDialog />
    </div>
    <div class="badge">{{ $t('Student Removal History') }}</div>
    <div class="index-header">
      <div class="toolbar">
        <div class="search-field">
          <span class="search-icon">
            <IndexSearchIcon />
          </span>
          <input
            v-model="word"
            placeholder="Search by country name or code…"
            class="search-input"
            type="text"
            @input="Search"
          />
        </div>
      </div>
      <FilterDialog v-model="FilterDialogShow">
        <template #content>
          <div class="filter-action">
            <button class="btn btn-cancel" @click="CloseFiletrDialog">Reset</button>
            <button class="btn btn-primary" @click="ApplayFilter">apply</button>
          </div>
        </template>
      </FilterDialog>
    </div>

    <DataStatusBuilder :controller="state">
      <template #success="{ data }">
        <div class="table-frame">
          <AppTable
            :headers="headers"
            :items="data as DeleteAccountsModel[]"
            selectable
            show-index
            hoverable
            striped
            @selection-change="setSelectef"
          >
            <template #cell-name="{ item }">
              {{ item.name }}
            </template>
            <template #cell-reason="{ item }">
              {{ item.Reason }}
            </template>
            <template #cell-notes="{ item }">
              {{ item.notes }}
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
          <img :src="EmptyDeletedAccounts" alt="empty-data" width="230" height="210" />
          <h3>{{ $t('no_delete_added') }}</h3>
          <p>{{ $t('your_delete_list_is_empty') }}</p>
        </div>
      </template>
      <template #failed>
        <div class="empty-state">
          <img :src="EmptyDeletedAccounts" alt="empty-data" width="230" height="210" />
          <h3>{{ $t('no_delete_added') }}</h3>
          <p>{{ $t('your_delete_list_is_empty') }}</p>
        </div>
      </template>
    </DataStatusBuilder>
  </div>
</template>
