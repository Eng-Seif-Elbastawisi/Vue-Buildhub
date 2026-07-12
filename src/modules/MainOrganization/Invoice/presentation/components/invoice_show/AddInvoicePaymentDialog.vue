<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import AddInvoicePaymentParams from '@/modules/MainOrganization/InvoicePayment/core/params/add.invoice.payment.params';

  const props = defineProps<{
    visible: boolean;
    invoiceId: number;
    loading?: boolean;
    remainingAmount: number;
    currency: string;
    formatAmount: (value?: number | string | null) => string;
  }>();

  const emit = defineEmits<{
    close: [];
    submit: [params: AddInvoicePaymentParams];
  }>();

  const paymentAmount = ref<number | null>(null);
  const paymentDate = ref('');
  const paymentMethod = ref<number | null>(null);
  const notes = ref('');

  const remainingText = computed(
    () => `${props.formatAmount(props.remainingAmount)} ${props.currency}`,
  );

  const resetForm = () => {
    paymentAmount.value = props.remainingAmount > 0 ? props.remainingAmount : null;
    paymentDate.value = new Date().toISOString().slice(0, 10);
    paymentMethod.value = null;
    notes.value = '';
  };

  const submitPayment = () => {
    emit(
      'submit',
      new AddInvoicePaymentParams({
        invoice_id: props.invoiceId,
        payment_amount: paymentAmount.value ?? undefined,
        payment_date: paymentDate.value,
        payment_method: paymentMethod.value ?? undefined,
        notes: notes.value || null,
      }),
    );
  };

  watch(
    () => props.visible,
    (visible) => {
      if (visible) resetForm();
    },
    { immediate: true },
  );
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="invoice-payment-dialog" role="dialog" aria-modal="true">
      <button
        class="invoice-payment-dialog__backdrop"
        type="button"
        :aria-label="$t('invoice_show.close')"
        @click="$emit('close')"
      ></button>

      <section class="invoice-payment-dialog__panel">
        <header class="invoice-payment-dialog__header">
          <div>
            <p>{{ $t('invoice_show.remaining_amount') }}: {{ remainingText }}</p>
            <h2>{{ $t('invoice_show.add_payment') }}</h2>
          </div>
          <button class="invoice-show-icon-btn" type="button" @click="$emit('close')">
            <i class="pi pi-times"></i>
          </button>
        </header>

        <form class="invoice-payment-dialog__form" @submit.prevent="submitPayment">
          <div class="field-group">
            <label class="field-label" for="show_payment_amount">
              {{ $t('invoice_payment.payment_amount') }}
            </label>
            <input
              id="show_payment_amount"
              v-model.number="paymentAmount"
              class="field-input"
              min="0"
              step="0.01"
              type="number"
              :placeholder="$t('invoice_payment.payment_amount_placeholder')"
            />
          </div>

          <div class="field-group">
            <label class="field-label" for="show_payment_date">
              {{ $t('invoice_payment.payment_date') }}
            </label>
            <input id="show_payment_date" v-model="paymentDate" class="field-input" type="date" />
          </div>

          <div class="field-group">
            <label class="field-label" for="show_payment_method">
              {{ $t('invoice_payment.payment_method') }}
            </label>
            <input
              id="show_payment_method"
              v-model.number="paymentMethod"
              class="field-input"
              min="0"
              step="1"
              type="number"
              :placeholder="$t('invoice_payment.payment_method_placeholder')"
            />
          </div>

          <div class="field-group col-span-2">
            <label class="field-label" for="show_payment_notes">
              {{ $t('invoice_payment.notes') }}
            </label>
            <textarea
              id="show_payment_notes"
              v-model="notes"
              class="field-input field-textarea"
              :placeholder="$t('invoice_payment.notes_placeholder')"
            />
          </div>

          <footer class="invoice-payment-dialog__actions">
            <button
              class="invoice-show-btn invoice-show-btn--light"
              type="button"
              @click="$emit('close')"
            >
              {{ $t('Cancel') }}
            </button>
            <button
              class="invoice-show-btn invoice-show-btn--primary"
              type="submit"
              :disabled="loading"
            >
              <i class="pi pi-check"></i>
              {{ loading ? $t('invoice_show.saving') : $t('invoice_payment.save') }}
            </button>
          </footer>
        </form>
      </section>
    </div>
  </Teleport>
</template>
