<script setup lang="ts">
import { onMounted, ref, watch, nextTick } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';

import type TitleInterface from '@/base/Data/Models/titleInterface';

import IndexBrandParams from '@/modules/shared/Brand/core/params/index.brand.params';
import BrandController from '@/modules/shared/Brand/presentation/controllers/brand.controller';

import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
import MultiLangInput from '@/shared/MultiLangInput.vue';

import { useFormsStore } from '@/stores/formsStore';

import type MaterialsShowModel from '../../core/models/materials.show.model';
import AddMaterialsParams from '../../core/params/add.materials.params';

import MeasurementController from '@/modules/shared/measurement/presentation/controllers/measurement.controller';
import IndexMeasurementParams from '@/modules/shared/measurement/core/params/index.measurement.params';

import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';

import ItemTypesController from '@/modules/MainOrganization/ItemTypes/presentation/controllers/item.types.controller';
import IndexItemTypesParams from '@/modules/MainOrganization/ItemTypes/core/params/index.item.types.params';

import StageController from '@/modules/shared/Stages/presentation/controllers/stage.controller';
import IndexStageParams from '@/modules/shared/Stages/core/params/index.stage.params';

const emit = defineEmits<{
  updateData: [params: AddMaterialsParams];
}>();

const props = defineProps<{
  material?: MaterialsShowModel;
  formKey?: string;
  loading?: boolean;
}>();

const formStore = useFormsStore();

const brandController = BrandController.getInstance();
const measurementController = MeasurementController.getInstance();
const itemTypeController = ItemTypesController.getInstance();
const stageController = StageController.getInstance();

const brandParams = new IndexBrandParams('', 1, 100, 0, undefined, 1);
const measurementParams = new IndexMeasurementParams('', 1, 100, 0);
const itemTypeParams = new IndexItemTypesParams('', 1, 100, 0);
const stageParams = new IndexStageParams('', 1, 100, 0, null);

const subStageParams = ref(
  new IndexStageParams('', 1, 100, 0, undefined),
);

const translations = ref<Record<string, string>>({});
const price = ref<number>();

const brand = ref<TitleInterface<string | number> | null>(null);
const measurement = ref<TitleInterface<string | number> | null>(null);
const itemType = ref<TitleInterface<string | number> | null>(null);
const stage = ref<TitleInterface<string | number> | null>(null);
const subStage = ref<TitleInterface<string | number> | null>(null);

const isInitializing = ref(false);
const isSubStageInitializing = ref(false);

const toSelectOption = (
  item?: { id?: number; title?: string } | null,
): TitleInterface<string | number> | null => {
  if (item?.id === undefined || item?.id === null) {
    return null;
  }

  return {
    id: item.id,
    title: item.title ?? '',
  };
};

watch(
  stage,
  async (value) => {
    if (!value?.id) {
      if (!isInitializing.value) {
        subStage.value = null;
        updateData();
      }

      return;
    }

    subStageParams.value = new IndexStageParams(
      '',
      1,
      100,
      0,
      Number(value.id),
    );

    if (!isInitializing.value) {
      subStage.value = null;
      updateData();
      return;
    }

    await nextTick();

    if (props.material?.subStage) {
      isSubStageInitializing.value = true;

      subStage.value = toSelectOption(props.material.subStage);

      await nextTick();

      isSubStageInitializing.value = false;
    }
  },
  { flush: 'post' },
);

watch(
  () => props.material,
  async (material) => {
    if (!material) {
      return;
    }

    isInitializing.value = true;
    isSubStageInitializing.value = true;

    translations.value = {
      ...(material.translations?.title ?? {}),
    };

    price.value = material.price;

    brand.value = toSelectOption(material.brand);
    measurement.value = toSelectOption(material.measurementId);
    itemType.value = toSelectOption(material.itemType);

    stage.value = toSelectOption(material.stage);

    if (material.stage?.id !== undefined && material.stage?.id !== null) {
      subStageParams.value = new IndexStageParams(
        '',
        1,
        100,
        0,
        Number(material.stage.id),
      );
    }

    subStage.value = toSelectOption(material.subStage);

    await nextTick();

    if (material.subStage) {
      subStage.value = toSelectOption(material.subStage);
    }

    isSubStageInitializing.value = false;
    isInitializing.value = false;
  },
  {
    immediate: true,
    flush: 'post',
  },
);

