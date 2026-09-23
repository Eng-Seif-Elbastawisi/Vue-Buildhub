<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import TitleInterface from '@/base/Data/Models/titleInterface';
import { dialogManager } from '@/base/Presentation/Dialogs/dialog.manager';
import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
import AppButton from '@/shared/HelpersComponents/AppButton.vue';
import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';

import ProductsController from '@/modules/MainOrganization/Products/presentation/controllers/products.controller';
import IndexProductsParams from '@/modules/MainOrganization/Products/core/params/index.products.params';
import type ProductsModel from '@/modules/MainOrganization/Products/core/models/products.model';

import MaterialController from '@/modules/shared/Materials/presentation/controllers/materials.controller';
import IndexMaterialParams from '@/modules/shared/Materials/core/params/index.materials.params';
import type MaterialsModel from '@/modules/shared/Materials/core/models/materials.model';

import LaborController from '@/modules/MainOrganization/Labors/presentation/controllers/labor.controller';
import IndexLaborParams from '@/modules/MainOrganization/Labors/core/params/index.labor.params';
import type LaborModel from '@/modules/MainOrganization/Labors/core/models/labor.model';

import {
  ExecutionQuoteItemSourceEnum,
  type ExecutionQuoteItemSource,
} from '../../../core/constants/execution.quote.item.source.enum';
import type { ExecutionQuoteItemDraft } from '../../types/execution.quote.ui.types';

const props = withDefaults(
  defineProps<{
    source: ExecutionQuoteItemSource | null;
    subStageId?: number | string;
    loading?: boolean;
    disabled?: boolean;
    pricingEnabled?: boolean;
  }>(),
  {
    subStageId: undefined,
    loading: false,
    disabled: false,
    pricingEnabled: true,
  },
);

const emit = defineEmits<{
  (event: 'add', item: ExecutionQuoteItemDraft): void;
}>();

const { t } = useI18n();

const productsController = ProductsController.getInstance();
const materialController = MaterialController.getInstance();
const laborController = LaborController.getInstance();

const productsParams = new IndexProductsParams({
  perPage: 100,
  withPage: 0,
  status: true,
});

const materialParams = new IndexMaterialParams('', 1, 100, 0);

const laborParams = new IndexLaborParams({
  perPage: 100,
  withPage: 0,
  active: 1,
});

const selectedProduct = ref<TitleInterface<string | number> | null>(null);
const selectedMaterial = ref<TitleInterface<string | number> | null>(null);
const selectedLabor = ref<TitleInterface<string | number> | null>(null);

const selectedSorting = ref<TitleInterface<string | number> | null>(null);
const quantity = ref(1);
const unitPrice = ref(0);

const isDisabled = computed(() => props.loading || props.disabled);

type UnknownRecord = Record<string, unknown>;

interface ProductSortingOption {
  id: number;
  title: string;
  price: number;
}

const asRecord = (value: unknown): UnknownRecord | undefined => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return undefined;
  }

  return value as UnknownRecord;
};

const valueToText = (value: unknown): string => {
  if (value === undefined || value === null || value === '') return '';

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  const objectValue = asRecord(value);
  if (!objectValue) return '';

  const displayValue =
    objectValue.title ?? objectValue.name ?? objectValue.label ?? objectValue.value;

  return displayValue === undefined || displayValue === null ? '' : String(displayValue);
};

const getNestedValue = (record: UnknownRecord, path: string[]): unknown => {
  let current: unknown = record;

  for (const key of path) {
    const currentRecord = asRecord(current);
    if (!currentRecord || !(key in currentRecord)) return undefined;
    current = currentRecord[key];
  }

  return current;
};

const getFirstText = (record: UnknownRecord | undefined, paths: string[][]): string => {
  if (!record) return '';

  for (const path of paths) {
    const text = valueToText(getNestedValue(record, path));
    if (text) return text;
  }

  return '';
};

