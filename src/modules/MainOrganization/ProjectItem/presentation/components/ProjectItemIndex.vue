<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';

  import type ProjectItemModel from '../../core/models/project.Item.model';
  import { ProjectItemPriceEnum } from '../../core/constant/project.item.Price.enum';
  import { FloorNumber } from '@/modules/MainOrganization/ProjectFloor/core/constants/floor.number.enum';
  import type TitleInterface from '@/base/Data/Models/titleInterface';

  const { t } = useI18n();

  const props = defineProps<{
    items: ProjectItemModel[];
    loading?: boolean;
  }>();

  const pricingMethodTitle = (method: ProjectItemPriceEnum) => {
    const option = Object.entries(ProjectItemPriceEnum).find(
      ([, value]) => Number(value) === Number(method),
    );

    if (!option) return '-';

    const [key] = option;

    return t(`project_item.pricing_methods.${key}`);
  };

  const floorNumberOptions = computed<TitleInterface<FloorNumber>[]>(() => {
    return Object.entries(FloorNumber).map(([key, value]) => ({
      id: value as FloorNumber,
      title: t(`ProjectFloor.floor_numbers.${key}`),
    }));
  });

  const relatedTitle = (item: ProjectItemModel) => {
    if (item.pricing_method === ProjectItemPriceEnum.SPACE_RELATED) {
      return item.project_floor_space_title ?? '-';
    }

    if (item.pricing_method === ProjectItemPriceEnum.FULL_FLOOR_RELATED) {
      const floor = floorNumberOptions.value.find(
        (floor) => Number(floor.id) === Number(item.project_floor_number),
      );

      return floor?.title ?? '-';
    }

    return '-';
  };

  const totalPrice = computed(() => {
    return props.items.reduce((total, item) => total + Number(item.final_price ?? 0), 0);
  });
</script>

<template>
  <section class="items-table-card" dir="ltr">
    <div class="table-summary">
      <div>
        <h3>{{ $t('project_item.selection_criteria_items') }}</h3>
        <p>
          {{ $t('project_item.index_fetch_description') }}
        </p>
      </div>

      <div class="summary-total">
        <span>{{ $t('project_item.total_price_label') }}</span>
        <strong>{{ totalPrice.toLocaleString() }}</strong>
      </div>
    </div>

    <div class="items-table" :class="{ disabled: loading }">
      <div class="table-head">
        <span>{{ $t('project_item.item') }}</span>
        <span>{{ $t('project_item.related_label') }}</span>
        <span>{{ $t('project_item.pricing_method') }}</span>
        <span>{{ $t('project_item.quantity') }}</span>
        <span>{{ $t('project_item.price') }}</span>
        <span>{{ $t('project_item.total_price_label') }}</span>
        <span>{{ $t('general.created_at') }}</span>
      </div>

      <div v-if="!items.length" class="empty-row">{{ $t('project_item.no_items') }}</div>

      <div v-for="item in items" :key="item.id" class="table-row">
        <div class="table-cell">
          <input class="table-input" :value="item.item.title" readonly />
        </div>

        <div class="table-cell">
          {{ relatedTitle(item) }}
        </div>

        <div class="table-cell">
          {{ pricingMethodTitle(item.pricing_method) }}
        </div>

        <div class="table-cell">
          <input class="table-input table-input--center" :value="item.quantity" readonly />
        </div>

        <div class="table-cell">
          <input class="table-input table-input--center" :value="item.price" readonly />
        </div>

        <div class="table-cell total-cell">
          {{ item.final_price.toLocaleString() }}
        </div>

        <div class="table-cell muted-cell">
          {{ item.created_at ?? '-' }}
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
  .items-table-card {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    padding: 1rem;
    border: 1px solid rgba(214, 207, 198, 0.9);
    border-radius: 18px;
    background: #fff;
  }

  .table-summary {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;

    h3 {
      margin: 0;
      color: #111827;
      font-family: 'Bold';
      font-size: 1rem;
    }

    p {
      margin: 0.35rem 0 0;
      color: #64748b;
      font-size: var(--sm-size);
    }
  }

  .summary-total {
    display: flex;
    min-width: 140px;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.75rem 1rem;
    border-radius: 14px;
    background: #f8fafc;
    text-align: center;

    span {
      color: #64748b;
      font-family: 'Medium';
      font-size: var(--xs-size);
    }

    strong {
      color: var(--PrimaryColor);
      font-family: 'Bold';
      font-size: 1rem;
    }
  }

  .items-table {
    overflow: hidden;
    border-radius: 15px;
    background: #fff;

    &.disabled {
      pointer-events: none;
      opacity: 0.7;
    }
  }

  .table-head,
  .table-row {
    display: grid;
    grid-template-columns:
      minmax(180px, 1.5fr)
      minmax(140px, 1fr)
      minmax(150px, 1fr)
      minmax(100px, 0.7fr)
      minmax(120px, 0.8fr)
      minmax(120px, 0.8fr)
      minmax(160px, 1fr);
    gap: 0.75rem;
    align-items: center;
  }

  .table-head {
    padding: 0.85rem 1rem;
    background: #f8fafc;
    color: #1e293b;
    font-family: 'Bold';
    font-size: 0.75rem;
  }

  .table-row {
    padding: 0.7rem 1rem;
    border-top: 1px solid rgba(214, 207, 198, 0.75);
    color: #111827;
    font-family: 'Medium';
    font-size: var(--sm-size);
  }

  .table-input {
    width: 100%;
    min-height: 36px;
    padding: 0.45rem 0.7rem;
    border: 1px solid rgba(210, 199, 187, 0.9);
    border-radius: 9px;
    background: #fff;
    color: #111827;
    text-align: right;
    font-family: 'Medium';
  }

  .table-input--center {
    text-align: center;
  }

  .total-cell {
    color: var(--PrimaryColor);
    font-family: 'Bold';
  }

  .muted-cell {
    color: #64748b;
    font-size: var(--xs-size);
  }

  .empty-row {
    padding: 1rem;
    border-top: 1px solid rgba(214, 207, 198, 0.75);
    color: #64748b;
    text-align: center;
    font-family: 'Medium';
  }

  @media (max-width: 1200px) {
    .table-head,
    .table-row {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 768px) {
    .table-summary {
      flex-direction: column;
    }

    .summary-total {
      width: 100%;
    }

    .table-head {
      display: none;
    }

    .table-row {
      grid-template-columns: 1fr;
      gap: 0.45rem;
    }
  }
</style>
