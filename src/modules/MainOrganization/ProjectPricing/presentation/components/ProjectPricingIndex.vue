<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRoute, useRouter } from 'vue-router';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import IndexPageHeader from '@/shared/IndexPageHeader/IndexPageHeader.vue';
  import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
  import Pagination from '@/shared/HelpersComponents/Pagination.vue';
  import TableSkelaton from '@/shared/HelpersComponents/TableSkelaton.vue';
  import DeleteDialog from '@/base/Presentation/Dialogs/MainDialogs/DeleteDialog.vue';
  import type ProjectPricingModel from '../../core/models/project.pricing.model';
  import DeleteProjectPricingParams from '../../core/params/delete.project.pricing.params';
  import { useUserStore } from '@/stores/user';
  import ProjectPricingController from '../controllers/project.pricing.controller';
  import IndexProjectPricingParams from '../../core/params/index.project.pricing.params';
  import { debounce } from '@/base/Presentation/Utils/debouced';
  import IndexAddIcon from '@/shared/icons/IndexAddIcon.vue';
  import { ProjectPricingDiscountEnum } from '../../core/constant/project.pricing.discount.enum';

  const controller = ProjectPricingController.getInstance();
  const state = computed(() => controller.listState.value);
  const router = useRouter();
  const route = useRoute();
  const { t } = useI18n();
  const perPage = ref(10);
  const word = ref('');

  const discountTypeKeys = Object.fromEntries(
    Object.entries(ProjectPricingDiscountEnum).map(([key, id]) => [id, key]),
  ) as Record<ProjectPricingDiscountEnum, string>;

  const headers: TableHeader[] = [
    { key: 'total_tax', label: 'project_pricing.total_tax', width: '30%', sortable: true },
    { key: 'discount_type', label: 'project_pricing.discount_type', width: '35%' },
    { key: 'discount_value', label: 'project_pricing.discount_value', width: '35%' },
  ];

  const discountTypeFor = (item: ProjectPricingModel) => {
    if (!item.discount_type) return '-';
    const key = discountTypeKeys[item.discount_type];

    return key ? t(`project_pricing.discount_types.${key}`) : '-';
  };

  const fetchPricing = async (page: number = 1, searchWord: string = '') => {
    await controller.fetchList(
      new IndexProjectPricingParams(
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

    fetchPricing(1, word.value);
  });

  const onPageChange = (page: number) => {
    void fetchPricing(page);
    void router.push({
      query: { ...route.query, page: String(page), word: word.value || undefined },
    });
  };

  const onPerPageChange = (count: number) => {
    perPage.value = count;
    void fetchPricing(1);
  };

  const deletePricing = async (id: number) => {
    await controller.delete(new DeleteProjectPricingParams({ project_pricing_id: id }));
    await fetchPricing();
  };

  onMounted(async () => {
    word.value = route.query.word ? String(route.query.word) : '';
    await fetchPricing(route.query.page ? Number(route.query.page) : 1, word.value);
  });
  const { user } = useUserStore();
</script>

<template>
  <div class="item-page">
    <IndexPageHeader
      :title="$t('project_pricing.index.title')"
      :subtitle="$t('project_pricing.index.description')"
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
            :placeholder="$t('project_pricing.search_placeholder')"
            class="search-input"
            type="text"
            @input="Search"
          />
        </div>
      </template>

      <template #actions>
        <router-link
          class="btn btn-primary"
          :to="
            user?.type === 1 ? '/admin/project-pricing/add' : '/organization/project-pricing/add'
          "
        >
          <IndexAddIcon /> {{ $t('project_pricing.add') }}
        </router-link>
      </template>
    </IndexPageHeader>

    <DataStatusBuilder :controller="state" :on-retry="async () => await fetchPricing()">
      <template #success="{ data }">
        <AppTable
          :headers="headers"
          :items="data as ProjectPricingModel[]"
          selectable
          show-index
          hoverable
          striped
        >
          <template #cell-discount_type="{ item }">{{ discountTypeFor(item) }}</template>
          <template #actions="{ item }">
            <div class="row-actions">
              <router-link
                class="action-btn edit"
                :to="
                  user?.type === 1
                    ? `/admin/project-pricing/edit/${item.id}`
                    : `/organization/project-pricing/edit/${item.id}`
                "
                :title="$t('project_pricing.edit')"
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
                :title="$t('project_pricing.delete_title')"
                :message="$t('project_pricing.delete_message')"
                :hasbtn="true"
                @delete="deletePricing(item.id!)"
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
        <Pagination
          :pagination="controller.pagination.value"
          @change-page="onPageChange"
          @count-per-page="onPerPageChange"
        />
      </template>

      <template #empty>
        <div class="empty-state">
          <h3>{{ $t('project_pricing.empty_title') }}</h3>
          <p>{{ $t('project_pricing.empty_description') }}</p>
          <router-link
            class="btn btn-primary"
            :to="
              user?.type === 1 ? '/admin/project-pricing/add' : '/organization/project-pricing/add'
            "
            >{{ $t('project_pricing.add') }}</router-link
          >
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
