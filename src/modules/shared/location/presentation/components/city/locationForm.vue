<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue';
  import { onBeforeRouteLeave } from 'vue-router';
  import type TitleInterface from '@/base/Data/Models/titleInterface';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import MultiLangInput from '@/shared/MultiLangInput.vue';
  import { useFormsStore } from '@/stores/formsStore';
  import AddLocationParams from '../../../core/params/add.location.params';
  import { LocationTypeEnum } from '../../../core/constant/location.type.enum';
  import type locationShowModel from '../../../core/models/location.show.model';
  import TranslationParams from '@/base/Core/Params/translationParams';
  import LocationController from '../../controllers/location.controller';
  import IndexLocationParams from '../../../core/params/index.location.params';
  import DocumentIcon from '@/shared/icons/DocaumentType/DocumentIcon.vue';

  const emit = defineEmits<{
    updateData: [params: AddLocationParams];
  }>();

  const props = defineProps<{
    location?: locationShowModel;
    formKey?: string;
    loading?: boolean;
  }>();

  const formStore = useFormsStore();
  const locationController = LocationController.getInstance();

  const translations = ref<Record<string, string>>({});
  const code = ref<string | undefined>();
  const country = ref<TitleInterface<string | number> | null>(null);
  const governorate = ref<TitleInterface<string | number> | null>(null);

  const countryParams = new IndexLocationParams('', 1, 100, 0, null, LocationTypeEnum.COUNTRY);

  const governorateParams = computed(() => {
    return new IndexLocationParams(
      '',
      1,
      100,
      0,
      null,
      LocationTypeEnum.GOVERNORATE,
      country.value?.id ? Number(country.value.id) : null,
    );
  });

  onBeforeRouteLeave((to, from) => {
    const savedData = props.formKey ? formStore.getFormData(props.formKey) : null;

    if (savedData && to.path !== from.path && props.formKey) {
      formStore.showReturnWarning(props.formKey);
    }
  });

  const updateData = () => {
    const translationParams = new TranslationParams({ title: translations.value });

    emit(
      'updateData',
      new AddLocationParams({
        parentId: governorate.value?.id ? Number(governorate.value.id) : undefined,
        code: code.value,
        type: LocationTypeEnum.CITY,
        translations: translationParams,
      }),
    );
  };

  const handleCountryChange = () => {
    governorate.value = null;
    updateData();
  };

  const handleGovernorateChange = () => {
    updateData();
  };

  onMounted(updateData);

  watch(
    () => props.location,
    (location) => {
      if (!location) return;

      translations.value = { ...location.translations.title };
      code.value = location.code;

      governorate.value = location.parent
        ? {
            id: location.parent.id,
            title: location.parent.title,
          }
        : null;

      country.value = location.parent?.parent
        ? {
            id: location.parent.parent.id,
            title: location.parent.parent.title,
          }
        : null;

      updateData();
    },
    { immediate: true },
  );
  const updateTranslations = (value: Record<string, string>) => {
    translations.value = value;
    updateData();
  };
</script>

<template>
  <div class="material-form-card">
    <div class="document-form-header">
      <DocumentIcon />
      <header class="form-header">
        <h3>{{ $t('location.form_title') }}</h3>
        <p>{{ $t('location.form_description') }}</p>
      </header>
    </div>

    <div class="form-fields" :class="{ disabled: loading }">
      <div class="field-group">
        <MultiLangInput
          field-key="title"
          :label="$t('location.title')"
          :languages="['en', 'ar']"
          :model-value="translations"
          type="title"
          @update:model-value="updateTranslations"
        />
      </div>

      <div class="field-group">
        <UpdatedCustomInputSelect
          id="country"
          v-model="country"
          :label="$t('location.country')"
          :options="[]"
          :controller="locationController"
          :placeholder="$t('location.country_placeholder')"
          :params="countryParams"
          :required="true"
          @update:model-value="handleCountryChange"
        />
      </div>

      <div class="field-group" :class="{ disabled: !country?.id }">
        <UpdatedCustomInputSelect
          id="governorate"
          v-model="governorate"
          :label="$t('location.governorate')"
          :options="[]"
          :controller="locationController"
          :placeholder="$t('location.governorate_placeholder')"
          :params="governorateParams"
          :required="true"
          @update:model-value="handleGovernorateChange"
        />
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
  .disabled {
    pointer-events: none;
    opacity: 0.7;
  }

  .document-form-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .field-input {
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
    align-items: end;

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
