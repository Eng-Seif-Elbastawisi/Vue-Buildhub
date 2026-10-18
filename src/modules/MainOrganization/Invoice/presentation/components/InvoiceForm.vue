<script setup lang="ts">
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { onBeforeRouteLeave } from 'vue-router';
import type TitleInterface from '@/base/Data/Models/titleInterface';
import AppButton from '@/shared/HelpersComponents/AppButton.vue';
import MultiLangInput from '@/shared/MultiLangInput.vue';
import { useFormsStore } from '@/stores/formsStore';
import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';
import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
import InvoiceDocumentIcon from '@/shared/icons/BreadcrumbIcons/DocumentIcon.vue';
import GroupIcon from '@/shared/icons/SidebarIcons/SidebarUsersIcon.vue';
import IndexProjectParams from '@/modules/MainOrganization/Project/core/params/index.project.params';
import ProjectController from '@/modules/MainOrganization/Project/presentation/controllers/project.controller';
import {
  InvoiceTypeEnum,
  InvoiceTypeLabelKeys,
  type InvoiceTypeEnum as InvoiceType,
} from '../../core/constant/invoice.type.enum';
import type InvoiceModel from '../../core/models/invoice.model';
import AddInvoiceParams from '../../core/params/add.invoice.params';
import IndexInvoiceParams from '../../core/params/index.invoice.params';
import InvoiceController from '../controllers/invoice.controller';

const emit = defineEmits<{
  updateData: [params: AddInvoiceParams];
  submit: [];
}>();

const props = withDefaults(
  defineProps<{
    invoice?: InvoiceModel | null;
    loading?: boolean;
    formKey?: string;
    enableGrouping?: boolean;
    submitLabelKey?: string;
  }>(),
  {
    invoice: null,
    loading: false,
    formKey: undefined,
    enableGrouping: false,
    submitLabelKey: 'invoice.save',
  },
);

const { t, locale } = useI18n();
const formStore = useFormsStore();
const projectController = ProjectController.getInstance();
const invoiceController = InvoiceController.getInstance();
const projectParams = new IndexProjectParams('', 1, 100, 0);
interface InvoiceTypeOption extends TitleInterface<string | number> {
  title: string;
  description: string;
  icon: 'project' | 'group';
}

const invoiceTypeOptions = computed<InvoiceTypeOption[]>(() => {
  const options: InvoiceTypeOption[] = [
    {
      id: InvoiceTypeEnum.SINGLE,
      title: t(InvoiceTypeLabelKeys[InvoiceTypeEnum.SINGLE]),
      description: t('invoice.type_single_description'),
      icon: 'project',
    },
    {
      id: InvoiceTypeEnum.GROUP,
      title: t(InvoiceTypeLabelKeys[InvoiceTypeEnum.GROUP]),
      description: t('invoice.type_group_description'),
      icon: 'group',
    },
  ];

  return props.enableGrouping ? options : options.slice(0, 1);
});
const getSingleInvoiceTypeOption = (): TitleInterface<string | number> => ({
  id: InvoiceTypeEnum.SINGLE,
  title: t(InvoiceTypeLabelKeys[InvoiceTypeEnum.SINGLE]),
});

const selectedInvoiceType = ref<TitleInterface<string | number> | null>(
  getSingleInvoiceTypeOption(),
);
const selectedProject = ref<TitleInterface<string | number> | null>(null);
const selectedInvoices = ref<TitleInterface<string | number>[]>([]);
const groupTitle = ref<Record<string, string>>({});
const exportStatus = ref(0);
const invoiceDate = ref('');
const invoiceAmount = ref<number | null>(null);
const notes = ref('');
const invoiceType = computed<InvoiceType | undefined>(() => {
  const selectedTypeId = selectedInvoiceType.value?.id;

  return selectedTypeId === InvoiceTypeEnum.SINGLE || selectedTypeId === InvoiceTypeEnum.GROUP
    ? selectedTypeId
    : undefined;
});
const isSingleInvoice = computed(() => invoiceType.value === InvoiceTypeEnum.SINGLE);
const isGroupInvoice = computed(() => invoiceType.value === InvoiceTypeEnum.GROUP);
const currentLanguage = computed<'en' | 'ar'>(() => (locale.value === 'ar' ? 'ar' : 'en'));
const groupTitleText = computed(() => {
  return (
    groupTitle.value[currentLanguage.value]?.trim() ||
    groupTitle.value.en?.trim() ||
    groupTitle.value.ar?.trim() ||
    undefined
  );
});
const invoiceParams = computed(
  () =>
    new IndexInvoiceParams(
      '',
      1,
      100,
      0,
      selectedProject.value?.id ? Number(selectedProject.value.id) : undefined,
      null,
      exportStatus.value,
    ),
);

const updateData = () => {
  // clg
  emit(
    'updateData',
    new AddInvoiceParams({
      type: invoiceType.value,
      project_id: selectedProject.value?.id ? Number(selectedProject.value.id) : undefined,
      title: groupTitleText.value,
      invoice_ids: selectedInvoices.value.map((invoice) => Number(invoice.id)),
      invoice_date: invoiceDate.value,
      invoice_amount: invoiceAmount.value ?? undefined,
      notes: notes.value || null,
    }),
  );
};

const updateInvoiceType = (selectedType: InvoiceTypeOption) => {
  selectedInvoiceType.value = selectedType;
  selectedInvoices.value = [];
  groupTitle.value = {};
  updateData();
};

const updateGroupTitle = (value: Record<string, string>) => {
  groupTitle.value = value;
  updateData();
};

const updateProject = (selectedProjectOption: TitleInterface<string | number> | null) => {
  selectedProject.value = selectedProjectOption;
  selectedInvoices.value = [];
  updateData();
};

