<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { onBeforeRouteLeave } from 'vue-router';
  import type TitleInterface from '@/base/Data/Models/titleInterface';
  import { useFormsStore } from '@/stores/formsStore';
  import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import IndexProjectParams from '@/modules/MainOrganization/Project/core/params/index.project.params';
  import ProjectController from '@/modules/MainOrganization/Project/presentation/controllers/project.controller';
  import AddInvoiceParams from '../../core/params/add.invoice.params';
  import type InvoiceModel from '../../core/models/invoice.model';

  const emit = defineEmits<{
    updateData: [params: AddInvoiceParams];
  }>();

  const props = defineProps<{
    invoice?: InvoiceModel | null;
    loading?: boolean;
    formKey?: string;
  }>();

  const formStore = useFormsStore();
  const projectController = ProjectController.getInstance();
  const projectParams = new IndexProjectParams('', 1, 100, 0);

  const selectedProject = ref<TitleInterface<string | number> | null>(null);
  const invoiceNumber = ref('');
  const invoiceDate = ref('');
  const invoiceAmount = ref<number | null>(null);
  const notes = ref('');

  const updateData = () => {
    emit(
      'updateData',
      new AddInvoiceParams({
        project_id: selectedProject.value?.id ? Number(selectedProject.value.id) : undefined,
        invoice_number: invoiceNumber.value,
        invoice_date: invoiceDate.value,
        invoice_amount: invoiceAmount.value ?? undefined,
        notes: notes.value || null,
      }),
    );
  };

  const updateProject = (value: TitleInterface<string | number> | null) => {
    selectedProject.value = value;
    updateData();
  };

  const getProjectTitle = (invoice: InvoiceModel) => {
    return invoice.project?.title || invoice.project?.name || `#${invoice.project_id}`;
  };

  onBeforeRouteLeave((to, from) => {
    const savedData = props.formKey ? formStore.getFormData(props.formKey) : null;

    if (savedData && to.path !== from.path && props.formKey) {
      formStore.showReturnWarning(props.formKey);
    }
  });

  watch(
    () => props.invoice,
    (invoice) => {
      selectedProject.value = invoice?.project_id
        ? {
            id: invoice.project_id,
            title: getProjectTitle(invoice),
          }
        : null;
      invoiceNumber.value = invoice?.invoice_number ?? '';
      invoiceDate.value = invoice?.invoice_date ?? '';
      invoiceAmount.value =
        invoice?.invoice_amount === undefined || invoice?.invoice_amount === null
          ? null
          : Number(invoice.invoice_amount);
      notes.value = invoice?.notes ?? '';

      updateData();
    },
    { immediate: true },
  );
</script>

<template>
  <section class="invoice-form-card">
    <header>
      <h3>{{ $t('invoice.form_title') }}</h3>
      <p>{{ $t('invoice.form_description') }}</p>
    </header>

    <div class="invoice-form-grid" :class="{ disabled: loading }">
      <div class="field-group">
        <UpdatedCustomInputSelect
          id="invoice_project_id"
          :model-value="selectedProject"
          :label="$t('invoice.project')"
          :controller="projectController"
          :placeholder="$t('invoice.project_placeholder')"
          :params="projectParams"
          @update:model-value="updateProject"
        />
      </div>

      <div class="field-group">
        <span class="field-help-label-row field-help-label-row--block">
          <label class="field-label" for="invoice_number">{{ $t('invoice.invoice_number') }}</label>
          <FieldHelpIcon
            :label="$t('invoice.invoice_number')"
            field-name="code"
            field-id="invoice_number"
          />
        </span>
        <input
          id="invoice_number"
          v-model="invoiceNumber"
          class="field-input"
          :placeholder="$t('invoice.invoice_number_placeholder')"
          @input="updateData"
        />
      </div>

      <div class="field-group">
        <span class="field-help-label-row field-help-label-row--block">
          <label class="field-label" for="invoice_date">{{ $t('invoice.invoice_date') }}</label>
          <FieldHelpIcon
            :label="$t('invoice.invoice_date')"
            field-name="date"
            field-id="invoice_date"
          />
        </span>
        <input
          id="invoice_date"
          v-model="invoiceDate"
          class="field-input"
          type="date"
          @input="updateData"
        />
      </div>

      <div class="field-group">
        <span class="field-help-label-row field-help-label-row--block">
          <label class="field-label" for="invoice_amount">{{ $t('invoice.invoice_amount') }}</label>
          <FieldHelpIcon
            :label="$t('invoice.invoice_amount')"
            field-name="price"
            field-id="invoice_amount"
          />
        </span>
        <input
          id="invoice_amount"
          v-model.number="invoiceAmount"
          class="field-input"
          min="0"
          step="0.01"
          type="number"
          :placeholder="$t('invoice.invoice_amount_placeholder')"
          @input="updateData"
        />
      </div>

      <div class="field-group col-span-2">
        <span class="field-help-label-row field-help-label-row--block">
          <label class="field-label" for="invoice_notes">{{ $t('invoice.notes') }}</label>
          <FieldHelpIcon :label="$t('invoice.notes')" field-name="notes" field-id="invoice_notes" />
        </span>
        <textarea
          id="invoice_notes"
          v-model="notes"
          class="field-input field-textarea"
          :placeholder="$t('invoice.notes_placeholder')"
          @input="updateData"
        />
      </div>
    </div>
  </section>
</template>
