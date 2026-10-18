<script setup lang="ts">
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
  import { computed, onMounted, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRoute, useRouter } from 'vue-router';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
  import Pagination from '@/shared/HelpersComponents/Pagination.vue';
  import TableSkelaton from '@/shared/HelpersComponents/TableSkelaton.vue';
  import IndexPageHeader from '@/shared/IndexPageHeader/IndexPageHeader.vue';
  import DeleteDialog from '@/base/Presentation/Dialogs/MainDialogs/DeleteDialog.vue';
  import type ProjectItemModel from '../../core/models/project.Item.model';
  import DeleteProjectItemParams from '../../core/params/delete.project.Item.params';
  import { useUserStore } from '@/stores/user';
  import ProjectItemController from '../controllers/project.Item.controller';
  import IndexProjectItemParams from '../../core/params/index.project.Item.params';
  import { debounce } from '@/base/Presentation/Utils/debouced';
  import IndexAddIcon from '@/shared/icons/IndexAddIcon.vue';
  import { ProjectItemPriceEnum } from '../../core/constant/project.item.Price.enum';

  const controller = ProjectItemController.getInstance();
  const state = computed(() => controller.listState.value);
  const router = useRouter();
  const route = useRoute();
  const { t } = useI18n();
  const perPage = ref(10);
  const word = ref('');

  const pricingMethodKeys = Object.fromEntries(
    Object.entries(ProjectItemPriceEnum).map(([key, id]) => [id, key]),
  ) as Record<ProjectItemPriceEnum, string>;

  const headers: TableHeader[] = [
    { key: 'item_id', label: 'project_item.item', width: '35%', sortable: true },
    { key: 'quantity', label: 'project_item.quantity', width: '15%' },
    { key: 'price', label: 'project_item.price', width: '15%' },
    { key: 'pricing_method', label: 'project_item.pricing_method', width: '25%' },
    { key: 'project_floor_id', label: 'project_item.project_floor', width: '10%' },
  ];

  const itemTitleFor = (item: ProjectItemModel) => item.item?.title ?? '-';
  const pricingMethodFor = (item: ProjectItemModel) => {
    const key = pricingMethodKeys[item.pricing_method];

    return key ? t(`project_item.pricing_methods.${key}`) : '-';
  };

  const fetchItems = async (page: number = 1, searchWord: string = '') => {
    await controller.fetchList(
      new IndexProjectItemParams(
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

    fetchItems(1, word.value);
  });

  const onPageChange = (page: number) => {
    void fetchItems(page);
    void router.push({
      query: { ...route.query, page: String(page), word: word.value || undefined },
    });
  };

  const onPerPageChange = (count: number) => {
    perPage.value = count;
    void fetchItems(1);
  };

  const deleteItem = async (id: number) => {
    await controller.delete(new DeleteProjectItemParams({ project_item_id: id }));
    await fetchItems();
  };

  onMounted(async () => {
    word.value = route.query.word ? String(route.query.word) : '';
    await fetchItems(route.query.page ? Number(route.query.page) : 1, word.value);
  });
  const { user } = useUserStore();
</script>

<template>
  <StandardFormLayout mode="edit" class="item-page">
    <IndexPageHeader
      :title="$t('project_item.index.title')"
      :subtitle="$t('project_item.index.description')"
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
            :placeholder="$t('project_item.search_placeholder')"
            class="search-input workspace-control"
            type="text"
            @input="Search"
          />
        </div>
      </template>
      <template #actions>
        <router-link
          class="btn btn-primary"
          :to="user?.type === 1 ? '/admin/project-item/add' : '/organization/project-item/add'"
        >
          <IndexAddIcon /> {{ $t('project_item.add') }}
        </router-link>
      </template>
    </IndexPageHeader>

    <DataStatusBuilder :controller="state" :on-retry="async () => await fetchItems()">
      <template #success="{ data }">
        <AppTable
          :headers="headers"
          :items="data as ProjectItemModel[]"
          selectable
          show-index
          hoverable
          striped
        >
          <template #cell-item_id="{ item }">{{ itemTitleFor(item) }}</template>
          <template #cell-pricing_method="{ item }">{{ pricingMethodFor(item) }}</template>
          <template #actions="{ item }">
            <div class="row-actions">
              <router-link
                class="action-btn edit"
                :to="
                  user?.type === 1
                    ? `/admin/project-item/edit/${item.id}`
                    : `/organization/project-item/edit/${item.id}`
                "
                :title="$t('project_item.edit')"
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
                :title="$t('project_item.delete_title')"
                :message="$t('project_item.delete_message')"
                :hasbtn="true"
                @delete="deleteItem(item.id!)"
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
          <h3>{{ $t('project_item.empty_title') }}</h3>
          <p>{{ $t('project_item.empty_description') }}</p>
          <router-link
            class="btn btn-primary"
            :to="user?.type === 1 ? '/admin/project-item/add' : '/organization/project-item/add'"
            >{{ $t('project_item.add') }}</router-link
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
  </StandardFormLayout>
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
