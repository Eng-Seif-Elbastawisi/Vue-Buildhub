<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { onBeforeRouteLeave, useRoute } from 'vue-router';

import type TitleInterface from '@/base/Data/Models/titleInterface';

import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
import MultiLangInput from '@/shared/MultiLangInput.vue';
import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';

import { useFormsStore } from '@/stores/formsStore';

import IndexDepartmentParams from '@/modules/shared/Department/core/params/index.department.params';
import DepartmentController from '@/modules/shared/Department/presentation/controllers/department.controller';
import type { DepartmentTypeEnum } from '@/modules/shared/Department/core/constants/Type.enum';

import IndexMeasurementParams from '@/modules/shared/measurement/core/params/index.measurement.params';
import MeasurementController from '@/modules/shared/measurement/presentation/controllers/measurement.controller';

import IndexStageParams from '@/modules/shared/Stages/core/params/index.stage.params';
import StageController from '@/modules/shared/Stages/presentation/controllers/stage.controller';

import AddItemParams from '../../core/params/add.Item.params';
import { ItemTypeEnum } from '../../core/constant/item.type.enum copy';
import { ItemStatusEnum } from '../../core/constant/item.status.enum';
import type ItemShowModel from '../../core/models/Item.show.model';

const emit = defineEmits<{
  updateData: [params: AddItemParams];
}>();

const props = defineProps<{
  item?: ItemShowModel;
  formKey?: string;
  loading?: boolean;
}>();

const route = useRoute();
const formStore = useFormsStore();

const departmentController = DepartmentController.getInstance();
const measurementController = MeasurementController.getInstance();
const stageController = StageController.getInstance();

const measurementParams = new IndexMeasurementParams('', 1, 100, 0);

const itemTypeOptions = Object.entries(ItemTypeEnum).map(([title, id]) => ({
  id,
  title,
}));

const statusOptions = Object.entries(ItemStatusEnum).map(([title, id]) => ({
  id,
  title,
}));

const translations = ref<Record<string, string>>({});

const itemType = ref<TitleInterface<string | number> | null>(null);
const status = ref<TitleInterface<string | number> | null>(null);

const selectedDepartment = ref<TitleInterface<string | number> | null>(null);
const selectedMeasurement = ref<TitleInterface<string | number> | null>(null);
const selectedStage = ref<TitleInterface<string | number> | null>(null);

const price = ref<number>();
const notes = ref<string>('');

const optionFromId = (id?: number | string): TitleInterface<number> | null => {
  if (id === undefined || id === null) {
    return null;
  }

  return {
    id: Number(id),
    title: String(id),
  };
};

const numericId = (value?: string | number): number | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  const normalizedValue = Number(value);

  return Number.isNaN(normalizedValue) ? undefined : normalizedValue;
};

const selectedDepartmentId = computed(() => numericId(selectedDepartment.value?.id));

const selectedStageId = computed(() => numericId(selectedStage.value?.id));

const departmentSelectKey = computed(() => {
  return `item-department-${selectedStageId.value ?? 'without-stage'}`;
});

const departmentParams = computed(() =>
  selectedStageId.value !== undefined && selectedStageId.value !== null
    ? new IndexDepartmentParams({
      perPage: 100,
      withPage: 0,
      stageId: selectedStageId.value,
      type: Number(route.query.service_type) as DepartmentTypeEnum,
    })
    : null,
);

const stageParams = computed(() => {
  return new IndexStageParams({
    perPage: 100,
    withPage: 0,
    departmentId: selectedDepartmentId.value,
  });
});

const updateData = (): void => {
  emit(
    'updateData',
    new AddItemParams({
      type: itemType.value?.id as ItemTypeEnum | undefined,
      status: status.value?.id as ItemStatusEnum | undefined,

      department_id: selectedDepartmentId.value,
      stage_id: selectedStageId.value,

      measurement_unit_id: numericId(selectedMeasurement.value?.id),

      price: price.value,
      notes: notes.value,

      translations: {
        title: translations.value,
      },
    }),
  );
};

const updateStage = (stage: TitleInterface<string | number> | null): void => {
  const previousStageId = selectedStageId.value;
  const nextStageId = numericId(stage?.id);

  selectedStage.value = stage;

  if (previousStageId !== nextStageId) {
    selectedDepartment.value = null;
  }

  updateData();
};

