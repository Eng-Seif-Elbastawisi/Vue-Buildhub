<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
  import Pagination from '@/shared/HelpersComponents/Pagination.vue';
  import TableSkelaton from '@/shared/HelpersComponents/TableSkelaton.vue';
  import DeleteDialog from '@/base/Presentation/Dialogs/MainDialogs/DeleteDialog.vue';
  import DeleteClientParams from '../../core/params/delete.client.params';
  import IndexClientParams from '../../core/params/index.client.params';
  import ClientController from '../controllers/client.controller';
  import { useUserStore } from '@/stores/user';
  import type ClientShowModel from '../../core/models/client.show.model';
  import IndexAddIcon from '@/shared/icons/IndexAddIcon.vue';
  import { debounce } from '@/base/Presentation/Utils/debouced';

  const controller = ClientController.getInstance();
  const state = computed(() => controller.listState.value);
  const router = useRouter();
  const route = useRoute();
  const perPage = ref(10);
  const word = ref('');

  const headers: TableHeader[] = [
    { key: 'name', label: 'client.name', width: '35%', sortable: true },
    { key: 'phone', label: 'client.phone', width: '20%' },
    { key: 'email', label: 'client.email', width: '20%' },
    { key: 'address', label: 'client.address', width: '20%' },
  ];

  const nameFor = (item: ClientShowModel) => item.name;
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
  const Search = debounce(() => {
    router.push({
      query: {
        ...route.query,
        page: Number(route.query.page ?? 1),
        word: word.value || undefined,
      },
    });
    fetchClient(1, word.value);
  });
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
          :to="user?.isMaster ? '/client/add' : '/organization/client/add'"
        >
          <IndexAddIcon /> {{ $t('client') }}</router-link
        >
      </div>
    </div>

    <DataStatusBuilder :controller="state" :on-retry="async () => await fetchClient()">
      <template #success="{ data }">
        <AppTable
          :headers="headers"
          :items="data as ClientShowModel[]"
          selectable
          show-index
          hoverable
          striped
        >
          <template #cell-name="{ item }">{{ nameFor(item) }}</template>
          <template #cell-phone="{ item }">{{ phoneFor(item) }}</template>
          <template #cell-email="{ item }">{{ emailFor(item) }}</template>
          <template #cell-address="{ item }">{{ addressFor(item) }}</template>
          <template #actions="{ item }">
            <div class="row-actions">
              <router-link
                class="action-btn edit"
                :to="
                  user?.isMaster
                    ? `/client/edit/${item.id}`
                    : `/organization/client/edit/${item.id}`
                "
                :title="$t('client.edit')"
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
                :title="$t('Are you sure you want to remove this client?')"
                :message="$t('This action cannot be undone.')"
                :hasbtn="true"
                @delete="deleteClient(item.id!)"
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
                :title="$t('client.delete_title')"
                :message="$t('client.delete_message')"
                :hasbtn="true"
                @delete="deleteClient(item.id!)"
              >
                <template #Dialog>
                  <IndexDelete />
                </template>
              </DeleteDialog> -->
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
          <h3>{{ $t('client.empty_title') }}</h3>
          <p>{{ $t('client.empty_description') }}</p>
          <router-link class="btn btn-primary" to="/organization/client/add">{{
            $t('client.add')
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
  .toolbar {
    width: 100%;
    justify-content: space-between;
  }

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
