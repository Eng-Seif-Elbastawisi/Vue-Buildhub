<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
import IndexPageHeader from '@/shared/IndexPageHeader/IndexPageHeader.vue';
import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
import Pagination from '@/shared/HelpersComponents/Pagination.vue';

import { useRoute, useRouter } from 'vue-router';

import { debounce } from '@/base/Presentation/Utils/debouced';

import IndexQuoteTypeParams from '../../core/params/index.quote.types.params';
import QuoteTypeController from '../controllers/quote.types.controller';
import ChangeQuoteTypeOrderParams from '../../core/params/change.quote.types.order.params';

import type QuoteTypeModel from '../../core/models/quote.types.model';

import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';

import EditIcon from '@/shared/icons/EditIcon.vue';
import IndexAddIcon from '@/shared/icons/IndexAddIcon.vue';

import ChangeStatusButton from '@/modules/MainOrganization/ChangeStatus/presentation/components/ChangeStatusButton.vue';
import { StatusTypeEnum } from '@/modules/MainOrganization/ChangeStatus/core/constant/change_status.type.enum';

const controller = QuoteTypeController.getInstance();

const state = computed(() => controller.listState.value);

const router = useRouter();
const route = useRoute();

const headers: TableHeader[] = [
  {
    key: 'title',
    label: 'title',
    width: '50%',
    sortable: true,
  },
  {
    key: 'typeCode',
    label: 'quote_type.type_code',
    width: '50%',
  },
];

const perPage = ref(10);
const word = ref('');
const sortBy = ref<string>();
const sortDirection = ref<'asc' | 'desc'>();

const fetchQuoteTypes = async (page: number = 1, searchWord: string = '') => {
  await controller.fetchList(
    new IndexQuoteTypeParams({
      word: searchWord,
      page,
      perPage: perPage.value,
      parentId: null,
      sortBy: sortBy.value,
      sortDirection: sortDirection.value,
    }),
  );
};

const updateRouteQuery = (page: number) =>
  router.push({
    query: {
      ...route.query,
      page: String(page),
      word: word.value || undefined,
      sort_by: sortBy.value,
      sort_direction: sortDirection.value,
    },
  });

const onSort = (key: string, direction: 'asc' | 'desc') => {
  sortBy.value = key;
  sortDirection.value = direction;
  void updateRouteQuery(1);
  void fetchQuoteTypes(1, word.value);
};

const Search = debounce(() => {
  void updateRouteQuery(1);

  void fetchQuoteTypes(1, word.value);
});

const onPageChange = (page: number) => {
  void fetchQuoteTypes(page, word.value);

  void updateRouteQuery(page);
};

const onPerPageChange = (count: number) => {
  perPage.value = count;

  void fetchQuoteTypes(1, word.value);
  void updateRouteQuery(1);
};

const routePrefix = computed(() =>
  route.path?.startsWith('/admin') ? '/admin' : '/organization',
);

const formRoute = computed(() => `${routePrefix.value}/quote-types/add`);

const onReorder = async ({
  movedItem,
  toIndex,
}: {
  items: QuoteTypeModel[];
  movedItem: QuoteTypeModel;
  fromIndex: number;
  toIndex: number;
}) => {
  if (!movedItem?.id) {
    console.warn('Cannot reorder a quote type without an ID');
    return;
  }

  const page = route.query.page ? Number(route.query.page) : 1;

  const newOrder = (page - 1) * perPage.value + toIndex + 1;

  const params = new ChangeQuoteTypeOrderParams({
    quoteTypeId: movedItem.id,
    order: newOrder,
  });

  const result = await controller.changeOrder(params);

  if (result instanceof DataSuccess) {
    await fetchQuoteTypes(page, word.value);
  }
};

onMounted(async () => {
  word.value = route.query.word ? String(route.query.word) : '';
  sortBy.value = route.query.sort_by ? String(route.query.sort_by) : undefined;
  sortDirection.value =
    route.query.sort_direction === 'asc' || route.query.sort_direction === 'desc'
      ? route.query.sort_direction
      : undefined;

  await fetchQuoteTypes(route.query.page ? Number(route.query.page) : 1, word.value);
});
</script>

