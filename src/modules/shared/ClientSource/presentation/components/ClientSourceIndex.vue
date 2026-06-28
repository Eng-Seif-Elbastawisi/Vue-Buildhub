<script setup lang="ts">
  import { onMounted, ref, computed } from 'vue';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
  import Pagination from '@/shared/HelpersComponents/Pagination.vue';
  import { useRoute, useRouter } from 'vue-router';
  import { debounce } from '@/base/Presentation/Utils/debouced';
  import ClientSourceController from '../controllers/client.source.controller.ts';
  import DeleteClientSourceParams from '../../core/params/delete.client.source.params.ts';
  import ShowClientSourceParams from '../../core/params/show.client.source.params.ts';
  import EditIcon from '@/shared/icons/EditIcon.vue';
  import DeleteDialog from '@/base/Presentation/Dialogs/MainDialogs/DeleteDialog.vue';
  import type ClientSourceModel from '../../core/models/client.source.model.ts';
  import IndexClientSourceParams from '../../core/params/index.client.source.params.ts';
  import ClientSourceAdd from './ClientSourceAdd.vue';

  // Controller instance
  const controller = ClientSourceController.getInstance();
  const state = computed(() => controller.listState.value);
  const router = useRouter();
  const route = useRoute();

  // Table headers
  const headers: TableHeader[] = [{ key: 'title', label: 'Title', width: '95%', sortable: true }];

  // Pagination state
  const perPage = ref(10);
  const word = ref('');

  const fetchClientSource = async (page: number = 1, word: string = '') => {
    await controller.fetchList(
      new IndexClientSourceParams(
        word,
        route.query.page ? Number(route.query.page) : page,
        perPage.value,
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

    fetchClientSource(1, word.value);
  });

  const onPageChange = (page: number) => {
    fetchClientSource(page);
    router.push({
      query: {
        ...route.query,
        page: String(page),
        word: word.value,
      },
    });
  };

  const onPerPageChange = (count: number) => {
    perPage.value = count;
    fetchClientSource(1);
  };

  onMounted(async () => {
    if (route.query.word) {
      word.value = String(route.query.word);
    }

    await fetchClientSource(route.query.page ? Number(route.query.page) : 1, word.value);
  });

  const deleteClientSource = async (id: number) => {
    await controller.delete(new DeleteClientSourceParams(id));
    await fetchClientSource();
  };

  const routePrefix = computed(() =>
    route.path.startsWith('/admin') ? '/admin' : '/organization',
  );
  const formRoute = computed(() => `${routePrefix.value}/client-source/add`);

  const SelectedRow = ref<ClientSourceModel[]>([]);
  const setSelectef = (items: ClientSourceModel[]) => {
    SelectedRow.value = items;
  };

  const deleteSelected = () => {
    SelectedRow.value.forEach((item) => {
      deleteClientSource(item.id!);
    });
  };
  const EditMode = ref(false);
  const selectedClientSource = computed(() =>
    EditMode.value ? (controller.itemData.value ?? undefined) : undefined,
  );

  const ShowClientSource = async (id: number) => {
    await controller.fetchOne(new ShowClientSourceParams(id, true));
    EditMode.value = true;
  };
  const formKey = ref(0);
  const onClientSourceSaved = async () => {
    EditMode.value = false;
    await fetchClientSource();
    formKey.value++;
  };
</script>

<template>
  <div class="client-source-page">
    <div class="index-header">
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
            :placeholder="$t('search_by_country_name_or_code')"
            class="search-input"
            type="text"
            @input="Search"
          />
        </div>
      </div>
      <div class="flex gap-10">
        <button v-if="SelectedRow.length > 0" class="btn-add" @click="deleteSelected">
          <span>{{ $t('delete') }}</span>
        </button>
      </div>
    </div>
    <ClientSourceAdd
      :key="formKey"
      :client-source="selectedClientSource"
      @saved="onClientSourceSaved"
    />

    <!-- ═══ Table ═══ -->
    <DataStatusBuilder :controller="state" :on-retry="async () => await fetchClientSource()">
      <template #success="{ data }">
        <div class="table-frame">
          <AppTable
            :headers="headers"
            :items="data as ClientSourceModel[]"
            selectable
            show-index
            hoverable
            striped
            @selection-change="setSelectef"
          >
            <template #cell-name="{ item }">
              {{ item?.title }}
            </template>

            <template #actions="{ item }">
              <div class="row-actions">
                <button
                  class="action-btn edit"
                  :title="$t('Edit')"
                  @click="ShowClientSource(item.id!)"
                >
                  <EditIcon />
                </button>
                <DeleteDialog
                  :title="$t('Are you sure you want to remove this stage?')"
                  :message="$t('This action cannot be undone.')"
                  :hasbtn="true"
                  @delete="deleteClientSource(item.id!)"
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
        </div>

        <Pagination
          :pagination="controller.pagination.value"
          @change-page="onPageChange"
          @count-per-page="onPerPageChange"
        />
      </template>

      <template #empty>
        <div class="empty-state">
          <svg
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1"
            stroke-linecap="round"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
          <h3>{{ $t('no_emails_yet') }}</h3>
          <p>{{ $t('add_first_employee_email') }}</p>
          <router-link :to="formRoute" class="btn-add empty-cta">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>{{ $t('add_email') }}</span>
          </router-link>
        </div>
      </template>
    </DataStatusBuilder>
  </div>
</template>
