<script setup lang="ts">
  import invoiceSummaryHero from '@/assets/images/ChatGPT Image Jul 12, 2026, 03_06_52 PM.png';

  defineProps<{
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    currency: string;
    isPaid: boolean;
    formatAmount: (value?: number | string | null) => string;
  }>();
</script>

<template>
  <aside class="invoice-show-card invoice-payment-summary">
    <div class="invoice-payment-summary__hero">
      <div>
        <p>{{ $t('invoice_show.total_amount') }}</p>
        <strong>{{ formatAmount(totalAmount) }} {{ currency }}</strong>
      </div>
      <figure class="invoice-payment-summary__receipt">
        <img :src="invoiceSummaryHero" :alt="$t('invoice_show.invoice_illustration_alt')" />
      </figure>
    </div>

    <dl class="invoice-payment-summary__rows">
      <div>
        <dt>{{ $t('invoice_show.paid_amount') }}</dt>
        <dd>{{ formatAmount(paidAmount) }} {{ currency }}</dd>
      </div>
      <div>
        <dt>{{ $t('invoice_show.remaining_amount') }}</dt>
        <dd>{{ formatAmount(remainingAmount) }} {{ currency }}</dd>
      </div>
    </dl>

    <div class="invoice-payment-summary__notice" :class="{ 'is-paid': isPaid }">
      <i :class="isPaid ? 'pi pi-check-circle' : 'pi pi-info-circle'"></i>
      <span>
        {{ isPaid ? $t('invoice_show.fully_paid') : $t('invoice_show.payment_pending') }}
      </span>
    </div>
  </aside>
</template>
