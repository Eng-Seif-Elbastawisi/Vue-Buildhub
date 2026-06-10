<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
import Pagination from '@/shared/HelpersComponents/Pagination.vue';
import { useRoute, useRouter } from 'vue-router';
import { debounce } from '@/base/Presentation/Utils/debouced';
import { useFormsStore } from '@/stores/formsStore';
import IndexDocumentParams from '../../core/params/index.document.params';
import DocumentController from '../controllers/document.controller';
import DeleteDocumentParams from '../../core/params/delete.document.params';
import type DocumentModel from '../../core/models/document.model';
import IndexAddIcon from '@/shared/icons/IndexAddIcon.vue';
import DocumentTypeDialog from '../subComponent/DocumentTypeDialog.vue';
import DeleteDialog from '@/base/Presentation/Dialogs/MainDialogs/DeleteDialog.vue';
import IndexDelete from '@/shared/icons/DocaumentType/IndexDelete.vue';
import FilterDialog from '@/shared/HelpersComponents/FilterDialog/FilterDialog.vue';
import DatePicker from 'primevue/datepicker';
import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
import IndexDocumentTypeParams from '../../core/params/documntType/index.document.type.params';
import DocumentTypeController from '../controllers/DocumentType/document.type.controller';
import type TitleInterface from '@/base/Data/Models/titleInterface';
import TableSkelaton from '@/shared/HelpersComponents/TableSkelaton.vue';

const controller = DocumentController.getInstance();
const state = computed(() => controller.listState.value);
const router = useRouter();
const route = useRoute();
const date = ref();


const headers: TableHeader[] = [
  { key: 'title', label: 'Title', width: '50%', sortable: true },
  { key: 'doecumentType', label: 'Document Type', width: '50%' },
];

const perPage = ref(10);
const word = ref('');

