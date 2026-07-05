<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
  import Pagination from '@/shared/HelpersComponents/Pagination.vue';
  import TableSkelaton from '@/shared/HelpersComponents/TableSkelaton.vue';
  import { ProjectType } from '../../core/constant/project-type.enum';
  import type ProjectTypeModel from '../../core/models/project-type.model';
  import DeleteProjectTypeParams from '../../core/params/delete.project-type.params';
  import IndexProjectTypeParams from '../../core/params/index.project-type.params';
  import ProjectTypeController from '../controllers/project-type.controller';
  import { useUserStore } from '@/stores/user';
  import DeleteDialog from '@/base/Presentation/Dialogs/MainDialogs/DeleteDialog.vue';
  import IndexAddIcon from '@/shared/icons/IndexAddIcon.vue';
  import { debounce } from '@/base/Presentation/Utils/debouced';

  const controller = ProjectTypeController.getInstance();
  const state = computed(() => controller.listState.value);
  const route = useRoute();
  const router = useRouter();
  const perPage = ref(10);
  const word = ref('');
  const typeNames = Object.fromEntries(Object.entries(ProjectType).map(([name, id]) => [id, name]));
  const headers: TableHeader[] = [
    { key: 'title', label: 'title', width: '90%', sortable: true },
    // { key: 'projectType', label: 'project.type', width: '35%' },
  ];
  const fetchProjects = async (page: number = 1, searchWord: string = '') =>
    controller.fetchList(
      new IndexProjectTypeParams(
        searchWord,
        route.query.page ? Number(route.query.page) : page,
        perPage.value,
        1,
      ),
    );
  const Search = debounce(() => {
    router.push({
      query: {
        ...route.query,
        page: Number(route.query.page ?? 1),
        word: word.value || undefined,
      },
    });
    fetchProjects(1, word.value);
  });
  const onPageChange = (page: number) => {
    void fetchProjects(page);
    void router.push({ query: { ...route.query, page: String(page) } });
  };
  const onPerPageChange = (count: number) => {
    perPage.value = count;
    void fetchProjects(1);
  };
  const deleteProject = async (id: number) => {
    await controller.delete(new DeleteProjectTypeParams({ projectId: id }));
    await fetchProjects();
  };
  onMounted(async () => {
    await fetchProjects();
  });
  const { user } = useUserStore();
</script>

<template>
  <div class="project-page">
    <header class="page-header">
      <div>
        <h4>{{ $t('project.list_title') }}</h4>
        <p>{{ $t('project.list_description') }}</p>
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
          :to="user?.isMaster ? '/admin/projectType/add' : '/organization/projectType/add'"
          ><IndexAddIcon />{{ $t('project') }}</router-link
        >
      </div>
    </header>
    <DataStatusBuilder
      :controller="state"
      :on-retry="
        async () => {
          await fetchProjects();
        }
      "
    >
      <template #success="{ data }">
        <AppTable
          :headers="headers"
          :items="data as ProjectTypeModel[]"
          selectable
          show-index
          hoverable
          striped
        >
          <template #cell-projectType="{ item }">{{
            $t(`project.types.${typeNames[item.projectType]}`)
          }}</template>
          <template #actions="{ item }"
            ><div class="row-actions">
              <router-link
                class="action-btn edit"
                :to="
                  user?.isMaster
                    ? `/admin/projectType/edit/${item.id}`
                    : `/organization/projectType/edit/${item.id}`
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
                :title="$t('Are you sure you want to remove this project type?')"
                :message="$t('This action cannot be undone.')"
                :hasbtn="true"
                @delete="deleteProject(item.id!)"
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
            </div></template
          >
        </AppTable>
        <Pagination
          :pagination="controller.pagination.value"
          @change-page="onPageChange"
          @count-per-page="onPerPageChange"
        />
      </template>
      <template #empty
        ><div class="empty-state">
          <h3>{{ $t('project.empty_title') }}</h3>
          <p>{{ $t('project.empty_description') }}</p>
          <router-link
            class="btn btn-primary"
            :to="user?.isMaster ? '/admin/projectType/add' : '/organization/projectType/add'"
            >{{ $t('project.add') }}</router-link
          >
        </div></template
      >
      <template #loader
        ><TableSkelaton
          :rows="5"
          :columns="headers.length"
          :has-actions="true"
          :show-index="true"
          :selectable="true"
      /></template>
    </DataStatusBuilder>
  </div>
</template>

<style scoped lang="scss">
  .project-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .toolbar {
    width: 100%;
    justify-content: space-between;
  }

  .page-header,
  .row-actions {
    display: flex;
    align-items: start;
    flex-direction: row;
    justify-content: space-between;
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
