<script setup lang="ts">
  import paymentCoinsIcon from '@/assets/images/payment-coins-icon.png';

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
      <span class="invoice-payment-summary__payment-icon invoice-show-asset-icon">
        <img :src="paymentCoinsIcon" alt="" aria-hidden="true" />
      </span>
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
      <i :class="isPaid ? 'pi pi-check-circle' : 'pi pi-info-circle'" aria-hidden="true"></i>
      <span>
        {{ isPaid ? $t('invoice_show.fully_paid') : $t('invoice_show.payment_pending') }}
      </span>
    </div>
  </aside>
</template>
