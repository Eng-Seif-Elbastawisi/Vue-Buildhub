<script setup lang="ts">
  import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';
  import { computed, ref, nextTick } from 'vue';
  import { useI18n } from 'vue-i18n';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import TitleInterface from '@/base/Data/Models/titleInterface';
  import IndexSuppliersParams from '@/modules/MainOrganization/Suppliers/core/params/index.Suppliers.params';
  import {
    DurationType,
    getDurationTypeNameKey,
  } from '@/modules/shared/Package/core/constants/duration.type.enum';
  import type { FieldError } from '@/base/Presentation/Utils/classValidation';
  import PurchaseRequestPricesController from '../controllers/purchase-request-prices.controller';
  import type { SupplierOfferDraft } from '../controllers/purchase-request-prices.controller';
  const props = defineProps<{
    row: SupplierOfferDraft;
    index: number;
    disabled: boolean;
    errors: FieldError[];
  }>();
  const emit = defineEmits<{ update: [Partial<SupplierOfferDraft>]; remove: [] }>();
  const { t } = useI18n();
  const lookup = PurchaseRequestPricesController.getInstance().createSupplierLookup();
  const search = ref('');
  const supplierSelectionVersion = ref(0);
  const params = computed(() => new IndexSuppliersParams(search.value, 1, 10, 0));
  const prefix = computed(() => `supplier-offer-${props.row.key}`);
  const units = computed(() =>
    Object.values(DurationType).map(
      (id) => new TitleInterface({ id, title: t(getDurationTypeNameKey(id)) }),
    ),
  );
  const unit = computed(
    () => units.value.find((option) => option.id === props.row.durationType?.id) ?? null,
  );
  async function selected(
    field: 'supplier' | 'durationType',
    value: TitleInterface<string | number> | TitleInterface<string | number>[] | null,
  ) {
    const selection = Array.isArray(value) ? null : value;
    emit('update', { [field]: selection });
    if (field === 'supplier') {
      await nextTick();
      // Shared select holds local state; reset it when the parent rejects a duplicate.
      if (props.row.supplier?.id !== selection?.id) supplierSelectionVersion.value++;
    }
  }
  function input(field: 'price' | 'duration', event: Event) {
    emit('update', { [field]: (event.target as HTMLInputElement).value });
  }
  function error(field: string) {
    return props.errors.find((error) => error.field === `suppliers.${props.index}.${field}`)
      ?.message;
  }
</script>
<template>
  <fieldset class="procurement-item" :disabled="disabled">
    <legend>{{ $t('procurement.offers.supplier_number', { number: index + 1 }) }}</legend>
    <div class="procurement-fields">
      <div class="field-group">
        <UpdatedCustomInputSelect
          :id="`${prefix}-supplier`"
          :key="supplierSelectionVersion"
          :model-value="row.supplier"
          label="procurement.offers.supplier"
          :placeholder="$t('procurement.offers.select_supplier')"
          :controller="lookup"
          :params="params"
          :reload="false"
          :disabled="disabled"
          paginated
          required
          @update:model-value="selected('supplier', $event)"
          @search="search = $event"
        >
          <template #LabelHeader>
            <span class="field-help-label-row">
              <FieldHelpIcon
                :label="$t('procurement.offers.supplier')"
                field-name="supplier"
                :field-id="`${prefix}-supplier`"
                :help-text="$t('field_help.execution_fields.supplier')"
              />
            </span> </template
        ></UpdatedCustomInputSelect>
        <small v-if="error('supplierId')" class="procurement-error" role="alert">{{
          $t(error('supplierId')!)
        }}</small>
      </div>
      <div class="field-group input-wrapper">
        <span class="field-help-label-row field-help-label-row--block"
          ><label class="field-label label" :for="`${prefix}-price`">{{
            $t('procurement.offers.price')
          }}</label>
          <FieldHelpIcon
            :label="$t('procurement.offers.price')"
            field-name="price"
            :field-id="`${prefix}-price`"
            :help-text="$t('field_help.execution_fields.price')"
          />
        </span>
        <input
          :id="`${prefix}-price`"
          :value="row.price"
          class="input workspace-control"
          type="text"
          inputmode="decimal"
          :disabled="disabled"
          :aria-invalid="!!error('price')"
          :aria-describedby="`${prefix}-price-error`"
          @input="input('price', $event)"
        />
        <small :id="`${prefix}-price-error`" class="procurement-error" role="alert">{{
          error('price') ? $t(error('price')!) : ''
        }}</small>
      </div>
      <div class="field-group input-wrapper">
        <span class="field-help-label-row field-help-label-row--block"
          ><label class="field-label label" :for="`${prefix}-duration`">{{
            $t('procurement.offers.duration')
          }}</label>
          <FieldHelpIcon
            :label="$t('procurement.offers.duration')"
            field-name="duration"
            :field-id="`${prefix}-duration`"
            :help-text="$t('field_help.execution_fields.duration')"
          />
        </span>
        <input
          :id="`${prefix}-duration`"
          :value="row.duration"
          class="input workspace-control"
          type="number"
          step="1"
          min="0"
          :disabled="disabled"
          :aria-invalid="!!error('duration')"
          :aria-describedby="`${prefix}-duration-error`"
          @input="input('duration', $event)"
        />
        <small :id="`${prefix}-duration-error`" class="procurement-error" role="alert">{{
          error('duration') ? $t(error('duration')!) : ''
        }}</small>
      </div>
      <div class="field-group">
        <UpdatedCustomInputSelect
          :id="`${prefix}-unit`"
          :model-value="unit"
          label="procurement.offers.duration_type"
          :placeholder="$t('procurement.offers.select_duration')"
          :static-options="units"
          :reload="false"
          :disabled="disabled"
          required
          @update:model-value="selected('durationType', $event)"
        >
          <template #LabelHeader>
            <span class="field-help-label-row">
              <FieldHelpIcon
                :label="$t('procurement.offers.duration_type')"
                field-name="duration_type"
                :field-id="`${prefix}-unit`"
                :help-text="$t('field_help.execution_fields.duration_type')"
              />
            </span> </template
        ></UpdatedCustomInputSelect>
        <small v-if="error('durationType')" class="procurement-error" role="alert">{{
          $t(error('durationType')!)
        }}</small>
      </div>
    </div>
    <AppButton
      type="button"
      theme="secondary"
      size="sm"
      :disabled="disabled"
      :aria-label="$t('procurement.offers.remove_supplier', { number: index + 1 })"
      @click="emit('remove')"
      >{{ $t('procurement.remove') }}</AppButton
    >
  </fieldset>
</template>
