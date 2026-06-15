<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
  import Pagination from '@/shared/HelpersComponents/Pagination.vue';
  import TableSkelaton from '@/shared/HelpersComponents/TableSkelaton.vue';
  import DeleteDialog from '@/shared/HelpersComponents/dialog/DeleteDialog.vue';
  import IndexDelete from '@/shared/icons/DocaumentType/IndexDelete.vue';
  import { ProjectTypeEnum } from '../../core/constant/project.type.enum';
  import type ProjectModel from '../../core/models/project.model';
  import DeleteProjectParams from '../../core/params/delete.project.params';
  import IndexProjectParams from '../../core/params/index.project.params';
  import ProjectController from '../controllers/project.controller';
import { useUserStore } from '@/stores/user';

  const controller = ProjectController.getInstance();
  const state = computed(() => controller.listState.value);
  const route = useRoute();
  const router = useRouter();
  const perPage = ref(10);
  const typeNames = Object.fromEntries(
    Object.entries(ProjectTypeEnum).map(([name, id]) => [id, name]),
  );
  const headers: TableHeader[] = [
    { key: 'title', label: 'project.name', width: '55%', sortable: true },
    { key: 'projectType', label: 'project.type', width: '35%' },
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
  <div class="project-page">
    <header class="page-header">
      <div>
        <h4>{{ $t('project.list_title') }}</h4>
        <p>{{ $t('project.list_description') }}</p>
      </div>
      <router-link class="btn btn-primary" :to="user?.isMaster ? '/admin/project/add' : '/organization/project/add'">{{ $t('project.add') }}</router-link>
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
          <template #cell-projectType="{ item }">{{
            $t(`project.types.${typeNames[item.projectType]}`) 
          }}</template>
          <template #actions="{ item }"
            ><div class="row-actions">
              <router-link :to="user?.isMaster ? `/admin/project/edit/${item.id}` : `/organization/project/edit/${item.id}`">{{ $t('project.edit') }}</router-link
              ><DeleteDialog
                :title="$t('project.delete_title')"
                :message="$t('project.delete_message')"
                :hasbtn="true"
                @delete="deleteProject(item.id!)"
                ><template #btn><IndexDelete /></template
              ></DeleteDialog></div
          ></template>
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
          <router-link class="btn btn-primary" to="/project/add">{{
            $t('project.add')
          }}</router-link>
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
