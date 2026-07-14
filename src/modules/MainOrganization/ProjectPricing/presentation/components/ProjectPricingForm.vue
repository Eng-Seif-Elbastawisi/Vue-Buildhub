<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import { onBeforeRouteLeave } from 'vue-router';
  import type TitleInterface from '@/base/Data/Models/titleInterface';
  import { useFormsStore } from '@/stores/formsStore';
  import { useI18n } from 'vue-i18n';

  import AddProjectPricingParams from '../../core/params/add.project.pricing.params';
  import { ProjectPricingDiscountEnum } from '../../core/constant/project.pricing.discount.enum';
  import type ProjectPricingShowModel from '../../core/models/project.pricing.show.model';
  import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';

  const emit = defineEmits<{
    updateData: [params: AddProjectPricingParams];
  }>();

  const props = defineProps<{
    item?: ProjectPricingShowModel;
    formKey?: string;
    loading?: boolean;
    projectId?: number;
    totalItemsPrice?: number;
  }>();

  const formStore = useFormsStore();
  const { t } = useI18n();

  const totalTax = ref<number>(0);
  const discountType = ref<TitleInterface<string | number> | null>(null);
  const discountValue = ref<number>(0);

  const discountMode = ref<'value' | 'percentage'>('value');

  const VALUE_DISCOUNT_ID = ProjectPricingDiscountEnum.FIXED;
  const PERCENTAGE_DISCOUNT_ID = ProjectPricingDiscountEnum.PERCENTAGE;

  const totalDesignItems = computed(() => Number(props.totalItemsPrice ?? 0));

  const valueDiscountOption = computed<TitleInterface<string | number>>(() => ({
    id: VALUE_DISCOUNT_ID,
    title: t('project_pricing.discount_types.FIXED'),
  }));

  const percentDiscountOption = computed<TitleInterface<string | number>>(() => ({
    id: PERCENTAGE_DISCOUNT_ID,
    title: t('project_pricing.discount_types.PERCENTAGE'),
  }));

  const isValueDiscount = computed(() => {
    return discountMode.value === 'value';
  });

  const isPercentageDiscount = computed(() => {
    return discountMode.value === 'percentage';
  });

  const optionFromId = (id?: number | string): TitleInterface<string | number> | null => {
    if (id === undefined || id === null) return null;

    if (Number(id) === Number(VALUE_DISCOUNT_ID)) {
      discountMode.value = 'value';
      return valueDiscountOption.value;
    }

    if (Number(id) === Number(PERCENTAGE_DISCOUNT_ID)) {
      discountMode.value = 'percentage';
      return percentDiscountOption.value;
    }

    return {
      id: Number(id),
      title: String(id),
    };
  };

  const formatMoney = (value?: number) => {
    return Number(value ?? 0).toLocaleString();
  };

  const setDiscountType = (type: 'value' | 'percentage') => {
    discountMode.value = type;

    discountType.value = type === 'value' ? valueDiscountOption.value : percentDiscountOption.value;

    updateData();
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
      if (!item) {
        discountMode.value = 'value';
        discountType.value = valueDiscountOption.value;
        totalTax.value = 0;
        discountValue.value = 0;
        updateData();
        return;
      }

      totalTax.value = Number(item.total_tax ?? 0);

      discountType.value = item.discount_type
        ? optionFromId(item.discount_type)
        : valueDiscountOption.value;

      if (!item.discount_type) {
        discountMode.value = 'value';
      }

      discountValue.value = Number(item.discount_value ?? 0);

      updateData();
    },
    { immediate: true },
  );

  function updateData() {
    emit(
      'updateData',
      new AddProjectPricingParams({
        project_id: props.projectId,
        total_tax: totalTax.value,
        discount_type: discountType.value?.id as ProjectPricingDiscountEnum,
        discount_value: discountValue.value,
      }),
    );
  }
</script>

