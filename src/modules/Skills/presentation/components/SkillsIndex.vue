<script setup lang="ts">
  import { onMounted, ref, computed } from 'vue';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
  import Pagination from '@/shared/HelpersComponents/Pagination.vue';
  import { useRoute, useRouter } from 'vue-router';
  import { debounce } from '@/base/Presentation/Utils/debouced';

  import { useFormsStore } from '@/stores/formsStore';
  import IndexPluseIcon from '@/shared/icons/IndexPluseIcon.vue';
  import * as XLSX from 'xlsx';
  import { saveAs } from 'file-saver';
  import ExportExcelIcon from '@/shared/icons/ExportExcelIcon.vue';
  import IndexSearchIcon from '@/shared/icons/IndexSearchIcon.vue';
  import FilterDialog from '@/shared/HelpersComponents/FilterDialog/FilterDialog.vue';
  import SkillsController from '../controllers/skills.controller';
  import IndexSkillsParams from '../../core/params/index.skills.params';
  import DeleteSkillsParams from '../../core/params/delete.skills.params';
  import type SkillModel from '../../core/models/skills.model';
  import DeleteSkillsDialog from '../subComponents/DeleteSkillsDialog.vue';
  import TableSkelaton from '@/shared/HelpersComponents/TableSkelaton.vue';

  // Controller instance
  const controller = SkillsController.getInstance();
  const state = computed(() => controller.listState.value);
  const router = useRouter();
  const route = useRoute();

  const FormStore = useFormsStore();
  const formRoute = computed(() => '/skills/add');

  // Table headers
  const headers: TableHeader[] = [{ key: 'title', label: 'title', width: '100%', sortable: true }];

  // Pagination state
  const perPage = ref(10);
  const word = ref('');

  const fetchSkills = async (page: number = 1, wordStr: string = '') => {
    await controller.fetchList(new IndexSkillsParams(wordStr || word.value, page, perPage.value));
  };

  const Search = debounce(() => {
    router.push({
      query: {
        ...route.query,
        page: 1,
        word: word.value || undefined,
      },
    });
    fetchSkills(1, word.value);
  });

  const onPageChange = (page: number) => {
    fetchSkills(page);
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
    fetchSkills(1);
  };

  onMounted(async () => {
    if (route.query.word) {
      word.value = String(route.query.word);
    }
    await fetchSkills(route.query.page ? Number(route.query.page) : 1, word.value);
  });

  const deleteSkills = async (id: number) => {
    await controller.delete(new DeleteSkillsParams(id));
    await fetchSkills();
  };

  const isDraft = computed(() => {
    const data = FormStore?.formData[formRoute.value] ?? {};
    return Object.keys(data).length === 0 || Object.values(data).every((v) => v == null);
  });

  const exportExcel = () => {
    if (!state.value.data || state.value.data.length === 0) {
      alert('No data available to export');
      return;
    }
    const worksheetData = (state.value.data as any[]).map((item: any) => {
      const it = item as any;
      return {
        name: it.name || 'N/A',
        email: it.email || null,
        phone: it.phone || null,
        password: '',
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoices');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'Employees.xlsx');
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
  <div class="employee-page">
    <div class="index-header">
      <div class="search-field">
        <span class="search-icon">
          <IndexSearchIcon />
        </span>
        <input
          v-model="word"
          placeholder="Search by skills…"
          class="search-input"
          type="text"
          @input="Search"
        />
      </div>
      <div class="btns-container">
        <button class="btn btn-secondary" @click="exportExcel">
          <ExportExcelIcon />
          <span>{{ $t('export') }}</span>
        </button>
        <router-link :to="formRoute" class="btn btn-primary btn-add">
          <IndexPluseIcon />
          <span>{{ isDraft ? 'Add Skills' : 'Continue Adding' }}</span>
        </router-link>
        <FilterDialog v-model="FilterDialogShow">
          <template #content>
            <div class="filter-action">
              <button class="btn btn-cancel" @click="CloseFiletrDialog">Reset</button>
              <button class="btn btn-primary" @click="ApplayFilter">apply</button>
            </div>
          </template>
        </FilterDialog>
      </div>
    </div>

    <DataStatusBuilder :controller="state" :on-retry="async () => await fetchSkills()">
      <template #success="{ data }">
        <div class="table-frame">
          <AppTable
            :headers="headers"
            :items="data as SkillModel[]"
            :hoverable="true"
            :striped="true"
            show-index
          >
            <template #cell-title="{ item }">
              <div class="skills-name">
                <span>{{ item.title }}</span>
              </div>
            </template>

            <template #actions="{ item }">
              <div class="row-actions">
                <router-link
                  class="action-btn edit"
                  :to="`/skills/edit/${item.id}`"
                  title="Edit"
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

                <DeleteSkillsDialog
                  :message="`Are you sure you want to delete this skill?`"
                  @delete="deleteSkills(item.id!)"
                >
                </DeleteSkillsDialog>
              </div>
            </template>
          </AppTable>
        </div>

        <Pagination
          v-if="controller.pagination.value"
          :pagination="controller.pagination.value"
          @change-page="onPageChange"
          @count-per-page="onPerPageChange"
        />
      </template>

      <template #loader>
        <TableSkelaton
          :rows="5"
          :columns="headers.length"
          :has-actions="true"
          :show-index="true"
          :selectable="true"
        >
        </TableSkelaton>
      </template>
    </DataStatusBuilder>
  </div>
</template>
