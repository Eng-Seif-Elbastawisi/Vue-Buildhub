<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import type InvoiceModel from '../../core/models/invoice.model';
  import FetchAutoInvoicesParams from '../../core/params/fetch.auto.invoices.params';
  import InvoiceController from '../controllers/invoice.controller';

  const props = defineProps<{
    projectId: number;
  }>();

  const emit = defineEmits<{
    close: [];
  }>();

  const { t } = useI18n();
  const controller = InvoiceController.getInstance();
  const invoices = ref<InvoiceModel[]>([]);
  const loading = ref(false);
  const errorMessage = ref('');

  const formatAmount = (amount?: number) => Number(amount ?? 0).toLocaleString();

  const fetchAutoInvoices = async () => {
    const params = new FetchAutoInvoicesParams({ project_id: props.projectId });

    if (!params.validate().isValid) {
      params.validateOrThrow();
      return;
    }

    loading.value = true;

    try {
      const response = await controller.fetchAutoInvoices(params);

      if (response instanceof DataSuccess) {
        invoices.value = response.data ?? [];
        return;
      }

      errorMessage.value =
        response.error?.displayMessage || response.error?.title || t('invoice_action.fetch_failed');
    } finally {
      loading.value = false;
    }
  };

  onMounted(fetchAutoInvoices);
</script>

<template>
  <div class="auto-invoices-modal" role="dialog" aria-modal="true">
    <button
      class="auto-invoices-modal__backdrop"
      type="button"
      :aria-label="$t('close')"
      @click="emit('close')"
    ></button>

    <section class="auto-invoices-modal__panel">
      <header class="auto-invoices-modal__header">
        <div>
          <h2>{{ $t('invoice_action.auto_invoices_title') }}</h2>
          <p>{{ $t('invoice_action.auto_invoices_description') }}</p>
        </div>

        <button
          class="auto-invoices-modal__close"
          type="button"
          :title="$t('close')"
          :aria-label="$t('close')"
          @click="emit('close')"
        >
          <i class="pi pi-times"></i>
        </button>
      </header>

      <p v-if="loading" class="auto-invoices-modal__state">
        {{ $t('invoice_action.loading_invoices') }}
      </p>
      <p v-else-if="errorMessage" class="auto-invoices-modal__error" role="alert">
        {{ errorMessage }}
      </p>
      <p v-else-if="invoices.length === 0" class="auto-invoices-modal__state">
        {{ $t('invoice_action.no_auto_invoices') }}
      </p>

      <div v-else class="auto-invoices-list">
        <article v-for="invoice in invoices" :key="invoice.id" class="auto-invoice-row">
          <div>
            <strong>{{ invoice.invoice_number ?? `#${invoice.id}` }}</strong>
            <span>{{ invoice.invoice_date ?? '-' }}</span>
          </div>
          <span>{{ formatAmount(invoice.invoice_amount) }}</span>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
  .auto-invoices-modal {
    position: fixed;
    inset: 0;
    z-index: 1100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .auto-invoices-modal__backdrop {
    position: absolute;
    inset: 0;
    width: 100%;
    border: 0;
    background: var(--overlay-bg);
  }

  .auto-invoices-modal__panel {
    position: relative;
    z-index: 1;
    width: min(100%, 640px);
    max-height: min(80vh, 720px);
    overflow-y: auto;
    padding: 1.25rem;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-sm);
    background: var(--BgWhite);
    box-shadow: var(--shadow-lg);
  }

  .auto-invoices-modal__header,
  .auto-invoice-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .auto-invoices-modal__header {
    h2,
    p {
      margin: 0;
    }

    p {
      margin-top: 0.25rem;
      color: var(--gray-500);
    }
  }

  .auto-invoices-modal__close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: 1px solid var(--border-weak);
    border-radius: 8px;
    background: var(--BgWhite);
    color: var(--gray-900);
    cursor: pointer;
  }

  .auto-invoices-modal__state,
  .auto-invoices-modal__error {
    padding: 1.5rem 0;
    text-align: center;
  }

  .auto-invoices-modal__error {
    color: var(--danger-dark);
  }

  .auto-invoices-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1.25rem;
  }

  .auto-invoice-row {
    padding: 0.9rem 1rem;
    border: 1px solid var(--border-weak);
    border-radius: 8px;

    div {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    span {
      color: var(--gray-500);
    }
  }
</style>
