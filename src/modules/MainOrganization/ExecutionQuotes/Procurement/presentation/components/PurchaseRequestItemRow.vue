<script lang="ts">
  import type TitleInterface from '@/base/Data/Models/titleInterface';
  import type { PurchaseRequestItemType } from '../../core/constants/purchase-request.constants';
  export interface PurchaseRequestItemDraft {
    key: number;
    stage: TitleInterface<string | number> | null;
    itemableType: PurchaseRequestItemType;
    itemable: TitleInterface<string | number> | null;
    quantity: number | null;
  }
</script>
<script setup lang="ts">
  import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';
  import { computed, ref, watch } from 'vue';
  import RadioButton from 'primevue/radiobutton';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import IndexMaterialParams from '@/modules/shared/Materials/core/params/index.materials.params';
  import IndexProductsParams from '@/modules/MainOrganization/Products/core/params/index.products.params';
  import { DataLoading } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import type { FieldError } from '@/base/Presentation/Utils/classValidation';
  import PurchaseRequestController from '../controllers/purchase-request.controller';
  const props = defineProps<{
    modelValue: PurchaseRequestItemDraft;
    index: number;
    canRemove: boolean;
    disabled: boolean;
    errors: FieldError[];
  }>();
  const emit = defineEmits<{ 'update:modelValue': [PurchaseRequestItemDraft]; remove: [] }>();
  const controller = PurchaseRequestController.getInstance();
  const materialLookup = controller.createLookup('material');
  const productLookup = controller.createLookup('product');
  const search = ref('');
  const lookup = computed(() =>
    props.modelValue.itemableType === 'material' ? materialLookup : productLookup,
  );
  const params = computed(() =>
    props.modelValue.itemableType === 'material'
      ? new IndexMaterialParams({ word: search.value })
      : new IndexProductsParams({ word: search.value }),
  );
  const prefix = computed(() => `requirement-item-${props.modelValue.key}`);
  const loadingStages = computed(() => controller.stagesState.value instanceof DataLoading);
  watch(
    () => props.modelValue.itemableType,
    () => {
      search.value = '';
    },
  );
  function select(
    field: 'stage' | 'itemable',
    selection: TitleInterface<string | number> | TitleInterface<string | number>[] | null,
  ) {
    emit('update:modelValue', {
      ...props.modelValue,
      [field]: Array.isArray(selection) ? null : selection,
    });
  }
  function changeType(type: PurchaseRequestItemType) {
    if (type !== props.modelValue.itemableType)
      emit('update:modelValue', { ...props.modelValue, itemableType: type, itemable: null });
  }
  function quantityInput(event: Event) {
    const input = (event.target as HTMLInputElement).value;
    emit('update:modelValue', {
      ...props.modelValue,
      quantity: input === '' ? null : Number(input),
    });
  }
  function error(field: string) {
    return props.errors.find((entry) => entry.field === `items.${props.index}.${field}`)?.message;
  }
