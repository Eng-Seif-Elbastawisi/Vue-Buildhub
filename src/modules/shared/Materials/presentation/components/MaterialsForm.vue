<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { onBeforeRouteLeave } from 'vue-router';
  import type TitleInterface from '@/base/Data/Models/titleInterface';
  import IndexBrandParams from '@/modules/shared/Brand/core/params/index.brand.params';
  import BrandController from '@/modules/shared/Brand/presentation/controllers/brand.controller';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import MultiLangInput from '@/shared/MultiLangInput.vue';
  import { useFormsStore } from '@/stores/formsStore';
  import type MaterialsShowModel from '../../core/models/materials.show.model';
  import AddMaterialsParams from '../../core/params/add.materials.params';
  import { UnitTypeEnum } from '../../core/constant/unit.type.enum';

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
  const brandParams = new IndexBrandParams('', 1, 100, 0, undefined, 1);
  const unitOptions = Object.entries(UnitTypeEnum).map(([title, id]) => ({ id, title }));

  const translations = ref<Record<string, string>>({});
  const price = ref<number>();
  const brand = ref<TitleInterface<string | number> | null>(null);
  const unit = ref<TitleInterface<string | number> | null>(null);

  onBeforeRouteLeave((to, from) => {
    const savedData = props.formKey ? formStore.getFormData(props.formKey) : null;
    if (savedData && to.path !== from.path && props.formKey) {
      formStore.showReturnWarning(props.formKey);
    }
  });

  watch(
    () => props.material,
    (material) => {
      if (!material) return;
      translations.value = { ...material.translations.title };
      price.value = material.price;
      brand.value = material.brandId
        ? { id: material.brandId, title: String(material.brandId) }
        : null;
      unit.value = material.unit
        ? (unitOptions.find((option) => option.id === material.unit) ?? null)
        : null;
    },
    { immediate: true },
  );

  const updateData = () => {
    emit(
      'updateData',
      new AddMaterialsParams({
        price: price.value,
        brandId: brand.value?.id,
        unit: unit.value?.id as (typeof UnitTypeEnum)[keyof typeof UnitTypeEnum] | undefined,
        translations: { title: translations.value },
      }),
    );
  };

  const updateTranslations = (value: Record<string, string>) => {
    translations.value = value;
    updateData();
  };
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
        <label class="field-label" for="material-price">{{ $t('material.price') }}</label>
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
          id="material-unit"
          v-model="unit"
          :label="$t('material.unit')"
          :placeholder="$t('material.unit_placeholder')"
          :static-options="unitOptions"
          required
          @update:model-value="updateData"
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