const getFirstNumber = (record: UnknownRecord | undefined, paths: string[][]): number => {
  if (!record) return 0;

  for (const path of paths) {
    const rawValue = getNestedValue(record, path);
    if (rawValue === undefined || rawValue === null || rawValue === '') continue;

    const numberValue = Number(rawValue);
    if (Number.isFinite(numberValue) && numberValue >= 0) return numberValue;
  }

  return 0;
};

const toOptionalId = (selection: TitleInterface<string | number> | null): number | undefined => {
  if (selection?.id === undefined || selection.id === null) return undefined;

  const id = Number(selection.id);
  return Number.isInteger(id) && id > 0 ? id : undefined;
};

const selectedItem = computed(() => {
  if (props.source === ExecutionQuoteItemSourceEnum.PRODUCT) return selectedProduct.value;
  if (props.source === ExecutionQuoteItemSourceEnum.BUILDING_MATERIAL)
    return selectedMaterial.value;
  if (props.source === ExecutionQuoteItemSourceEnum.LABOR) return selectedLabor.value;
  return null;
});

const selectedRecord = computed<ProductsModel | MaterialsModel | LaborModel | undefined>(() => {
  const sourceId = toOptionalId(selectedItem.value);
  if (!sourceId || !props.source) return undefined;

  const records =
    props.source === ExecutionQuoteItemSourceEnum.PRODUCT
      ? productsController.listData.value
      : props.source === ExecutionQuoteItemSourceEnum.BUILDING_MATERIAL
        ? materialController.listData.value
        : laborController.listData.value;

  return (records ?? []).find((record) => Number(record.id) === sourceId) as
    ProductsModel | MaterialsModel | LaborModel | undefined;
});

const selectedRecordData = computed<UnknownRecord | undefined>(() =>
  asRecord(selectedRecord.value),
);

const selectedSourceTitle = computed(() => {
  const recordTitle = getFirstText(selectedRecordData.value, [['title'], ['name']]);
  return recordTitle || selectedItem.value?.title || '';
});

/**
 * The APIs you shared use `item_type` for Products, Materials and Labor.
 * Fallback aliases are kept so the form remains compatible if a model mapper
 * exposes camelCase fields.
 */
const typeName = computed(() =>
  getFirstText(selectedRecordData.value, [
    ['item_type', 'title'],
    ['itemType', 'title'],
    ['item_type_title'],
    ['itemTypeTitle'],
    ['type', 'title'],
    ['typeTitle'],
  ]),
);

/**
 * The three APIs use `measurement_unit`.
 */
const unitName = computed(() =>
  getFirstText(selectedRecordData.value, [
    ['measurement_unit', 'title'],
    ['measurementUnit', 'title'],
    ['measurement_unit_title'],
    ['measurementUnitTitle'],
    ['unit', 'title'],
    ['unitTitle'],
  ]),
);

/**
 * Products => expected_price
 * Materials / Labor => price
 */
const recordPrice = computed(() =>
  getFirstNumber(selectedRecordData.value, [
    ['expected_price'],
    ['expectedPrice'],
    ['price'],
    ['unit_price'],
    ['unitPrice'],
  ]),
);

const productHasSorting = computed(() => {
  if (props.source !== ExecutionQuoteItemSourceEnum.PRODUCT) return false;

  const record = selectedRecordData.value;
  if (!record) return false;

  return Boolean(record.has_sorting ?? record.hasSorting);
});

const productSortings = computed<ProductSortingOption[]>(() => {
  if (props.source !== ExecutionQuoteItemSourceEnum.PRODUCT) return [];

  const rawSortings = selectedRecordData.value?.sortings;
  if (!Array.isArray(rawSortings)) return [];

  return rawSortings
    .map((sorting) => {
      const data = asRecord(sorting);
      if (!data) return null;

      const id = Number(data.id);
      const title = valueToText(data.title);
      const price = Number(data.price ?? 0);

      if (!Number.isInteger(id) || id <= 0 || !title) return null;

      return {
        id,
        title,
        price: Number.isFinite(price) && price >= 0 ? price : 0,
      } satisfies ProductSortingOption;
    })
    .filter((sorting): sorting is ProductSortingOption => sorting !== null);
});

