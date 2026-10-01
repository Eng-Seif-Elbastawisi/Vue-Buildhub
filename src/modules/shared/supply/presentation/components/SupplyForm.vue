<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import type TitleInterface from '@/base/Data/Models/titleInterface';
import IndexBrandParams from '@/modules/shared/Brand/core/params/index.brand.params';
import BrandController from '@/modules/shared/Brand/presentation/controllers/brand.controller';
import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
import MultiLangInput from '@/shared/MultiLangInput.vue';
import { useFormsStore } from '@/stores/formsStore';
import type SupplyShowModel from '../../core/models/supply.show.model';
import AddSupplyParams from '../../core/params/add.supply.params';
import MeasurementController from '@/modules/shared/measurement/presentation/controllers/measurement.controller';
import IndexMeasurementParams from '@/modules/shared/measurement/core/params/index.measurement.params';
import DocumentIcon from '@/shared/icons/DocaumentType/DocumentIcon.vue';
import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';

const emit = defineEmits<{
  updateData: [params: AddSupplyParams];
}>();

const props = defineProps<{
  supply?: SupplyShowModel;
  formKey?: string;
  loading?: boolean;
}>();

const formStore = useFormsStore();
const brandController = BrandController.getInstance();
const brandParams = new IndexBrandParams('', 1, 100, 0, undefined, 2);
const measurementController = MeasurementController.getInstance();
const measurementParams = new IndexMeasurementParams('', 1, 100, 0);

const translations = ref<Record<string, string>>({});
const price = ref<number>();
const brand = ref<TitleInterface<string | number> | null>(null);
const measurement = ref<TitleInterface<string | number> | null>(null);

onBeforeRouteLeave((to, from) => {
  const savedData = props.formKey ? formStore.getFormData(props.formKey) : null;
  if (savedData && to.path !== from.path && props.formKey) {
    formStore.showReturnWarning(props.formKey);
  }
});

// watch(
//   () => props.supply,
//   (supply) => {
//     if (!supply) return;

//     translations.value = { ...supply.translations.title };
//     price.value = supply.price;
//     brand.value = supply.brandId;
//     measurement.value = supply.measurementId;
//   },
//   { immediate: true },
// );
watch(
  () => props.supply,
  (supply) => {
    if (!supply) return;

    translations.value = { ...supply.translations.title };
    price.value = supply.price;

    brand.value =
      supply.brandId?.id !== undefined && supply.brandId?.id !== null
        ? {
          id: supply.brandId.id,
          title: supply.brandId.title ?? '',
        }
        : null;

    measurement.value =
      supply.measurementId?.id !== undefined && supply.measurementId?.id !== null
        ? {
          id: supply.measurementId.id,
          title: supply.measurementId.title ?? '',
        }
        : null;
  },
  { immediate: true },
);

const updateData = () => {
  emit(
    'updateData',
    new AddSupplyParams({
      price: price.value,
      brandId: brand.value?.id,
      measurementId: measurement.value?.id,
      translations: { title: translations.value },
    }),
  );
};

const updateTranslations = (value: Record<string, string>) => {
  translations.value = value;
  updateData();
};

onMounted(updateData);
</script>

<template>
  <div class="supply-form-card">
    <div class="document-form-header">
      <DocumentIcon />
      <header class="form-header">
        <h3>{{ $t('supply.form_title') }}</h3>
        <p>{{ $t('supply.form_description') }}</p>
      </header>
    </div>

    <div class="form-fields" :class="{ disabled: loading }">
      <div class="field-group col-span-2">
        <!-- {{ translations }} -->
        <MultiLangInput field-key="title" :label="$t('supply.title')" :languages="['en', 'ar']"
          :model-value="translations" type="title" @update:model-value="updateTranslations" />
      </div>

      <div class="field-group">
        <span class="field-help-label-row field-help-label-row--block">
          <label class="field-label" for="supply-price">{{ $t('supply.price') }}</label>
          <FieldHelpIcon :label="$t('supply.price')" field-name="price" field-id="supply-price" />
        </span>
        <div class="input-wrap">
          <input id="supply-price" v-model.number="price" class="field-input" min="0" step="1" type="number"
            :placeholder="$t('supply.price_placeholder')" @input="updateData" />
        </div>
      </div>

      <!-- {{ brand }} -->
      <div class="field-group">
        <UpdatedCustomInputSelect id="supply-brand" v-model="brand" :controller="brandController"
          :label="$t('supply.brand')" :params="brandParams" :placeholder="$t('supply.brand_placeholder')" required
          @update:model-value="updateData" />
      </div>
      <!-- {{ measurement }} -->
      <div class="field-group">
        <UpdatedCustomInputSelect id="supply-measurement" v-model="measurement" :controller="measurementController"
          :label="$t('measurement')" :params="measurementParams" :placeholder="$t('measurement.unit_placeholder')"
          required @update:model-value="updateData" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.document-form-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.input-wrap {
  input {
    width: 100%;
    padding: 12px 16px;
    padding-inline-end: 50px;
    border: 1px solid var(--border-weak);
    border-radius: 28px;
    background: var(--white);
    outline: none;
    transition: all 0.25s ease;
    font-family: 'Medium';
    font-weight: 400;
    font-size: var(--sm-size);
    color: var(--bread-crumb-color-span);
    max-height: 200px;
    max-width: 100%;
  }
}

.supply-form-card {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-header p {
  color: var(--gray-5);
}

.form-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;

  &.disabled {
    pointer-events: none;
    opacity: 0.7;
  }
}

.col-span-2 {
  grid-column: span 2;
}

@media (max-width: 768px) {
  .form-fields {
    grid-template-columns: 1fr;
  }

  .col-span-2 {
    grid-column: span 1;
  }
}
</style>
