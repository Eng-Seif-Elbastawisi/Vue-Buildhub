<script setup lang="ts">
  import { computed } from 'vue';
  import type { InvoiceItemModel } from '../../../core/models/invoice.show.model';

  const props = defineProps<{
    items: InvoiceItemModel[];
    currency: string;
    formatAmount: (value?: number | string | null) => string;
  }>();

  const subtotal = computed(() =>
    props.items.reduce((total, item) => total + item.quantity * item.unit_price, 0),
  );
  const discount = computed(() => props.items.reduce((total, item) => total + item.discount, 0));
  const tax = computed(() => props.items.reduce((total, item) => total + item.tax, 0));
  const totalAmount = computed(() => props.items.reduce((total, item) => total + item.total, 0));
</script>

<template>
  <section class="invoice-show-card invoice-items-card">
    <div class="invoice-show-card__header">
      <span class="invoice-show-icon invoice-show-icon--primary">
        <i class="pi pi-file"></i>
      </span>
      <h2>{{ $t('invoice_show.items') }}</h2>
    </div>

    <div v-if="items.length" class="invoice-show-table-wrap">
      <table class="invoice-show-table">
        <thead>
          <tr>
            <th>{{ $t('invoice_show.table_number') }}</th>
            <th>{{ $t('invoice_show.description') }}</th>
            <th>{{ $t('invoice_show.quantity') }}</th>
            <th>{{ $t('invoice_show.unit_price') }}</th>
            <th>{{ $t('invoice_show.discount') }}</th>
            <th>{{ $t('invoice_show.tax') }}</th>
            <th>{{ $t('invoice_show.total') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in items" :key="item.id ?? index">
            <td>{{ index + 1 }}</td>
            <td>{{ item.description }}</td>
            <td>{{ item.quantity.toFixed(2) }}</td>
            <td>{{ formatAmount(item.unit_price) }}</td>
            <td>{{ formatAmount(item.discount) }}</td>
            <td>{{ formatAmount(item.tax) }}</td>
            <td>{{ formatAmount(item.total) }}</td>
          </tr>
        </tbody>
      </table>

      <dl class="invoice-items-card__totals">
        <div>
          <dt>{{ $t('invoice_show.subtotal') }}</dt>
          <dd>{{ formatAmount(subtotal) }} {{ currency }}</dd>
        </div>
        <div>
          <dt>{{ $t('invoice_show.discount') }}</dt>
          <dd>{{ formatAmount(discount) }} {{ currency }}</dd>
        </div>
        <div>
          <dt>{{ $t('invoice_show.tax') }}</dt>
          <dd>{{ formatAmount(tax) }} {{ currency }}</dd>
        </div>
        <div class="invoice-items-card__total-row">
          <dt>{{ $t('invoice_show.total_amount') }}</dt>
          <dd>{{ formatAmount(totalAmount) }} {{ currency }}</dd>
        </div>
      </dl>
    </div>

    <p v-else class="invoice-show-empty">{{ $t('invoice_show.no_items') }}</p>
  </section>
</template>