const fetchDocuments = async (
  page: number = 1,
  searchWord: string = '',
  date?: string,
  documentTypeId?: number,
) => {
  // console.log(`vvvvvvvvvvvvvvvvv`, date, documentTypeId);
  await controller.fetchList(
    new IndexDocumentParams(
      searchWord,
      route.query.page ? Number(route.query.page) : page,
      perPage.value,
      1,
      date ? date : undefined,
      documentTypeId ? documentTypeId : undefined,
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
  fetchDocuments(1, word.value);
});

const onPageChange = (page: number) => {
  fetchDocuments(page);
  router.push({
    query: { ...route.query, page: String(page), word: word.value },
  });
};

const onPerPageChange = (count: number) => {
  perPage.value = count;
  fetchDocuments(1);
};

onMounted(async () => {
  if (route.query.word) {
    word.value = String(route.query.word);
  }
  await fetchDocuments(route.query.page ? Number(route.query.page) : 1, word.value);
});

const deleteDocument = async (id: number) => {
  await controller.delete(new DeleteDocumentParams({ document_id: id }));
  await fetchDocuments();
};

const FormStore = useFormsStore();
const formRoute = computed(() => '/documents/add');

const isDraft = computed(() => {
  const data = FormStore?.formData[formRoute.value] ?? {};
  return Object.keys(data).length === 0 || Object.values(data).every((v) => v == null);
});
const deleteDialogTitle = ref('Are you sure you want to remove this document type?');
const deleteDialogMessage = ref(
  'Deleting this document will remove all related data. This action is irreversible, and the document must be created again if needed.',
);
const indexDocumentTypeParams = new IndexDocumentTypeParams();
const documentTypeController = DocumentTypeController.getInstance();
const selectedDocumentType = ref<TitleInterface<number> | null>(null);
const updateData = (data: TitleInterface<number>) => {
  selectedDocumentType.value = data;
};
const FilterDialogShow = ref<boolean>(false);
const ApplayFilter = () => {
  if (date.value || selectedDocumentType.value?.id) {
    fetchDocuments(1, word.value, date.value, selectedDocumentType.value?.id);
  }
  FilterDialogShow.value = false;
};
const CloseFiletrDialog = () => {
  FilterDialogShow.value = false;
};
</script>

<template>
  <div class="document-page">
    <h4 class="document-index-title">{{ $t('Documents') }}</h4>
    <p class="document-index-dexription">
      {{ $t('Manage and organize all uploaded documents in one place') }}
    </p>
    <div class="badge">{{ $t('All Documents') }}</div>
    <div class="index-header">
      <div class="toolbar">
        <div class="search-field">
          <span class="search-icon">
            <svg
width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input
v-model="word" :placeholder="$t('search_documents')" class="search-input" type="text"
            @input="Search" />
        </div>
      </div>
      <div class="btns">
        <FilterDialog v-model="FilterDialogShow">
          <template #content>
            <div class="date-remove">
              <h6>{{ $t('date of remove') }}</h6>
              <DatePicker v-model="date" class="date-model" :placeholder="$t('Date Remove')" />
            </div>
            <div class="date-remove">
              <UpdatedCustomInputSelect
id="documentType" :label="`document type`" :params="indexDocumentTypeParams"
                :controller="documentTypeController" :model-value="selectedDocumentType"
                :placeholder="$t('Document Type')" @update:model-value="updateData" />
            </div>
            <div class="date-remove">
              <UpdatedCustomInputSelect
id="documentType" :label="`added by`" :params="indexDocumentTypeParams"
                :controller="documentTypeController" :model-value="selectedDocumentType"
                :placeholder="$t('Student Name')" @update:model-value="updateData" />
            </div>
            <div class="filter-action">
              <button class="btn btn-cancel" @click="CloseFiletrDialog">{{ $t('Reset') }}</button>
              <button class="btn btn-primary" @click="ApplayFilter">{{ $t('apply') }}</button>
            </div>
          </template>
        </FilterDialog>
        <router-link :to="formRoute" class="btn btn-secondary">
          <IndexAddIcon />
          <span>{{ isDraft ? $t('add_document') : $t('continue_adding') }}</span>
        </router-link>

        <DocumentTypeDialog />
      </div>
    </div>

    <DataStatusBuilder :controller="state" :on-retry="async () => await fetchDocuments()">
      <template #success="{ data }">
        <div class="table-frame">
          <AppTable :headers="headers" :items="data as DocumentModel[]" selectable show-index hoverable striped>
            <template #cell-doecumentType="{ item }">
              {{ item.doecumentType?.title ?? 'N/A' }}
              <!-- {{ DOCUMENT_TYPE_LABELS[item.id] ?? item.documentTypeId }} -->
            </template>
            <template #actions="{ item }">
              <div class="row-actions">
                <router-link
class="action-btn edit" :to="`/documents/edit/${item.id}`"
                  title="Edit">
                  <svg
width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </router-link>

                <DeleteDialog
:title="deleteDialogTitle" :message="deleteDialogMessage" :hasbtn="true"
                  @delete="deleteDocument(item.id!)">
                  <template #btn>
                    <IndexDelete />
                  </template>
                </DeleteDialog>
              </div>
            </template>
          </AppTable>
        </div>

        <Pagination
:pagination="controller.pagination.value" @change-page="onPageChange"
          @count-per-page="onPerPageChange" />
      </template>

      <template #empty>
        <div class="empty-state">
          <svg
width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"
            stroke-linecap="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <h3>{{ $t('no_documents_yet') }}</h3>
          <p>{{ $t('add_first_document') }}</p>
          <router-link :to="formRoute" class="btn-add empty-cta">
            <svg
width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
              stroke-linecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>{{ $t('add_document') }}</span>
          </router-link>
        </div>
      </template>
      <template #loader>
        <TableSkelaton :rows="5" :columns="headers.length" :has-actions="true" :show-index="true" :selectable="true">
        </TableSkelaton>
      </template>
      <template #failed>
        ing
      </template>
    </DataStatusBuilder>
  </div>
</template>

<style scoped lang="scss">
:deep(.p-datepicker) {
  width: 100%;
}

:deep(.p-inputtext) {
  width: 100%;
  background-color: white;
  border: 1px solid rgba(230, 230, 230, 1);
  border-radius: 20px;
  color: black !important;
}

.date-remove {
  border-bottom: 2px dashed rgba(230, 230, 230, 1);
  padding-bottom: 1rem;
  margin: 1rem 0;

  &::placeholder {
    color: red !important;
  }

  h6 {
    color: rgba(75, 75, 75, 1);
    font-family: medium;
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  :deep(.input-label) {
    label {
      color: black !important;
    }
  }
}
</style>
