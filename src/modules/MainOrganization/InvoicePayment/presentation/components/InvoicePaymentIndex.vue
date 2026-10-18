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
  import { debounce } from '@/base/Presentation/Utils/debouced';
  import { useUserStore } from '@/stores/user';
  import IndexAddIcon from '@/shared/icons/IndexAddIcon.vue';
  import DeleteInvoicePaymentParams from '../../core/params/delete.invoice.payment.params';
  import IndexInvoicePaymentParams from '../../core/params/index.invoice.payment.params';
  import type InvoicePaymentModel from '../../core/models/invoice.payment.model';
  import InvoicePaymentController from '../controllers/invoice.payment.controller';

  const controller = InvoicePaymentController.getInstance();
  const state = computed(() => controller.listState.value);
  const router = useRouter();
  const route = useRoute();
  const { t } = useI18n();
  const { user } = useUserStore();
  const perPage = ref(10);
  const word = ref('');

  const headers: TableHeader[] = [
    { key: 'invoice', label: 'invoice_payment.invoice', width: '22%' },
    {
      key: 'payment_amount',
      label: 'invoice_payment.payment_amount',
      width: '20%',
      sortable: true,
    },
    { key: 'payment_date', label: 'invoice_payment.payment_date', width: '18%', sortable: true },
    { key: 'payment_method', label: 'invoice_payment.payment_method', width: '18%' },
    { key: 'notes', label: 'invoice_payment.notes', width: '22%' },
  ];

  const basePath = computed(() =>
    user?.type === 1 ? '/admin/invoice-payment' : '/organization/invoice-payment',
  );

  const invoiceTitleFor = (payment: InvoicePaymentModel) => {
    return payment.invoice?.invoice_number || payment.invoice_id || '-';
  };

  const formatAmount = (amount?: number) => {
    return Number(amount ?? 0).toLocaleString();
  };

  const fetchPayments = async (page: number = 1, searchWord: string = '') => {
    await controller.fetchList(
      new IndexInvoicePaymentParams(
        searchWord,
        route.query.page ? Number(route.query.page) : page,
        perPage.value,
        1,
      ),
    );
  };

  const search = debounce(() => {
    void router.push({
      query: {
        ...route.query,
        page: Number(route.query.page ?? 1),
        word: word.value || undefined,
      },
    });

    void fetchPayments(1, word.value);
  });

  const onPageChange = (page: number) => {
    void fetchPayments(page);
    void router.push({
      query: { ...route.query, page: String(page), word: word.value || undefined },
    });
  };

  const onPerPageChange = (count: number) => {
    perPage.value = count;
    void fetchPayments(1);
  };

  const deletePayment = async (id: number) => {
    await controller.delete(new DeleteInvoicePaymentParams({ invoice_payment_id: id }));
    await fetchPayments();
  };

  onMounted(async () => {
    word.value = route.query.word ? String(route.query.word) : '';
    await fetchPayments(route.query.page ? Number(route.query.page) : 1, word.value);
  });
</script>

<template>
  <div class="invoice-payment-page">
    <IndexPageHeader
      :title="$t('invoice_payment.index.title')"
      :subtitle="$t('invoice_payment.index.description')"
    >
      <template #search>
        <div class="search-field">
          <span class="search-icon">
            <i class="pi pi-search"></i>
          </span>
          <input
            v-model="word"
            :placeholder="$t('invoice_payment.search_placeholder')"
            class="search-input workspace-control"
            type="text"
            @input="search"
          />
        </div>
      </template>

      <template #actions>
        <router-link class="btn btn-primary" :to="`${basePath}/add`">
          <IndexAddIcon /> {{ $t('invoice_payment.add') }}
        </router-link>
      </template>
    </IndexPageHeader>

    <DataStatusBuilder :controller="state" :on-retry="async () => await fetchPayments()">
      <template #success="{ data }">
        <AppTable
          :headers="headers"
          :items="data as InvoicePaymentModel[]"
          selectable
          show-index
          hoverable
          striped
        >
          <template #cell-invoice="{ item }">
            {{ invoiceTitleFor(item) }}
          </template>

          <template #cell-payment_amount="{ item }">
            {{ formatAmount(item.payment_amount) }}
          </template>

          <template #actions="{ item }">
            <div class="row-actions">
              <router-link
                class="action-btn edit"
                :to="`${basePath}/edit/${item.id}`"
                :title="t('invoice_payment.edit')"
              >
                <i class="pi pi-pencil"></i>
              </router-link>

              <DeleteDialog
                :title="$t('invoice_payment.delete_title')"
                :message="$t('invoice_payment.delete_message')"
                :hasbtn="true"
                @delete="deletePayment(item.id!)"
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
          <h3>{{ $t('invoice_payment.empty_title') }}</h3>
          <p>{{ $t('invoice_payment.empty_description') }}</p>
          <router-link class="btn btn-primary" :to="`${basePath}/add`">
            {{ $t('invoice_payment.add') }}
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

<style lang="scss">
@use '../styles/invoice_payment';
</style>
