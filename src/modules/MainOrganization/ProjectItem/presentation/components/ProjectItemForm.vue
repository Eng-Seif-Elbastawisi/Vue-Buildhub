<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { useI18n } from 'vue-i18n';

import type TitleInterface from '@/base/Data/Models/titleInterface';
import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';
import { useFormsStore } from '@/stores/formsStore';

import IndexItemParams from '@/modules/shared/Item/core/params/index.Item.params';
import { ItemServiceTypeEnum } from '@/modules/shared/Item/core/constant/item.service.type.enum';
import GeneralItemController from '@/modules/shared/Item/presentation/controllers/Item.controller';

import { DepartmentTypeEnum } from '@/modules/shared/Department/core/constants/Type.enum';
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

const departmentController = DepartmentController.getInstance();
const departmentParams = new IndexDepartmentParams('', 1, 100, 0, DepartmentTypeEnum.DESIGN);

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

const generalItemParams = computed(() => {
  const departmentId = numericId(selectedDepartment.value?.id);

  if (departmentId === undefined) return undefined;

  return new IndexItemParams('', 1, 100, 0, undefined, ItemServiceTypeEnum.DESIGN, departmentId);
});

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

  if (!price.value) return null;
  if (isSpaceRelated.value && !selectedSpace.value) return null;
  if (isFullFloorRelated.value && !selectedFloorNumber.value) return null;

  return {
    local_id: Date.now(),
    item_id: numericId(selectedItem.value.id),
    item_title: selectedItem.value.title ?? '-',
    pricing_method: selectedPricingMethodId.value,
    pricing_method_title: pricingMethod.value.title ?? '-',
    quantity: quantity.value,

    price: price.value,

    project_floor_space_id: isSpaceRelated.value ? selectedProjectFloorSpaceId.value : undefined,

    project_floor_id: isFullFloorRelated.value ? selectedProjectFloorId.value : undefined,

    related_title: isSpaceRelated.value
      ? (selectedSpace.value?.title ?? '-')
      : isFullFloorRelated.value
        ? (selectedFloorNumber.value?.title ?? '-')
        : '-',

    total: total.value,
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

const updateDepartment = (department: TitleInterface<string | number> | null) => {
  selectedDepartment.value = department;
  selectedItem.value = null;
  updateData();
};

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
  <section class="pricing-card">
    <header class="pricing-header">
      <div class="pricing-header__content">
        <span class="pricing-header__icon">
          <i class="pi pi-box"></i>
        </span>

        <div>
          <h3>{{ $t('project_item.form_title') }}</h3>
          <p>{{ $t('project_item.form_description') }}</p>
        </div>
      </div>

      <div class="pricing-header__count">
        <span>{{ $t('project_item.selected_items') }}</span>
        <strong>{{ localItems.length }}</strong>
      </div>
    </header>

    <div class="add-panel" :class="{ disabled: loading }">
      <div class="form-section">
        <div class="form-section__header">
          <span class="form-section__number">01</span>

          <div>
            <h4>{{ $t('project_item.basic_information') }}</h4>
            <p>{{ $t('project_item.basic_information_description') }}</p>
          </div>
        </div>

        <div class="form-grid form-grid--main">
          <div class="field-box">
            <span class="field-help-label-row">
              <label class="mini-label">{{ $t('department.title') }}</label>

              <FieldHelpIcon :label="$t('department.title')" field-name="department_id" field-id="department_id" />
            </span>

            <UpdatedCustomInputSelect id="department_id" v-model="selectedDepartment" :controller="departmentController"
              :params="departmentParams" :placeholder="$t('department.placeholder')" :reload="true" required
              @update:model-value="updateDepartment" />
          </div>

          <div class="field-box">
            <span class="field-help-label-row">
              <label class="mini-label">{{ $t('project_item.item') }}</label>

              <FieldHelpIcon :label="$t('project_item.item')" field-name="material" field-id="project-item-item" />
            </span>

            <UpdatedCustomInputSelect id="project-item-item" v-model="selectedItem" :controller="generalItemController"
              :params="generalItemParams" :placeholder="$t('project_item.item_placeholder')" :reload="true" required
              @update:model-value="updateData" />
          </div>

          <div class="field-box">
            <span class="field-help-label-row">
              <label class="mini-label">{{ $t('project_item.pricing_method') }}</label>

              <FieldHelpIcon :label="$t('project_item.pricing_method')" field-name="type"
                field-id="project-item-pricing-method" />
            </span>

            <UpdatedCustomInputSelect id="project-item-pricing-method" :model-value="pricingMethod"
              :placeholder="$t('project_item.pricing_method_placeholder')" :static-options="pricingMethodOptions"
              required @update:model-value="updatePricingMethod" />
          </div>
        </div>
      </div>

      <div v-if="isFullFloorRelated || isSpaceRelated" class="form-section form-section--related">
        <div class="form-section__header">
          <span class="form-section__number">02</span>

          <div>
            <h4>{{ $t('project_item.related_label') }}</h4>
            <p>{{ $t('project_item.related_description') }}</p>
          </div>
        </div>

        <div class="form-grid form-grid--related">
          <div v-if="isFullFloorRelated" class="field-box">
            <span class="field-help-label-row">
              <label class="mini-label">{{ $t('ProjectFloor.floor_number') }}</label>

              <FieldHelpIcon :label="$t('ProjectFloor.floor_number')" field-name="floor_number"
                field-id="floor_number" />
            </span>

            <UpdatedCustomInputSelect id="floor_number" :model-value="selectedFloorNumber"
              :static-options="projectFloorOptions" :placeholder="$t('ProjectFloor.floor_number_placeholder')" required
              @update:model-value="updateFloorNumber" />
          </div>

          <div v-if="isSpaceRelated" class="field-box">
            <span class="field-help-label-row">
              <label class="mini-label">{{ $t('ProjectFloor.space') }}</label>

              <FieldHelpIcon :label="$t('ProjectFloor.space')" field-name="space" field-id="space_id" />
            </span>

            <UpdatedCustomInputSelect id="space_id" :model-value="selectedSpace"
              :static-options="projectFloorSpaceOptions" :placeholder="$t('ProjectFloor.space_placeholder')"
              @update:model-value="updateSelectedSpace" />
          </div>
        </div>
      </div>

      <div class="form-section">
        <div class="form-section__header">
          <span class="form-section__number">
            {{ isFullFloorRelated || isSpaceRelated ? '03' : '02' }}
          </span>

          <div>
            <h4>{{ $t('project_item.pricing_details') }}</h4>
            <p>{{ $t('project_item.pricing_details_description') }}</p>
          </div>
        </div>

        <div class="form-grid form-grid--pricing">
          <div class="field-box">
            <span class="field-help-label-row">
              <label class="mini-label">{{ $t('project_item.quantity') }}</label>

              <FieldHelpIcon :label="$t('project_item.quantity')" field-name="quantity" />
            </span>

            <input v-model.number="quantity" class="field-input" min="0" step="1" type="number" @input="updateData" />
          </div>

          <div class="field-box">
            <span class="field-help-label-row">
              <label class="mini-label">{{ $t('project_item.price') }}</label>

              <FieldHelpIcon :label="$t('project_item.price')" field-name="price" />
            </span>

            <input v-model.number="price" class="field-input" min="0" step="1" type="number" @input="updateData" />
          </div>

          <div class="field-box">
            <span class="field-help-label-row">
              <label class="mini-label">{{ $t('project_item.total_label') }}</label>

              <FieldHelpIcon :label="$t('project_item.total_label')" field-name="total" />
            </span>

            <div class="total-field">
              <span>{{ total.toLocaleString() }}</span>
            </div>
          </div>

          <div class="field-box field-box--action">
            <span class="field-help-label-row field-help-label-row--ghost">
              <label class="mini-label">{{ $t('general.actions') }}</label>
            </span>

            <button type="button" class="add-btn" :disabled="loading" @click="addItemToList">
              <i class="pi pi-plus"></i>
              <span>{{ $t('general.add') }}</span>
            </button>
          </div>
        </div>
      </div>

      <div class="items-section">
        <div class="items-section__header">
          <div>
            <h4>{{ $t('project_item.selected_items') }}</h4>
            <p>{{ $t('project_item.selected_items_description') }}</p>
          </div>

          <span class="items-section__badge">
            {{ localItems.length }}
          </span>
        </div>

        <div v-if="!localItems.length" class="empty-local-row">
          <span class="empty-local-row__icon">
            <i class="pi pi-inbox"></i>
          </span>

          <strong>{{ $t('project_item.no_items') }}</strong>
        </div>

        <div v-else class="local-table-wrap">
          <div class="local-table">
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
              <span class="local-table-row__primary">
                {{ item.item_title }}
              </span>

              <span>{{ item.related_title }}</span>
              <span>{{ item.pricing_method_title }}</span>
              <span>{{ item.quantity }}</span>
              <span>{{ item.price ?? '-' }}</span>
              <span class="local-table-row__total">{{ item.total ?? '-' }}</span>

              <button type="button" class="remove-btn" :title="$t('general.delete')" @click="removeItem(item.local_id)">
                <i class="pi pi-trash"></i>
              </button>
            </div>
          </div>
        </div>

        <footer class="local-total">
          <span>{{ $t('project_item.total_label') }}</span>

          <strong>{{ localItemsTotal.toLocaleString() }}</strong>
        </footer>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.pricing-card {
  overflow: hidden;
  border: 1px solid var(--border-weak);
  border-radius: 28px;
  background: var(--BgWhite);
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.06);
}

