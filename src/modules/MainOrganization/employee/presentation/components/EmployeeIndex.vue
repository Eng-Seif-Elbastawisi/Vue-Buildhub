<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import DeleteDialog from '@/base/Presentation/Dialogs/MainDialogs/DeleteDialog.vue';
  import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
  import Pagination from '@/shared/HelpersComponents/Pagination.vue';
  import TableSkelaton from '@/shared/HelpersComponents/TableSkelaton.vue';
  import type EmployeeModel from '../../core/models/employee.model';
  import DeleteEmployeeParams from '../../core/params/delete.employee.params';
  import IndexEmployeeParams from '../../core/params/index.employee.params';
  import EmployeeController from '../controllers/employee.controller';
  import { useUserStore } from '@/stores/user';
  import IndexAddIcon from '@/shared/icons/IndexAddIcon.vue';
  import { debounce } from '@/base/Presentation/Utils/debouced';

  const controller = EmployeeController.getInstance();
  const state = computed(() => controller.listState.value);
  const router = useRouter();
  const route = useRoute();
  const perPage = ref(10);
  const word = ref('');

  const headers: TableHeader[] = [
    { key: 'name', label: 'name', width: '30%', sortable: true },
    { key: 'email', label: 'email', width: '35%' },
    { key: 'phone', label: 'phone', width: '25%' },
  ];

  const fetchEmployees = async (page: number = 1, searchWord: string = '') => {
    await controller.fetchList(
      new IndexEmployeeParams(
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
    fetchEmployees(1, word.value);
  });

  const onPageChange = (page: number) => {
    void fetchEmployees(page);
    void router.push({
      query: { ...route.query, page: String(page), word: word.value || undefined },
    });
  };

  const onPerPageChange = (count: number) => {
    perPage.value = count;
    void fetchEmployees(1);
  };

  const deleteEmployee = async (id: number) => {
    await controller.delete(new DeleteEmployeeParams(id));
    void fetchEmployees();
  };

  onMounted(async () => {
    word.value = route.query.word ? String(route.query.word) : '';
    await fetchEmployees(route.query.page ? Number(route.query.page) : 1, word.value);
  });
  const { user } = useUserStore();
</script>

<template>
  <div class="employee-page">
    <div class="employee-header">
      <div>
        <h4>{{ $t('employee.index.title') }}</h4>
        <p>{{ $t('employee.index.description') }}</p>
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
            :placeholder="$t('search_suppliers')"
            class="search-input"
            type="text"
            @input="Search"
          />
        </div>
        <router-link
          class="btn btn-primary"
          :to="user?.type === 1 ? '/admin/employee/add' : '/organization/employee/add'"
        >
          <IndexAddIcon /> {{ $t('employee') }}
        </router-link>
      </div>
    </div>

    <DataStatusBuilder :controller="state" :on-retry="async () => await fetchEmployees()">
      <template #success="{ data }">
        <AppTable
          :headers="headers"
          :items="data as EmployeeModel[]"
          selectable
          show-index
          hoverable
          striped
        >
          <template #actions="{ item }">
            <div class="row-actions">
              <router-link
                class="action-btn edit"
                :to="
                  user?.type === 1
                    ? `/admin/edit/${item.id}`
                    : `/organization/employee/edit/${item.id}`
                "
                :title="$t('admin.edit')"
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
                :title="$t('admin.delete_title')"
                :message="$t('admin.delete_message')"
                :hasbtn="true"
                @delete="deleteEmployee(item.id!)"
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
        <Pagination
          :pagination="controller.pagination.value"
          @change-page="onPageChange"
          @count-per-page="onPerPageChange"
        />
      </template>

      <template #empty>
        <div class="empty-state">
          <h3>{{ $t('admin.empty_title') }}</h3>
          <p>{{ $t('admin.empty_description') }}</p>
          <router-link class="btn btn-primary" to="/organization/employee/add">{{
            $t('employee.add')
          }}</router-link>
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
  .admin-page,
  .admin-header,
  .row-actions {
    display: flex;
  }

  .admin-page {
    flex-direction: column;
    gap: 1.5rem;
  }

  .admin-header {
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .admin-header p,
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
