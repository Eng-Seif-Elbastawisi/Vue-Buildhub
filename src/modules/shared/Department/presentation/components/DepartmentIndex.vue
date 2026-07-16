<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
  import Pagination from '@/shared/HelpersComponents/Pagination.vue';
  import { useRoute, useRouter } from 'vue-router';
  import { debounce } from '@/base/Presentation/Utils/debouced';
  import EditIcon from '@/shared/icons/EditIcon.vue';
  import DeleteDialog from '@/base/Presentation/Dialogs/MainDialogs/DeleteDialog.vue';
  import DepartmentController from '@/modules/shared/Department/presentation/controllers/department.controller';
  import IndexDepartmentParams from '@/modules/shared/Department/core/params/index.department.params';
  import DepartmentIdParams from '@/modules/shared/Department/core/params/department-id.params';
  import type DepartmentModel from '@/modules/shared/Department/core/models/department.model';
  import DepartmentAdd from './DepartmentAdd.vue';
  import ShowDepartmentParams from '../../core/params/show.department.params';
  import { DepartmentTypeEnum } from '../../core/constants/Type.enum';

  // Controller instance
  const controller = DepartmentController.getInstance();
  const state = computed(() => controller.listState.value);
  const router = useRouter();
  const route = useRoute();

  // Table headers
  const headers: TableHeader[] = [{ key: 'title', label: 'title', width: '95%', sortable: true }];

  // Pagination state
  const perPage = ref(10);
  const word = ref('');

  const getDepartmentType = (): DepartmentTypeEnum | undefined => {
    const queryType = Array.isArray(route.query.type) ? route.query.type[0] : route.query.type;
    const type = Number(queryType);

    return Object.values(DepartmentTypeEnum).includes(type as DepartmentTypeEnum)
      ? (type as DepartmentTypeEnum)
      : undefined;
  };

  const getRoutePage = (): number => {
    const queryPage = Array.isArray(route.query.page) ? route.query.page[0] : route.query.page;
    const page = Number(queryPage);

    return Number.isFinite(page) && page > 0 ? page : 1;
  };

  const getRouteWord = (): string => {
    const queryWord = Array.isArray(route.query.word) ? route.query.word[0] : route.query.word;

    return queryWord ? String(queryWord) : '';
  };

  const fetchDepartments = async (page: number = 1, word: string = '') => {
    await controller.fetchList(
      new IndexDepartmentParams({
        word,
        page,
        perPage: perPage.value,
        type: getDepartmentType(),
      }),
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
  });

  const onPageChange = (page: number) => {
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
    fetchDepartments(getRoutePage(), word.value);
  };

  onMounted(async () => {
    word.value = getRouteWord();

    await fetchDepartments(getRoutePage(), word.value);
  });

  watch(
    () => [route.query.type, route.query.page, route.query.word],
    async () => {
      word.value = getRouteWord();
      await fetchDepartments(getRoutePage(), word.value);
    },
  );

  const deleteCountry = async (id: number) => {
    await controller.delete(new DepartmentIdParams(id));
    await fetchDepartments();
  };

  // const formRoute = computed(() => '/stages/add');

  const SelectedRow = ref<DepartmentModel[]>([]);
  const setSelectef = (items: DepartmentModel[]) => {
    SelectedRow.value = items;
  };

  const deleteSelected = () => {
    SelectedRow.value.forEach((item) => {
      if (item.id !== undefined) {
        deleteCountry(item.id);
      }
    });
  };
  const EditMode = ref(false);
  const selectedDepartment = computed(() =>
    EditMode.value ? (controller.itemData.value ?? undefined) : undefined,
  );

  const ShowDepartment = async (id: number) => {
    await controller.fetchOne(new ShowDepartmentParams({ id, allLocales: true }));

    EditMode.value = true;
  };
  const formKey = ref(0);
  const onDepartmentSaved = async () => {
    EditMode.value = false;
    await fetchDepartments();
    formKey.value++;
  };

  const onDepartmentCancelled = () => {
    EditMode.value = false;
    controller.resetItem();
    formKey.value++;
  };
</script>

<template>
  <div class="index-page-department">
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
            :placeholder="$t('search_departments')"
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
    <DepartmentAdd
      :key="formKey"
      :department="selectedDepartment"
      :type="getDepartmentType()"
      @cancel="onDepartmentCancelled"
      @update-data="onDepartmentSaved"
      @saved="onDepartmentSaved"
    />

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
                <button
                  class="action-btn edit"
                  :title="$t('Edit')"
                  @click="ShowDepartment(item.id!)"
                >
                  <EditIcon />
                </button>
                <DeleteDialog
                  :title="$t('Are you sure you want to remove this department?')"
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
          <!-- <router-link :to="formRoute" class="btn-add empty-cta">
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
          </router-link> -->
        </div>
      </template>
    </DataStatusBuilder>
  </div>
</template>

<style scoped scss>
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 64px 20px;
    text-align: center;

    svg {
      color: var(--gray-300);
      margin-bottom: 16px;
    }

    h3 {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--gray-700);
      margin: 0 0 4px;
    }

    p {
      font-size: 0.875rem;
      color: var(--gray-400);
      margin: 0 0 20px;
    }
  }
</style>
