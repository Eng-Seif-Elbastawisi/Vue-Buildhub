<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
import Pagination from '@/shared/HelpersComponents/Pagination.vue';
import { useRoute, useRouter } from 'vue-router';
import TableSkelaton from '@/shared/HelpersComponents/TableSkelaton.vue';
import DeleteDialog from '@/shared/HelpersComponents/dialog/DeleteDialog.vue';
import IndexDelete from '@/shared/icons/DocaumentType/IndexDelete.vue';
import Dialog from 'primevue/dialog';
import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
import MaterialController from '../controllers/materials.controller.ts';
import IndexMaterialParams from '../../core/params/index.materials.params.ts';
import type MaterialsModel from '../../core/models/materials.model.ts';
import DeleteMaterialParams from '../../core/params/delete.materials.params.ts';
import { UnitTypeEnum } from '../../core/constant/unit.type.enum.ts';


const controller = MaterialController.getInstance();
const state = computed(() => controller.listState.value);
const router = useRouter();
const route = useRoute();
// const date = ref();


const headers: TableHeader[] = [
  { key: 'brandId', label: 'brandId', width: '10%' },
  { key: 'translations', label: 'title', width: '35%', sortable: true },
  { key: 'price', label: 'price', width: '25%' },
  { key: 'unit', label: 'unit', width: '25%' },
];

const perPage = ref(10);
const word = ref('');

const fetchMaterial = async (
  page: number = 1,
  searchWord: string = '',
) => {
  await controller.fetchList(
    new IndexMaterialParams(
      searchWord,
      route.query.page ? Number(route.query.page) : page,
      perPage.value,
      1,
    ),
  );
};

// const Search = debounce(() => {
//   router.push({
//     query: {
//       ...route.query,
//       page: Number(route.query.page ?? 1),
//       word: word.value || undefined,
//     },
//   });
//   fetchSuppliers(1, word.value);
// });

const onPageChange = (page: number) => {
  fetchMaterial(page);
  router.push({
    query: { ...route.query, page: String(page), word: word.value },
  });
};

const onPerPageChange = (count: number) => {
  perPage.value = count;
  fetchMaterial(1);
};

onMounted(async () => {
  if (route.query.word) {
    word.value = String(route.query.word);
  }
  await fetchMaterial(route.query.page ? Number(route.query.page) : 1, word.value);
});

const deleteMaterial = async (id: number) => {
  await controller.delete(new DeleteMaterialParams({ material_id: id }));
  await fetchMaterial();
};

// const FormStore = useFormsStore();
// const formRoute = computed(() => '/Suppliers/add');

// const isDraft = computed(() => {
//   const data = FormStore?.formData[formRoute.value] ?? {};
//   return Object.keys(data).length === 0 || Object.values(data).every((v) => v == null);
// });
const deleteDialogTitle = ref('Are you sure you want to remove this Brand?');
const deleteDialogMessage = ref(
  'Deleting this Brand will remove all related data. This action is irreversible, and the Brand must be created again if needed.',
);

const visible = ref(false);
const title = ref('');
const equipment = ref(null);
const equipmentOptions = Object.entries(UnitTypeEnum).map(
  ([title, id]) => ({
    id,
    title,
  }),
);
</script>

