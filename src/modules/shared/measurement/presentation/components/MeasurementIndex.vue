<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
import AppTable, {
  type TableHeader,
} from '@/shared/HelpersComponents/AppTable.vue';
import Pagination from '@/shared/HelpersComponents/Pagination.vue';
import { deleteSelectedRows } from '@/shared/HelpersComponents/deleteSelectedRows';
import DeleteDialog from '@/base/Presentation/Dialogs/MainDialogs/DeleteDialog.vue';
import EditIcon from '@/shared/icons/EditIcon.vue';

import { debounce } from '@/base/Presentation/Utils/debouced';

import MeasurementController from '../controllers/measurement.controller.ts';
import DeleteMeasurementParams from '../../core/params/delete.measurement.params.ts';
import IndexMeasurementParams from '../../core/params/index.measurement.params.ts';
import type MeasurementModel from '../../core/models/measurement.model.ts';
import ChangeStatusButton from '@/modules/MainOrganization/ChangeStatus/presentation/components/ChangeStatusButton.vue';
import { StatusTypeEnum } from '@/modules/MainOrganization/ChangeStatus/core/constant/change_status.type.enum.ts';

// -----------------------------------------------------------------------------
// Controller & Router
// -----------------------------------------------------------------------------

const controller = MeasurementController.getInstance();

const router = useRouter();
const route = useRoute();

const state = computed(() => controller.listState.value);


// -----------------------------------------------------------------------------
// Table
// -----------------------------------------------------------------------------

const headers: TableHeader[] = [
  {
    key: 'title',
    label: 'title',
    width: '25%',
    sortable: false,
  },
  {
    key: 'code',
    label: 'code',
    width: '25%',
    sortable: false,
  },
  {
    key: 'symbol',
    label: 'symbol',
    width: '25%',
    sortable: false,
  },
  {
    key: 'precision',
    label: 'precision',
    width: '25%',
    sortable: false,
  },

  // {
  //   key: 'status',
  //   label: 'status',
  //   width: '25%',
  //   sortable: false,
  // },

];



// -----------------------------------------------------------------------------
// State
// -----------------------------------------------------------------------------

const perPage = ref(10);
const word = ref('');

// -----------------------------------------------------------------------------
// Routes
// -----------------------------------------------------------------------------

const routePrefix = computed(() =>
  route.path.startsWith('/admin') ? '/admin' : '/organization',
);

const formRoute = computed(
  () => `${routePrefix.value}/measurement/add`,
);

// -----------------------------------------------------------------------------
// Fetch
// -----------------------------------------------------------------------------

const fetchMeasurements = async (
  page: number = 1,
  searchWord: string = '',
) => {
  await controller.fetchList(
    new IndexMeasurementParams(
      searchWord,
      route.query.page ? Number(route.query.page) : page,
      perPage.value,
    ),
  );
};

// -----------------------------------------------------------------------------
// Search
// -----------------------------------------------------------------------------

const search = debounce(() => {
  router.push({
    query: {
      ...route.query,
      page: Number(route.query.page ?? 1),
      word: word.value || undefined,
    },
  });

  fetchMeasurements(1, word.value);
});

// -----------------------------------------------------------------------------
// Pagination
// -----------------------------------------------------------------------------

const onPageChange = (page: number) => {
  fetchMeasurements(page);

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
  fetchMeasurements(1);
};

// -----------------------------------------------------------------------------
// Delete
// -----------------------------------------------------------------------------

const deleteMeasurement = async (id: number) => {
  await controller.delete(new DeleteMeasurementParams(id));
  await fetchMeasurements();
};

const deleteSelectedMeasurements = (
  measurements: MeasurementModel[],
) =>
  deleteSelectedRows(
    measurements,
    (id) => controller.delete(new DeleteMeasurementParams(id)),
    fetchMeasurements,
  );

// -----------------------------------------------------------------------------
// Lifecycle
// -----------------------------------------------------------------------------

onMounted(async () => {
  if (route.query.word) {
    word.value = String(route.query.word);
  }

  await fetchMeasurements(
    route.query.page ? Number(route.query.page) : 1,
    word.value,
  );
});
</script>

<template>
  <div class="index-measurement-page">
    <!-- Header -->
    <div class="index-header">
      <div class="toolbar">
        <div class="search-field">
          <span class="search-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </span>

          <input v-model="word" class="search-input" type="text" :placeholder="$t('search_measurements')"
            @input="search" />
        </div>
      </div>

      <div class="d-flex justify-end">
        <button class="app-btn btn btn-primary btn--md btn--has-icon btn-save"
          @click="router.push(`${routePrefix}/measurement/add`)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
            stroke-linecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>

          Add measurement
        </button>
      </div>
    </div>

    <!-- Table -->
    <DataStatusBuilder :controller="state" :on-retry="async () => await fetchMeasurements()">
      <template #success="{ data }">
        <div class="table-frame">
          <AppTable :headers="headers" :items="data as MeasurementModel[]" :bulk-delete="deleteSelectedMeasurements"
            selectable show-index hoverable striped>
            <!-- Title -->
            <template #cell-title="{ item }">
              {{ item?.title || '-' }}
            </template>

            <!-- Code -->
            <template #cell-code="{ item }">
              {{ item?.code || '-' }}
            </template>

            <!-- Symbol -->
            <template #cell-symbol="{ item }">
              {{ item?.symbol || '-' }}
            </template>

            <!-- Precision -->
            <template #cell-precision="{ item }">
              {{ item?.precision ?? '-' }}
            </template>

            <!-- <template #cell-status="{ item }">
              {{ item?.status ?? '-' }}
            </template> -->

            <!-- Actions -->
            <template #actions="{ item }">
              <div class="row-actions">
                <!-- Edit -->


                <ChangeStatusButton :id="item.id!" :initialIsActive="item.status === 1 ? true : false"
                  :type="StatusTypeEnum.MEASUREMENT" @reload="fetchMeasurements" />

                <button class="action-btn edit" :title="$t('Edit')" @click="
                  router.push(
                    `${routePrefix}/measurement/edit/${item.id}`,
                  )
                  ">
                  <EditIcon />
                </button>

                <!-- Delete -->
                <DeleteDialog :title="$t(
                  'Are you sure you want to remove this stage?',
                )" :message="$t('This action cannot be undone.')" :hasbtn="true" @delete="deleteMeasurement(item.id!)">
                  <template #btn>
                    <button class="action-btn delete" :title="$t('Delete')">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1.2 2-2 2H7c-.8 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2" />
                      </svg>
                    </button>
                  </template>
                </DeleteDialog>
              </div>
            </template>
          </AppTable>
        </div>

        <!-- Pagination -->
        <Pagination :pagination="controller.pagination.value" @change-page="onPageChange"
          @count-per-page="onPerPageChange" />
      </template>

      <!-- Empty -->
      <template #empty>
        <div class="empty-state">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"
            stroke-linecap="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>

          <h3>
            {{ $t('measurement.empty_title') }}
          </h3>

          <p>
            {{ $t('measurement.empty_description') }}
          </p>

          <router-link :to="formRoute" class="btn-add empty-cta">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
              stroke-linecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>

            <span>
              {{ $t('measurement.add') }}
            </span>
          </router-link>
        </div>
      </template>
    </DataStatusBuilder>
  </div>
</template>