</script>
<template>
  <fieldset class="procurement-item" :disabled="disabled">
    <legend class="procurement-sr-only">
      {{ $t('procurement.item_number', { number: index + 1 }) }}
    </legend>
    <div class="procurement-item__header">
      <strong>{{ $t('procurement.item_number', { number: index + 1 }) }}</strong>
      <AppButton
        type="button"
        theme="secondary"
        size="sm"
        :disabled="disabled || !canRemove"
        :title="$t('procurement.remove_item', { number: index + 1 })"
        :aria-label="$t('procurement.remove_item', { number: index + 1 })"
        @click="emit('remove')"
        >{{ $t('procurement.remove') }}</AppButton
      >
    </div>
    <div class="procurement-fields">
      <div
        class="field-group"
        :class="{ 'procurement-field-invalid': !!error('projectTimelineStageId') }"
      >
        <UpdatedCustomInputSelect
          :id="`${prefix}-stage`"
          :model-value="modelValue.stage"
          label="procurement.timeline_stage"
          :placeholder="$t('procurement.select_stage')"
          :static-options="controller.mainStages.value"
          :disabled="disabled || loadingStages"
          :reload="false"
          required
          @update:model-value="select('stage', $event)"
        >
          <template #LabelHeader>
            <span class="field-help-label-row">
              <FieldHelpIcon
                :label="$t('procurement.timeline_stage')"
                field-name="timeline_stage"
                :field-id="`${prefix}-stage`"
                :help-text="$t('field_help.execution_fields.timeline_stage')"
              />
            </span> </template
        ></UpdatedCustomInputSelect>
        <small v-if="error('projectTimelineStageId')" class="procurement-error" role="alert">{{
          error('projectTimelineStageId')
        }}</small>
      </div>
      <fieldset class="field-group procurement-type">
        <legend>
          <span class="field-help-label-row"
            >{{ $t('procurement.item_type')
            }}<FieldHelpIcon
              :label="$t('procurement.item_type')"
              field-name="item_type"
              :field-id="`${prefix}-type`"
              :help-text="$t('field_help.execution_fields.item_type')"
            />
          </span>
        </legend>
        <div class="procurement-type-options">
          <label :for="`${prefix}-material`"
            ><RadioButton
              :input-id="`${prefix}-material`"
              :name="`${prefix}-type`"
              :model-value="modelValue.itemableType"
              value="material"
              :disabled="disabled"
              @update:model-value="changeType('material')"
            />{{ $t('procurement.material') }}</label
          >
          <label :for="`${prefix}-product`"
            ><RadioButton
              :input-id="`${prefix}-product`"
              :name="`${prefix}-type`"
              :model-value="modelValue.itemableType"
              value="product"
              :disabled="disabled"
              @update:model-value="changeType('product')"
            />{{ $t('procurement.product') }}</label
          >
        </div>
        <small v-if="error('itemableType')" class="procurement-error" role="alert">{{
          error('itemableType')
        }}</small>
      </fieldset>
      <div class="field-group" :class="{ 'procurement-field-invalid': !!error('itemableId') }">
        <UpdatedCustomInputSelect
          :id="`${prefix}-catalog`"
          :key="modelValue.itemableType"
          :model-value="modelValue.itemable"
          :label="`procurement.${modelValue.itemableType}`"
          :placeholder="$t('procurement.select_item')"
          :controller="lookup"
          :params="params"
          :disabled="disabled"
          :reload="false"
          paginated
          required
          @update:model-value="select('itemable', $event)"
        >
          <template #LabelHeader>
            <span class="field-help-label-row">
              <FieldHelpIcon
                :label="$t(`procurement.${modelValue.itemableType}`)"
                field-name="catalog"
                :field-id="`${prefix}-catalog`"
                :help-text="$t('field_help.execution_fields.catalog')"
              />
            </span> </template
        ></UpdatedCustomInputSelect>
        <small v-if="error('itemableId')" class="procurement-error" role="alert">{{
          error('itemableId')
        }}</small>
      </div>
      <div class="field-group input-wrapper">
        <span class="field-help-label-row field-help-label-row--block"
          ><label class="field-label label" :for="`${prefix}-quantity`">{{
            $t('procurement.quantity')
          }}</label>
          <FieldHelpIcon
            :label="$t('procurement.quantity')"
            field-name="quantity"
            :field-id="`${prefix}-quantity`"
            :help-text="$t('field_help.execution_fields.quantity')"
          />
        </span>
        <input
          :id="`${prefix}-quantity`"
          :value="modelValue.quantity"
          class="input workspace-control"
          type="number"
          step="0.01"
          min="0.01"
          :disabled="disabled"
          :aria-invalid="!!error('quantity')"
          :aria-describedby="`${prefix}-quantity-help ${prefix}-quantity-error`"
          @input="quantityInput"
        />
        <small :id="`${prefix}-quantity-help`">{{ $t('procurement.quantity_help') }}</small>
        <small :id="`${prefix}-quantity-error`" class="procurement-error" role="alert">{{
          error('quantity')
        }}</small>
      </div>
    </div>
  </fieldset>
</template>