const sortingOptions = computed<TitleInterface<string | number>[]>(() =>
  productSortings.value.map(
    (sorting) =>
      new TitleInterface<string | number>({
        id: sorting.id,
        title: sorting.title,
        subtitle: sorting.price,
      }),
  ),
);

const selectedSortingData = computed(() =>
  productSortings.value.find((sorting) => sorting.id === toOptionalId(selectedSorting.value)),
);

const sortingRequired = computed(
  () => productHasSorting.value && productSortings.value.length > 0,
);

const hasSelectedSourceItem = computed(() => Boolean(toOptionalId(selectedItem.value)));

const itemValuesAreValid = computed(
  () =>
    Number.isFinite(quantity.value) &&
    quantity.value > 0 &&
    (!props.pricingEnabled || (Number.isFinite(unitPrice.value) && unitPrice.value >= 0)),
);

const isItemReadyToAdd = computed(
  () =>
    hasSelectedSourceItem.value &&
    (!sortingRequired.value || Boolean(toOptionalId(selectedSorting.value))) &&
    itemValuesAreValid.value,
);

const itemGuidanceKey = computed(() => {
  if (!hasSelectedSourceItem.value) {
    return props.pricingEnabled
      ? 'execution_quote.item_guidance.choose_item'
      : 'execution_quote.item_guidance.choose_item_without_pricing';
  }
  if (sortingRequired.value && !toOptionalId(selectedSorting.value)) {
    return 'execution_quote.item_guidance.choose_sorting';
  }
  if (!itemValuesAreValid.value) {
    return props.pricingEnabled
      ? 'execution_quote.item_guidance.review_values'
      : 'execution_quote.item_guidance.review_quantity';
  }
  return props.pricingEnabled
    ? 'execution_quote.item_guidance.ready'
    : 'execution_quote.item_guidance.ready_without_pricing';
});

const clearSelectedSource = () => {
  selectedProduct.value = null;
  selectedMaterial.value = null;
  selectedLabor.value = null;
  selectedSorting.value = null;
};

const clearEntryValues = () => {
  quantity.value = 1;
  unitPrice.value = 0;
};

const clear = () => {
  clearSelectedSource();
  clearEntryValues();
};

watch(
  () => props.source,
  () => clear(),
);

watch(selectedItem, () => {
  selectedSorting.value = null;
  unitPrice.value = props.pricingEnabled ? recordPrice.value : 0;
});

watch(recordPrice, (price) => {
  if (props.pricingEnabled && selectedItem.value && !selectedSortingData.value) {
    unitPrice.value = price;
  }
});

watch(selectedSorting, () => {
  if (!props.pricingEnabled) {
    unitPrice.value = 0;
  } else if (selectedSortingData.value) {
    unitPrice.value = selectedSortingData.value.price;
  } else if (selectedItem.value) {
    unitPrice.value = recordPrice.value;
  }
});

const add = () => {
  const sourceId = toOptionalId(selectedItem.value);

  if (!props.source || !props.subStageId || !sourceId) {
    dialogManager.toastWarning(t('execution_quote.validation.item_required'));
    return;
  }

  if (sortingRequired.value && !toOptionalId(selectedSorting.value)) {
    dialogManager.toastWarning(t('execution_quote.validation.item_required'));
    return;
  }

  if (
    !Number.isFinite(quantity.value) ||
    quantity.value <= 0 ||
    (props.pricingEnabled && (!Number.isFinite(unitPrice.value) || unitPrice.value < 0))
  ) {
    dialogManager.toastWarning(t('execution_quote.validation.item_values'));
    return;
  }

  emit('add', {
    source_id: sourceId,
    sorting_id:
      props.source === ExecutionQuoteItemSourceEnum.PRODUCT
        ? toOptionalId(selectedSorting.value)
        : undefined,
    quantity: Number(quantity.value),
    unit_price: props.pricingEnabled ? Number(unitPrice.value) : 0,
    source_title: selectedSourceTitle.value,
    unit_name: unitName.value,
    sorting_title: selectedSortingData.value?.title,
  });

  clear();
};
</script>

