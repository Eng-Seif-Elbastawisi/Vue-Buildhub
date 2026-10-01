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
  const siteDescription = ref('');
  const technicalGeneralNotes = ref('');
  const inspectionRecommendations = ref('');
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

  const toProjectItemPayload = (projectItemRow: LocalProjectItemRow): ProjectItemPayload => ({
    item_id: projectItemRow.item_id,
    price: projectItemRow.price,
    quantity: projectItemRow.quantity,
    pricing_method: projectItemRow.pricing_method,
    project_floor_id: projectItemRow.project_floor_id,
    project_floor_space_id: projectItemRow.project_floor_space_id,
  });

  const getProjectItemsPayload = (): ProjectItemPayload[] => {
    if (localItems.value.length) return localItems.value.map(toProjectItemPayload);

    const currentProjectItem = props.item ? buildCurrentItem() : null;
    return currentProjectItem ? [toProjectItemPayload(currentProjectItem)] : [];
  };

  function updateData() {
    emit(
      'updateData',
      new AddProjectItemParams({
        project_id: props.project,
        department_id: numericId(selectedDepartment.value?.id),
        site_description: siteDescription.value,
        technical_general_notes: technicalGeneralNotes.value,
        inspection_recommendations: inspectionRecommendations.value,
        items: getProjectItemsPayload(),
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
    siteDescription.value = '';
    technicalGeneralNotes.value = '';
    inspectionRecommendations.value = '';
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
      siteDescription.value = item.site_description ?? '';
      technicalGeneralNotes.value = item.technical_general_notes ?? '';
      inspectionRecommendations.value = item.inspection_recommendations ?? '';

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
  <section class="project-item-form-page pricing-card" :aria-busy="loading">
    <header class="pricing-header">
      <div class="pricing-header__content">
        <span class="pricing-header__icon" aria-hidden="true">
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
          <div class="form-section__heading">
            <span class="form-section__icon" aria-hidden="true">
              <i class="pi pi-info-circle"></i>
            </span>

            <div>
              <h4>{{ $t('project_item.basic_information') }}</h4>
              <p>{{ $t('project_item.basic_information_description') }}</p>
            </div>
          </div>

          <span class="form-section__number">01</span>
        </div>

        <div class="form-grid form-grid--main">
          <div class="field-box">
            <span class="field-help-label-row">
              <label class="mini-label">
                {{ $t('department.title') }}
                <span class="field-required" aria-hidden="true">*</span>
              </label>

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
              @update:model-value="updateDepartment"
            />
          </div>

          <div class="field-box">
            <span class="field-help-label-row">
              <label class="mini-label">
                {{ $t('project_item.item') }}
                <span class="field-required" aria-hidden="true">*</span>
              </label>

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

          <div class="field-box">
            <span class="field-help-label-row">
              <label class="mini-label">
                {{ $t('project_item.pricing_method') }}
                <span class="field-required" aria-hidden="true">*</span>
              </label>

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
        </div>
      </div>

      <div v-if="isFullFloorRelated || isSpaceRelated" class="form-section form-section--related">
        <div class="form-section__header">
          <div class="form-section__heading">
            <span class="form-section__icon" aria-hidden="true">
              <i class="pi pi-link"></i>
            </span>

            <div>
              <h4>{{ $t('project_item.related_label') }}</h4>
              <p>{{ $t('project_item.related_description') }}</p>
            </div>
          </div>

          <span class="form-section__number">02</span>
        </div>

        <div class="form-grid form-grid--related">
          <div v-if="isFullFloorRelated" class="field-box">
            <span class="field-help-label-row">
              <label class="mini-label">
                {{ $t('ProjectFloor.floor_number') }}
                <span class="field-required" aria-hidden="true">*</span>
              </label>

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

          <div v-if="isSpaceRelated" class="field-box">
            <span class="field-help-label-row">
              <label class="mini-label">
                {{ $t('ProjectFloor.space') }}
                <span class="field-required" aria-hidden="true">*</span>
              </label>

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
        </div>
      </div>

      <div class="form-section">
        <div class="form-section__header">
          <div class="form-section__heading">
            <span class="form-section__icon" aria-hidden="true">
              <i class="pi pi-calculator"></i>
            </span>

            <div>
              <h4>{{ $t('project_item.pricing_details') }}</h4>
              <p>{{ $t('project_item.pricing_details_description') }}</p>
            </div>
          </div>

          <span class="form-section__number">
            {{ isFullFloorRelated || isSpaceRelated ? '03' : '02' }}
          </span>
        </div>

        <div class="form-grid form-grid--pricing">
          <div class="field-box">
            <span class="field-help-label-row">
              <label class="mini-label" for="project-item-quantity">
                {{ $t('project_item.quantity') }}
                <span class="field-required" aria-hidden="true">*</span>
              </label>

              <FieldHelpIcon :label="$t('project_item.quantity')" field-name="quantity" />
            </span>

            <input
              id="project-item-quantity"
              v-model.number="quantity"
              class="field-input field-input--numeric"
              min="0"
              step="1"
              type="number"
              aria-required="true"
              @input="updateData"
            />
          </div>

          <div class="field-box">
            <span class="field-help-label-row">
              <label class="mini-label" for="project-item-price">
                {{ $t('project_item.price') }}
                <span class="field-required" aria-hidden="true">*</span>
              </label>

              <FieldHelpIcon :label="$t('project_item.price')" field-name="price" />
            </span>

            <input
              id="project-item-price"
              v-model.number="price"
              class="field-input field-input--numeric"
              min="0"
              step="1"
              type="number"
              aria-required="true"
              @input="updateData"
            />
          </div>

          <div class="field-box">
            <span class="field-help-label-row">
              <label class="mini-label">{{ $t('project_item.total_label') }}</label>

              <FieldHelpIcon :label="$t('project_item.total_label')" field-name="total" />
            </span>

            <div class="total-field" role="status" aria-live="polite">
              <span>{{ total.toLocaleString() }}</span>
            </div>
          </div>

          <div class="field-box field-box--action">
            <span class="field-help-label-row field-help-label-row--ghost">
              <label class="mini-label">{{ $t('general.actions') }}</label>
            </span>

            <button type="button" class="add-btn" :disabled="loading" @click="addItemToList">
              <i class="pi pi-plus" aria-hidden="true"></i>
              <span>{{ $t('general.add') }}</span>
            </button>
          </div>
        </div>
      </div>

      <div class="form-section">
        <div class="form-section__header">
          <div class="form-section__heading">
            <span class="form-section__icon" aria-hidden="true">
              <i class="pi pi-map-marker"></i>
            </span>

            <div>
              <h4>{{ $t('ProjectFloor.site_recommendations') }}</h4>
              <p>{{ $t('ProjectFloor.site_recommendations_description') }}</p>
            </div>
          </div>

          <span class="form-section__number">
            {{ isFullFloorRelated || isSpaceRelated ? '04' : '03' }}
          </span>
        </div>

        <div class="form-grid form-grid--notes">
          <label class="field-box">
            <span class="mini-label">{{ $t('ProjectFloor.site_description') }}</span>
            <textarea
              id="project-item-site-description"
              v-model="siteDescription"
              class="field-input notes-input"
              :placeholder="$t('ProjectFloor.site_description_placeholder')"
              @input="updateData"
            ></textarea>
          </label>

          <label class="field-box">
            <span class="mini-label">{{ $t('ProjectFloor.technical_general_notes') }}</span>
            <textarea
              id="project-item-technical-general-notes"
              v-model="technicalGeneralNotes"
              class="field-input notes-input"
              :placeholder="$t('ProjectFloor.technical_general_notes_placeholder')"
              @input="updateData"
            ></textarea>
          </label>

          <label class="field-box">
            <span class="mini-label">{{ $t('ProjectFloor.inspection_recommendations') }}</span>
            <textarea
              id="project-item-inspection-recommendations"
              v-model="inspectionRecommendations"
              class="field-input notes-input"
              :placeholder="$t('ProjectFloor.inspection_recommendations_placeholder')"
              @input="updateData"
            ></textarea>
          </label>
        </div>
      </div>

      <div class="items-section">
        <div class="items-section__header">
          <div class="items-section__heading">
            <span class="items-section__icon" aria-hidden="true">
              <i class="pi pi-list"></i>
            </span>

            <div>
              <h4>{{ $t('project_item.selected_items') }}</h4>
              <p>{{ $t('project_item.selected_items_description') }}</p>
            </div>
          </div>

          <span class="items-section__badge">
            {{ localItems.length }}
          </span>
        </div>

        <div v-if="!localItems.length" class="empty-local-row">
          <span class="empty-local-row__icon" aria-hidden="true">
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

              <button
                type="button"
                class="remove-btn"
                :title="$t('general.delete')"
                :aria-label="$t('general.delete')"
                @click="removeItem(item.local_id)"
              >
                <i class="pi pi-trash" aria-hidden="true"></i>
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
    border-radius: var(--radius-xl);
    background: var(--bg-card);
    box-shadow: var(--shadow-sm);
  }

  .pricing-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    min-height: 5.5rem;
    padding: var(--surface-padding);
    border-bottom: 1px solid var(--border-weak);
    background: color-mix(in sRGB, var(--PrimaryColor) 5%, var(--bg-card));
  }

  .pricing-header__content {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 1rem;

    h3 {
      margin: 0;
      color: var(--gray-900);
      font-family: 'Bold', var(--font-family);
      font-size: var(--xl-size-base);
      line-height: 1.4;
    }

    p {
      margin: 0.3rem 0 0;
      color: var(--gray-500);
      font-size: var(--xs-size);
      line-height: 1.55;
    }
  }

  .pricing-header__icon {
    display: inline-flex;
    width: 3rem;
    height: 3rem;
    flex: 0 0 3rem;
    align-items: center;
    justify-content: center;
    border: 1px solid color-mix(in sRGB, var(--PrimaryColor) 18%, var(--border-weak));
    border-radius: var(--radius-md);
    background: color-mix(in sRGB, var(--PrimaryColor) 9%, var(--bg-card));
    color: var(--PrimaryColor);
    font-size: 1.25rem;
  }

  .pricing-header__count {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    gap: 0.7rem;
    padding: 0.5rem 0.65rem;
    border: 1px solid color-mix(in sRGB, var(--PrimaryColor) 14%, var(--border-weak));
    border-radius: var(--radius-md);
    background: var(--bg-card);
    color: var(--gray-500);
    font-family: 'Medium', var(--font-family);
    font-size: var(--xs-size);

    strong {
      display: inline-flex;
      min-width: 38px;
      height: 38px;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);
      background: var(--PrimaryColor);
      color: var(--standard-white);
      font-family: 'Bold', var(--font-family);
    }
  }

  .add-panel {
    display: flex;
    flex-direction: column;
    gap: var(--page-section-gap);
    padding: var(--surface-padding);
    background: var(--bg-section);

    &.disabled {
      pointer-events: none;
      opacity: 0.65;
    }
  }

  .form-section,
  .items-section {
    overflow: hidden;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-xl);
    background: var(--bg-card);
    box-shadow: var(--shadow-sm);
  }

  .form-section__header,
  .items-section__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    min-height: 4.5rem;
    margin: 0;
    padding: 1rem var(--surface-padding);
    border-bottom: 1px solid color-mix(in sRGB, var(--PrimaryColor) 10%, var(--border-weak));
    background: color-mix(in sRGB, var(--PrimaryColor) 6%, var(--bg-card));

    h4 {
      margin: 0;
      color: var(--gray-900);
      font-family: 'Bold', var(--font-family);
      font-size: var(--md-size);
      line-height: 1.4;
    }

    p {
      margin: 0.25rem 0 0;
      color: var(--gray-500);
      font-size: var(--xs-size);
      line-height: 1.5;
    }
  }

  .form-section__heading,
  .items-section__heading {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 0.75rem;
  }

  .form-section__icon,
  .items-section__icon {
    display: grid;
    width: 2.35rem;
    height: 2.35rem;
    flex: 0 0 auto;
    place-items: center;
    border: 1px solid color-mix(in sRGB, var(--PrimaryColor) 16%, var(--border-weak));
    border-radius: var(--radius-sm);
    background: color-mix(in sRGB, var(--PrimaryColor) 9%, var(--bg-card));
    color: var(--PrimaryColor);
  }

  .form-section__number {
    display: inline-flex;
    width: 34px;
    height: 34px;
    flex: 0 0 34px;
    align-items: center;
    justify-content: center;
    border: 1px solid color-mix(in sRGB, var(--PrimaryColor) 18%, var(--border-weak));
    border-radius: var(--radius-full);
    background: var(--bg-card);
    color: var(--PrimaryColor);
    font-family: 'Bold', var(--font-family);
    font-size: 0.78rem;
  }

  .form-grid {
    display: grid;
    gap: 1rem;
    align-items: end;
    padding: var(--surface-padding);
  }

  .form-grid--main {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .form-grid--related {
    grid-template-columns: minmax(0, 1fr);
  }

  .form-grid--pricing {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .form-grid--notes {
    grid-template-columns: repeat(3, minmax(0, 1fr));
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
    color: var(--gray-700);
    font-family: 'Medium', var(--font-family);
    font-size: var(--sm-size);
    line-height: 1.45;
  }

  .field-required {
    margin-inline-start: 0.15rem;
    color: var(--danger);
  }

  .field-input,
  .total-field,
  .add-btn {
    width: 100%;
    min-height: max(var(--control-height), 46px);
    border-radius: var(--control-radius);
  }

  .field-input {
    padding: 0.75rem 0.9rem;
    border: 1px solid var(--border-strong);
    background: var(--bg-card);
    color: var(--gray-800);
    outline: none;
    font-family: 'Medium', var(--font-family);
    font-size: var(--sm-size);
    transition:
      border-color var(--transition-fast),
      box-shadow var(--transition-fast);

    &:hover:not(:disabled) {
      border-color: var(--gray-400);
    }

    &:focus-visible {
      border-color: var(--PrimaryColor);
      box-shadow: var(--focus-ring);
    }

    &::placeholder {
      color: var(--gray-400);
      opacity: 1;
    }
  }

  .field-input--numeric {
    direction: ltr;
    font-variant-numeric: tabular-nums;
    text-align: start;
  }

  .notes-input {
    min-height: 112px;
    resize: vertical;
  }

  .total-field {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid color-mix(in sRGB, var(--PrimaryColor) 20%, var(--border-weak));
    background: color-mix(in sRGB, var(--PrimaryColor) 7%, var(--bg-card));
    color: var(--PrimaryColor);
    font-family: 'Bold', var(--font-family);
    font-variant-numeric: tabular-nums;
    direction: ltr;
  }

  .add-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.55rem;
    border: 1px solid var(--PrimaryColor);
    background: var(--PrimaryColor);
    color: var(--standard-white);
    cursor: pointer;
    font-family: 'Medium', var(--font-family);
    transition:
      background-color var(--transition-fast),
      border-color var(--transition-fast),
      box-shadow var(--transition-fast),
      transform var(--transition-fast),
      opacity var(--transition-fast);

    &:disabled {
      cursor: not-allowed;
      opacity: 0.55;
    }

    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 8px 18px color-mix(in sRGB, var(--PrimaryColor) 20%, transparent);
    }

    &:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring);
    }
  }

  .items-section__badge {
    display: inline-flex;
    min-width: 34px;
    height: 34px;
    align-items: center;
    justify-content: center;
    border: 1px solid color-mix(in sRGB, var(--PrimaryColor) 18%, var(--border-weak));
    border-radius: var(--radius-full);
    background: var(--bg-card);
    color: var(--PrimaryColor);
    font-family: 'Bold', var(--font-family);
  }

  .empty-local-row {
    display: flex;
    min-height: 170px;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 0.75rem;
    padding: 2rem 1rem;
    background: var(--bg-card);
    color: var(--gray-500);
    text-align: center;

    strong {
      color: var(--gray-800);
      font-family: 'Medium', var(--font-family);
    }
  }

  .empty-local-row__icon {
    display: inline-flex;
    width: 54px;
    height: 54px;
    align-items: center;
    justify-content: center;
    border: 1px dashed var(--border-weak);
    border-radius: var(--radius-full);
    background: var(--bg-section);
    color: var(--PrimaryColor);
    font-size: 1.2rem;
  }

  .local-table-wrap {
    overflow-x: auto;
    overscroll-behavior-inline: contain;
  }

  .local-table {
    min-width: 56rem;
  }

  .local-table-head,
  .local-table-row {
    display: grid;
    grid-template-columns:
      minmax(170px, 1.3fr) minmax(140px, 1fr) minmax(150px, 1fr) minmax(90px, 0.6fr)
      minmax(100px, 0.7fr) minmax(110px, 0.75fr) 56px;
    gap: 0.75rem;
    align-items: center;
    padding: 0.8rem 1rem;
  }

  .local-table-head {
    border-bottom: 1px solid var(--border-weak);
    background: var(--bg-section);
    color: var(--gray-600);
    font-family: 'Medium', var(--font-family);
    font-size: 0.76rem;
  }

  .local-table-row {
    min-height: 58px;
    border-top: 1px solid var(--border-weak);
    color: var(--gray-700);
    font-family: 'Medium', var(--font-family);
    font-size: var(--sm-size);

    > span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .local-table-row__primary,
  .local-table-row__total {
    color: var(--gray-900);
    font-family: 'Bold', var(--font-family);
  }

  .local-table-row__total {
    color: var(--PrimaryColor);
  }

  .local-table-head > :nth-child(n + 4):nth-child(-n + 6),
  .local-table-row > :nth-child(n + 4):nth-child(-n + 6),
  .local-total strong {
    direction: ltr;
    font-variant-numeric: tabular-nums;
    unicode-bidi: isolate;
  }

  .remove-btn {
    display: inline-flex;
    width: 36px;
    height: 36px;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--danger-alpha-15);
    border-radius: var(--control-radius);
    background: var(--bg-card);
    color: var(--danger);
    cursor: pointer;
    transition:
      border-color var(--transition-fast),
      background-color var(--transition-fast),
      box-shadow var(--transition-fast),
      transform var(--transition-fast);

    &:hover,
    &:focus-visible {
      border-color: var(--danger);
      transform: translateY(-1px);
      background: var(--danger-light);
      outline: none;
    }

    &:focus-visible {
      box-shadow: var(--focus-ring);
    }
  }

  .local-total {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem var(--surface-padding);
    border-top: 1px solid var(--border-weak);
    background: color-mix(in sRGB, var(--PrimaryColor) 6%, var(--bg-card));

    span {
      color: var(--gray-700);
      font-family: 'Medium', var(--font-family);
    }

    strong {
      color: var(--PrimaryColor);
      font-family: 'Bold', var(--font-family);
      font-size: 1.05rem;
      font-variant-numeric: tabular-nums;
    }
  }

  .add-panel :deep(.input-label) {
    display: none;
  }

  .add-panel :deep(.p-select),
  .add-panel :deep(.custom-select),
  .add-panel :deep(.form-control) {
    min-height: max(var(--control-height), 46px);
    border-color: var(--border-strong);
    border-radius: var(--control-radius);
    background: var(--bg-card);
    box-shadow: none;
  }

  .add-panel :deep(.p-select:not(.p-disabled):hover) {
    border-color: var(--gray-400);
  }

  .add-panel :deep(.p-select.p-focus) {
    border-color: var(--PrimaryColor);
    box-shadow: var(--focus-ring);
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
      padding: 1rem;
    }

    .pricing-header__count {
      width: 100%;
      justify-content: space-between;
    }

    .form-grid--main,
    .form-grid--related,
    .form-grid--pricing,
    .form-grid--notes {
      grid-template-columns: 1fr;
    }

    .field-help-label-row--ghost {
      display: none;
    }

    .form-section__header,
    .items-section__header,
    .form-grid,
    .local-total {
      padding-inline: 1rem;
    }
  }

  @media (max-width: 520px) {
    .pricing-header__content,
    .form-section__heading,
    .items-section__heading {
      align-items: flex-start;
    }

    .form-section__icon,
    .items-section__icon {
      width: 2rem;
      height: 2rem;
    }

    .form-section__header,
    .items-section__header {
      gap: 0.65rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .field-input,
    .add-btn,
    .remove-btn {
      transition: none;
    }
  }
</style>