<template>
  <div class="document-page">
    <h4 class="document-index-title">{{ $t('Brands') }}</h4>
    <p class="document-index-dexription">
      {{ $t('Manage and organize all uploaded documents in one place') }}
    </p>
    <div class="badge">{{ $t('All Brands') }}</div>
    <div class="index-header">
      <div class="toolbar">
        <!-- <div class="search-field">
          <span class="search-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input v-model="word" :placeholder="$t('search_suppliers')" class="search-input" type="text"
            @input="Search" />
        </div> -->
      </div>
      <div class="btns">
        <button class="btn btn-secondary" @click="visible = true">{{ $t('add_Brand') }}</button>
        <Dialog v-model:visible="visible"
          :pt="{ root: 'filter-dialog', header: 'dialog-header', content: 'dialog-body', }" modal
          :style="{ width: '45rem' }">
          <template #header>
            <h6> {{ $t('add_Brand') }}</h6>
          </template>
          <div class="all_inputs">
            <div class="group">

              <div class="field-group col-span-2">
                <label class="field-label" for="name">{{ $t(`brand title`) }}</label>
                <div class="input-wrap">
                  <input id="title" v-model="title" type="text" placeholder="Enter brand title" class="field-input"
                    @input="updateData" />
                </div>
              </div>
              <div class="field-group">
                <UpdatedCustomInputSelect id="doc-branch" :label="`material type`" :static-options="equipmentOptions"
                  v-model="materialType" :placeholder="$t('Enter material type')" :reload="true"
                  @update:model-value="handleMaterialTypeChange($event)" />
              </div>
            </div>
          </div>
          <div class="save_button">
            <button> {{ $t('Save') }}</button>
          </div>
        </Dialog>
      </div>
    </div>

    <DataStatusBuilder :controller="state" :on-retry="async () => await fetchMaterial()">
      <template #success="{ data }">
        <div class="table-frame">
          <AppTable :headers="headers" :items="data as MaterialsModel[]" selectable show-index hoverable striped>
            <template #cell-Suppliers="{ item }">
              {{ item.translations.title ?? 'N/A' }}
            </template>
            <template #actions="{ item }">
              <div class="row-actions">
                <router-link class="action-btn edit" :to="`/Brand/edit/${item.id}`" title="Edit">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </router-link>

                <DeleteDialog :title="deleteDialogTitle" :message="deleteDialogMessage" :hasbtn="true"
                  @delete="deleteMaterial(item.id!)">
                  <template #btn>
                    <IndexDelete />
                  </template>
                </DeleteDialog>
              </div>
            </template>
          </AppTable>
        </div>

        <Pagination :pagination="controller.pagination.value" @change-page="onPageChange"
          @count-per-page="onPerPageChange" />
      </template>

      <template #empty>
        <div class="empty-state">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"
            stroke-linecap="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <h3>{{ $t('no_Suppliers_yet') }}</h3>
          <p>{{ $t('add_first_Supplier') }}</p>
          <router-link :to="formRoute" class="btn-add empty-cta">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
              stroke-linecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>{{ $t('add_Supplier') }}</span>
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

<style scoped>
.filter-dialog {
  color: black;
}

.field-group {
  label {
    color: black;
    font-weight: 600;
    font-family: "Medium";
    color: var(--gray-5);
  }
}

.input-wrap {
  input {
    width: 100%;
    padding: 13px var(--md-size);
    border: 1px solid var(--input-border-color) !important;
    border-radius: var(--xl-size-3) !important;
    font-size: var(--sm-size);
    color: var(--Gray-6);
    background: var(--BgWhite) !important;
    outline: none;
    transition: all .25s ease;
  }
}

.save_button {
  button {
    background-color: #2563eb;
    color: white;
    padding: 1rem;
    border-radius: var(--xl-size-3);
  }
}

.dialog-header {
  h6 {
    color: black;
    font-size: 18px;
    font-weight: 600;
  }
}

.p-dialog-title {
  color: black !important;
}

.all_inputs {
  .group {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
    align-items: end;
  }

  .form_group {
    display: flex;
    flex-direction: column;
    gap: .5rem;

    label {
      color: black;
    }

    input {
      width: 100%;
      padding: var(--xs-size) var(--md-size);
      border: 1px solid var(--input-border-color) !important;
      border-radius: var(--xl-size-3) !important;
      font-size: var(--sm-size);
      color: var(--Gray-6);
      background: var(--BgWhite) !important;
      outline: none;
      transition: all .25s ease;
    }
  }
}


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
