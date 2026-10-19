<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import {
    InvoiceStatusClassNames,
    InvoiceStatusEnum,
    InvoiceStatusLabelKeys,
    normalizeInvoiceStatus,
  } from '../../../core/constant/invoice.status.enum';
  import type InvoiceShowModel from '../../../core/models/invoice.show.model';

  defineProps<{
    children: InvoiceShowModel[];
    currency: string;
    formatAmount: (value?: number | string | null) => string;
  }>();

  defineEmits<{
    pay: [invoiceId: number, remainingAmount?: number];
  }>();

  const { t } = useI18n();

  const childTitle = (invoice: InvoiceShowModel) => {
    return invoice.title || invoice.invoice_number || (invoice.id ? `#${invoice.id}` : '-');
  };

  const childStatus = (invoice: InvoiceShowModel) => normalizeInvoiceStatus(invoice.status);

  const childStatusLabel = (invoice: InvoiceShowModel) => {
    const status = childStatus(invoice);

    return status ? t(InvoiceStatusLabelKeys[status]) : '-';
  };

  const childStatusClass = (invoice: InvoiceShowModel) => {
    const status = childStatus(invoice);

    return status ? InvoiceStatusClassNames[status] : 'is-unknown';
  };

  const canPayChild = (invoice: InvoiceShowModel) => {
    const status = childStatus(invoice);

    return status !== InvoiceStatusEnum.PAID && status !== InvoiceStatusEnum.EXTRA_PAID;
  };
</script>

<template>
  <section v-if="children.length" class="invoice-show-card invoice-children-card">
    <div class="invoice-show-card__header">
      <div class="invoice-show-card__title">
        <span class="invoice-show-icon invoice-show-icon--primary">
          <i class="pi pi-copy"></i>
        </span>
        <h2>{{ $t('invoice_show.child_invoices') }}</h2>
      </div>
    </div>

    <div class="invoice-children-card__grid">
      <article v-for="child in children" :key="child.id" class="invoice-children-card__item">
        <div class="invoice-children-card__heading">
          <h3>{{ childTitle(child) }}</h3>
          <span class="invoice-status-badge bh-status" :class="childStatusClass(child)">
            {{ childStatusLabel(child) }}
          </span>
        </div>

        <div class="invoice-children-card__details">
          <div>
            <small>{{ $t('invoice.notes') }}</small>
            <p>{{ child.notes || $t('invoice_show.no_notes') }}</p>
          </div>
          <dl class="invoice-children-card__amounts">
            <div>
              <dt>{{ $t('invoice.invoice_amount') }}</dt>
              <dd>{{ formatAmount(child.invoice_amount) }} {{ currency }}</dd>
            </div>
            <div>
              <dt>{{ $t('invoice_show.paid_amount') }}</dt>
              <dd>{{ formatAmount(child.paid_amount) }} {{ currency }}</dd>
            </div>
            <div>
              <dt>{{ $t('invoice_show.remaining_amount') }}</dt>
              <dd>{{ formatAmount(child.remaining_amount) }} {{ currency }}</dd>
            </div>
          </dl>
        </div>

        <button
          v-if="child.id && canPayChild(child)"
          class="invoice-show-btn invoice-show-btn--outline invoice-children-card__pay"
          type="button"
          @click="$emit('pay', child.id, child.remaining_amount)"
        >
          <i class="pi pi-credit-card"></i>
          {{ $t('invoice_show.pay_invoice') }}
        </button>
      </article>
    </div>
  </section>
</template>
