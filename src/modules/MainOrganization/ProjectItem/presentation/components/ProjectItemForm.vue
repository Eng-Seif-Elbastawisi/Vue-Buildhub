<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import { onBeforeRouteLeave } from 'vue-router';
  import { useI18n } from 'vue-i18n';

  import type TitleInterface from '@/base/Data/Models/titleInterface';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import { useFormsStore } from '@/stores/formsStore';

  import IndexItemParams from '@/modules/shared/Item/core/params/index.Item.params';
  import GeneralItemController from '@/modules/shared/Item/presentation/controllers/Item.controller';

  import { IndexSpaceParams, SpaceController } from '@/modules/shared/Space';

  import AddProjectItemParams from '../../core/params/add.project.Item.params';
  import { ProjectItemPriceEnum } from '../../core/constant/project.item.Price.enum';
  import type ProjectItemShowModel from '../../core/models/project.Item.show.model';
  import { FloorNumber } from '@/modules/MainOrganization/ProjectFloor/core/constants/floor.number.enum';

  const emit = defineEmits<{
    updateData: [params: AddProjectItemParams];
  }>();

  const props = defineProps<{
    item?: ProjectItemShowModel;
    formKey?: string;
    loading?: boolean;
    project?: number;
    projectItem?: number;
  }>();

  const formStore = useFormsStore();
  const { t } = useI18n();

  const generalItemController = GeneralItemController.getInstance();
  const generalItemParams = new IndexItemParams('', 1, 100, 0);

  const spaceController = SpaceController.getInstance();
  const spaceParams = new IndexSpaceParams('', 1, 100, 0);

  const pricingMethodOptions = Object.entries(ProjectItemPriceEnum).map(([key, id]) => ({
    id,
    title: t(`project_item.pricing_methods.${key}`),
  }));

  const floorNumberOptions = computed<TitleInterface<FloorNumber>[]>(() => [
    {
      id: FloorNumber.BASEMENT,
      title: t('project.BASEMENT'),
    },
    {
      id: FloorNumber.GROUND_FLOOR,
      title: t('project.GROUND_FLOOR'),
    },
    {
      id: FloorNumber.FIRST_FLOOR,
      title: t('project.FIRST_FLOOR'),
    },
    {
      id: FloorNumber.SECOND_FLOOR,
      title: t('project.SECOND_FLOOR'),
    },
    {
      id: FloorNumber.THIRD_FLOOR,
      title: t('project.THIRD_FLOOR'),
    },
    {
      id: FloorNumber.FOURTH_FLOOR,
      title: t('project.FOURTH_FLOOR'),
    },
    {
      id: FloorNumber.FIFTH_FLOOR,
      title: t('project.FIFTH_FLOOR'),
    },
    {
      id: FloorNumber.SIXTH_FLOOR,
      title: t('project.SIXTH_FLOOR'),
    },
    {
      id: FloorNumber.SEVENTH_FLOOR,
      title: t('project.SEVENTH_FLOOR'),
    },
    {
      id: FloorNumber.EIGHTH_FLOOR,
      title: t('project.EIGHTH_FLOOR'),
    },
    {
      id: FloorNumber.NINTH_FLOOR,
      title: t('project.NINTH_FLOOR'),
    },
    {
      id: FloorNumber.TENTH_FLOOR,
      title: t('project.TENTH_FLOOR'),
    },
  ]);

  const selectedItem = ref<TitleInterface<string | number> | null>(null);
  const pricingMethod = ref<TitleInterface<string | number> | null>(null);
  const selectedFloorNumber = ref<TitleInterface<FloorNumber> | null>(null);
  const selectedSpace = ref<TitleInterface<number>[]>([]);

  const price = ref<number>();
  const quantity = ref<number>();

  const numericId = (value?: string | number) => {
    return value == null ? undefined : Number(value);
  };

  const optionFromId = (id?: number | string): TitleInterface<number> | null => {
    return id !== undefined && id !== null
      ? {
          id: Number(id),
          title: String(id),
        }
      : null;
  };

  const floorOptionFromId = (id?: number | string): TitleInterface<FloorNumber> | null => {
    if (id === undefined || id === null) return null;

    const option = floorNumberOptions.value.find((floor) => Number(floor.id) === Number(id));

    return (
      option ?? {
        id: Number(id) as FloorNumber,
        title: String(id),
      }
    );
  };

  const itemOptionFromModel = (item?: ProjectItemShowModel): TitleInterface<number> | null => {
    if (!item?.item_id) return null;

    return {
      id: Number(item.item_id.id),
      title: item.item_id.title,
    };
  };

  const selectedPricingMethodId = computed(() => {
    return pricingMethod.value?.id as ProjectItemPriceEnum | undefined;
  });

  const isGeneralItem = computed(() => {
    return selectedPricingMethodId.value === ProjectItemPriceEnum.GENERAL_ITEM;
  });

  const isSpaceRelated = computed(() => {
    return selectedPricingMethodId.value === ProjectItemPriceEnum.SPACE_RELATED;
  });

  const isFullFloorRelated = computed(() => {
    return selectedPricingMethodId.value === ProjectItemPriceEnum.FULL_FLOOR_RELATED;
  });

  const selectedProjectFloorSpaceId = computed(() => {
    return selectedSpace.value[0]?.id ? Number(selectedSpace.value[0].id) : undefined;
  });

  const selectedProjectFloorId = computed(() => {
    return selectedFloorNumber.value?.id !== undefined && selectedFloorNumber.value?.id !== null
      ? Number(selectedFloorNumber.value.id)
      : undefined;
  });

  const resetFieldsByPricingMethod = () => {
    if (isSpaceRelated.value) {
      price.value = undefined;
      selectedFloorNumber.value = null;
      return;
    }

    if (isFullFloorRelated.value) {
      selectedSpace.value = [];
      return;
    }

    selectedSpace.value = [];
    selectedFloorNumber.value = null;
  };

  function updatePricingMethod(value: TitleInterface<string | number> | null) {
    pricingMethod.value = value;
    resetFieldsByPricingMethod();
    updateData();
  }

  function updateSelectedSpace(value: TitleInterface<number>[] | TitleInterface<number> | null) {
    if (!value) {
      selectedSpace.value = [];
      updateData();
      return;
    }

    selectedSpace.value = Array.isArray(value) ? value.slice(0, 1) : [value];

    updateData();
  }

  const updateFloorNumber = (value: TitleInterface<FloorNumber> | null) => {
    selectedFloorNumber.value = value;
    updateData();
  };

  function updateData() {
    emit(
      'updateData',
      new AddProjectItemParams({
        project_id: props.project,
        item_id: numericId(selectedItem.value?.id),
        pricing_method: selectedPricingMethodId.value,
        quantity: quantity.value,

        price: isSpaceRelated.value ? undefined : price.value,

        project_floor_space_id: isSpaceRelated.value
          ? selectedProjectFloorSpaceId.value
          : undefined,

        project_floor_id: isFullFloorRelated.value ? selectedProjectFloorId.value : undefined,
      }),
    );
  }

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

      selectedItem.value = itemOptionFromModel(item);

      pricingMethod.value = item.pricing_method
        ? (pricingMethodOptions.find((option) => option.id === item.pricing_method) ??
          optionFromId(item.pricing_method))
        : null;

      price.value = item.price;
      quantity.value = item.quantity;

      const projectFloorSpaceId = (item as any).project_floor_space_id;
      const projectFloorId = (item as any).project_floor_id;

      selectedSpace.value = projectFloorSpaceId
        ? [
            {
              id: Number(projectFloorSpaceId),
              title: String(projectFloorSpaceId),
            },
          ]
        : [];

      selectedFloorNumber.value = floorOptionFromId(projectFloorId);

      updateData();
    },
    { immediate: true },
  );