const updateDepartment = (department: TitleInterface<string | number> | null): void => {
  selectedDepartment.value = department;
  updateData();
};

const updateTranslations = (value: Record<string, string>): void => {
  translations.value = value;
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
      return;
    }

    translations.value = {
      ...item.translations.title,
    };

    itemType.value = item.type
      ? (itemTypeOptions.find((option) => option.id === item.type) ?? optionFromId(item.type))
      : null;

    status.value = item.status
      ? (statusOptions.find((option) => option.id === item.status) ?? optionFromId(item.status))
      : null;

    selectedStage.value = optionFromId(item.stage_id);
    selectedDepartment.value = optionFromId(item.department_id);

    selectedMeasurement.value = optionFromId(item.measurement_unit_id);

    price.value = item.price;
    notes.value = item.notes ?? '';

    updateData();
  },
  {
    immediate: true,
  },
);

onMounted(() => {
  updateData();
});
</script>

<template>
  <div class="material-form-card">
    <header class="form-header">
      <h3>
        {{ $t('item.form_title') }}
      </h3>

      <p>
        {{ $t('item.form_description') }}
      </p>
    </header>

    <div class="form-fields" :class="{ disabled: loading }">
      <div class="field-group col-span-2">
        <MultiLangInput field-key="title" :label="$t('item.title')" :languages="['en', 'ar']"
          :model-value="translations" type="title" @update:model-value="updateTranslations" />
      </div>

      <div v-if="route.query.service_type === '2'" class="field-group" :class="{ disabled: loading }">
        <span class="field-help-label-row field-help-label-row--block">
          <label class="field-label" for="item-price">
            {{ $t('item.price') }}
          </label>

          <FieldHelpIcon :label="$t('item.price')" field-name="price" field-id="item-price" />
        </span>

        <div class="input-wrap">
          <input id="item-price" v-model.number="price" class="field-input" min="0" step="1" type="number"
            :placeholder="$t('item.price_placeholder')" @input="updateData" />
        </div>
      </div>

      <div v-if="route.query.service_type === '2'" class="field-group">
        <UpdatedCustomInputSelect id="item-type" v-model="itemType" :label="$t('item.type')"
          :placeholder="$t('item.type_placeholder')" :static-options="itemTypeOptions" required
          @update:model-value="updateData" />
      </div>

      <div class="field-group">
        <UpdatedCustomInputSelect id="item-status" v-model="status" :label="$t('item.status')"
          :placeholder="$t('item.status_placeholder')" :static-options="statusOptions" required
          @update:model-value="updateData" />
      </div>

      <div v-if="route.query.service_type === '2'" class="field-group">
        <UpdatedCustomInputSelect id="item-stage" :model-value="selectedStage" :controller="stageController"
          :label="$t('item.stage')" :params="stageParams" :placeholder="$t('item.stage_placeholder')" :reload="true"
          required @update:model-value="updateStage" />
      </div>

      <div class="field-group">
        <UpdatedCustomInputSelect id="item-department" :key="departmentSelectKey" v-model="selectedDepartment"
          :controller="departmentController" :label="$t('item.department')" :params="departmentParams"
          :placeholder="$t('item.department_placeholder')" :reload="true" required
          @update:model-value="updateDepartment" />
      </div>

      <div v-if="route.query.service_type === '2'" class="field-group">
        <UpdatedCustomInputSelect id="item-measurement" v-model="selectedMeasurement"
          :controller="measurementController" :label="$t('item.measurement')" :params="measurementParams"
          :placeholder="$t('item.measurement_placeholder')" :reload="true" required @update:model-value="updateData" />
      </div>

      <div class="field-group col-span-2">
        <span class="field-help-label-row field-help-label-row--block">
          <label class="field-label" for="item-notes">
            {{ $t('item.notes') }}
          </label>

          <FieldHelpIcon :label="$t('item.notes')" field-name="notes" field-id="item-notes" />
        </span>

        <div class="input-wrap">
          <textarea id="item-notes" v-model="notes" class="field-input notes-input"
            :placeholder="$t('item.notes_placeholder')" rows="3" @input="updateData" />
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
  color: var(--bread-crumb-color-span);
  font-family: 'Medium';
  font-size: var(--sm-size);
  font-weight: 400;
  transition: all 0.25s ease;
}

.notes-input {
  min-height: 96px;
  resize: vertical;
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
  align-items: end;
  gap: 1rem;

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