<template>
  <section class="execution-quote__card workflow-section">
    <div class="section-title">
      <h2>{{ $t('execution_quote.select_item_title') }}</h2>

      <span v-if="isItemReadyToAdd" class="section-title__badge">
        {{ $t('execution_quote.ready_to_add') }}
      </span>
    </div>

    <div v-if="!source || !subStageId" class="stage-empty">
      {{ $t('execution_quote.select_sub_stage_and_source') }}
    </div>

    <div v-else class="item-form">
      <div class="item-guidance" :class="{ 'item-guidance--ready': isItemReadyToAdd }" role="status" aria-live="polite">
        <span class="item-guidance__icon" aria-hidden="true">
          <i :class="isItemReadyToAdd ? 'pi pi-check-circle' : 'pi pi-info-circle'"></i>
        </span>
        <div>
          <strong>{{ $t('execution_quote.item_guidance.title') }}</strong>
          <p>{{ $t(itemGuidanceKey) }}</p>
        </div>
      </div>

      <div v-if="source === ExecutionQuoteItemSourceEnum.PRODUCT" class="item-form__selector">
        <UpdatedCustomInputSelect id="execution-quote-product" v-model="selectedProduct"
          :controller="productsController" :params="productsParams"
          :placeholder="$t('execution_quote.placeholders.product')" label="execution_quote.item_fields.product"
          :disabled="isDisabled" required />
      </div>

      <div v-else-if="source === ExecutionQuoteItemSourceEnum.BUILDING_MATERIAL" class="item-form__selector">
        <UpdatedCustomInputSelect id="execution-quote-material" v-model="selectedMaterial"
          :controller="materialController" :params="materialParams"
          :placeholder="$t('execution_quote.placeholders.material')" label="execution_quote.item_fields.material"
          :disabled="isDisabled" required />
      </div>

      <div v-else class="item-form__selector">
        <UpdatedCustomInputSelect id="execution-quote-labor" v-model="selectedLabor" :controller="laborController"
          :params="laborParams" :placeholder="$t('execution_quote.placeholders.labor')"
          label="execution_quote.item_fields.labor" :disabled="isDisabled" required />
      </div>

      <div class="item-form__fields" :class="{
        'item-form__fields--product': source === ExecutionQuoteItemSourceEnum.PRODUCT,
      }">
        <div class="item-display-field">
          <span class="item-field-label">
            {{ $t('execution_quote.item_fields.type') }}
            <FieldHelpIcon field-name="type" :label="$t('execution_quote.item_fields.type')" />
          </span>
          <div class="item-display-control">
            <strong>{{ typeName || $t('execution_quote.not_available') }}</strong>
          </div>
        </div>

        <div v-if="source === ExecutionQuoteItemSourceEnum.PRODUCT" class="item-input-field item-input-field--select">
          <UpdatedCustomInputSelect id="execution-quote-product-sorting" v-model="selectedSorting"
            :static-options="sortingOptions" :placeholder="productSortings.length
              ? $t('execution_quote.item_fields.sorting')
              : $t('execution_quote.not_available')
              " label="execution_quote.item_fields.sorting"
            :disabled="isDisabled || !hasSelectedSourceItem || !productSortings.length" :required="sortingRequired"
            :reload="false" />
        </div>

        <div class="item-display-field">
          <span class="item-field-label">
            {{ $t('execution_quote.item_fields.unit') }}
            <FieldHelpIcon field-name="measurement" :label="$t('execution_quote.item_fields.unit')" />
          </span>
          <div class="item-display-control">
            <strong>{{ unitName || $t('execution_quote.not_available') }}</strong>
          </div>
        </div>

        <label class="item-input-field" for="execution-quote-item-quantity">
          <span class="item-field-label">
            {{ $t('execution_quote.item_fields.quantity') }}
          </span>
          <input id="execution-quote-item-quantity" v-model.number="quantity" class="item-control" type="number" min="1"
            step="1" :disabled="isDisabled" />
        </label>

        <label v-if="pricingEnabled" class="item-input-field" for="execution-quote-item-unit-price">
          <span class="item-field-label">
            {{ $t('execution_quote.item_fields.unit_price') }}
            <FieldHelpIcon field-name="price" :label="$t('execution_quote.item_fields.unit_price')" />
          </span>
          <input id="execution-quote-item-unit-price" v-model.number="unitPrice" class="item-control" type="number"
            min="0" step="1" :disabled="isDisabled" />
        </label>

        <AppButton class="add-item-button" icon="right" :disabled="isDisabled ||
          !hasSelectedSourceItem ||
          !itemValuesAreValid ||
          (sortingRequired && !toOptionalId(selectedSorting))
          " @click="add">
          <template #icon>
            <i class="pi pi-plus" aria-hidden="true"></i>
          </template>
          {{ $t('execution_quote.add_item') }}
        </AppButton>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.execution-quote__card {
  padding: 1.1rem;
  background: var(--bg-card);
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.section-title h2 {
  margin: 0;
  font-size: 1.15rem;
}

.section-title__badge {
  border-radius: var(--radius-full);
  background: var(--PrimaryColor-light);
  color: var(--PrimaryColor);
  font-size: var(--xs-size);
  font-weight: 700;
  padding: 0.25rem 0.55rem;
}

.stage-empty {
  border: 1px dashed var(--border-weak);
  border-radius: var(--radius-sm);
  color: var(--subtitle-color);
  font-size: var(--xs-size);
  margin-top: 0.85rem;
  padding: 1.25rem;
  text-align: center;
}

.item-form {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  margin-top: 0.85rem;
}

.item-form__selector {
  min-width: 0;
}

.item-guidance {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.8rem 0.9rem;
  border: 1px solid var(--PrimaryColor-alpha-20);
  border-radius: var(--radius-md);
  background: var(--info-light);
  color: var(--title-card-color);
}

.item-guidance--ready {
  border-color: var(--PrimaryColor-alpha-30);
  background: var(--light-green-bg);
}

.item-guidance__icon {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-full);
  background: var(--PrimaryColor-alpha-10);
  color: var(--PrimaryColor);
}

