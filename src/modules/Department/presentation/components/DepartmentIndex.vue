<script setup lang="ts">
  import { onMounted, ref, computed } from 'vue';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
  import Pagination from '@/shared/HelpersComponents/Pagination.vue';
  import { useRoute, useRouter } from 'vue-router';
  import { debounce } from '@/base/Presentation/Utils/debouced';
  import EditIcon from '@/shared/icons/EditIcon.vue';
  import DeleteDialog from '@/base/Presentation/Dialogs/MainDialogs/DeleteDialog.vue';
  import DepartmentController from '@/modules/Department/presentation/controllers/department.controller';
  import IndexDepartmentParams from '@/modules/Department/core/params/index.department.params';
  import DepartmentIdParams from '@/modules/Department/core/params/department-id.params';
  import type DepartmentModel from '@/modules/Department/core/models/department.model';
  import DepartmentAdd from './DepartmentAdd.vue';

  // Controller instance
  const controller = DepartmentController.getInstance();
  const state = computed(() => controller.listState.value);
  const router = useRouter();
  const route = useRoute();

  // Table headers
  const headers: TableHeader[] = [{ key: 'title', label: 'Title', width: '95%', sortable: true }];

  // Pagination state
  const perPage = ref(10);
  const word = ref('');

  const fetchDepartments = async (page: number = 1, word: string = '') => {
    await controller.fetchList(
      new IndexDepartmentParams(
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

    fetchDepartments(1, word.value);
  });

  const onPageChange = (page: number) => {
    fetchDepartments(page);
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
    fetchDepartments(1);
  };

  onMounted(async () => {
    if (route.query.word) {
      word.value = String(route.query.word);
    }

    await fetchDepartments(route.query.page ? Number(route.query.page) : 1, word.value);
  });

  const deleteCountry = async (id: number) => {
    await controller.delete(new DepartmentIdParams(id));
    await fetchDepartments();
  };

  const formRoute = computed(() => '/stages/add');

  const SelectedRow = ref<DepartmentModel[]>([]);
  const setSelectef = (items: DepartmentModel[]) => {
    SelectedRow.value = items;
  };

  const deleteSelected = () => {
    SelectedRow.value.forEach((item) => {
      deleteCountry(item.id!);
    });
  };
  const EditMode = ref(false);
  const selectedDepartment = computed(() =>
    EditMode.value ? (controller.itemData.value ?? undefined) : undefined,
  );

  const ShowDepartment = async (id: number) => {
    await controller.fetchOne(new DepartmentIdParams(id));

    EditMode.value = true;
  };

  const onStageSaved = async () => {
    EditMode.value = false;
    await fetchDepartments();
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
            placeholder="Search by country name or code…"
            class="search-input"
            type="text"
            @input="Search"
          />
        </div>
      </div>
      <div class="flex gap-10">
        <button v-if="SelectedRow.length > 0" class="btn-add" @click="deleteSelected">
          <span>delete</span>
        </button>
      </div>
    </div>
    <DepartmentAdd :department="selectedDepartment" @update-data="onStageSaved" />

    <!-- ═══ Table ═══ -->
    <DataStatusBuilder :controller="state" :on-retry="async () => await fetchDepartments()">
      <template #success="{ data }">
        <div class="table-frame">
          <AppTable
            :headers="headers"
            :items="data as DepartmentModel[]"
            selectable
            show-index
            hoverable
            striped
            @selection-change="setSelectef"
          >
            <template #cell-name="{ item }">
              {{ item.translations }}
            </template>

            <template #actions="{ item }">
              <div class="row-actions">
                <button class="action-btn edit" title="Edit" @click="ShowDepartment(item.id!)">
                  <EditIcon />
                </button>
                <DeleteDialog
                  :title="$t('Are you sure you want to remove this stage?')"
                  :message="$t('This action cannot be undone.')"
                  :hasbtn="true"
                  @delete="deleteCountry(item.id!)"
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
          <h3>No emails yet</h3>
          <p>Add the first employee email to get started</p>
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
            <span>Add Email</span>
          </router-link>
        </div>
      </template>
    </DataStatusBuilder>
  </div>
</template>
