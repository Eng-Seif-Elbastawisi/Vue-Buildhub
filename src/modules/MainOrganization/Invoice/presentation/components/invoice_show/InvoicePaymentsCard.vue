<script setup lang="ts">
  import type InvoicePaymentModel from '@/modules/MainOrganization/InvoicePayment/core/models/invoice.payment.model';
  import type InvoiceShowModel from '../../../core/models/invoice.show.model';

  defineProps<{
    payments: InvoicePaymentModel[];
    currency: string;
    formatAmount: (value?: number | string | null) => string;
    formatDateTime: (value?: string | null) => string;
    paymentMethodLabel: (value?: number | null) => string;
    invoice: InvoiceShowModel;
  }>();

  defineEmits<{
    add: [];
    download: [payment: InvoicePaymentModel];
  }>();
</script>

<template>
  <section v-if="invoice.children?.length === 0" class="invoice-show-card invoice-payments-card">
    <div class="invoice-show-card__header invoice-show-card__header--between">
      <div class="invoice-show-card__title">
        <span class="invoice-show-icon invoice-show-icon--primary">
          <i class="pi pi-credit-card"></i>
        </span>
        <h2>{{ $t('invoice_show.payments') }}</h2>
      </div>
      <button
        v-if="invoice.export_status === 1"
        class="invoice-show-btn invoice-show-btn--outline"
        type="button"
        @click="$emit('add')"
      >
        <i class="pi pi-plus"></i>
        {{ $t('invoice_show.add_payment') }}
      </button>
    </div>

    <div
      v-if="payments.length"
      class="invoice-payments-card__table-wrap"
      tabindex="0"
      :aria-label="$t('invoice_show.payments')"
    >
      <table class="invoice-payments-card__table">
        <thead>
          <tr>
            <th scope="col">{{ $t('invoice_show.payment_received') }}</th>
            <th scope="col">{{ $t('invoice_payment.payment_method') }}</th>
            <th scope="col">{{ $t('invoice_show.amount') }}</th>
            <th scope="col">{{ $t('invoice_payment.payment_date') }}</th>
            <th scope="col">{{ $t('invoice_show.reference_no') }}</th>
            <th scope="col">{{ $t('invoice_show.download_receipt') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="payment in payments"
            :key="payment.id ?? `${payment.payment_date}-${payment.payment_amount}`"
          >
            <td>
              <div class="invoice-payments-card__payment">
                <span class="invoice-payments-card__status">
                  <i class="pi pi-check"></i>
                </span>
                <strong>{{ $t('invoice_show.payment_received') }}</strong>
              </div>
            </td>
            <td>
              <span class="invoice-payments-card__method">
                {{ paymentMethodLabel(payment.payment_method) }}
              </span>
            </td>
            <td>
              <strong>{{ formatAmount(payment.payment_amount) }} {{ currency }}</strong>
            </td>
            <td>
              <span>{{ formatDateTime(payment.payment_date) }}</span>
            </td>
            <td>
              <span>{{ payment.id ? `#${payment.id}` : $t('invoice_show.not_available') }}</span>
            </td>
            <td>
              <button
                class="invoice-show-icon-btn action--download"
                type="button"
                :title="$t('invoice_show.download_receipt')"
                @click="$emit('download', payment)"
              >
                <i class="pi pi-download"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else class="invoice-show-empty">{{ $t('invoice_show.no_payments') }}</p>
  </section>
</template>
