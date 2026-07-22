<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import DeleteDialog from '@/base/Presentation/Dialogs/MainDialogs/DeleteDialog.vue';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
  import Pagination from '@/shared/HelpersComponents/Pagination.vue';
  import TableSkelaton from '@/shared/HelpersComponents/TableSkelaton.vue';
  import type PackageModel from '../../core/models/package.model';
  import DeletePackageParams from '../../core/params/delete.package.params';
  import IndexPackageParams from '../../core/params/index.package.params';
  import PackageController from '../controllers/package.controller';

  const controller = PackageController.getInstance();
  const state = computed(() => controller.listState.value);
  const router = useRouter();
  const route = useRoute();
  const perPage = ref(10);
  const word = ref('');

  const headers: TableHeader[] = [
    { key: 'duration', label: 'package.duration', sortable: true },
    { key: 'projectnumbers', label: 'package.projectnumbers' },
    { key: 'employeenumbers', label: 'package.employeenumbers' },
    { key: 'hasmobild', label: 'package.hasmobild' },
    { key: 'hasportal', label: 'package.hasportal' },
    { key: 'price', label: 'package.price', sortable: true },
  ];

  const fetchPackages = async (page: number = 1, searchWord: string = '') => {
    await controller.fetchList(
      new IndexPackageParams(
        searchWord,
        route.query.page ? Number(route.query.page) : page,
        perPage.value,
        1,
      ),
    );
  };

  const onPageChange = (page: number) => {
    void fetchPackages(page);
    void router.push({
      query: { ...route.query, page: String(page), word: word.value || undefined },
    });
  };

  const onPerPageChange = (count: number) => {
    perPage.value = count;
    void fetchPackages(1);
  };

  const deletePackage = async (id: number) => {
    await controller.delete(new DeletePackageParams(id));
    await fetchPackages();
  };

  onMounted(async () => {
    word.value = route.query.word ? String(route.query.word) : '';
    await fetchPackages(route.query.page ? Number(route.query.page) : 1, word.value);
  });
</script>

<template>
  <div class="package-page">
    <div class="package-header">
      <div>
        <h4>{{ $t('package.index.title') }}</h4>
        <p>{{ $t('package.index.description') }}</p>
      </div>
      <router-link class="btn btn-primary" :to="{ name: 'Add Package' }">
        {{ $t('package.add') }}
      </router-link>
    </div>

    <DataStatusBuilder :controller="state" :on-retry="async () => await fetchPackages()">
      <template #success="{ data }">
        <AppTable
          :headers="headers"
          :items="data as PackageModel[]"
          hoverable
          selectable
          show-index
          striped
        >
          <template #cell-hasmobild="{ value }">
            {{ $t(value ? 'package.yes' : 'package.no') }}
          </template>
          <template #cell-hasportal="{ value }">
            {{ $t(value ? 'package.yes' : 'package.no') }}
          </template>
          <template #actions="{ item }">
            <div class="row-actions">
              <router-link
                class="action-btn edit"
                :title="$t('package.edit')"
                :to="{ name: 'Edit Package', params: { id: item.id } }"
              >
                <i class="pi pi-pencil"></i>
              </router-link>
              <DeleteDialog
                :hasbtn="true"
                :message="$t('package.delete_message')"
                :title="$t('package.delete_title')"
                @delete="deletePackage(item.id!)"
              >
                <template #btn>
                  <button class="action-btn delete" :title="$t('Delete')" type="button">
                    <i class="pi pi-trash"></i>
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
          <h3>{{ $t('package.empty_title') }}</h3>
          <p>{{ $t('package.empty_description') }}</p>
          <router-link class="btn btn-primary" :to="{ name: 'Add Package' }">
            {{ $t('package.add') }}
          </router-link>
        </div>
      </template>

      <template #loader>
        <TableSkelaton
          :columns="headers.length"
          :has-actions="true"
          :rows="5"
          :selectable="true"
          :show-index="true"
        />
      </template>
    </DataStatusBuilder>
  </div>
</template>

<style scoped lang="scss">
  .package-page,
  .package-header,
  .row-actions {
    display: flex;
  }

  .package-page {
    flex-direction: column;
    gap: 1.5rem;
  }

  .package-header {
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .package-header p,
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