.item-guidance strong,
.item-guidance p {
  display: block;
  margin: 0;
}

.item-guidance strong {
  font-size: var(--sm-size);
}

.item-guidance p {
  margin-top: 0.2rem;
  color: var(--subtitle-color);
  font-size: var(--xs-size);
  line-height: 1.55;
}

.item-form__fields {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr)) auto;
  align-items: end;
  gap: 0.75rem;
}

.item-form__fields--product {
  grid-template-columns: repeat(5, minmax(0, 1fr)) auto;
}

.item-display-field,
.item-input-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
}

.item-display-control {
  display: flex;
  align-items: center;
  min-height: 2.65rem;
  padding: 0.5rem 0.7rem;
  border: 1px solid var(--input-border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
}

.item-field-label {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: var(--subtitle-color);
  font-size: var(--xs-size);
  font-weight: 600;
}

.item-display-control strong {
  overflow: hidden;
  color: var(--title-card-color);
  font-size: var(--sm-size);
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-control {
  width: 100%;
  min-height: 2.65rem;
  border: 1px solid var(--input-border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  color: var(--Title-input-Color);
  padding: 0.55rem 0.7rem;
  outline: none;
}

.item-control:focus {
  border-color: var(--PrimaryColor);
}

.item-control:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.add-item-button {
  align-self: end;
  min-height: 2.65rem;
  white-space: nowrap;
}

@media (max-width: 1200px) {

  .item-form__fields,
  .item-form__fields--product {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {

  .item-form__fields,
  .item-form__fields--product {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 520px) {

  .item-form__fields,
  .item-form__fields--product {
    grid-template-columns: 1fr;
  }

  .add-item-button {
    width: 100%;
  }
}
</style>