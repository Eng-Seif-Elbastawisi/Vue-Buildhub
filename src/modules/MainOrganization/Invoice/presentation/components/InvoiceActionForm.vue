<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import TitleInterface from '@/base/Data/Models/titleInterface';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import {
    InvoiceActionStatusEnum,
    InvoiceActionStatusLabelKeys,
    type InvoiceActionStatus,
  } from '../../core/constant/invoice.action.status.enum';
  import type InvoiceModel from '../../core/models/invoice.model';
  import FetchAutoInvoicesParams from '../../core/params/fetch.auto.invoices.params';
  import SetInvoiceActionParams from '../../core/params/set.invoice.action.params';
  import InvoiceController from '../controllers/invoice.controller';

  const route = useRoute();
  const { t } = useI18n();
  const controller = InvoiceController.getInstance();
  const rawProjectId = Array.isArray(route.params.project_id)
    ? route.params.project_id[0]
    : route.params.project_id;
  const projectId = Number(rawProjectId);
  const selectedActionStatus = ref<TitleInterface<string | number> | null>(
    new TitleInterface({
      id: InvoiceActionStatusEnum.OFFER_ACCEPT,
      title: t(InvoiceActionStatusLabelKeys[InvoiceActionStatusEnum.OFFER_ACCEPT]),
    }),
  );
  const selectedInvoices = ref<TitleInterface<string | number>[]>([]);
  const invoiceOptions = ref<TitleInterface<string | number>[]>([]);
  const loadingInvoices = ref(false);
  const submitting = ref(false);
  const statusKey = ref('');
  const errorMessage = ref('');

  const actionStatusOptions = computed<TitleInterface<string | number>[]>(() => [
    new TitleInterface({
      id: InvoiceActionStatusEnum.OFFER_ACCEPT,
      title: t(InvoiceActionStatusLabelKeys[InvoiceActionStatusEnum.OFFER_ACCEPT]),
    }),
  ]);

  const invoiceOptionFor = (invoice: InvoiceModel) =>
    new TitleInterface<string | number>({
      id: Number(invoice.id),
      title: invoice.invoice_number ?? `#${invoice.id}`,
      subtitle: invoice.invoice_date ?? '',
    });

  const fetchAutoInvoices = async () => {
    const params = new FetchAutoInvoicesParams({ project_id: projectId });

    if (!params.validate().isValid) {
      params.validateOrThrow();
      return;
    }

    loadingInvoices.value = true;
    errorMessage.value = '';

    try {
      const response = await controller.fetchAutoInvoices(params);

      if (response instanceof DataSuccess) {
        invoiceOptions.value = (response.data ?? []).map(invoiceOptionFor);
        return;
      }

      errorMessage.value =
        response.error?.displayMessage || response.error?.title || t('invoice_action.fetch_failed');
    } finally {
      loadingInvoices.value = false;
    }
  };

  const submitInvoiceAction = async () => {
    const params = new SetInvoiceActionParams({
      project_id: projectId,
      action_status: selectedActionStatus.value?.id as InvoiceActionStatus | undefined,
      invoice_ids: selectedInvoices.value.map((invoice) => Number(invoice.id)),
    });

    if (!params.validate().isValid) {
      params.validateOrThrow();
      return;
    }

    submitting.value = true;
    statusKey.value = '';
    errorMessage.value = '';

    try {
      const response = await controller.setInvoiceAction(params);

      if (response instanceof DataSuccess) {
        selectedInvoices.value = [];
        statusKey.value = 'invoice_action.saved';
        return;
      }

      errorMessage.value =
        response.error?.displayMessage || response.error?.title || t('invoice_action.save_failed');
    } finally {
      submitting.value = false;
    }
  };

  onMounted(fetchAutoInvoices);
</script>

<template>
  <main class="invoice-action-page">
    <header class="invoice-action-header">
      <p class="invoice-action-header__eyebrow">{{ $t('invoice_action.page_label') }}</p>
      <h1>{{ $t('invoice_action.title') }}</h1>
      <p>{{ $t('invoice_action.description') }}</p>
    </header>

    <form class="invoice-action-card" @submit.prevent="submitInvoiceAction">
      <div class="invoice-action-grid">
        <div class="invoice-action-field">
          <UpdatedCustomInputSelect
            id="invoice-action-status"
            v-model="selectedActionStatus"
            label="invoice_action.action_status"
            :placeholder="$t('invoice_action.action_status_placeholder')"
            :static-options="actionStatusOptions"
            :reload="false"
            required
          />
        </div>

        <div class="invoice-action-field">
          <UpdatedCustomInputSelect
            id="invoice-action-invoices"
            v-model="selectedInvoices"
            label="invoice_action.invoices"
            :placeholder="$t('invoice_action.invoices_placeholder')"
            :static-options="invoiceOptions"
            :type="2"
            :reload="false"
            required
          />

          <small v-if="loadingInvoices">{{ $t('invoice_action.loading_invoices') }}</small>
          <small v-else-if="invoiceOptions.length === 0">
            {{ $t('invoice_action.no_auto_invoices') }}
          </small>
        </div>
      </div>

      <p v-if="statusKey" class="invoice-action-status" role="status">
        {{ $t(statusKey) }}
      </p>
      <p v-if="errorMessage" class="invoice-action-error" role="alert">
        {{ errorMessage }}
      </p>

      <footer class="invoice-action-actions">
        <AppButton
          type="submit"
          :loading="submitting"
          :disabled="loadingInvoices || invoiceOptions.length === 0"
          :title="$t('invoice_action.save')"
        >
          {{ $t('invoice_action.save') }}
        </AppButton>
      </footer>
    </form>
  </main>
</template>

<style scoped lang="scss">
  .invoice-action-page {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding: 1.5rem;
  }

  .invoice-action-header,
  .invoice-action-card {
    padding: 1.25rem;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-sm);
    background: var(--BgWhite);
    box-shadow: var(--shadow-sm);
  }

  .invoice-action-header {
    h1,
    p {
      margin: 0;
    }

    h1 {
      margin-block: 0.25rem;
      color: var(--gray-900);
      font-size: 1.75rem;
    }
  }

  .invoice-action-header__eyebrow {
    color: var(--PrimaryColor);
    font-family: 'Bold';
  }

  .invoice-action-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  .invoice-action-field {
    min-width: 0;

    small {
      display: block;
      margin-top: 0.45rem;
      color: var(--gray-500);
    }
  }

  .invoice-action-status,
  .invoice-action-error {
    margin: 1rem 0 0;
  }

  .invoice-action-status {
    color: var(--success-dark);
  }

  .invoice-action-error {
    color: var(--danger-dark);
  }

  .invoice-action-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 1.25rem;
  }

  @media (max-width: 768px) {
    .invoice-action-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
