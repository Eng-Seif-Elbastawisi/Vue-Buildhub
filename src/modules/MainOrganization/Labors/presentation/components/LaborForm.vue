<script setup lang="ts">
  import { onMounted, ref, watch, nextTick } from 'vue';
  import { onBeforeRouteLeave } from 'vue-router';

  import type TitleInterface from '@/base/Data/Models/titleInterface';

  import IndexBrandParams from '@/modules/shared/Brand/core/params/index.brand.params';
  import BrandController from '@/modules/shared/Brand/presentation/controllers/brand.controller';

  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import MultiLangInput from '@/shared/MultiLangInput.vue';

  import { useFormsStore } from '@/stores/formsStore';

  import AddLaborParams from '../../core/params/add.labor.params';

  import MeasurementController from '@/modules/shared/measurement/presentation/controllers/measurement.controller';
  import IndexMeasurementParams from '@/modules/shared/measurement/core/params/index.measurement.params';

  import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';

  import ItemTypesController from '@/modules/MainOrganization/ItemTypes/presentation/controllers/item.types.controller';
  import IndexItemTypesParams from '@/modules/MainOrganization/ItemTypes/core/params/index.item.types.params';

  import StageController from '@/modules/shared/Stages/presentation/controllers/stage.controller';
  import IndexStageParams from '@/modules/shared/Stages/core/params/index.stage.params';
  import type LaborModel from '../../core/models/labor.model';
import type laborShowModel from '../../core/models/labor.show.model';
  // import type laborShowModel from '@/modules/shared/labors/core/models/labors.show.model';

  const emit = defineEmits<{
    updateData: [params: AddLaborParams];
  }>();

  const props = defineProps<{
    labor?: laborShowModel;
    formKey?: string;
    loading?: boolean;
  }>();

  const formStore = useFormsStore();

  const measurementController = MeasurementController.getInstance();
  const itemTypeController = ItemTypesController.getInstance();
  const stageController = StageController.getInstance();

  const measurementParams = new IndexMeasurementParams('', 1, 100, 0);
  const itemTypeParams = new IndexItemTypesParams('', 1, 100, 0);
  const stageParams = new IndexStageParams('', 1, 100, 0, null);

  const subStageParams = ref(new IndexStageParams('', 1, 100, 0, undefined));

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

      subStageParams.value = new IndexStageParams('', 1, 100, 0, Number(value.id));

      if (!isInitializing.value) {
        subStage.value = null;
        updateData();
        return;
      }

      await nextTick();

      if (props.labor?.subStage) {
        isSubStageInitializing.value = true;

        subStage.value = toSelectOption(props.labor.subStage);

        await nextTick();

        isSubStageInitializing.value = false;
      }
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

      // brand.value = toSelectOption(labor.brand);

      measurement.value = toSelectOption(labor.measurementId);

      itemType.value = toSelectOption(labor.itemType);

      stage.value = toSelectOption(labor.stage);

      if (labor.stage?.id !== undefined && labor.stage?.id !== null) {
        subStageParams.value = new IndexStageParams('', 1, 100, 0, Number(labor.stage.id));
      }

      subStage.value = toSelectOption(labor.subStage);

      await nextTick();

      if (labor.subStage) {
        subStage.value = toSelectOption(labor.subStage);
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
      new AddLaborParams({
        price: price.value,
        // brandId: brand.value?.id,
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

  const handleSubStageUpdate = (value: TitleInterface<string | number> | null) => {
    if (isSubStageInitializing.value) {
      return;
    }

    subStage.value = value;
    updateData();
  };

  onBeforeRouteLeave((to, from) => {
    const savedData = props.formKey ? formStore.getFormData(props.formKey) : null;

    if (savedData && to.path !== from.path && props.formKey) {
      formStore.showReturnWarning(props.formKey);
    }
  });

  onMounted(() => {
    if (!props.labor) {
      updateData();
    }
  });
</script>

<template>
  <div class="labor-form-card">
    <header class="form-header">
      <h3>{{ $t('labor.title') }}</h3>
      <p>{{ $t('labor.description') }}</p>
    </header>

    <div class="form-fields" :class="{ disabled: loading }">
      <div class="field-group col-span-2">
        <MultiLangInput
          field-key="title"
          :label="$t('labor.title')"
          :languages="['en', 'ar']"
          :model-value="translations"
          type="title"
          @update:model-value="updateTranslations"
        />
      </div>

      <div class="field-group">
        <span class="field-help-label-row field-help-label-row--block">
          <label class="field-label" for="labor-price">
            {{ $t('labor.price') }}
          </label>

          <FieldHelpIcon :label="$t('labor.price')" field-name="price" field-id="labor-price" />
        </span>

        <div class="input-wrap">
          <input
            id="labor-price"
            v-model.number="price"
            class="field-input"
            min="0"
            step="0.01"
            type="number"
            :placeholder="$t('labor.price_placeholder')"
            @input="updateData"
          />
        </div>
      </div>

      <div class="field-group">
        <UpdatedCustomInputSelect
          id="labor-item-type"
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
          id="labor-stage"
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
          id="labor-sub-stage"
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

      <!-- <div class="field-group">
        <UpdatedCustomInputSelect
          id="labor-brand"
          v-model="brand"
          :controller="brandController"
          :label="$t('labor.brand')"
          :params="brandParams"
          :placeholder="$t('labor.brand_placeholder')"
          required
          @update:model-value="updateData"
        />
      </div> -->

      <div class="field-group">
        <UpdatedCustomInputSelect
          id="labor-measurement"
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