.pricing-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-weak);
  background: linear-gradient(135deg,
      var(--BgWhite),
      color-mix(in sRGB, var(--PrimaryColor-light) 45%, var(--BgWhite)));
}

.pricing-header__content {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 1rem;

  h3 {
    margin: 0;
    color: var(--bread-crumb-color-span);
    font-family: 'Bold';
    font-size: 1.15rem;
  }

  p {
    margin: 0.3rem 0 0;
    color: var(--gray-5);
    font-size: var(--xs-size);
  }
}

.pricing-header__icon {
  display: inline-flex;
  width: 48px;
  height: 48px;
  flex: 0 0 48px;
  align-items: center;
  justify-content: center;
  border: 1px solid color-mix(in sRGB, var(--PrimaryColor) 18%, transparent);
  border-radius: 16px;
  background: var(--BgWhite);
  color: var(--PrimaryColor);
  box-shadow: 0 8px 24px color-mix(in sRGB, var(--PrimaryColor) 12%, transparent);
}

.pricing-header__count {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 0.7rem;
  color: var(--gray-5);
  font-family: 'Medium';
  font-size: var(--xs-size);

  strong {
    display: inline-flex;
    min-width: 38px;
    height: 38px;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    background: var(--PrimaryColor);
    color: #fff;
    font-family: 'Bold';
  }
}

