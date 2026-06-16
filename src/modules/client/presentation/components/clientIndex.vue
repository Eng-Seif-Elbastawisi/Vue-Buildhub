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
import DeleteClientParams from '../../core/params/delete.client.params';
import IndexClientParams from '../../core/params/index.client.params';
import ClientController from '../controllers/client.controller';
import { useUserStore } from '@/stores/user';
import type ClientShowModel from '../../core/models/client.show.model';

const controller = ClientController.getInstance();
const state = computed(() => controller.listState.value);
const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const perPage = ref(10);
const word = ref('');

const headers: TableHeader[] = [
  { key: 'name', label: 'client.name', width: '35%', sortable: true },
  { key: 'phone', label: 'client.phone', width: '20%' },
  { key: 'email', label: 'client.email', width: '20%' },
  { key: 'address', label: 'client.address', width: '20%' },
];


const nameFor = (item: ClientShowModel) =>
  item.name;
const phoneFor = (item: ClientShowModel) => item.phone;
const emailFor = (item: ClientShowModel) => item.email;
const addressFor = (item: ClientShowModel) => item.address;

const fetchClient = async (page: number = 1, searchWord: string = '') => {
  await controller.fetchList(
    new IndexClientParams(
      searchWord,
      route.query.page ? Number(route.query.page) : page,
      perPage.value,
      1,
    ),
  );
};

const onPageChange = (page: number) => {
  void fetchClient(page);
  void router.push({
    query: { ...route.query, page: String(page), word: word.value || undefined },
  });
};

const onPerPageChange = (count: number) => {
  perPage.value = count;
  void fetchClient(1);
};

const deleteClient = async (id: number) => {
  await controller.delete(new DeleteClientParams({ client_id: id }));
  await fetchClient();
};

onMounted(async () => {
  word.value = route.query.word ? String(route.query.word) : '';
  await fetchClient(route.query.page ? Number(route.query.page) : 1, word.value);
});
const { user } = useUserStore();
</script>

<template>
  <div class="client-page">
    <div class="client-header">
      <div>
        <h4>{{ $t('client.list_title') }}</h4>
        <p>{{ $t('client.list_description') }}</p>
      </div>
      <router-link class="btn btn-primary" :to="user?.isMaster ? '/client/add' : '/organization/client/add'">

        {{ $t('client.add') }}</router-link>
    </div>

    <DataStatusBuilder :controller="state" :on-retry="async () => await fetchClient()">
      <template #success="{ data }">
        <AppTable :headers="headers" :items="data as ClientShowModel[]" selectable show-index hoverable striped>
          <template #cell-name="{ item }">{{ nameFor(item) }}</template>
          <template #cell-phone="{ item }">{{ phoneFor(item) }}</template>
          <template #cell-email="{ item }">{{ emailFor(item) }}</template>
          <template #cell-address="{ item }">{{ addressFor(item) }}</template>
          <template #actions="{ item }">
            <div class="row-actions">
              <router-link class="action-btn edit"
                :to="user?.isMaster ? `/client/edit/${item.id}` : `/organization/client/edit/${item.id}`"
                :title="$t('client.edit')">
                {{ $t('client.edit') }}
              </router-link>
              <DeleteDialog :title="$t('client.delete_title')" :message="$t('client.delete_message')" :hasbtn="true"
                @delete="deleteClient(item.id!)">
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
          <h3>{{ $t('client.empty_title') }}</h3>
          <p>{{ $t('client.empty_description') }}</p>
          <router-link class="btn btn-primary" to="/client/add">{{
            $t('client.add')
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
