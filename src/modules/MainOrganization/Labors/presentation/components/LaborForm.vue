<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { onBeforeRouteLeave, useRoute } from 'vue-router';

import type TitleInterface from '@/base/Data/Models/titleInterface';

import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
import MultiLangInput from '@/shared/MultiLangInput.vue';
import StatusToggleField from '@/modules/MainOrganization/ChangeStatus/presentation/components/StatusToggleField.vue';

import { useFormsStore } from '@/stores/formsStore';

import AddLaborParams from '../../core/params/add.labor.params';
import EditLaborParams from '../../core/params/edit.labor.params';

import MeasurementController from '@/modules/shared/measurement/presentation/controllers/measurement.controller';
import IndexMeasurementParams from '@/modules/shared/measurement/core/params/index.measurement.params';

import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';

import ItemTypesController from '@/modules/MainOrganization/ItemTypes/presentation/controllers/item.types.controller';
import IndexItemTypesParams from '@/modules/MainOrganization/ItemTypes/core/params/index.item.types.params';

import StageController from '@/modules/shared/Stages/presentation/controllers/stage.controller';
import { useStageSubStageFilters } from '@/modules/shared/Stages/presentation/composables/useStageSubStageFilters';
import type LaborShowModel from '../../core/models/labor.show.model';

const emit = defineEmits<{
  updateData: [params: AddLaborParams | EditLaborParams];
}>();

const props = defineProps<{
  labor?: LaborShowModel;
  formKey?: string;
  loading?: boolean;
}>();

const formStore = useFormsStore();
const route = useRoute();

const laborId = computed(() => {
  const routeParam = route.params.labor_id;
  const value = Array.isArray(routeParam) ? routeParam[0] : routeParam;
  const parsedId = Number(value);

  return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : undefined;
});

const measurementController = MeasurementController.getInstance();
const itemTypeController = ItemTypesController.getInstance();
const stageController = StageController.getInstance();

const measurementParams = new IndexMeasurementParams('', 1, 100, 0);
const itemTypeParams = new IndexItemTypesParams('', 1, 100, 0);
const translations = ref<Record<string, string>>({});
const price = ref<number>();
const status = ref(true);

const measurement = ref<TitleInterface<string | number> | null>(null);
const itemType = ref<TitleInterface<string | number> | null>(null);
const stage = ref<TitleInterface<string | number> | null>(null);
const subStage = ref<TitleInterface<string | number>[]>([]);

const { stageParams, subStageParams } = useStageSubStageFilters(stage);

const isInitializing = ref(false);
const isSubStageInitializing = ref(false);

const toSelectOption = (
  entity?: { id?: number; title?: string } | null,
): TitleInterface<string | number> | null => {
  if (entity?.id === undefined || entity?.id === null) return null;

  return { id: entity.id, title: entity.title ?? '' };
};

const toSelectOptions = (
  entities: { id?: number; title?: string }[],
): TitleInterface<string | number>[] => {
  return entities
    .map((entity) => toSelectOption(entity))
    .filter((option): option is TitleInterface<string | number> => option !== null);
};

watch(
  stage,
  async (selectedStage) => {
    if (!selectedStage?.id) {
      if (!isInitializing.value) {
        subStage.value = [];
        updateData();
      }

      return;
    }

    if (!isInitializing.value) {
      subStage.value = [];
      updateData();
      return;
    }

    await nextTick();
  },
  {
    flush: 'post',
  },
);

watch(
  () => props.labor,
  async (labor) => {
    if (!labor) {
      return;
    }

    isInitializing.value = true;
    isSubStageInitializing.value = true;

    translations.value = {
      ...(labor.translations?.title ?? {}),
    };

    price.value = labor.price;
    status.value = labor.status;

    measurement.value = toSelectOption(labor.measurementId);

    itemType.value = toSelectOption(labor.itemType);

    stage.value = toSelectOption(labor.stage);

    subStage.value = toSelectOptions(labor.subStages);

    await nextTick();

    isSubStageInitializing.value = false;
    isInitializing.value = false;
    updateData();
  },
  {
    immediate: true,
    flush: 'post',
  },
);

