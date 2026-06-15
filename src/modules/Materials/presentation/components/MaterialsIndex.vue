<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRoute, useRouter } from 'vue-router';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
  import Pagination from '@/shared/HelpersComponents/Pagination.vue';
  import TableSkelaton from '@/shared/HelpersComponents/TableSkelaton.vue';
  import DeleteDialog from '@/shared/HelpersComponents/dialog/DeleteDialog.vue';
  import IndexDelete from '@/shared/icons/DocaumentType/IndexDelete.vue';
  import { UnitTypeEnum } from '../../core/constant/unit.type.enum';
  import type MaterialsModel from '../../core/models/materials.model';
  import DeleteMaterialParams from '../../core/params/delete.materials.params';
  import IndexMaterialParams from '../../core/params/index.materials.params';
  import MaterialController from '../controllers/materials.controller';
import { useUserStore } from '@/stores/user';

  const controller = MaterialController.getInstance();
  const state = computed(() => controller.listState.value);
  const router = useRouter();
  const route = useRoute();
  const { locale, t } = useI18n();
  const perPage = ref(10);
  const word = ref('');

  const headers: TableHeader[] = [
    { key: 'translations', label: 'material.title', width: '35%', sortable: true },
    { key: 'brandId', label: 'material.brand', width: '20%' },
    { key: 'price', label: 'material.price', width: '20%' },
    { key: 'unit', label: 'material.unit', width: '20%' },
  ];

  const unitLabels = Object.fromEntries(
    Object.entries(UnitTypeEnum).map(([name, id]) => [id, name]),
  );
  const titleFor = (item: MaterialsModel) =>
    item.translations.title[locale.value] ?? item.translations.title.en ?? '-';
  const unitFor = (item: MaterialsModel) => t(`material.units.${unitLabels[item.unit]}`);

  const fetchMaterials = async (page: number = 1, searchWord: string = '') => {
    await controller.fetchList(
      new IndexMaterialParams(
        searchWord,
        route.query.page ? Number(route.query.page) : page,
        perPage.value,
        1,
      ),
    );
  };

  const onPageChange = (page: number) => {
    void fetchMaterials(page);
    void router.push({
      query: { ...route.query, page: String(page), word: word.value || undefined },
    });
  };

  const onPerPageChange = (count: number) => {
    perPage.value = count;
    void fetchMaterials(1);
  };

  const deleteMaterial = async (id: number) => {
    await controller.delete(new DeleteMaterialParams({ material_id: id }));
    await fetchMaterials();
  };

  onMounted(async () => {
    word.value = route.query.word ? String(route.query.word) : '';
    await fetchMaterials(route.query.page ? Number(route.query.page) : 1, word.value);
  });
    const { user } = useUserStore();
</script>

<template>
  <div class="material-page">
    <div class="material-header">
      <div>
        <h4>{{ $t('material.list_title') }}</h4>
        <p>{{ $t('material.list_description') }}</p>
      </div>
      <router-link class="btn btn-primary" :to="user?.isMaster ? '/material/add' : '/organization/material/add'">
        
        {{ $t('material.add') }}</router-link>
    </div>

    <DataStatusBuilder :controller="state" :on-retry="async () => await fetchMaterials()">
      <template #success="{ data }">
        <AppTable
          :headers="headers"
          :items="data as MaterialsModel[]"
          selectable
          show-index
          hoverable
          striped
        >
          <template #cell-translations="{ item }">{{ titleFor(item) }}</template>
          <template #cell-unit="{ item }">{{ unitFor(item) }}</template>
          <template #actions="{ item }">
            <div class="row-actions">
              <router-link
                class="action-btn edit"
                :to="user?.isMaster ? `/material/edit/${item.id}` : `/organization/material/edit/${item.id}`"
                :title="$t('material.edit')"
              >
                {{ $t('material.edit') }}
              </router-link>
              <DeleteDialog
                :title="$t('material.delete_title')"
                :message="$t('material.delete_message')"
                :hasbtn="true"
                @delete="deleteMaterial(item.id!)"
              >
                <template #btn><IndexDelete /></template>
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
          <h3>{{ $t('material.empty_title') }}</h3>
          <p>{{ $t('material.empty_description') }}</p>
          <router-link class="btn btn-primary" to="/material/add">{{
            $t('material.add')
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
  .material-page,
  .material-header,
  .row-actions {
    display: flex;
  }

  .material-page {
    flex-direction: column;
    gap: 1.5rem;
  }

  .material-header {
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .material-header p,
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
