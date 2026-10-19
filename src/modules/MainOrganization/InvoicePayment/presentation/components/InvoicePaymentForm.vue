<script setup lang="ts">
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
  import { ref, watch } from 'vue';
  import { onBeforeRouteLeave } from 'vue-router';
  import type TitleInterface from '@/base/Data/Models/titleInterface';
  import { useFormsStore } from '@/stores/formsStore';
  import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import InvoiceController from '@/modules/MainOrganization/Invoice/presentation/controllers/invoice.controller';
  import IndexInvoiceParams from '@/modules/MainOrganization/Invoice/core/params/index.invoice.params';
  import {
    InvoicePaymentMethodOptions,
    type InvoicePaymentMethodEnum,
  } from '../../core/constant/invoice.payment.method.enum';
  import AddInvoicePaymentParams from '../../core/params/add.invoice.payment.params';
  import type InvoicePaymentModel from '../../core/models/invoice.payment.model';

  const emit = defineEmits<{
    updateData: [params: AddInvoicePaymentParams];
  }>();

  const props = defineProps<{
    payment?: InvoicePaymentModel | null;
    loading?: boolean;
    formKey?: string;
  }>();

  const formStore = useFormsStore();
  const invoiceController = InvoiceController.getInstance();
  const invoiceParams = new IndexInvoiceParams('', 1, 100, 0);

  const selectedInvoice = ref<TitleInterface<string | number> | null>(null);
  const paymentAmount = ref<number | null>(null);
  const paymentDate = ref('');
  const paymentMethod = ref<InvoicePaymentMethodEnum | null>(null);
  const notes = ref('');
  const paymentMethodOptions = InvoicePaymentMethodOptions;

  const updateData = () => {
    emit(
      'updateData',
      new AddInvoicePaymentParams({
        invoice_id: selectedInvoice.value?.id ? Number(selectedInvoice.value.id) : undefined,
        payment_amount: paymentAmount.value ?? undefined,
        payment_date: paymentDate.value,
        payment_method: paymentMethod.value ?? undefined,
        notes: notes.value || null,
      }),
    );
  };

  const updateInvoice = (value: TitleInterface<string | number> | null) => {
    selectedInvoice.value = value;
    updateData();
  };

  const getInvoiceTitle = (payment: InvoicePaymentModel) => {
    return payment.invoice?.invoice_number || `#${payment.invoice_id}`;
  };

  onBeforeRouteLeave((to, from) => {
    const savedData = props.formKey ? formStore.getFormData(props.formKey) : null;

    if (savedData && to.path !== from.path && props.formKey) {
      formStore.showReturnWarning(props.formKey);
    }
  });

  watch(
    () => props.payment,
    (payment) => {
      selectedInvoice.value = payment?.invoice_id
        ? {
            id: payment.invoice_id,
            title: getInvoiceTitle(payment),
          }
        : null;
      paymentAmount.value =
        payment?.payment_amount === undefined || payment?.payment_amount === null
          ? null
          : Number(payment.payment_amount);
      paymentDate.value = payment?.payment_date ?? '';
      paymentMethod.value =
        payment?.payment_method === undefined || payment?.payment_method === null
          ? null
          : (Number(payment.payment_method) as InvoicePaymentMethodEnum);
      notes.value = payment?.notes ?? '';

      updateData();
    },
    { immediate: true },
  );
</script>

<template>
  <StandardFormLayout as="section" class="invoice-payment-form-card">
    <header>
      <h3>{{ $t('invoice_payment.form_title') }}</h3>
      <p>{{ $t('invoice_payment.form_description') }}</p>
    </header>

    <div class="invoice-payment-form-grid form-fields" :class="{ disabled: loading }">
      <div class="field-group">
        <UpdatedCustomInputSelect
          id="invoice_payment_invoice_id"
          :model-value="selectedInvoice"
          :label="$t('invoice_payment.invoice')"
          :controller="invoiceController"
          :placeholder="$t('invoice_payment.invoice_placeholder')"
          :params="invoiceParams"
          @update:model-value="updateInvoice"
        />
      </div>

      <div class="field-group">
        <span class="field-help-label-row field-help-label-row--block">
          <label class="field-label" for="payment_amount">
            {{ $t('invoice_payment.payment_amount') }}
          </label>
          <FieldHelpIcon
            :label="$t('invoice_payment.payment_amount')"
            field-name="price"
            field-id="payment_amount"
          />
        </span>
        <input
          id="payment_amount"
          v-model.number="paymentAmount"
          class="field-input workspace-control"
          min="0"
          step="1"
          type="number"
          :placeholder="$t('invoice_payment.payment_amount_placeholder')"
          @input="updateData"
        />
      </div>

      <div class="field-group">
        <span class="field-help-label-row field-help-label-row--block">
          <label class="field-label" for="payment_date">{{
            $t('invoice_payment.payment_date')
          }}</label>
          <FieldHelpIcon
            :label="$t('invoice_payment.payment_date')"
            field-name="date"
            field-id="payment_date"
          />
        </span>
        <input
          id="payment_date"
          v-model="paymentDate"
          class="field-input workspace-control"
          type="date"
          @input="updateData"
        />
      </div>

      <div class="field-group">
        <span class="field-help-label-row field-help-label-row--block">
          <label class="field-label" for="payment_method">
            {{ $t('invoice_payment.payment_method') }}
          </label>
          <FieldHelpIcon
            :label="$t('invoice_payment.payment_method')"
            field-name="type"
            field-id="payment_method"
          />
        </span>
        <select
          id="payment_method"
          v-model.number="paymentMethod"
          class="field-input workspace-control"
          @change="updateData"
        >
          <option disabled :value="null">
            {{ $t('invoice_payment.payment_method_placeholder') }}
          </option>
          <option v-for="option in paymentMethodOptions" :key="option.value" :value="option.value">
            {{ $t(option.labelKey) }}
          </option>
        </select>
      </div>

      <div class="field-group col-span-2">
        <span class="field-help-label-row field-help-label-row--block">
          <label class="field-label" for="payment_notes">{{ $t('invoice_payment.notes') }}</label>
          <FieldHelpIcon
            :label="$t('invoice_payment.notes')"
            field-name="notes"
            field-id="payment_notes"
          />
        </span>
        <textarea
          id="payment_notes"
          v-model="notes"
          class="field-input field-textarea workspace-control"
          :placeholder="$t('invoice_payment.notes_placeholder')"
          @input="updateData"
        />
      </div>
    </div>
  </StandardFormLayout>
</template>