const updateData = () => {
  const laborData = {
    price: price.value,
    measurementId: measurement.value?.id,
    itemTypeId: itemType.value?.id,
    stageId: stage.value?.id,
    subStageIds: subStage.value.map((item) => Number(item.id)),
    status: status.value,
    translations: {
      title: translations.value,
    },
  };

  const params = laborId.value
    ? new EditLaborParams({ laborId: laborId.value, ...laborData })
    : new AddLaborParams(laborData);

  emit('updateData', params);
};

const updateTranslations = (updatedTranslations: Record<string, string>) => {
  translations.value = updatedTranslations;
  updateData();
};

const updateSubStage = (
  selectedSubStage: TitleInterface<string | number> | TitleInterface<string | number>[] | null,
) => {
  if (isSubStageInitializing.value) {
    return;
  }

  subStage.value = Array.isArray(selectedSubStage)
    ? selectedSubStage
    : selectedSubStage
      ? [selectedSubStage]
      : [];
  updateData();
};

onBeforeRouteLeave((to, from) => {
  const savedData = props.formKey ? formStore.getFormData(props.formKey) : null;

  if (savedData && to.path !== from.path && props.formKey) {
    formStore.showReturnWarning(props.formKey);
  }
});

onMounted(() => {
  if (!laborId.value && !props.labor) {
    updateData();
  }
});
</script>

<template>
  <div class="labor-form-card">
    <header class="form-header">
      <h3>{{ $t('labor.form_title') }}</h3>
      <p>{{ $t('labor.form_description') }}</p>
    </header>

    <div class="form-fields" :class="{ disabled: loading }">
      <div class="field-group col-span-2">
        <MultiLangInput field-key="title" :label="$t('labor.name')" :languages="['en', 'ar']"
          :model-value="translations" type="title" @update:model-value="updateTranslations" />
      </div>

      <div class="field-group">
        <span class="field-help-label-row field-help-label-row--block">
          <label class="field-label" for="labor-price">
            {{ $t('labor.price') }}
          </label>

          <FieldHelpIcon :label="$t('labor.price')" field-name="price" field-id="labor-price" />
        </span>

        <div class="input-wrap">
          <input id="labor-price" v-model.number="price" class="field-input" min="0" type="number"
            :placeholder="$t('labor.price_placeholder')" @input="updateData" />
          <!-- step="1" -->
        </div>
      </div>

      <div class="field-group">
        <UpdatedCustomInputSelect id="labor-item-type" v-model="itemType" :controller="itemTypeController"
          :label="$t('labor.item_type')" :params="itemTypeParams" :placeholder="$t('labor.item_type_placeholder')"
          required @update:model-value="updateData" />
      </div>

      <div class="field-group">
        <UpdatedCustomInputSelect id="labor-stage" v-model="stage" :controller="stageController"
          :label="$t('labor.stage')" :params="stageParams" :placeholder="$t('labor.stage_placeholder')" required
          @update:model-value="updateData" />
      </div>

      <div class="field-group">
        <UpdatedCustomInputSelect id="labor-sub-stage" :key="`labor-sub-stage-${stage?.id ?? 'none'}`"
          v-model="subStage" :controller="stageController" :label="$t('labor.sub_stage')" :params="subStageParams"
          :placeholder="$t('labor.sub_stage_placeholder')" :disabled="!stage?.id" :selection-limit="5" paginated
          required show-select-all :type="2" @update:model-value="updateSubStage" />
      </div>

      <div class="field-group">
        <UpdatedCustomInputSelect id="labor-measurement" v-model="measurement" :controller="measurementController"
          :label="$t('labor.measurement')" :params="measurementParams"
          :placeholder="$t('labor.measurement_placeholder')" required @update:model-value="updateData" />
      </div>

      <StatusToggleField v-model="status" input-id="labor-status" :disabled="loading"
        @update:model-value="updateData" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.input-wrap {
  input {
    width: 100%;
    padding: 12px 16px;
    padding-inline-end: 50px;
    border: 1px solid var(--border-weak);
    border-radius: 28px;
    background: var(--white);
    outline: none;
    transition: all 0.25s ease;
    font-family: 'Medium';
    font-weight: 400;
    font-size: var(--sm-size);
    color: var(--bread-crumb-color-span);
    max-height: 200px;
    max-width: 100%;
  }
}

.labor-form-card {
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