<template>
  <div class="quote-type-page">
    <IndexPageHeader
      :title="$t('quote_type.list_title')"
      :subtitle="$t('quote_type.list_description')"
    >
      <template #search>
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
            :placeholder="$t('search_quote_types')"
            class="search-input workspace-control"
            type="text"
            @input="Search"
          />
        </div>
      </template>
    </IndexPageHeader>

    <!-- <router-link class="btn btn-primary" :to="formRoute">
      <IndexAddIcon />

      {{ $t('quote_type.add') }}
    </router-link> -->

    <DataStatusBuilder
      :controller="state"
      :on-retry="
        async () => await fetchQuoteTypes(route.query.page ? Number(route.query.page) : 1, word)
      "
    >
      <template #success="{ data }">
        <div class="table-frame">
          <AppTable
            :headers="headers"
            :items="data as QuoteTypeModel[]"
            :initial-sort-key="sortBy"
            :initial-sort-direction="sortDirection"
            show-index
            hoverable
            striped
            reorderable
            @sort="onSort"
            @reorder="onReorder"
          >
            <template #cell-title="{ item }">
              {{ item?.title }}
            </template>

            <template #cell-typeCode="{ item }">
              <span class="type-code" dir="ltr">
                {{ item?.typeCode || $t('not_available') }}
              </span>
            </template>

            <template #cell-quoteTypeChildrenCount="{ item }">
              {{ item?.quoteTypeChildrenCount }}
            </template>

            <template #actions="{ item }">
              <div class="row-actions">
                <ChangeStatusButton
                  :id="item.id!"
                  :key="`${item.id}-${item.status}`"
                  :initial-is-active="Boolean(item.status)"
                  :type="StatusTypeEnum.QUOTE_TYPE"
                  @reload="
                    async () =>
                      await fetchQuoteTypes(route.query.page ? Number(route.query.page) : 1, word)
                  "
                />
                <router-link
                  class="action-btn edit"
                  :to="`${routePrefix}/quote-types/edit/${item.id}`"
                >
                  <EditIcon />
                </router-link>
              </div>
            </template>
          </AppTable>
        </div>

        <Pagination
          :pagination="controller.pagination.value as any"
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

          <h3>{{ $t('quote_type.empty_title') }}</h3>

          <p>
            {{ $t('quote_type.empty_description') }}
          </p>

          <router-link :to="formRoute" class="btn btn-primary">
            <IndexAddIcon />

            {{ $t('quote_type.add') }}
          </router-link>
        </div>
      </template>

      <template #loader>
        <div class="table-loading">{{ $t('common.loading') }}</div>
      </template>
    </DataStatusBuilder>
  </div>
</template>

<style scoped lang="scss">
.quote-type-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.page-info {
  width: 100%;
}

.page-info h4 {
  margin: 0;
}

.page-info p {
  margin: 0.35rem 0 0;
  color: var(--gray-5);
}

.toolbar {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 1rem;
  box-sizing: border-box;
}

.search-field {
  display: flex;
  align-items: center;
  width: 50%;
  flex: 0 0 40%;
  min-width: 0;
}

.search-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-inline-end: 0.5rem;
}

.search-input {
  width: 100%;
  min-width: 0;
}

.toolbar .btn-primary {
  margin-inline-start: auto;
  flex-shrink: 0;
  white-space: nowrap;
}

.row-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.type-code {
  display: inline-flex;
  padding: 0.25rem 0.6rem;
  color: var(--gray-700);
  background: var(--gray-100);
  border-radius: var(--radius-full);
  font-family: monospace;
  font-size: var(--xs-size);
  font-weight: 600;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 3rem 1rem;
  text-align: center;
}

.empty-state p {
  margin: 0;
  color: var(--gray-5);
}

.table-loading {
  padding: 2rem;
  text-align: center;
  color: var(--gray-5);
}

@media (max-width: 768px) {
  .toolbar {
    gap: 0.75rem;
  }

  .toolbar .btn-primary {
    margin-inline-start: auto;
  }
}
</style>
