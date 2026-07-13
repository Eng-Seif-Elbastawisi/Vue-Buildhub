<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue';
  import { onBeforeRouteLeave } from 'vue-router';
  import { useI18n } from 'vue-i18n';

  import type TitleInterface from '@/base/Data/Models/titleInterface';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';
  import { useFormsStore } from '@/stores/formsStore';

  import IndexItemParams from '@/modules/shared/Item/core/params/index.Item.params';
  import GeneralItemController from '@/modules/shared/Item/presentation/controllers/Item.controller';

  import IndexDepartmentParams from '@/modules/shared/Department/core/params/index.department.params';
  import DepartmentController from '@/modules/shared/Department/presentation/controllers/department.controller';

  import AddProjectItemParams, {
    type ProjectItemPayload,
  } from '../../core/params/add.project.Item.params';

  import { ProjectItemPriceEnum } from '../../core/constant/project.item.Price.enum';
  import type ProjectItemShowModel from '../../core/models/project.Item.show.model';

  import { FloorNumber } from '@/modules/MainOrganization/ProjectFloor/core/constants/floor.number.enum';
  import IndexProjectFloorParams from '@/modules/MainOrganization/ProjectFloor/core/params/index.project.floor.params';
  import ProjectFloorController from '@/modules/MainOrganization/ProjectFloor/presentation/controllers/project.floor.controller';

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

  type LocalProjectItemRow = ProjectItemPayload & {
    local_id: number;
    item_title: string;
    pricing_method_title: string;
    related_title: string;
    total?: number;
  };

  const formStore = useFormsStore();
  const { t } = useI18n();

  const generalItemController = GeneralItemController.getInstance();
  const generalItemParams = new IndexItemParams('', 1, 100, 0);

  const departmentController = DepartmentController.getInstance();
  const departmentParams = new IndexDepartmentParams('', 1, 100, 0);

  const projectFloorController = ProjectFloorController.getInstance();
  const projectFloorParams = new IndexProjectFloorParams('', 1, 100, 0, null, props.project);

  const selectedDepartment = ref<TitleInterface<string | number> | null>(null);
  const selectedItem = ref<TitleInterface<string | number> | null>(null);
  const pricingMethod = ref<TitleInterface<string | number> | null>(null);
  const selectedFloorNumber = ref<TitleInterface<number> | null>(null);
  const selectedSpace = ref<TitleInterface<number> | null>(null);

  const price = ref<number>();
  const quantity = ref<number>(1);
  const localItems = ref<LocalProjectItemRow[]>([]);

  const pendingFloorNumber = ref<number | string | null>(null);

  const pricingMethodOptions = Object.entries(ProjectItemPriceEnum).map(([key, id]) => ({
    id,
    title: t(`project_item.pricing_methods.${key}`),
  }));

  const floorNumberTitleOptions = computed<TitleInterface<number>[]>(() => [
    { id: Number(FloorNumber.BASEMENT), title: t('ProjectFloor.floor_numbers.BASEMENT') },
    { id: Number(FloorNumber.GROUND_FLOOR), title: t('ProjectFloor.floor_numbers.GROUND_FLOOR') },
    { id: Number(FloorNumber.FIRST_FLOOR), title: t('ProjectFloor.floor_numbers.FIRST_FLOOR') },
    { id: Number(FloorNumber.SECOND_FLOOR), title: t('ProjectFloor.floor_numbers.SECOND_FLOOR') },
    { id: Number(FloorNumber.THIRD_FLOOR), title: t('ProjectFloor.floor_numbers.THIRD_FLOOR') },
    { id: Number(FloorNumber.FOURTH_FLOOR), title: t('ProjectFloor.floor_numbers.FOURTH_FLOOR') },
    { id: Number(FloorNumber.FIFTH_FLOOR), title: t('ProjectFloor.floor_numbers.FIFTH_FLOOR') },
    { id: Number(FloorNumber.SIXTH_FLOOR), title: t('ProjectFloor.floor_numbers.SIXTH_FLOOR') },
    { id: Number(FloorNumber.SEVENTH_FLOOR), title: t('ProjectFloor.floor_numbers.SEVENTH_FLOOR') },
    { id: Number(FloorNumber.EIGHTH_FLOOR), title: t('ProjectFloor.floor_numbers.EIGHTH_FLOOR') },
    { id: Number(FloorNumber.NINTH_FLOOR), title: t('ProjectFloor.floor_numbers.NINTH_FLOOR') },
    { id: Number(FloorNumber.TENTH_FLOOR), title: t('ProjectFloor.floor_numbers.TENTH_FLOOR') },
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
    const apiItem = (item as any)?.item_id ?? (item as any)?.item;

    if (!apiItem) return null;

    return {
      id: Number(apiItem.id),
      title: apiItem.title,
    };
  };

  const departmentOptionFromModel = (
    item?: ProjectItemShowModel,
  ): TitleInterface<number> | null => {
    const department = (item as any)?.department ?? (item as any)?.item?.department;

    if (!department) return null;

    return {
      id: Number(department.id),
      title: department.title ?? department.name ?? `#${department.id}`,
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

  const localItemsTotal = computed(() => {
    return localItems.value.reduce((sum, item) => sum + Number(item.total ?? 0), 0);
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

  function buildCurrentItem(): LocalProjectItemRow | null {
    if (!selectedItem.value) return null;
    if (!pricingMethod.value) return null;
    if (!quantity.value) return null;

    if ((isGeneralItem.value || isFullFloorRelated.value) && !price.value) return null;
    if (isSpaceRelated.value && !selectedSpace.value) return null;
    if (isFullFloorRelated.value && !selectedFloorNumber.value) return null;

    return {
      local_id: Date.now(),
      item_id: numericId(selectedItem.value.id),
      item_title: selectedItem.value.title,
      pricing_method: selectedPricingMethodId.value,
      pricing_method_title: pricingMethod.value.title,
      quantity: quantity.value,

      price: isSpaceRelated.value ? undefined : price.value,

      project_floor_space_id: isSpaceRelated.value ? selectedProjectFloorSpaceId.value : undefined,

      project_floor_id: isFullFloorRelated.value ? selectedProjectFloorId.value : undefined,

      related_title: isSpaceRelated.value
        ? (selectedSpace.value?.title ?? '-')
        : isFullFloorRelated.value
          ? (selectedFloorNumber.value?.title ?? '-')
          : '-',

      total: isSpaceRelated.value ? undefined : total.value,
    };
  }

  function updateData() {
    emit(
      'updateData',
      new AddProjectItemParams({
        project_id: props.project,
        department_id: numericId(selectedDepartment.value?.id),
        items: localItems.value.map((item) => ({
          item_id: item.item_id,
          price: item.price,
          quantity: item.quantity,
          pricing_method: item.pricing_method,
          project_floor_id: item.project_floor_id,
          project_floor_space_id: item.project_floor_space_id,
        })),
      }),
    );
  }

  function addItemToList() {
    const item = buildCurrentItem();

    if (!selectedDepartment.value) return;
    if (!item) return;

    localItems.value.push(item);

    selectedItem.value = null;
    pricingMethod.value = null;
    selectedFloorNumber.value = null;
    selectedSpace.value = null;
    pendingFloorNumber.value = null;
    price.value = undefined;
    quantity.value = 1;

    updateData();
  }

  function removeItem(localId: number) {
    localItems.value = localItems.value.filter((item) => item.local_id !== localId);
    updateData();
  }

  function resetForm() {
    selectedDepartment.value = null;
    selectedItem.value = null;
    pricingMethod.value = null;
    selectedFloorNumber.value = null;
    selectedSpace.value = null;
    pendingFloorNumber.value = null;
    price.value = undefined;
    quantity.value = 1;
    localItems.value = [];
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

      selectedDepartment.value = departmentOptionFromModel(item);
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
    updateData();
  });
</script>

<template>
  <section class="pricing-card" dir="ltr">
    <header class="pricing-header">
      <div>
        <h3>{{ $t('project_item.form_title') }}</h3>
      </div>
    </header>

    <div class="add-panel" :class="{ disabled: loading }">
      <div class="form-row">
        <div class="field-box field-box--department">
          <span class="field-help-label-row">
            <label class="mini-label">{{ $t('department.title') }}</label>
            <FieldHelpIcon
              :label="$t('department.title')"
              field-name="department_id"
              field-id="department_id"
            />
          </span>

          <UpdatedCustomInputSelect
            id="department_id"
            v-model="selectedDepartment"
            :controller="departmentController"
            :params="departmentParams"
            :placeholder="$t('department.placeholder')"
            :reload="true"
            required
            @update:model-value="updateData"
          />
        </div>

        <div class="field-box field-box--method">
          <span class="field-help-label-row">
            <label class="mini-label">{{ $t('project_item.pricing_method') }}</label>
            <FieldHelpIcon
              :label="$t('project_item.pricing_method')"
              field-name="type"
              field-id="project-item-pricing-method"
            />
          </span>

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
          <span class="field-help-label-row">
            <label class="mini-label">{{ $t('ProjectFloor.floor_number') }}</label>
            <FieldHelpIcon
              :label="$t('ProjectFloor.floor_number')"
              field-name="floor_number"
              field-id="floor_number"
            />
          </span>

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
          <span class="field-help-label-row">
            <label class="mini-label">{{ $t('ProjectFloor.space') }}</label>
            <FieldHelpIcon
              :label="$t('ProjectFloor.space')"
              field-name="space"
              field-id="space_id"
            />
          </span>

          <UpdatedCustomInputSelect
            id="space_id"
            :model-value="selectedSpace"
            :static-options="projectFloorSpaceOptions"
            :placeholder="$t('ProjectFloor.space_placeholder')"
            @update:model-value="updateSelectedSpace"
          />
        </div>

        <div class="field-box field-box--item">
          <span class="field-help-label-row">
            <label class="mini-label">{{ $t('project_item.item') }}</label>
            <FieldHelpIcon
              :label="$t('project_item.item')"
              field-name="material"
              field-id="project-item-item"
            />
          </span>

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
          <span class="field-help-label-row">
            <label class="mini-label">{{ $t('project_item.quantity') }}</label>
            <FieldHelpIcon :label="$t('project_item.quantity')" field-name="quantity" />
          </span>

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
          <span class="field-help-label-row">
            <label class="mini-label">{{ $t('project_item.price') }}</label>
            <FieldHelpIcon :label="$t('project_item.price')" field-name="price" />
          </span>

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
          <span class="field-help-label-row">
            <label class="mini-label">{{ $t('project_item.total_label') }}</label>
            <FieldHelpIcon :label="$t('project_item.total_label')" field-name="total" />
          </span>

          <input class="field-input readonly-input" :value="total" readonly />
        </div>

        <button type="button" class="add-btn" :disabled="loading" @click="addItemToList">
          {{ $t('general.add') }}
        </button>
      </div>

      <div class="local-items-table">
        <div class="local-table-summary">
          <strong>{{ $t('project_item.selected_items') }}</strong>
          <span>{{ localItems.length }}</span>
        </div>

        <div v-if="!localItems.length" class="empty-local-row">
          {{ $t('project_item.no_items') }}
        </div>

        <div v-else class="local-table">
          <div class="local-table-head">
            <span>{{ $t('project_item.item') }}</span>
            <span>{{ $t('project_item.related_label') }}</span>
            <span>{{ $t('project_item.pricing_method') }}</span>
            <span>{{ $t('project_item.quantity') }}</span>
            <span>{{ $t('project_item.price') }}</span>
            <span>{{ $t('project_item.total_label') }}</span>
            <span>{{ $t('general.actions') }}</span>
          </div>

          <div v-for="item in localItems" :key="item.local_id" class="local-table-row">
            <span>{{ item.item_title }}</span>
            <span>{{ item.related_title }}</span>
            <span>{{ item.pricing_method_title }}</span>
            <span>{{ item.quantity }}</span>
            <span>{{ item.price ?? '-' }}</span>
            <span>{{ item.total ?? '-' }}</span>

            <button type="button" class="remove-btn" @click="removeItem(item.local_id)">
              {{ $t('general.delete') }}
            </button>
          </div>
        </div>

        <div class="local-total">
          <span>{{ $t('project_item.total_label') }}</span>
          <strong>{{ localItemsTotal.toLocaleString() }}</strong>
        </div>
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

  .local-items-table {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1rem;
  }

  .local-table-summary,
  .local-total {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    border-radius: 14px;
    background: #fff;
    color: #111827;
    font-family: 'Bold';

    span {
      color: #64748b;
    }

    strong {
      color: var(--PrimaryColor);
    }
  }

  .empty-local-row {
    padding: 1rem;
    border: 1px dashed rgba(148, 163, 184, 0.45);
    border-radius: 14px;
    background: #fff;
    color: #64748b;
    text-align: center;
    font-family: 'Medium';
  }

  .local-table {
    overflow: hidden;
    border: 1px solid rgba(214, 207, 198, 0.75);
    border-radius: 14px;
    background: #fff;
  }

  .local-table-head,
  .local-table-row {
    display: grid;
    grid-template-columns:
      minmax(160px, 1.2fr)
      minmax(130px, 1fr)
      minmax(130px, 1fr)
      minmax(90px, 0.6fr)
      minmax(100px, 0.7fr)
      minmax(100px, 0.7fr)
      minmax(90px, 0.6fr);
    gap: 0.65rem;
    align-items: center;
  }

  .local-table-head {
    padding: 0.75rem 1rem;
    background: #f8fafc;
    color: #1e293b;
    font-family: 'Bold';
    font-size: 0.75rem;
  }

  .local-table-row {
    padding: 0.75rem 1rem;
    border-top: 1px solid rgba(214, 207, 198, 0.75);
    color: #334155;
    font-family: 'Medium';
    font-size: var(--sm-size);
  }

  .remove-btn {
    min-height: 34px;
    border: 1px solid rgba(239, 68, 68, 0.35);
    border-radius: 9px;
    background: #fff;
    color: #ef4444;
    cursor: pointer;
    font-family: 'Bold';
  }

  @media (max-width: 1200px) {
    .form-row,
    .local-table-head,
    .local-table-row {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 768px) {
    .form-row {
      grid-template-columns: 1fr;
    }

    .local-table-head {
      display: none;
    }

    .local-table-row {
      grid-template-columns: 1fr;
    }
  }

  .add-panel :deep(.input-label) {
    display: none;
  }
</style>