const updateInvoices = (
  selectedInvoiceOptions:
    | TitleInterface<string | number>[]
    | TitleInterface<string | number>
    | null,
) => {
  if (!selectedInvoiceOptions) {
    selectedInvoices.value = [];
    updateData();
    return;
  }

  selectedInvoices.value = Array.isArray(selectedInvoiceOptions)
    ? selectedInvoiceOptions
    : [selectedInvoiceOptions];
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
    if (!props.enableGrouping) {
      selectedInvoiceType.value = getSingleInvoiceTypeOption();
    }

    selectedProject.value = invoice?.project_id
      ? {
        id: invoice.project_id,
        title: getProjectTitle(invoice),
      }
      : null;
    invoiceDate.value = invoice?.invoice_date ?? '';
    invoiceAmount.value =
      invoice?.invoice_amount === undefined || invoice?.invoice_amount === null
        ? null
        : Number(invoice.invoice_amount);
    notes.value = invoice?.notes ?? '';
    groupTitle.value = {};

    updateData();
  },
  { immediate: true },
);
</script>

<template>
  <StandardFormLayout class="invoice-form-layout">
    <section
      class="invoice-form__card invoice-form__details"
      aria-labelledby="invoice-details-title"
    >
      <header class="invoice-form__header">
        <span class="invoice-form__header-icon" aria-hidden="true">
          <InvoiceDocumentIcon />
        </span>
        <span class="invoice-form__header-copy">
          <h2 id="invoice-details-title">{{ $t('invoice.basic_information') }}</h2>
          <p>{{ $t('invoice.basic_information_description') }}</p>
        </span>
      </header>

      <div class="invoice-form__fields" :class="{ 'is-disabled': loading }">
        <div v-if="invoiceType" class="field-group invoice-form__project">
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

        <div v-if="isGroupInvoice && selectedProject" class="field-group invoice-form__invoices">
          <UpdatedCustomInputSelect
            id="invoice_ids"
            :model-value="selectedInvoices"
            :label="$t('invoice.group_invoices')"
            :controller="invoiceController"
            :placeholder="$t('invoice.group_invoices_placeholder')"
            :params="invoiceParams"
            :type="2"
            @update:model-value="updateInvoices"
          />
        </div>

        <div v-if="isSingleInvoice" class="field-group invoice-form__date">
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
            class="field-input workspace-control"
            type="date"
            @input="updateData"
          />
        </div>

        <div v-if="isSingleInvoice" class="field-group invoice-form__amount">
          <span class="field-help-label-row field-help-label-row--block">
            <label class="field-label" for="invoice_amount">{{
              $t('invoice.invoice_amount')
            }}</label>
            <FieldHelpIcon
              :label="$t('invoice.invoice_amount')"
              field-name="price"
              field-id="invoice_amount"
            />
          </span>
          <input
            id="invoice_amount"
            v-model.number="invoiceAmount"
            class="field-input workspace-control"
            min="0"
            step="1"
            type="number"
            :placeholder="$t('invoice.invoice_amount_placeholder')"
            @input="updateData"
          />
        </div>

        <div class="field-group invoice-form__group-title">
          <MultiLangInput
            :key="currentLanguage"
            field-key="title"
            :label="$t('title')"
            :languages="[currentLanguage]"
            :model-value="groupTitle"
            type="title"
            @update:model-value="updateGroupTitle"
          />
        </div>
        <div v-if="isSingleInvoice" class="field-group invoice-form__notes">
          <span class="field-help-label-row field-help-label-row--block">
            <label class="field-label" for="invoice_notes">{{ $t('invoice.notes') }}</label>
            <FieldHelpIcon
              :label="$t('invoice.notes')"
              field-name="notes"
              field-id="invoice_notes"
            />
          </span>
          <textarea
            id="invoice_notes"
            v-model="notes"
            class="field-input field-textarea workspace-control"
            :placeholder="$t('invoice.notes_placeholder')"
            @input="updateData"
          />
        </div>
      </div>

      <footer class="invoice-form__footer">
        <AppButton
          class="invoice-form__submit"
          :disabled="loading"
          :loading="loading"
          :title="$t(submitLabelKey)"
          type="button"
          @click="emit('submit')"
        >
          {{ $t(submitLabelKey) }}
        </AppButton>
      </footer>
    </section>

    <aside class="invoice-form__card invoice-form__type" aria-labelledby="invoice-type-title">
      <header class="invoice-form__type-header">
        <span class="invoice-form__header-icon" aria-hidden="true">
          <InvoiceDocumentIcon />
        </span>
        <span class="invoice-form__header-copy">
          <h2 id="invoice-type-title">{{ $t('invoice.type') }}</h2>
          <p>{{ $t('invoice.type_description') }}</p>
        </span>
      </header>

      <div class="invoice-type-options" :class="{ 'is-disabled': loading }">
        <label
          v-for="option in invoiceTypeOptions"
          :key="option.id"
          class="invoice-type-option"
          :class="{ 'is-selected': invoiceType === option.id }"
          :for="`invoice_type_${option.id}`"
        >
          <input
            :id="`invoice_type_${option.id}`"
            class="invoice-type-option__radio"
            type="radio"
            name="invoice_type"
            :value="option.id"
            :checked="invoiceType === option.id"
            :disabled="loading"
            @change="updateInvoiceType(option)"
          />
          <span class="invoice-type-option__icon" aria-hidden="true">
            <InvoiceDocumentIcon v-if="option.icon === 'project'" />
            <GroupIcon v-else />
          </span>
          <span class="invoice-type-option__copy">
            <strong>{{ option.title }}</strong>
            <small>{{ option.description }}</small>
          </span>
        </label>
      </div>
    </aside>
  </StandardFormLayout>
</template>
