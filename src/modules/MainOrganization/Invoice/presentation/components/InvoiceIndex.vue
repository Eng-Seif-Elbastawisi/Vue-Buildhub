<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRoute, useRouter } from 'vue-router';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
  import Pagination from '@/shared/HelpersComponents/Pagination.vue';
  import TableSkelaton from '@/shared/HelpersComponents/TableSkelaton.vue';
  import DeleteDialog from '@/base/Presentation/Dialogs/MainDialogs/DeleteDialog.vue';
  import { debounce } from '@/base/Presentation/Utils/debouced';
  import { useUserStore } from '@/stores/user';
  import IndexAddIcon from '@/shared/icons/IndexAddIcon.vue';
  import DeleteInvoiceParams from '../../core/params/delete.invoice.params';
  import IndexInvoiceParams from '../../core/params/index.invoice.params';
  import type InvoiceModel from '../../core/models/invoice.model';
  import {
    InvoiceStatusClassNames,
    InvoiceStatusEnum,
    InvoiceStatusLabelKeys,
    normalizeInvoiceStatus,
  } from '../../core/constant/invoice.status.enum';
  import InvoiceController from '../controllers/invoice.controller';

  const controller = InvoiceController.getInstance();
  const state = computed(() => controller.listState.value);
  const router = useRouter();
  const route = useRoute();
  const { t } = useI18n();
  const { user } = useUserStore();
  const perPage = ref(10);
  const word = ref('');

  const headers: TableHeader[] = [
    { key: 'invoice_number', label: 'invoice.invoice_number', width: '18%', sortable: true },
    { key: 'project', label: 'invoice.project', width: '20%' },
    { key: 'invoice_date', label: 'invoice.invoice_date', width: '15%', sortable: true },
    { key: 'invoice_amount', label: 'invoice.invoice_amount', width: '15%', sortable: true },
    { key: 'status', label: 'invoice_show.status', width: '14%' },
    { key: 'notes', label: 'invoice.notes', width: '18%' },
  ];

  const basePath = computed(() => (user?.type === 1 ? '/admin/invoice' : '/organization/invoice'));
  const showBasePath = computed(() =>
    user?.type === 1 ? '/admin/invoices' : '/organization/invoices',
  );
  const routeStatus = computed(() => {
    const status = Array.isArray(route.query.status) ? route.query.status[0] : route.query.status;

    return normalizeInvoiceStatus(status);
  });
  const currentPage = computed(() => {
    const page = Number(route.query.page ?? 1);

    return Number.isFinite(page) && page > 0 ? page : 1;
  });
  const titleKey = computed(() => {
    if (routeStatus.value === InvoiceStatusEnum.PAID) return 'sidebar.paid_invoices';
    if (routeStatus.value === InvoiceStatusEnum.UNPAID) return 'sidebar.unpaid_invoices';

    return 'invoice.index.title';
  });

  const projectTitleFor = (invoice: InvoiceModel) => {
    return invoice.project?.title || invoice.project?.name || invoice.project_id || '-';
  };

  const formatAmount = (amount?: number) => {
    return Number(amount ?? 0).toLocaleString();
  };

  const statusLabelFor = (invoice: InvoiceModel) => {
    const status = normalizeInvoiceStatus(invoice.status);

    return status ? t(InvoiceStatusLabelKeys[status]) : '-';
  };

  const statusClassFor = (invoice: InvoiceModel) => {
    const status = normalizeInvoiceStatus(invoice.status);

    return status ? InvoiceStatusClassNames[status] : 'is-unknown';
  };

  const fetchInvoices = async (page: number = 1, searchWord: string = '') => {
    await controller.fetchList(
      new IndexInvoiceParams(searchWord, page, perPage.value, 1, null, routeStatus.value),
    );
  };

  const search = debounce(() => {
    void router.push({
      query: {
        ...route.query,
        page: '1',
        word: word.value || undefined,
      },
    });
  });

  const onPageChange = (page: number) => {
    void router.push({
      query: { ...route.query, page: String(page), word: word.value || undefined },
    });
  };

  const onPerPageChange = (count: number) => {
    perPage.value = count;
    void fetchInvoices(1);
  };

  const deleteInvoice = async (id: number) => {
    await controller.delete(new DeleteInvoiceParams({ invoice_id: id }));
    await fetchInvoices();
  };

  const syncWordFromRoute = () => {
    word.value = route.query.word ? String(route.query.word) : '';
  };

  watch(
    () => [route.query.status, route.query.page, route.query.word],
    () => {
      syncWordFromRoute();
      void fetchInvoices(currentPage.value, word.value);
    },
    { immediate: true },
  );
</script>

<template>
  <div class="invoice-page">
    <div class="invoice-header">
      <div>
        <h4>{{ $t(titleKey) }}</h4>
        <p>{{ $t('invoice.index.description') }}</p>
      </div>
    </div>

    <div class="toolbar">
      <div class="search-field">
        <span class="search-icon">
          <i class="pi pi-search"></i>
        </span>
        <input
          v-model="word"
          :placeholder="$t('invoice.search_placeholder')"
          class="search-input"
          type="text"
          @input="search"
        />
      </div>

      <div class="action-buttons">
        <router-link class="btn btn-primary" :to="`${basePath}/add`">
          <IndexAddIcon /> {{ $t('invoice.add') }}
        </router-link>
      </div>
    </div>

    <DataStatusBuilder :controller="state" :on-retry="async () => await fetchInvoices()">
      <template #success="{ data }">
        <AppTable
          :headers="headers"
          :items="data as InvoiceModel[]"
          selectable
          show-index
          hoverable
          striped
        >
          <template #cell-project="{ item }">
            {{ projectTitleFor(item) }}
          </template>

          <template #cell-invoice_amount="{ item }">
            {{ formatAmount(item.invoice_amount) }}
          </template>

          <template #cell-status="{ item }">
            <span class="invoice-status-badge" :class="statusClassFor(item)">
              {{ statusLabelFor(item) }}
            </span>
          </template>

          <template #actions="{ item }">
            <div class="row-actions">
              <router-link
                class="action-btn show"
                :to="`${showBasePath}/${item.id}`"
                :title="t('invoice_show.details')"
              >
                <i class="pi pi-eye"></i>
              </router-link>

              <router-link
                class="action-btn edit"
                :to="`${basePath}/edit/${item.id}`"
                :title="t('invoice.edit')"
              >
                <i class="pi pi-pencil"></i>
              </router-link>

              <DeleteDialog
                :title="$t('invoice.delete_title')"
                :message="$t('invoice.delete_message')"
                :hasbtn="true"
                @delete="deleteInvoice(item.id!)"
              >
                <template #btn>
                  <button class="action-btn delete" :title="$t('Delete')">
                    <i class="pi pi-trash"></i>
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
          <h3>{{ $t('invoice.empty_title') }}</h3>
          <p>{{ $t('invoice.empty_description') }}</p>
          <router-link class="btn btn-primary" :to="`${basePath}/add`">
            {{ $t('invoice.add') }}
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
