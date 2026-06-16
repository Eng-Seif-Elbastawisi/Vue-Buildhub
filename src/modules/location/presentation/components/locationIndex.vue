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
import type LocationModel from '../../core/models/location.model';
import DeleteLocationParams from '../../core/params/delete.location.params';
import { useUserStore } from '@/stores/user';
import LocationController from '../controllers/location.controller';
import IndexLocationParams from '../../core/params/index.location.params';
import { LocationTypeEnum } from '../../core/constant/location.type.enum';

const controller = LocationController.getInstance();
const state = computed(() => controller.listState.value);
const router = useRouter();
const route = useRoute();
const { locale, t } = useI18n();
const perPage = ref(10);
const word = ref('');

const headers: TableHeader[] = [
  { key: 'translations', label: 'location.title', width: '35%', sortable: true },
  { key: 'code', label: 'location.code', width: '20%' },
  { key: 'type', label: 'location.type', width: '30%' },
];

const typeLabels = Object.fromEntries(
  Object.entries(LocationTypeEnum).map(([name, id]) => [id, name]),
);
const titleFor = (item: LocationModel) =>
  item.translations.title[locale.value] ?? item.translations.title.en ?? '-';
const typeFor = (item: LocationModel) => t(`${typeLabels[item.type]}`);

const fetchLocations = async (page: number = 1, searchWord: string = '') => {
  await controller.fetchList(
    new IndexLocationParams(
      searchWord,
      route.query.page ? Number(route.query.page) : page,
      perPage.value,
      1,
    ),
  );
};

const onPageChange = (page: number) => {
  void fetchLocations(page);
  void router.push({
    query: { ...route.query, page: String(page), word: word.value || undefined },
  });
};

const onPerPageChange = (count: number) => {
  perPage.value = count;
  void fetchLocations(1);
};

const deleteLocation = async (id: number) => {
  await controller.delete(new DeleteLocationParams({ location_id: id }));
  await fetchLocations();
};

onMounted(async () => {
  word.value = route.query.word ? String(route.query.word) : '';
  await fetchLocations(route.query.page ? Number(route.query.page) : 1, word.value);
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
      <router-link class="btn btn-primary" :to="user?.isMaster ? '/location/add' : '/organization/location/add'">

        {{ $t('location.add') }}</router-link>
    </div>

    <DataStatusBuilder :controller="state" :on-retry="async () => await fetchLocations()">
      <template #success="{ data }">
        <AppTable :headers="headers" :items="data as LocationModel[]" selectable show-index hoverable striped>
          <template #cell-translations="{ item }">{{ titleFor(item) }}</template>
          <template #cell-type="{ item }">{{ typeFor(item) }}</template>
          <template #actions="{ item }">
            <div class="row-actions">
              <router-link class="action-btn edit"
                :to="user?.isMaster ? `/location/edit/${item.id}` : `/organization/location/edit/${item.id}`"
                :title="$t('location.edit')">
                {{ $t('location.edit') }}
              </router-link>
              <DeleteDialog :title="$t('location.delete_title')" :message="$t('location.delete_message')" :hasbtn="true"
                @delete="deleteLocation(item.id!)">
                <template #btn>
                  <IndexDelete />
                </template>
              </DeleteDialog>
            </div>
          </template>
        </AppTable>
        <Pagination :pagination="controller.pagination.value" @change-page="onPageChange"
          @count-per-page="onPerPageChange" />
      </template>

      <template #empty>
        <div class="empty-state">
          <h3>{{ $t('location.empty_title') }}</h3>
          <p>{{ $t('location.empty_description') }}</p>
          <router-link class="btn btn-primary" to="/location/add">{{
            $t('location.add')
          }}</router-link>
        </div>
      </template>

      <template #loader>
        <TableSkelaton :rows="5" :columns="headers.length" :has-actions="true" :show-index="true" :selectable="true" />
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