const updateData = () => {
  emit(
    'updateData',
    new AddMaterialsParams({
      price: price.value,
      brandId: brand.value?.id,
      measurementId: measurement.value?.id,
      itemTypeId: itemType.value?.id,
      stageId: stage.value?.id,
      subStageId: subStage.value?.id,
      translations: {
        title: translations.value,
      },
    }),
  );
};

const updateTranslations = (value: Record<string, string>) => {
  translations.value = value;
  updateData();
};

const handleSubStageUpdate = (
  value: TitleInterface<string | number> | null,
) => {
  if (isSubStageInitializing.value) {
    return;
  }

  subStage.value = value;
  updateData();
};

onBeforeRouteLeave((to, from) => {
  const savedData = props.formKey
    ? formStore.getFormData(props.formKey)
    : null;

  if (savedData && to.path !== from.path && props.formKey) {
    formStore.showReturnWarning(props.formKey);
  }
});

onMounted(() => {
  if (!props.material) {
    updateData();
  }
});
</script>

<template>
  <div class="material-form-card">
    <header class="form-header">
      <h3>{{ $t('material.form_title') }}</h3>
      <p>{{ $t('material.form_description') }}</p>
    </header>

    <div class="form-fields" :class="{ disabled: loading }">
      <div class="field-group col-span-2">
        <MultiLangInput
          field-key="title"
          :label="$t('material.title')"
          :languages="['en', 'ar']"
          :model-value="translations"
          type="title"
          @update:model-value="updateTranslations"
        />
      </div>

      <div class="field-group">
        <span class="field-help-label-row field-help-label-row--block">
          <label class="field-label" for="material-price">
            {{ $t('material.price') }}
          </label>

          <FieldHelpIcon
            :label="$t('material.price')"
            field-name="price"
            field-id="material-price"
          />
        </span>

        <div class="input-wrap">
          <input
            id="material-price"
            v-model.number="price"
            class="field-input"
            min="0"
            step="0.01"
            type="number"
            :placeholder="$t('material.price_placeholder')"
            @input="updateData"
          />
        </div>
      </div>

      <div class="field-group">
        <UpdatedCustomInputSelect
          id="material-item-type"
          v-model="itemType"
          :controller="itemTypeController"
          :label="$t('item_type')"
          :params="itemTypeParams"
          :placeholder="$t('item_type_placeholder')"
          required
          @update:model-value="updateData"
        />
      </div>

      <div class="field-group">
        <UpdatedCustomInputSelect
          id="material-stage"
          v-model="stage"
          :controller="stageController"
          :label="$t('Stage')"
          :params="stageParams"
          :placeholder="$t('stage_placeholder')"
          required
          @update:model-value="updateData"
        />
      </div>

      <div class="field-group">
        <UpdatedCustomInputSelect
          id="material-sub-stage"
          v-model="subStage"
          :controller="stageController"
          :label="$t('sub_stages')"
          :params="subStageParams"
          :placeholder="$t('sub_stage_placeholder')"
          :disabled="!stage"
          required
          @update:model-value="handleSubStageUpdate"
        />
      </div>

      <div class="field-group">
        <UpdatedCustomInputSelect
          id="material-brand"
          v-model="brand"
          :controller="brandController"
          :label="$t('material.brand')"
          :params="brandParams"
          :placeholder="$t('material.brand_placeholder')"
          required
          @update:model-value="updateData"
        />
      </div>

      <div class="field-group">
        <UpdatedCustomInputSelect
          id="material-measurement"
          v-model="measurement"
          :controller="measurementController"
          :label="$t('Measurement')"
          :params="measurementParams"
          :placeholder="$t('measurement.unit_placeholder')"
          required
          @update:model-value="updateData"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.input-wrap {
  input {
    width: 100%;
    padding: 12px 16px;
    padding-right: 50px;
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