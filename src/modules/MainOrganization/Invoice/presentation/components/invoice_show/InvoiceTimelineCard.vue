<script setup lang="ts">
  import { computed } from 'vue';
  import type InvoicePaymentModel from '@/modules/MainOrganization/InvoicePayment/core/models/invoice.payment.model';
  import type InvoiceShowModel from '../../../core/models/invoice.show.model';

  const props = defineProps<{
    invoice: InvoiceShowModel;
    payments: InvoicePaymentModel[];
    isPaid: boolean;
    formatDateTime: (value?: string | null) => string;
    paymentMethodLabel: (value?: number | null) => string;
  }>();

  const timelinePayments = computed(() => props.payments.slice(0, 4));
</script>

<template>
  <section class="invoice-show-card invoice-timeline-card">
    <div class="invoice-show-card__header">
      <span class="invoice-show-icon invoice-show-icon--primary">
        <i class="pi pi-clock"></i>
      </span>
      <h2>{{ $t('invoice_show.timeline') }}</h2>
    </div>

    <ol class="invoice-timeline-card__list">
      <li>
        <span class="invoice-timeline-card__dot"></span>
        <div>
          <strong>{{ $t('invoice_show.invoice_created') }}</strong>
          <p>{{ formatDateTime(invoice.created_at || invoice.invoice_date) }}</p>
        </div>
      </li>

      <li v-for="payment in timelinePayments" :key="payment.id ?? payment.payment_date">
        <span class="invoice-timeline-card__dot is-success"></span>
        <div>
          <strong>
            {{
              $t('invoice_show.payment_logged', {
                method: paymentMethodLabel(payment.payment_method),
              })
            }}
          </strong>
          <p>{{ formatDateTime(payment.payment_date) }}</p>
        </div>
      </li>

      <li v-if="isPaid">
        <span class="invoice-timeline-card__dot is-success"></span>
        <div>
          <strong>{{ $t('invoice_show.invoice_marked_paid') }}</strong>
          <p>{{ $t('invoice_show.fully_paid') }}</p>
        </div>
      </li>
    </ol>
  </section>
</template>
