<script setup lang="ts">
  import { computed, onUnmounted, ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import type TitleInterface from '@/base/Data/Models/titleInterface';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import {
    InvoicePaymentMethodOptions,
    type InvoicePaymentMethodEnum,
  } from '@/modules/MainOrganization/InvoicePayment/core/constant/invoice.payment.method.enum';
  import AddInvoicePaymentParams from '@/modules/MainOrganization/InvoicePayment/core/params/add.invoice.payment.params';

  const props = defineProps<{
    visible: boolean;
    invoiceId: number;
    remainingAmount?: number;
    loading?: boolean;
  }>();

  const emit = defineEmits<{
    close: [];
    submit: [params: AddInvoicePaymentParams];
  }>();

  const { t } = useI18n();
  const paymentAmount = ref<number | null>(null);
  const paymentDate = ref('');
  const paymentMethod = ref<TitleInterface<string | number> | null>(null);
  const notes = ref('');
  const dialogBodyClass = 'invoice-payment-dialog-open';
  const paymentMethodOptions = computed<TitleInterface<string | number>[]>(() =>
    InvoicePaymentMethodOptions.map((option) => ({
      id: option.value,
      title: t(option.labelKey),
    })),
  );

  const setDialogBodyClass = (visible: boolean) => {
    if (typeof document === 'undefined') return;

    document.body.classList.toggle(dialogBodyClass, visible);
  };

  const resetForm = () => {
    const remainingAmount = Number(props.remainingAmount);

    paymentAmount.value = Number.isFinite(remainingAmount) ? remainingAmount : null;
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
        payment_method: paymentMethod.value?.id as InvoicePaymentMethodEnum | undefined,
        notes: notes.value || null,
      }),
    );
  };

  watch(
    () => props.visible,
    (visible) => {
      setDialogBodyClass(visible);
      if (visible) resetForm();
    },
    { immediate: true },
  );

  onUnmounted(() => {
    setDialogBodyClass(false);
  });
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
            <UpdatedCustomInputSelect
              id="show_payment_method"
              v-model="paymentMethod"
              :label="$t('invoice_payment.payment_method')"
              :placeholder="$t('invoice_payment.payment_method_placeholder')"
              :reload="false"
              :static-options="paymentMethodOptions"
              required
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
              {{ $t('cancel') }}
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
