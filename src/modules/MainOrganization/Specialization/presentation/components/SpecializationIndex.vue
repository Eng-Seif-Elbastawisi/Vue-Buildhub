<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import IndexPageHeader from '@/shared/IndexPageHeader/IndexPageHeader.vue';
  import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
  import { deleteSelectedRows } from '@/shared/HelpersComponents/deleteSelectedRows';
  import Pagination from '@/shared/HelpersComponents/Pagination.vue';
  import TableSkelaton from '@/shared/HelpersComponents/TableSkelaton.vue';
  import type SpecializationModel from '../../core/models/specialization.model';
  import DeleteSpecializationParams from '../../core/params/delete.specialization.params';
  import IndexSpecializationParams from '../../core/params/index.specialization.params';
  import SpecializationController from '../controllers/specialization.controller';
  import { useUserStore } from '@/stores/user';
  import DeleteDialog from '@/base/Presentation/Dialogs/MainDialogs/DeleteDialog.vue';
  import { debounce } from '@/base/Presentation/Utils/debouced';
  import IndexAddIcon from '@/shared/icons/IndexAddIcon.vue';

  const controller = SpecializationController.getInstance();
  const state = computed(() => controller.listState.value);
  const route = useRoute();
  const router = useRouter();
  const perPage = ref(10);
  const word = ref('');
  const headers: TableHeader[] = [
    { key: 'title', label: 'title', width: '90%', sortable: true },
    // { key: 'Specialization', label: 'project.type', width: '35%' },
  ];
  const fetchSpecializations = async (page: number = 1, searchWord: string = '') =>
    controller.fetchList(
      new IndexSpecializationParams(
        searchWord,
        route.query.page ? Number(route.query.page) : page,
        perPage.value,
        1,
      ),
    );
  const onPageChange = (page: number) => {
    void fetchSpecializations(page);
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

    fetchSpecializations(1, word.value);
  });
  const onPerPageChange = (count: number) => {
    perPage.value = count;
    void fetchSpecializations(1);
  };
  const deleteSpecialization = async (id: number) => {
    await controller.delete(new DeleteSpecializationParams({ specializationId: id }));
    await fetchSpecializations();
  };
  const deleteSelectedSpecializations = (specializations: SpecializationModel[]) =>
    deleteSelectedRows(
      specializations,
      (id) => controller.delete(new DeleteSpecializationParams({ specializationId: id })),
      fetchSpecializations,
    );
  onMounted(async () => {
    word.value = route.query.word ? String(route.query.word) : '';
    await fetchSpecializations();
  });
  const { user } = useUserStore();
</script>

<template>
  <div class="Specialization-page">
    <IndexPageHeader
      :title="$t('Specialization.list_title')"
      :subtitle="$t('Specialization.list_description')"
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
            :placeholder="$t('search_specializations')"
            class="search-input workspace-control"
            type="text"
            @input="Search"
          />
        </div>
      </template>

      <template #actions>
        <router-link
          class="btn btn-primary"
          :to="
            user?.type === 1
              ? '/organization/specialization/add'
              : '/organization/specialization/add'
          "
          ><IndexAddIcon />{{ $t('Specialization') }}</router-link
        >
      </template>
    </IndexPageHeader>
    <DataStatusBuilder
      :controller="state"
      :on-retry="
        async () => {
          await fetchSpecializations();
        }
      "
    >
      <template #success="{ data }">
        <AppTable
          :headers="headers"
          :items="data as SpecializationModel[]"
          :bulk-delete="deleteSelectedSpecializations"
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
                    ? `/organization/specialization/edit/${item.id}`
                    : `/organization/specialization/edit/${item.id}`
                "
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
                :title="$t('Are you sure you want to remove this specialization?')"
                :message="$t('This action cannot be undone.')"
                :hasbtn="true"
                @delete="deleteSpecialization(item.id!)"
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
          :pagination="controller.pagination.value"
          @change-page="onPageChange"
          @count-per-page="onPerPageChange"
        />
      </template>
      <template #empty>
        <div class="empty-state">
          <h3>{{ $t('Specialization.empty_title') }}</h3>
          <p>{{ $t('Specialization.empty_description') }}</p>
          <router-link
            class="btn btn-primary"
            :to="
              user?.type === 1
                ? '/organization/specialization/add'
                : '/organization/specialization/add'
            "
            ><IndexAddIcon />{{ $t('Specialization.add') }}</router-link
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
.Specialization-page {
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