.add-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  background: color-mix(in sRGB, var(--bg-main) 72%, var(--BgWhite));

  &.disabled {
    pointer-events: none;
    opacity: 0.65;
  }
}

.form-section,
.items-section {
  padding: 1.15rem;
  border: 1px solid var(--border-weak);
  border-radius: 20px;
  background: var(--BgWhite);
}

.form-section--related {
  background: color-mix(in sRGB, var(--PrimaryColor-light) 24%, var(--BgWhite));
}

.form-section__header,
.items-section__header {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 1rem;

  h4 {
    margin: 0;
    color: var(--bread-crumb-color-span);
    font-family: 'Bold';
    font-size: 0.95rem;
  }

  p {
    margin: 0.25rem 0 0;
    color: var(--gray-5);
    font-size: var(--xs-size);
  }
}

.form-section__number {
  display: inline-flex;
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: var(--PrimaryColor-light);
  color: var(--PrimaryColor);
  font-family: 'Bold';
  font-size: 0.78rem;
}

.form-grid {
  display: grid;
  gap: 1rem;
  align-items: end;
}

.form-grid--main {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.form-grid--related {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.form-grid--pricing {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.field-box {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.5rem;
}

.field-help-label-row {
  display: flex;
  min-height: 24px;
  align-items: center;
  gap: 0.35rem;
}

.field-help-label-row--ghost {
  visibility: hidden;
}

.mini-label {
  color: var(--gray-6);
  font-family: 'Bold';
  font-size: 0.78rem;
}

.field-input,
.total-field,
.add-btn {
  width: 100%;
  min-height: 48px;
  border-radius: 14px;
}

.field-input {
  padding: 0.75rem 0.9rem;
  border: 1px solid var(--border-weak);
  background: var(--BgWhite);
  color: var(--bread-crumb-color-span);
  outline: none;
  font-family: 'Medium';
  font-size: var(--sm-size);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &:focus {
    border-color: var(--PrimaryColor);
    box-shadow: 0 0 0 3px var(--PrimaryColor-light);
  }
}

.total-field {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid color-mix(in sRGB, var(--PrimaryColor) 20%, var(--border-weak));
  background: var(--PrimaryColor-light);
  color: var(--PrimaryColor);
  font-family: 'Bold';
}

.add-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  border: 0;
  background: var(--PrimaryColor);
  color: #fff;
  cursor: pointer;
  font-family: 'Bold';
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 10px 24px color-mix(in sRGB, var(--PrimaryColor) 24%, transparent);
  }
}

.items-section {
  padding: 0;
  overflow: hidden;
}

.items-section__header {
  justify-content: space-between;
  margin: 0;
  padding: 1rem 1.15rem;
  border-bottom: 1px solid var(--border-weak);
  background: var(--bg-main);
}

.items-section__badge {
  display: inline-flex;
  min-width: 34px;
  height: 34px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: var(--PrimaryColor-light);
  color: var(--PrimaryColor);
  font-family: 'Bold';
}

.empty-local-row {
  display: flex;
  min-height: 170px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 0.75rem;
  color: var(--gray-5);
  text-align: center;

  strong {
    font-family: 'Medium';
  }
}

.empty-local-row__icon {
  display: inline-flex;
  width: 54px;
  height: 54px;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background: var(--bg-main);
  color: var(--PrimaryColor);
  font-size: 1.2rem;
}

.local-table-wrap {
  overflow-x: auto;
}

.local-table {
  min-width: 980px;
}

.local-table-head,
.local-table-row {
  display: grid;
  grid-template-columns:
    minmax(170px, 1.3fr) minmax(140px, 1fr) minmax(150px, 1fr) minmax(90px, 0.6fr) minmax(100px, 0.7fr) minmax(110px, 0.75fr) 56px;
  gap: 0.75rem;
  align-items: center;
  padding: 0.8rem 1rem;
}

.local-table-head {
  background: var(--bg-main);
  color: var(--gray-6);
  font-family: 'Bold';
  font-size: 0.76rem;
}

.local-table-row {
  min-height: 58px;
  border-top: 1px solid var(--border-weak);
  color: var(--bread-crumb-color-span);
  font-family: 'Medium';
  font-size: var(--sm-size);

  >span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.local-table-row__primary,
.local-table-row__total {
  color: var(--bread-crumb-color-span);
  font-family: 'Bold';
}

.local-table-row__total {
  color: var(--PrimaryColor);
}

.remove-btn {
  display: inline-flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(239, 68, 68, 0.24);
  border-radius: 10px;
  background: var(--BgWhite);
  color: var(--Red);
  cursor: pointer;
  transition:
    background 0.2s ease,
    transform 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    background: var(--danger-light);
  }
}

.local-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.15rem;
  border-top: 1px solid var(--border-weak);
  background: linear-gradient(135deg, var(--PrimaryColor-light), var(--BgWhite));

  span {
    color: var(--gray-6);
    font-family: 'Bold';
  }

  strong {
    color: var(--PrimaryColor);
    font-family: 'Bold';
    font-size: 1.05rem;
  }
}

.add-panel :deep(.input-label) {
  display: none;
}

.add-panel :deep(.p-select),
.add-panel :deep(.custom-select),
.add-panel :deep(.form-control) {
  min-height: 48px;
  border-radius: 14px;
}

@media (max-width: 1100px) {

  .form-grid--main,
  .form-grid--pricing {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .pricing-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .pricing-header__count {
    width: 100%;
    justify-content: space-between;
  }

  .form-grid--main,
  .form-grid--related,
  .form-grid--pricing {
    grid-template-columns: 1fr;
  }

  .field-help-label-row--ghost {
    display: none;
  }

  .local-table {
    min-width: 0;
  }

  .local-table-head {
    display: none;
  }

  .local-table-row {
    grid-template-columns: 1fr;
    gap: 0.45rem;
    padding: 1rem;

    >span {
      white-space: normal;
    }
  }

  .remove-btn {
    width: 100%;
  }
}
</style>
