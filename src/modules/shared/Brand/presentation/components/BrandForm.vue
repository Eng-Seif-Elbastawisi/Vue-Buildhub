<script setup lang="ts">
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
  import { computed, onMounted, ref, watch } from 'vue';
  import { onBeforeRouteLeave } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import TranslationParams from '@/base/Core/Params/translationParams';
  import type TitleInterface from '@/base/Data/Models/titleInterface';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import MultiLangInput from '@/shared/MultiLangInput.vue';
  import DocumentIcon from '@/shared/icons/DocaumentType/DocumentIcon.vue';
  import { useFormsStore } from '@/stores/formsStore';
  import { BrandTypeEnum } from '../../core/constant/Brand.type.enum';
  import type BrandShowModel from '../../core/models/brand.show.model';
  import AddBrandParams from '../../core/params/add.brand.params';

  const emit = defineEmits<{ updateData: [params: AddBrandParams] }>();
  const props = defineProps<{
    brand?: BrandShowModel;
    formKey?: string;
    loading?: boolean;
  }>();

  const { t } = useI18n();
  const formStore = useFormsStore();
  const selectedType = ref<TitleInterface<number> | null>(null);
  const title = ref<Record<string, string>>({});
  const typeOptions = computed<TitleInterface<number>[]>(() => [
    { id: BrandTypeEnum.MATERIALS, title: t('brand.types.materials') },
    { id: BrandTypeEnum.SUPPLIES, title: t('brand.types.supplies') },
  ]);

  const updateData = () => {
    const translations = new TranslationParams({ title: title.value });
    emit(
      'updateData',
      new AddBrandParams({
        translations,
        type: selectedType.value?.id as BrandTypeEnum | undefined,
      }),
    );
  };

  const updateTitle = (value: Record<string, string>) => {
    title.value = value;
    updateData();
  };

  const updateType = (value: TitleInterface<number> | null) => {
    selectedType.value = value;
    updateData();
  };

  onMounted(updateData);

  onBeforeRouteLeave((to, from) => {
    const savedData = props.formKey ? formStore.getFormData(props.formKey) : null;
    if (savedData && to.path !== from.path && props.formKey) {
      formStore.showReturnWarning(props.formKey);
    }
  });

  watch(
    () => props.brand,
    (brand) => {
      if (!brand) return;
      title.value = { ...brand.translations.title };
      selectedType.value = typeOptions.value.find((option) => option.id === brand.type) ?? null;
      updateData();
    },
    { immediate: true },
  );
</script>

<template>
  <StandardFormLayout class="document-form-card">
    <div class="document-form-header">
      <DocumentIcon />
      <div class="document-form-header-text">
        <h4>{{ $t('brand.form_title') }}</h4>
        <p>{{ $t('brand.form_description') }}</p>
      </div>
    </div>

    <div class="form-fields" :class="{ disabled: props.loading }">
      <div class="all_inputs">
        <div class="field-group col-span-2">
          <MultiLangInput
            field-key="title"
            :label="$t('brand.title')"
            :languages="['en', 'ar']"
            :model-value="title"
            type="title"
            @update:model-value="updateTitle"
          />
        </div>
        <div class="field-group">
          <UpdatedCustomInputSelect
            id="type"
            :model-value="selectedType"
            :label="$t('brand.type')"
            :placeholder="$t('brand.type_placeholder')"
            :static-options="typeOptions"
            required
            @update:model-value="updateType"
          />
        </div>
      </div>
    </div>
  </StandardFormLayout>
</template>

<style scoped>
.document-form-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.form-fields {
  .all_inputs {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    align-items: end;
  }
}

.field-input {
  width: 100%;
  max-width: 100%;
  max-height: 200px;
  padding: 12px 16px;
  padding-inline-end: 50px;
  border: 1px solid var(--border-weak);
  border-radius: var(--bh-radius-control);
  outline: none;
  background: var(--bh-surface-raised);
  color: var(--bread-crumb-color-span);
  font-family: 'Medium';
  font-size: var(--sm-size);
  font-weight: 400;
  transition: all 0.25s ease;
}

.disabled-input {
  pointer-events: none;
  opacity: 0.5;
}
</style>
