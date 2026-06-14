<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
import Pagination from '@/shared/HelpersComponents/Pagination.vue';
import { useRoute, useRouter } from 'vue-router';
import { debounce } from '@/base/Presentation/Utils/debouced';
import { useFormsStore } from '@/stores/formsStore';
import TableSkelaton from '@/shared/HelpersComponents/TableSkelaton.vue';
import SuppliersController from '../controllers/Suppliers.controller';
import IndexSuppliersParams from '../../core/params/index.Suppliers.params.ts';
import DeleteSuppliersParams from '../../core/params/delete.Suppliers.params.ts';
import type SuppliersModel from '../../core/models/Suppliers.model.ts';
import DeleteDialog from '@/shared/HelpersComponents/dialog/DeleteDialog.vue';
import IndexDelete from '@/shared/icons/DocaumentType/IndexDelete.vue';
import Dialog from 'primevue/dialog';


const controller = SuppliersController.getInstance();
const state = computed(() => controller.listState.value);
const router = useRouter();
const route = useRoute();
// const date = ref();


const headers: TableHeader[] = [
  { key: 'Suppliers', label: 'Suppliers', width: '30%', sortable: true },
  { key: 'Specialization', label: 'Specialization', width: '30%' },
  { key: 'phone', label: 'Phone', width: '20%' },
  { key: 'materials', label: 'Materials', width: '20%' },
];

const perPage = ref(10);
const word = ref('');

const fetchSuppliers = async (
  page: number = 1,
  searchWord: string = '',
  date?: string,
  documentTypeId?: number,
) => {
  // console.log(`vvvvvvvvvvvvvvvvv`, date, documentTypeId);
  await controller.fetchList(
    new IndexSuppliersParams(
      searchWord,
      route.query.page ? Number(route.query.page) : page,
      perPage.value,
      1,
      date ? date : undefined,
      documentTypeId ? documentTypeId : undefined,
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
  fetchSuppliers(page);
  router.push({
    query: { ...route.query, page: String(page), word: word.value },
  });
};

const onPerPageChange = (count: number) => {
  perPage.value = count;
  fetchSuppliers(1);
};

onMounted(async () => {
  if (route.query.word) {
    word.value = String(route.query.word);
  }
  await fetchSuppliers(route.query.page ? Number(route.query.page) : 1, word.value);
});

const deleteSupplier = async (id: number) => {
  await controller.delete(new DeleteSuppliersParams({ suppliers_id: id }));
  await fetchSuppliers();
};

// const FormStore = useFormsStore();
// const formRoute = computed(() => '/Suppliers/add');

// const isDraft = computed(() => {
//   const data = FormStore?.formData[formRoute.value] ?? {};
//   return Object.keys(data).length === 0 || Object.values(data).every((v) => v == null);
// });
const deleteDialogTitle = ref('Are you sure you want to remove this Supplier?');
const deleteDialogMessage = ref(
  'Deleting this Supplier will remove all related data. This action is irreversible, and the Supplier must be created again if needed.',
);
// const selectedSuppliers = ref<TitleInterface<number> | null>(null);
// const FilterDialogShow = ref<boolean>(false);
// const ApplayFilter = () => {
//   if (date.value || selectedSuppliers.value?.id) {
//     fetchSuppliers(1, word.value, date.value, selectedSuppliers.value?.id);
//   }
//   FilterDialogShow.value = false;
// };
// const CloseFiletrDialog = () => {
//   FilterDialogShow.value = false;
// };

const visible = ref(false);
const supplier = ref('');
const Specialization = ref('');
const phone = ref('');
const materials = ref('');
</script>

<template>
  <div class="document-page">
    <h4 class="document-index-title">{{ $t('Suppliers') }}</h4>
    <p class="document-index-dexription">
      {{ $t('Manage and organize all uploaded documents in one place') }}
    </p>
    <div class="badge">{{ $t('All Suppliers') }}</div>
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
        <!-- <FilterDialog v-model="FilterDialogShow">
          <template #content>
            <div class="date-remove">
              <h6>{{ $t('date of remove') }}</h6>
              <DatePicker v-model="date" class="date-model" :placeholder="$t('Date Remove')" />
            </div>
            <div class="filter-action">
              <button class="btn btn-cancel" @click="CloseFiletrDialog">{{ $t('Reset') }}</button>
              <button class="btn btn-primary" @click="ApplayFilter">{{ $t('apply') }}</button>
            </div>
          </template>
        </FilterDialog> -->
        <!-- <router-link :to="formRoute" class="btn btn-secondary">
          <IndexAddIcon />
          <span>{{ isDraft ? $t('add_Supplier') : $t('continue_adding') }}</span>
        </router-link> -->

        <button class="btn btn-secondary" @click="visible = true" >{{ $t('add_Supplier') }}</button>
        <Dialog v-model:visible="visible" modal :header="$t('add_Supplier')" :style="{ width: '45rem' }">
    <!-- <span class="text-surface-500 dark:text-surface-400 block mb-8">{{ $t('Upload your Suppliers and fill in its details') }}</span>
    <div class="flex items-center gap-4 mb-4">
        <label for="username" class="font-semibold w-24">{{ $t('Supplier') }}</label>
        <InputText id="username" class="flex-auto" autocomplete="off" />
    </div>
    <div class="flex items-center gap-4 mb-8">
        <label for="email" class="font-semibold w-24">Email</label>
        <InputText id="email" class="flex-auto" autocomplete="off" />
    </div>
    <div class="flex justify-end gap-2">
        <Button type="button" label="Cancel" severity="secondary" @click="visible = false"></Button>
        <Button type="button" label="Save" @click="visible = false"></Button>
    </div> -->
    <div class="all_inputs"> 
      <div class="group">
        <div class="form_group">
          <label for="Supplier">{{ $t('Supplier Name') }}</label>
          <input v-model="supplier" type="text" >
        </div>
        <div class="form_group">
          <label for="Phone">{{ $t('Specialization') }}</label>
          <input v-model="Specialization" type="text">
        </div>
      </div>
       <div class="group">

         <div class="form_group">
           <label for="materials">{{ $t('phone') }}</label>
           <input v-model="phone" type="text">
         </div>
         <div class="form_group">
           <label for="spacification">{{ $t('Related material') }}</label>
           <input v-model="materials" type="text">
         </div>
       </div>
    </div>
</Dialog>
      </div>
    </div>

    <DataStatusBuilder :controller="state" :on-retry="async () => await fetchSuppliers()">
      <template #success="{ data }">
        <div class="table-frame">
          <AppTable :headers="headers" :items="data as SuppliersModel[]" selectable show-index hoverable striped>
            <template #cell-Suppliers="{ item }">
              {{ item.Suppliers ?? 'N/A' }}
            </template>
            <template #actions="{ item }">
              <div class="row-actions">
                <router-link class="action-btn edit" :to="`/Suppliers/edit/${item.id}`" title="Edit">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </router-link>

                <DeleteDialog :title="deleteDialogTitle" :message="deleteDialogMessage" :hasbtn="true"
                  @delete="deleteSupplier(item.id!)">
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
.p-dialog.filter-dialog{
  
}
.all_inputs{
  .group{
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
.form_group{
display: flex;
flex-direction: column;
gap: 1rem;
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
