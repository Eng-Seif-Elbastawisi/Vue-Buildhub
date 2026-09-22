<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type TitleInterface from '@/base/Data/Models/titleInterface';
import { dialogManager } from '@/base/Presentation/Dialogs/dialog.manager';
import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';

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
  }>(),
  {
    subStageId: undefined,
    loading: false,
    disabled: false,
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

const selectedSortingId = ref<number | null>(null);
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

const toOptionalId = (
  selection: TitleInterface<string | number> | null,
): number | undefined => {
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
    | ProductsModel
    | MaterialsModel
    | LaborModel
    | undefined;
});

const selectedRecordData = computed<UnknownRecord | undefined>(() => asRecord(selectedRecord.value));

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

const selectedSorting = computed(() =>
  productSortings.value.find((sorting) => sorting.id === selectedSortingId.value),
);

const sortingRequired = computed(
  () => productHasSorting.value && productSortings.value.length > 0,
);

const hasSelectedSourceItem = computed(() => Boolean(toOptionalId(selectedItem.value)));

const clearSelectedSource = () => {
  selectedProduct.value = null;
  selectedMaterial.value = null;
  selectedLabor.value = null;
  selectedSortingId.value = null;
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
  selectedSortingId.value = null;
  unitPrice.value = recordPrice.value;
});

watch(recordPrice, (price) => {
  if (selectedItem.value && !selectedSorting.value) {
    unitPrice.value = price;
  }
});