<template>
  <section class="pricing-summary-card" :class="{ disabled: loading }">
    <div class="summary-grid">
      <article class="summary-box">
        <span class="summary-label">
          {{ $t('project_pricing.design_items_total') }}
        </span>

        <strong class="summary-value">
          {{ formatMoney(totalDesignItems) }}
        </strong>
      </article>

      <article class="summary-box discount-box">
        <div class="discount-head">
          <span class="field-help-label-row">
            <span class="summary-label">
              {{ $t('project_pricing.discount') }}
            </span>
            <FieldHelpIcon :label="$t('project_pricing.discount')" field-name="discount" />
          </span>

          <div class="discount-toggle">
            <button
              type="button"
              :class="{ active: isValueDiscount }"
              @click="setDiscountType('value')"
            >
              {{ $t('project_pricing.value') }}
            </button>

            <button
              type="button"
              :class="{ active: isPercentageDiscount }"
              @click="setDiscountType('percentage')"
            >
              %
            </button>
          </div>
        </div>

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
      </article>

      <article class="summary-box">
        <span class="field-help-label-row">
          <label class="summary-label" for="project-pricing-total-tax">
            {{ $t('project_pricing.tax_percentage') }}
          </label>
          <FieldHelpIcon
            :label="$t('project_pricing.tax_percentage')"
            field-name="tax"
            field-id="project-pricing-total-tax"
          />
        </span>

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
      </article>
    </div>
  </section>
</template>

<style scoped lang="scss">
  .pricing-summary-card {
    padding: 1rem 0;
    border-top: 1px solid rgba(214, 207, 198, 0.75);
    border-bottom: 1px solid rgba(214, 207, 198, 0.75);
    background: var(--bg-main);

    &.disabled {
      pointer-events: none;
      opacity: 0.7;
    }
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.85rem;
  }

  .summary-box {
    display: flex;
    min-height: 148px;
    flex-direction: column;
    justify-content: center;
    gap: 0.75rem;
    padding: 1.15rem;
    border: 1px solid rgba(214, 207, 198, 0.95);
    border-radius: 18px;
    background: var(--bg-main);
  }

  .summary-label {
    color: var(--gray-500);
    font-family: 'Medium';
    font-size: var(--sm-size);
    line-height: 1.4;
  }

  .summary-value {
    color: var(--gray-900);
    font-family: 'Bold';
    font-size: 1.45rem;
    line-height: 1;
  }

  .discount-box {
    justify-content: flex-start;
  }

  .discount-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .discount-toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.2rem;
    border: 1px solid rgba(214, 207, 198, 0.95);
    border-radius: 999px;
    background: var(--gray-100);

    button {
      min-width: 42px;
      height: 32px;
      padding: 0 0.65rem;
      border: 0;
      border-radius: 999px;
      background: transparent;
      color: var(--gray-800);
      cursor: pointer;
      font-family: 'Bold';
      font-size: var(--xs-size);
      transition: all 0.2s ease;

      &.active {
        background: var(--gray-900);
        color: var(--bg-main);
        box-shadow: 0 6px 14px rgba(15, 23, 42, 0.18);
      }
    }
  }

  .field-input {
    width: 100%;
    min-height: 40px;
    padding: 0.55rem 0.85rem;
    border: 1px solid rgba(214, 207, 198, 0.95);
    border-radius: 9px;
    background: var(--bg-main);
    color: var(--gray-900);
    outline: none;
    text-align: center;
    font-family: 'Medium';
    font-size: var(--sm-size);
    transition: all 0.25s ease;

    &:focus {
      border-color: var(--PrimaryColor);
      box-shadow: 0 0 0 3px var(--PrimaryColor-light);
    }
  }

  @media (max-width: 1200px) {
    .summary-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 768px) {
    .summary-grid {
      grid-template-columns: 1fr;
    }

    .summary-box {
      min-height: auto;
    }
  }
</style>
