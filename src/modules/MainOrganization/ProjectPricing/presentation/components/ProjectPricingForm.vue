<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { onBeforeRouteLeave } from 'vue-router';
  import type TitleInterface from '@/base/Data/Models/titleInterface';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import { useFormsStore } from '@/stores/formsStore';
  import { useI18n } from 'vue-i18n';
  import AddProjectPricingParams from '../../core/params/add.project.pricing.params';
  import { ProjectPricingDiscountEnum } from '../../core/constant/project.pricing.discount.enum';
  import type ProjectPricingShowModel from '../../core/models/project.pricing.show.model';

  const emit = defineEmits<{
    updateData: [params: AddProjectPricingParams];
  }>();

  const props = defineProps<{
    item?: ProjectPricingShowModel;
    formKey?: string;
    loading?: boolean;
  }>();

  const formStore = useFormsStore();
  const { t } = useI18n();
  const discountTypeOptions = Object.entries(ProjectPricingDiscountEnum).map(([key, id]) => ({
    id,
    title: t(`project_pricing.discount_types.${key}`),
  }));

  const totalTax = ref<number>();
  const discountType = ref<TitleInterface<string | number> | null>(null);
  const discountValue = ref<number>();

  const optionFromId = (id?: number | string): TitleInterface<number> | null => {
    return id !== undefined && id !== null
      ? {
          id: Number(id),
          title: String(id),
        }
      : null;
  };

  onBeforeRouteLeave((to, from) => {
    const savedData = props.formKey ? formStore.getFormData(props.formKey) : null;
    if (savedData && to.path !== from.path && props.formKey) {
      formStore.showReturnWarning(props.formKey);
    }
  });

  watch(
    () => props.item,
    (item) => {
      if (!item) return;
      totalTax.value = item.total_tax;
      discountType.value = item.discount_type
        ? (discountTypeOptions.find((option) => option.id === item.discount_type) ??
          optionFromId(item.discount_type))
        : null;
      discountValue.value = item.discount_value;
      updateData();
    },
    { immediate: true },
  );

  function updateData() {
    emit(
      'updateData',
      new AddProjectPricingParams({
        total_tax: totalTax.value,
        discount_type: discountType.value?.id as ProjectPricingDiscountEnum,
        discount_value: discountValue.value,
      }),
    );
  }
</script>

<template>
  <div class="material-form-card">
    <header class="form-header">
      <h3>{{ $t('project_pricing.form_title') }}</h3>
      <p>{{ $t('project_pricing.form_description') }}</p>
    </header>

    <div class="form-fields" :class="{ disabled: loading }">
      <div class="field-group">
        <label class="field-label" for="project-pricing-total-tax">
          {{ $t('project_pricing.total_tax') }}
        </label>
        <div class="input-wrap">
          <input
            id="project-pricing-total-tax"
            v-model.number="totalTax"
            class="field-input"
            min="0"
            step="0.01"
            max="100"
            type="number"
            :placeholder="$t('project_pricing.total_tax_placeholder')"
            @input="updateData"
          />
        </div>
      </div>

      <div class="field-group">
        <UpdatedCustomInputSelect
          id="project-pricing-discount-type"
          v-model="discountType"
          :label="$t('project_pricing.discount_type')"
          :placeholder="$t('project_pricing.discount_type_placeholder')"
          :static-options="discountTypeOptions"
          required
          @update:model-value="updateData"
        />
      </div>

      <div class="field-group col-span-2">
        <label class="field-label" for="project-pricing-discount-value">
          {{ $t('project_pricing.discount_value') }}
        </label>
        <div class="input-wrap">
          <input
            id="project-pricing-discount-value"
            v-model.number="discountValue"
            class="field-input"
            min="0"
            step="0.01"
            type="number"
            :placeholder="$t('project_pricing.discount_value_placeholder')"
            @input="updateData"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .field-input {
    width: 100%;
    max-width: 100%;
    padding: 12px 16px;
    border: 1px solid var(--border-weak);
    border-radius: 28px;
    background: var(--white);
    outline: none;
    transition: all 0.25s ease;
    font-family: 'Medium';
    font-weight: 400;
    font-size: var(--sm-size);
    color: var(--bread-crumb-color-span);
  }

  .material-form-card {
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
    align-items: end;

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
