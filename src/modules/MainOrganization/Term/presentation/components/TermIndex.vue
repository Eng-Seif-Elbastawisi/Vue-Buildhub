<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import IndexPageHeader from '@/shared/IndexPageHeader/IndexPageHeader.vue';
  import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
  import Pagination from '@/shared/HelpersComponents/Pagination.vue';
  import TableSkelaton from '@/shared/HelpersComponents/TableSkelaton.vue';
  import { deleteSelectedRows } from '@/shared/HelpersComponents/deleteSelectedRows';

  import type TermModel from '../../core/models/term.model';
  import DeleteTermParams from '../../core/params/delete.term.params';
  import IndexTermParams from '../../core/params/index.term.params';
  import TermController from '../controllers/term.controller';

  import DeleteDialog from '@/base/Presentation/Dialogs/MainDialogs/DeleteDialog.vue';
  import { debounce } from '@/base/Presentation/Utils/debouced';
  import IndexAddIcon from '@/shared/icons/IndexAddIcon.vue';

  const controller = TermController.getInstance();

  const state = computed(() => controller.listState.value);

  const route = useRoute();
  const router = useRouter();

  const perPage = ref(10);
  const word = ref('');

  const headers: TableHeader[] = [
    {
      key: 'title',
      label: 'title',
      width: '90%',
      sortable: true,
    },
  ];

  /**
   * Fetch terms
   */
  const fetchTerms = async (page: number = 1, searchWord: string = word.value) => {
    await controller.fetchList(new IndexTermParams(searchWord, page, perPage.value, 1));
  };

  /**
   * Search
   */
  const Search = debounce(() => {
    router.push({
      query: {
        ...route.query,
        page: '1',
        word: word.value || undefined,
      },
    });

    void fetchTerms(1, word.value);
  });

  /**
   * Pagination
   */
  const onPageChange = (page: number) => {
    void fetchTerms(page, word.value);

    void router.push({
      query: {
        ...route.query,
        page: String(page),
        word: word.value || undefined,
      },
    });
  };

  /**
   * Change items per page
   */
  const onPerPageChange = (count: number) => {
    perPage.value = count;

    void fetchTerms(1, word.value);

    void router.push({
      query: {
        ...route.query,
        page: '1',
        word: word.value || undefined,
      },
    });
  };

  /**
   * Delete single term
   */
  const deleteTerm = async (id: number) => {
    await controller.delete(
      new DeleteTermParams({
        termId: id,
      }),
    );

    await fetchTerms(route.query.page ? Number(route.query.page) : 1, word.value);
  };

  /**
   * Delete selected terms
   *
   * Select multiple rows from the table,
   * delete them all, then refresh the list.
   */
  const deleteSelectedTerms = (terms: TermModel[]) =>
    deleteSelectedRows(
      terms,
      (id) =>
        controller.delete(
          new DeleteTermParams({
            termId: id,
          }),
        ),
      () => fetchTerms(route.query.page ? Number(route.query.page) : 1, word.value),
    );

  /**
   * Initial load
   */
  onMounted(async () => {
    word.value = route.query.word ? String(route.query.word) : '';

    await fetchTerms(route.query.page ? Number(route.query.page) : 1, word.value);
  });
</script>

<template>
  <div class="Term-page">
    <!-- ================= HEADER ================= -->
    <IndexPageHeader
      :title="$t('Term.list_title')"
      :subtitle="$t('Term.list_description')"
    >
      <template #search>
        <!-- Search -->
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
            :placeholder="$t('search_terms')"
            class="search-input"
            type="text"
            @input="Search"
          />
        </div>
      </template>

      <template #actions>
        <!-- Add Term -->
        <router-link class="btn btn-primary" to="/organization/term/add">
          <IndexAddIcon />

          {{ $t('Term') }}
        </router-link>
      </template>
    </IndexPageHeader>

    <!-- ================= TABLE STATE ================= -->
    <DataStatusBuilder
      :controller="state"
      :on-retry="
        async () => {
          await fetchTerms(route.query.page ? Number(route.query.page) : 1, word);
        }
      "
    >
      <!-- ================= SUCCESS ================= -->
      <template #success="{ data }">
        <AppTable
          :headers="headers"
          :items="data as TermModel[]"
          :bulk-delete="deleteSelectedTerms"
          selectable
          show-index
          hoverable
          striped
        >
          <!-- ================= ACTIONS ================= -->
          <template #actions="{ item }">
            <div class="row-actions">
              <!-- Edit -->
              <router-link
                class="action-btn edit"
                :to="`/organization/term/edit/${item.id}`"
                :title="$t('Edit')"
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

              <!-- Delete -->
              <DeleteDialog
                :title="$t('Are you sure you want to remove this term?')"
                :message="$t('This action cannot be undone.')"
                :hasbtn="true"
                @delete="deleteTerm(item.id!)"
              >
                <template #btn>
                  <button type="button" class="action-btn delete" :title="$t('Delete')">
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

                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-2-2-2V6" />

                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 2 2 2v2" />
                    </svg>
                  </button>
                </template>
              </DeleteDialog>
            </div>
          </template>
        </AppTable>

        <!-- ================= PAGINATION ================= -->
        <Pagination
          :pagination="controller.pagination.value"
          @change-page="onPageChange"
          @count-per-page="onPerPageChange"
        />
      </template>

      <!-- ================= EMPTY ================= -->
      <template #empty>
        <div class="empty-state">
          <h3>
            {{ $t('Term.empty_title') }}
          </h3>

          <p>
            {{ $t('Term.empty_description') }}
          </p>

          <router-link class="btn btn-primary" to="/organization/term/add">
            <IndexAddIcon />

            {{ $t('Term.add') }}
          </router-link>
        </div>
      </template>

      <!-- ================= LOADER ================= -->
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
  @use '../styles/Term_imports';

  .Term-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  /* ================= HEADER ================= */

  .page-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
  }

  .page-info {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .page-info p {
    color: var(--gray-5);
  }

  /* ================= TOOLBAR ================= */

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 1rem;
  }

  /* ================= ROW ACTIONS ================= */

  .row-actions {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    min-width: 80px;
  }

  /* ================= ACTION BUTTON ================= */

  .action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    width: 32px;
    height: 32px;

    padding: 0;

    border: none;
    border-radius: 6px;

    background: transparent;

    cursor: pointer;

    transition:
      background-color 0.2s ease,
      color 0.2s ease,
      opacity 0.2s ease;
  }

  /* ================= EDIT ================= */

  .action-btn.edit {
    color: var(--primary-color, #3b82f6);
  }

  .action-btn.edit:hover {
    background-color: rgba(59, 130, 246, 0.1);
  }

  /* ================= DELETE ================= */

  .action-btn.delete {
    display: inline-flex;

    color: #ef4444;

    visibility: visible;
    opacity: 1;
  }

  .action-btn.delete:hover {
    background-color: rgba(239, 68, 68, 0.1);
  }

  /* ================= EMPTY ================= */

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;

    padding: 3rem 1rem;

    text-align: center;
  }

  .empty-state p {
    color: var(--gray-5);
  }

  /* ================= RESPONSIVE ================= */

  @media (max-width: 768px) {
    .page-header {
      flex-direction: column;
    }

    .toolbar {
      width: 100%;
      justify-content: space-between;
    }
  }
</style>
