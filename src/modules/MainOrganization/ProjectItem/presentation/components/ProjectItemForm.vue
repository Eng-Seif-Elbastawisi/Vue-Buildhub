<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue';
  import { onBeforeRouteLeave } from 'vue-router';
  import { useI18n } from 'vue-i18n';

  import type TitleInterface from '@/base/Data/Models/titleInterface';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import { useFormsStore } from '@/stores/formsStore';

  import IndexItemParams from '@/modules/shared/Item/core/params/index.Item.params';
  import GeneralItemController from '@/modules/shared/Item/presentation/controllers/Item.controller';

  import AddProjectItemParams from '../../core/params/add.project.Item.params';
  import { ProjectItemPriceEnum } from '../../core/constant/project.item.Price.enum';
  import type ProjectItemShowModel from '../../core/models/project.Item.show.model';

  import { FloorNumber } from '@/modules/MainOrganization/ProjectFloor/core/constants/floor.number.enum';
  import IndexProjectFloorParams from '@/modules/MainOrganization/ProjectFloor/core/params/index.project.floor.params';
  import ProjectFloorController from '@/modules/MainOrganization/ProjectFloor/presentation/controllers/project.floor.controller';

  const emit = defineEmits<{
    updateData: [params: AddProjectItemParams];
    addItem: [];
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

  const projectFloorController = ProjectFloorController.getInstance();
  const projectFloorParams = new IndexProjectFloorParams('', 1, 100, 0, null, props.project);

  const selectedItem = ref<TitleInterface<string | number> | null>(null);
  const pricingMethod = ref<TitleInterface<string | number> | null>(null);

  // هنا id هيكون project_floor_id الحقيقي، والـ title هيكون floor_number مترجم
  const selectedFloorNumber = ref<TitleInterface<number> | null>(null);
  const selectedSpace = ref<TitleInterface<number> | null>(null);

  const price = ref<number>();
  const quantity = ref<number>(1);

  // بنستخدمه عشان لو floor_number راجع 0 يظهر عادي بعد ما floors تتحمل
  const pendingFloorNumber = ref<number | string | null>(null);

  const pricingMethodOptions = Object.entries(ProjectItemPriceEnum).map(([key, id]) => ({
    id,
    title: t(`project_item.pricing_methods.${key}`),
  }));

  const floorNumberTitleOptions = computed<TitleInterface<number>[]>(() => [
    { id: Number(FloorNumber.BASEMENT), title: t('project.BASEMENT') },
    { id: Number(FloorNumber.GROUND_FLOOR), title: t('project.GROUND_FLOOR') },
    { id: Number(FloorNumber.FIRST_FLOOR), title: t('project.FIRST_FLOOR') },
    { id: Number(FloorNumber.SECOND_FLOOR), title: t('project.SECOND_FLOOR') },
    { id: Number(FloorNumber.THIRD_FLOOR), title: t('project.THIRD_FLOOR') },
    { id: Number(FloorNumber.FOURTH_FLOOR), title: t('project.FOURTH_FLOOR') },
    { id: Number(FloorNumber.FIFTH_FLOOR), title: t('project.FIFTH_FLOOR') },
    { id: Number(FloorNumber.SIXTH_FLOOR), title: t('project.SIXTH_FLOOR') },
    { id: Number(FloorNumber.SEVENTH_FLOOR), title: t('project.SEVENTH_FLOOR') },
    { id: Number(FloorNumber.EIGHTH_FLOOR), title: t('project.EIGHTH_FLOOR') },
    { id: Number(FloorNumber.NINTH_FLOOR), title: t('project.NINTH_FLOOR') },
    { id: Number(FloorNumber.TENTH_FLOOR), title: t('project.TENTH_FLOOR') },
  ]);

  const getProjectFloors = () => {
    const state = projectFloorController.listState.value as any;

    const data =
      state?.data?.data ??
      state?.data ??
      state?.response?.data?.data ??
      state?.response?.data ??
      [];

    return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  };

  const getFloorTitle = (floorNumber?: number | string | null) => {
    if (floorNumber === undefined || floorNumber === null) return '';

    const option = floorNumberTitleOptions.value.find(
      (floor) => Number(floor.id) === Number(floorNumber),
    );

    return option?.title ?? String(floorNumber);
  };

  // ده هيعرض الأدوار الراجعة من الـ API بس
  const projectFloorOptions = computed<TitleInterface<number>[]>(() => {
    return getProjectFloors()
      .filter((floor: any) => floor?.id !== undefined && floor?.id !== null)
      .map((floor: any) => ({
        id: Number(floor.id),
        title: getFloorTitle(floor.floor_number),
      }));
  });

  const projectFloorSpaceOptions = computed<TitleInterface<number>[]>(() => {
    return getProjectFloors().flatMap((floor: any) => {
      if (!Array.isArray(floor.spaces)) return [];

      return floor.spaces.map((spaceItem: any) => ({
        id: Number(spaceItem.id),
        title: spaceItem.space?.title ?? `#${spaceItem.id}`,
      }));
    });
  });

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

  const projectFloorOptionFromProjectFloorId = (
    id?: number | string | null,
  ): TitleInterface<number> | null => {
    if (id === undefined || id === null) return null;

    const option = projectFloorOptions.value.find((floor) => Number(floor.id) === Number(id));

    return (
      option ?? {
        id: Number(id),
        title: String(id),
      }
    );
  };

  const projectFloorOptionFromFloorNumber = (
    floorNumber?: number | string | null,
  ): TitleInterface<number> | null => {
    if (floorNumber === undefined || floorNumber === null) return null;

    const floor = getProjectFloors().find(
      (projectFloor: any) => Number(projectFloor.floor_number) === Number(floorNumber),
    );

    if (floor?.id !== undefined && floor?.id !== null) {
      return {
        id: Number(floor.id),
        title: getFloorTitle(floor.floor_number),
      };
    }

    return {
      id: Number(floorNumber),
      title: getFloorTitle(floorNumber),
    };
  };

  const spaceOptionFromId = (id?: number | string): TitleInterface<number> | null => {
    if (id === undefined || id === null) return null;

    const option = projectFloorSpaceOptions.value.find((space) => Number(space.id) === Number(id));

    return (
      option ?? {
        id: Number(id),
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
    return selectedSpace.value?.id ? Number(selectedSpace.value.id) : undefined;
  });

  const selectedProjectFloorId = computed(() => {
    return selectedFloorNumber.value?.id !== undefined && selectedFloorNumber.value?.id !== null
      ? Number(selectedFloorNumber.value.id)
      : undefined;
  });

  const total = computed(() => {
    return Number(price.value ?? 0) * Number(quantity.value ?? 0);
  });

  const resetFieldsByPricingMethod = () => {
    if (isSpaceRelated.value) {
      price.value = undefined;
      selectedFloorNumber.value = null;
      pendingFloorNumber.value = null;
      return;
    }

    if (isFullFloorRelated.value) {
      selectedSpace.value = null;
      return;
    }

    selectedSpace.value = null;
    selectedFloorNumber.value = null;
    pendingFloorNumber.value = null;
  };

  function updatePricingMethod(value: TitleInterface<string | number> | null) {
    pricingMethod.value = value;
    resetFieldsByPricingMethod();
    updateData();
  }

  function updateSelectedSpace(value: TitleInterface<number>[] | TitleInterface<number> | null) {
    if (!value) {
      selectedSpace.value = null;
      updateData();
      return;
    }

    selectedSpace.value = Array.isArray(value) ? (value[0] ?? null) : value;

    updateData();
  }

  const updateFloorNumber = (value: TitleInterface<number> | null) => {
    pendingFloorNumber.value = null;
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

  function addItem() {
    updateData();

    if (!selectedItem.value) return;
    if (!pricingMethod.value) return;
    if (!quantity.value) return;

    if ((isGeneralItem.value || isFullFloorRelated.value) && !price.value) return;
    if (isSpaceRelated.value && !selectedSpace.value) return;
    if (isFullFloorRelated.value && !selectedFloorNumber.value) return;

    emit('addItem');
  }

  function resetForm() {
    selectedItem.value = null;
    pricingMethod.value = null;
    selectedFloorNumber.value = null;
    selectedSpace.value = null;
    pendingFloorNumber.value = null;
    price.value = undefined;
    quantity.value = 1;
    updateData();
  }

  onBeforeRouteLeave((to, from) => {
    const savedData = props.formKey ? formStore.getFormData(props.formKey) : null;

    if (savedData && to.path !== from.path && props.formKey) {
      formStore.showReturnWarning(props.formKey);
    }
  });

  watch(
    () => props.loading,
    (isLoading, wasLoading) => {
      if (wasLoading === true && isLoading === false) {
        resetForm();
      }
    },
  );

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
      quantity.value = item.quantity ?? 1;

      const projectFloor = (item as any).project_floor ?? (item as any).projectFloor;
      const projectFloorSpaceId = (item as any).project_floor_space_id;
      const projectFloorId = (item as any).project_floor_id ?? projectFloor?.id;

      // مهم: هنا بنقرأ floor_number حتى لو قيمته 0
      const floorNumber = (item as any).floor_number ?? projectFloor?.floor_number;

      pendingFloorNumber.value = floorNumber ?? null;

      selectedSpace.value =
        projectFloorSpaceId !== undefined && projectFloorSpaceId !== null
          ? spaceOptionFromId(projectFloorSpaceId)
          : null;

      selectedFloorNumber.value =
        projectFloorId !== undefined && projectFloorId !== null
          ? projectFloorOptionFromProjectFloorId(projectFloorId)
          : projectFloorOptionFromFloorNumber(floorNumber);

      updateData();
    },
    { immediate: true },
  );

  watch(
    projectFloorOptions,
    () => {
      if (pendingFloorNumber.value !== null) {
        selectedFloorNumber.value = projectFloorOptionFromFloorNumber(pendingFloorNumber.value);
        updateData();
        return;
      }

      if (!selectedFloorNumber.value) return;

      selectedFloorNumber.value = projectFloorOptionFromProjectFloorId(
        selectedFloorNumber.value.id,
      );
      updateData();
    },
    { deep: true },
  );

  watch(
    projectFloorSpaceOptions,
    () => {
      if (!selectedSpace.value) return;

      selectedSpace.value = spaceOptionFromId(selectedSpace.value.id);
      updateData();
    },
    { deep: true },
  );

  onMounted(async () => {
    await projectFloorController.fetchList(projectFloorParams);
  });
</script>

<template>
  <section class="pricing-card" dir="rtl">
    <header class="pricing-header">
      <div>
        <h3>{{ $t('project_item.title') }}</h3>
      </div>
    </header>

    <div class="add-panel" :class="{ disabled: loading }">
      <div class="form-row">
        <div class="field-box field-box--method">
          <label class="mini-label">{{ $t('project_item.pricing_method_label') }}</label>

          <UpdatedCustomInputSelect
            id="project-item-pricing-method"
            :model-value="pricingMethod"
            :placeholder="$t('project_item.pricing_method_placeholder')"
            :static-options="pricingMethodOptions"
            required
            @update:model-value="updatePricingMethod"
          />
        </div>

        <div v-if="isFullFloorRelated" class="field-box field-box--floor">
          <label class="mini-label">{{ $t('ProjectFloor.floor_number_label') }}</label>

          <UpdatedCustomInputSelect
            id="floor_number"
            :model-value="selectedFloorNumber"
            :static-options="projectFloorOptions"
            :placeholder="$t('ProjectFloor.floor_number_placeholder')"
            required
            @update:model-value="updateFloorNumber"
          />
        </div>

        <div v-if="isSpaceRelated" class="field-box field-box--floor">
          <label class="mini-label">{{ $t('ProjectFloor.space_label') }}</label>

          <UpdatedCustomInputSelect
            id="space_id"
            :model-value="selectedSpace"
            :static-options="projectFloorSpaceOptions"
            :placeholder="$t('ProjectFloor.space_placeholder')"
            @update:model-value="updateSelectedSpace"
          />
        </div>

        <div class="field-box field-box--item">
          <label class="mini-label">{{ $t('project_item.item_label') }}</label>

          <UpdatedCustomInputSelect
            id="project-item-item"
            v-model="selectedItem"
            :controller="generalItemController"
            :params="generalItemParams"
            :placeholder="$t('project_item.item_placeholder')"
            :reload="true"
            required
            @update:model-value="updateData"
          />
        </div>

        <div class="field-box field-box--qty">
          <label class="mini-label">{{ $t('project_item.quantity_label') }}</label>

          <input
            v-model.number="quantity"
            class="field-input"
            min="0"
            step="1"
            type="number"
            @input="updateData"
          />
        </div>

        <div v-if="isGeneralItem || isFullFloorRelated" class="field-box field-box--price">
          <label class="mini-label">{{ $t('project_item.price_label') }} </label>

          <input
            v-model.number="price"
            class="field-input"
            min="0"
            step="0.01"
            type="number"
            @input="updateData"
          />
        </div>

        <div v-if="isGeneralItem || isFullFloorRelated" class="field-box field-box--total">
          <label class="mini-label">{{ $t('project_item.total_label') }}</label>

          <input class="field-input readonly-input" :value="total" readonly />
        </div>

        <button type="button" class="add-btn" :disabled="loading" @click="addItem">
          <span v-if="loading" class="loader"></span>
          <span v-else>{{ $t('general.add') }}</span>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
  .pricing-card {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    padding: 1rem;
    border: 1px solid rgba(214, 207, 198, 0.9);
    border-radius: 18px;
    background: #fff;
  }

  .pricing-header {
    display: flex;
    justify-content: flex-start;
    text-align: right;

    h3 {
      margin: 0;
      color: #111827;
      font-family: 'Bold';
      font-size: 1rem;
    }
  }

  .preview-check {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    margin-top: 0.45rem;
    color: #111827;
    font-family: 'Medium';
    font-size: var(--sm-size);

    input {
      width: 16px;
      height: 16px;
      accent-color: #2563eb;
    }
  }

  .add-panel {
    padding: 0.75rem;
    border: 1px solid rgba(214, 207, 198, 0.85);
    border-radius: 14px;
    background: #fafbfc;

    &.disabled {
      pointer-events: none;
      opacity: 0.7;
    }
  }

  .form-row {
    display: grid;
    grid-template-columns:
      minmax(150px, 1fr)
      minmax(150px, 1fr)
      minmax(150px, 1fr)
      minmax(170px, 1.1fr)
      minmax(110px, 0.7fr)
      minmax(150px, 0.8fr)
      minmax(150px, 0.8fr)
      minmax(140px, 0.7fr);
    gap: 0.55rem;
    align-items: end;
  }

  .field-box {
    min-width: 0;
  }

  .mini-label {
    display: flex;
    justify-content: center;
    margin-bottom: 0.3rem;
    color: #334155;
    font-family: 'Bold';
    font-size: 0.75rem;
  }

  .field-input {
    width: 100%;
    min-height: 42px;
    padding: 0.55rem 0.75rem;
    border: 1px solid rgba(210, 199, 187, 0.95);
    border-radius: 9px;
    background: #fff;
    color: #111827;
    outline: none;
    text-align: center;
    font-family: 'Medium';
    font-size: var(--sm-size);
  }

  .readonly-input {
    background: #fff;
    color: #111827;
  }

  .add-btn {
    min-height: 42px;
    border: 0;
    border-radius: 10px;
    background: linear-gradient(135deg, #b77733, #050505);
    color: #fff;
    cursor: pointer;
    font-family: 'Bold';
    transition: all 0.25s ease;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.65;
    }

    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 12px 24px rgba(117, 70, 28, 0.18);
    }
  }

  @media (max-width: 1200px) {
    .form-row {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 768px) {
    .form-row {
      grid-template-columns: 1fr;
    }
  }

  .add-panel :deep(.input-label) {
    display: none;
  }
</style>
