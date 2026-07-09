<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
  import Pagination from '@/shared/HelpersComponents/Pagination.vue';
  import TableSkelaton from '@/shared/HelpersComponents/TableSkelaton.vue';
  import type ProjectModel from '../../core/models/project.model';
  import DeleteProjectParams from '../../core/params/delete.project.params';
  import IndexProjectParams from '../../core/params/index.project.params';
  import ProjectController from '../controllers/project.controller';
  import { useUserStore } from '@/stores/user';
  import DeleteDialog from '@/base/Presentation/Dialogs/MainDialogs/DeleteDialog.vue';

  const controller = ProjectController.getInstance();
  const state = computed(() => controller.listState.value);
  const route = useRoute();
  const router = useRouter();
  const perPage = ref(10);
  const headers: TableHeader[] = [
    { key: 'title', label: 'title', width: '90%', sortable: true },
    // { key: 'Project', label: 'project.type', width: '35%' },
  ];
  const fetchProjects = async (page: number = 1) =>
    controller.fetchList(
      new IndexProjectParams(
        '',
        route.query.page ? Number(route.query.page) : page,
        perPage.value,
        1,
      ),
    );
  const onPageChange = (page: number) => {
    void fetchProjects(page);
    void router.push({ query: { ...route.query, page: String(page) } });
  };
  const onPerPageChange = (count: number) => {
    perPage.value = count;
    void fetchProjects(1);
  };
  const deleteProject = async (id: number) => {
    await controller.delete(new DeleteProjectParams({ projectId: id }));
    await fetchProjects();
  };
  onMounted(async () => {
    await fetchProjects();
  });
  const { user } = useUserStore();
</script>

<template>
  <div class="Project-page">
    <header class="page-header">
      <div>
        <h4>{{ $t('Project.list_title') }}</h4>
        <p>{{ $t('Project.list_description') }}</p>
      </div>
      <router-link
        class="btn btn-primary"
        :to="user?.isMaster ? '/admin/Project/add' : '/organization/Project/add'"
        >{{ $t('Project.add') }}</router-link
      >
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
          :items="data as ProjectModel[]"
          selectable
          show-index
          hoverable
          striped
        >
          <template #actions="{ item }"
            ><div class="row-actions">
              <router-link
                class="action-btn edit"
                :to="
                  user?.isMaster
                    ? `/admin/Project/show/${item.id}`
                    : `/organization/Project/show/${item.id}`
                "
                :title="$t('show')"
              >
                <i class="pi pi-eye"></i>
              </router-link>
              <router-link
                class="action-btn edit"
                :to="
                  user?.isMaster
                    ? `/admin/Project/edit/${item.id}`
                    : `/organization/Project/edit/${item.id}`
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
                :title="$t('Are you sure you want to remove this project?')"
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
          <h3>{{ $t('Project.list_title') }}</h3>
          <p>{{ $t('Project.list_description') }}</p>
          <router-link class="btn btn-primary" to="/Project/add">{{
            $t('Project.add')
          }}</router-link>
        </div>
      </template>
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
  .Project-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-sm);
    background: var(--bg-main);
    color: var(--gray-400);
    cursor: pointer;
    text-decoration: none;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);

    &:hover {
      transform: translateY(-2px);
    }

    &.edit:hover {
      border-color: var(--PrimaryColor);
      color: var(--PrimaryColor);
      background: var(--PrimaryColor-light);
      box-shadow: 0 3px 10px rgba(99, 102, 241, 0.2);
    }

    &.delete:hover {
      border-color: var(--Red);
      color: var(--Red);
      background: var(--danger-light);
      box-shadow: 0 3px 10px rgba(220, 38, 38, 0.15);
    }
  }

  .page-header,
  .row-actions {
    display: flex;
    align-items: center;
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
