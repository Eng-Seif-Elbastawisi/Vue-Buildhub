<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
import IndexPageHeader from '@/shared/IndexPageHeader/IndexPageHeader.vue';
import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
import { deleteSelectedRows } from '@/shared/HelpersComponents/deleteSelectedRows';
import Pagination from '@/shared/HelpersComponents/Pagination.vue';
import TableSkelaton from '@/shared/HelpersComponents/TableSkelaton.vue';
import DeleteDialog from '@/base/Presentation/Dialogs/MainDialogs/DeleteDialog.vue';
import { useUserStore } from '@/stores/user';
import { debounce } from '@/base/Presentation/Utils/debouced';
import AttachmentTypeController from '../controllers/attachment.type.controller';
import IndexAttachmentTypeParams from '../../core/params/index.attachment.type.params';
import DeleteAttachmentTypeParams from '../../core/params/delete.attachment.type.params';
import type AttachmentTypeModel from '../../core/models/attachment.type.model';

const controller = AttachmentTypeController.getInstance();
const state = computed(() => controller.listState.value);

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { user } = useUserStore();

const perPage = ref(10);
const word = ref('');

const headers = computed<TableHeader[]>(() => [
  {
    key: 'title',
    label: 'title',
    width: '80%',
    sortable: true,
  },
]);

const fetchAttachmentTypes = async (page: number = 1, searchWord: string = '') => {
  await controller.fetchList(
    new IndexAttachmentTypeParams(
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
      page: 1,
      word: word.value || undefined,
    },
  });
  fetchAttachmentTypes(1, word.value);
});

const onPageChange = async (page: number) => {
  await router.push({
    query: {
      ...route.query,
      page,
      word: word.value || undefined,
    },
  });
  await fetchAttachmentTypes(page, word.value);
};

const onPerPageChange = async (newPerPage: number) => {
  perPage.value = newPerPage;
  await fetchAttachmentTypes(1, word.value);
};

const deleteAttachmentType = async (id: number) => {
  await controller.delete(new DeleteAttachmentTypeParams(id));
  await fetchAttachmentTypes(
    route.query.page ? Number(route.query.page) : 1,
    word.value,
  );
};

const deleteSelectedAttachmentTypes = (attachmentTypes: AttachmentTypeModel[]) =>
  deleteSelectedRows(
    attachmentTypes,
    (id) => controller.delete(new DeleteAttachmentTypeParams(id)),
    () => fetchAttachmentTypes(route.query.page ? Number(route.query.page) : 1, word.value),
  );

const routePrefix = computed(() =>
  user?.type === 1 ? '/admin' : '/organization',
);

onMounted(async () => {
  word.value = (route.query.word as string) || '';
  await fetchAttachmentTypes(
    route.query.page ? Number(route.query.page) : 1,
    word.value,
  );
});
</script>

<template>
  <div class="attachment-types-page">
    <IndexPageHeader
      :title="t('attachment_types')"
      :subtitle="t('attachment_type.list_description')"
    >
      <template #search>
        <div class="search-box">
          <span class="search-icon">
            <svg
              width="16"
              height="16"
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
            :placeholder="$t('search_attachment_type')"
            class="search-input"
            type="text"
            @input="Search"
          />
        </div>
      </template>

      <template #actions>
        <router-link class="btn btn-primary" :to="`${routePrefix}/attachment-types/add`">
          {{ $t('attachment_type.add') }}
        </router-link>
      </template>
    </IndexPageHeader>

    <DataStatusBuilder
      :controller="state"
      :on-retry="
        async () => {
          await fetchAttachmentTypes();
        }
      "
    >
      <template #success="{ data }">
        <AppTable
          :headers="headers"
          :items="data as AttachmentTypeModel[]"
          :bulk-delete="deleteSelectedAttachmentTypes"
          selectable
          show-index
          hoverable
          striped
        >
          <template #cell-title="{ item }">
            <span>{{ item?.title || '-' }}</span>
          </template>

          <template #actions="{ item }">
            <div class="row-actions">
              <router-link
                class="action-btn edit"
                :to="`${routePrefix}/attachment-types/edit/${item.id}`"
                :title="$t('edit')"
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
                :title="$t('Are you sure you want to remove this item?')"
                :message="$t('This action cannot be undone.')"
                :hasbtn="true"
                @delete="deleteAttachmentType(item.id!)"
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
          <h3>{{ $t('attachment_type.empty_title') }}</h3>
          <p>{{ $t('attachment_type.empty_description') }}</p>
          <router-link
            class="btn btn-primary"
            :to="`${routePrefix}/attachment-types/add`"
          >
            {{ $t('attachment_type.add') }}
          </router-link>
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
.attachment-types-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header__content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.page-header__titles h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--black-text);
  margin-bottom: 0.25rem;
}

.page-header__titles p {
  color: var(--gray-5);
  font-size: 0.875rem;
}

.page-header__actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-box {
  position: relative;
  min-width: 250px;
}

.search-icon {
  position: absolute;
  inset-inline-start: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-4);
  display: flex;
}

.search-input {
  width: 100%;
  padding: 0.625rem 1rem 0.625rem 2.5rem;
  border-radius: 9999px;
  border: 1px solid var(--border-weak);
  outline: none;
  background-color: var(--white);
  font-size: 0.875rem;
  transition: border-color 0.2s;

  &:focus {
    border-color: var(--PrimaryColor);
  }
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background-color: var(--PrimaryColor);
  color: #fff;
  border-radius: 9999px;
  font-weight: 500;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
}

.row-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--border-weak);
  background: var(--white);
  color: var(--gray-6);
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;

  &:hover {
    background: var(--gray-1);
    color: var(--PrimaryColor);
  }

  &.delete:hover {
    color: var(--danger);
    border-color: var(--danger);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  gap: 1rem;

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
  }

  p {
    color: var(--gray-5);
    max-width: 400px;
  }
}
</style>