</script>

<template>
  <div class="material-form-card">
    <header class="form-header">
      <h3>{{ $t('project_item.form_title') }}</h3>
      <p>{{ $t('project_item.form_description') }}</p>
    </header>

    <div class="form-fields" :class="{ disabled: loading }">
      <div class="field-group">
        <UpdatedCustomInputSelect
          id="project-item-item"
          v-model="selectedItem"
          :controller="generalItemController"
          :label="$t('project_item.item')"
          :params="generalItemParams"
          :placeholder="$t('project_item.item_placeholder')"
          :reload="true"
          required
          @update:model-value="updateData"
        />
      </div>

      <div class="field-group">
        <UpdatedCustomInputSelect
          id="project-item-pricing-method"
          :model-value="pricingMethod"
          :label="$t('project_item.pricing_method')"
          :placeholder="$t('project_item.pricing_method_placeholder')"
          :static-options="pricingMethodOptions"
          required
          @update:model-value="updatePricingMethod"
        />
      </div>

      <div v-if="isGeneralItem || isFullFloorRelated" class="field-group">
        <label class="field-label" for="project-item-price">
          {{ $t('project_item.price') }}
        </label>

        <div class="input-wrap">
          <input
            id="project-item-price"
            v-model.number="price"
            class="field-input"
            min="0"
            step="0.01"
            type="number"
            :placeholder="$t('project_item.price_placeholder')"
            @input="updateData"
          />
        </div>
      </div>

      <div class="field-group">
        <label class="field-label" for="project-item-quantity">
          {{ $t('project_item.quantity') }}
        </label>

        <div class="input-wrap">
          <input
            id="project-item-quantity"
            v-model.number="quantity"
            class="field-input"
            min="0"
            step="1"
            type="number"
            :placeholder="$t('project_item.quantity_placeholder')"
            @input="updateData"
          />
        </div>
      </div>

      <div v-if="isSpaceRelated" class="field-group col-span-2">
        <UpdatedCustomInputSelect
          id="space_id"
          :model-value="selectedSpace"
          :controller="spaceController"
          :params="spaceParams"
          :placeholder="$t('ProjectFloor.space_placeholder')"
          @update:model-value="updateSelectedSpace"
        />
      </div>

      <div v-if="isFullFloorRelated" class="field-group col-span-2">
        <UpdatedCustomInputSelect
          id="floor_number"
          :model-value="selectedFloorNumber"
          :static-options="floorNumberOptions"
          :label="$t('project_item.project_floor')"
          :placeholder="$t('ProjectFloor.floor_number_placeholder')"
          required
          @update:model-value="updateFloorNumber"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .material-form-card {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .form-header {
    h3 {
      margin: 0;
      color: #111827;
      font-family: 'Bold';
    }

    p {
      margin: 0.35rem 0 0;
      color: var(--gray-5);
      line-height: 1.7;
    }
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

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .field-label {
    color: #334155;
    font-family: 'Medium';
    font-size: var(--sm-size);
  }

  .input-wrap {
    width: 100%;
  }

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

    &:focus {
      border-color: var(--PrimaryColor);
      box-shadow: 0 0 0 3px var(--PrimaryColor-light);
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