watch(selectedSortingId, () => {
  if (selectedSorting.value) {
    unitPrice.value = selectedSorting.value.price;
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

  if (sortingRequired.value && !selectedSortingId.value) {
    dialogManager.toastWarning(t('execution_quote.validation.item_required'));
    return;
  }

  if (
    !Number.isFinite(quantity.value) ||
    quantity.value <= 0 ||
    !Number.isFinite(unitPrice.value) ||
    unitPrice.value < 0
  ) {
    dialogManager.toastWarning(t('execution_quote.validation.item_values'));
    return;
  }

  emit('add', {
    source_id: sourceId,
    sorting_id:
      props.source === ExecutionQuoteItemSourceEnum.PRODUCT
        ? selectedSortingId.value
        : undefined,
    quantity: Number(quantity.value),
    unit_price: Number(unitPrice.value),
    source_title: selectedSourceTitle.value,
    unit_name: unitName.value,
    sorting_title: selectedSorting.value?.title,
  });

  clear();
};
</script>

<template>
  <section class="execution-quote__card workflow-section">
    <div class="section-title">
      <h2>{{ $t('execution_quote.select_item_title') }}</h2>

      <span v-if="source && subStageId" class="section-title__badge">
        {{ $t('execution_quote.ready_to_add') }}
      </span>
    </div>

    <div v-if="!source || !subStageId" class="stage-empty">
      {{ $t('execution_quote.select_sub_stage_and_source') }}
    </div>

    <div v-else class="item-form">
      <!-- Item selector -->
      <UpdatedCustomInputSelect
        v-if="source === ExecutionQuoteItemSourceEnum.PRODUCT"
        id="execution-quote-product"
        v-model="selectedProduct"
        :controller="productsController"
        :params="productsParams"
        :placeholder="$t('execution_quote.placeholders.product')"
        :label="$t('execution_quote.item_fields.product')"
        :disabled="isDisabled"
        required
      />

      <UpdatedCustomInputSelect
        v-else-if="source === ExecutionQuoteItemSourceEnum.BUILDING_MATERIAL"
        id="execution-quote-material"
        v-model="selectedMaterial"
        :controller="materialController"
        :params="materialParams"
        :placeholder="$t('execution_quote.placeholders.material')"
        :label="$t('execution_quote.item_fields.material')"
        :disabled="isDisabled"
        required
      />

      <UpdatedCustomInputSelect
        v-else
        id="execution-quote-labor"
        v-model="selectedLabor"
        :controller="laborController"
        :params="laborParams"
        :placeholder="$t('execution_quote.placeholders.labor')"
        :label="$t('execution_quote.item_fields.labor')"
        :disabled="isDisabled"
        required
      />

      <!--
        Product:
        Type | Sorting(select) | Unit | Quantity | Unit Price | Add

        Building Material / Labor:
        Type | Unit | Quantity | Unit Price | Add
      -->
      <div
        class="item-form__fields"
        :class="{
          'item-form__fields--product': source === ExecutionQuoteItemSourceEnum.PRODUCT,
        }"
      >
        <!-- Type -->
        <div class="item-display-field">
          <span class="item-field-label">
            {{ $t('execution_quote.item_fields.type') }}
            <span class="item-field-help" aria-hidden="true">?</span>
          </span>
          <strong>{{ typeName || $t('execution_quote.not_available') }}</strong>
        </div>

        <!-- Sorting: Products only -->
        <label
          v-if="source === ExecutionQuoteItemSourceEnum.PRODUCT"
          class="item-input-field"
        >
          <span class="item-field-label">
            {{ $t('execution_quote.item_fields.grade') }}
            <span class="item-field-help" aria-hidden="true">?</span>
          </span>

          <select
            v-model.number="selectedSortingId"
            :disabled="isDisabled || !hasSelectedSourceItem || !productSortings.length"
            class="item-control"
          >
            <option :value="null">
              {{
                productSortings.length
                  ? $t('execution_quote.item_fields.grade')
                  : $t('execution_quote.not_available')
              }}
            </option>

            <option
              v-for="sorting in productSortings"
              :key="sorting.id"
              :value="sorting.id"
            >
              {{ sorting.title }}
            </option>
          </select>
        </label>

        <!-- Unit -->
        <div class="item-display-field">
          <span class="item-field-label">
            {{ $t('execution_quote.item_fields.unit') }}
            <span class="item-field-help" aria-hidden="true">?</span>
          </span>
          <strong>{{ unitName || $t('execution_quote.not_available') }}</strong>
        </div>

        <!-- Quantity -->
        <label class="item-input-field">
          <span class="item-field-label">
            {{ $t('execution_quote.item_fields.quantity') }}
          </span>
          <input
            v-model.number="quantity"
            class="item-control"
            type="number"
            min="0.01"
            step="0.01"
            :disabled="isDisabled"
          />
        </label>

        <!-- Unit Price -->
        <label class="item-input-field">
          <span class="item-field-label">
            {{ $t('execution_quote.item_fields.unit_price') }}
            <span class="item-field-help" aria-hidden="true">?</span>
          </span>
          <input
            v-model.number="unitPrice"
            class="item-control"
            type="number"
            min="0"
            step="0.01"
            :disabled="isDisabled"
          />
        </label>

        <button
          type="button"
          class="add-item-button"
          :disabled="isDisabled || !hasSelectedSourceItem || (sortingRequired && !selectedSortingId)"
          @click="add"
        >
          <span aria-hidden="true">+</span>
          {{ $t('execution_quote.add_item') }}
        </button>
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

.item-display-field {
  justify-content: center;
  min-height: 2.65rem;
  border: 1px solid var(--input-border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  padding: 0.5rem 0.7rem;
}

.item-field-label {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: var(--subtitle-color);
  font-size: var(--xs-size);
  font-weight: 600;
}

.item-display-field strong {
  overflow: hidden;
  color: var(--title-card-color);
  font-size: var(--sm-size);
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-field-help {
  display: inline-grid;
  place-items: center;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: var(--PrimaryColor-light);
  color: var(--PrimaryColor);
  font-size: 0.65rem;
  font-weight: 800;
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

select.item-control {
  cursor: pointer;
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
  border: 1px solid var(--PrimaryColor);
  border-radius: var(--radius-sm);
  background: var(--PrimaryColor);
  color: var(--white);
  cursor: pointer;
  padding: 0.55rem 0.85rem;
  white-space: nowrap;
}

.add-item-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
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
