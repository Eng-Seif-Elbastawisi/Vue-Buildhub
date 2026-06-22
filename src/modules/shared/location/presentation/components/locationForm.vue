<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { onBeforeRouteLeave } from 'vue-router';
  import type TitleInterface from '@/base/Data/Models/titleInterface';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import MultiLangInput from '@/shared/MultiLangInput.vue';
  import { useFormsStore } from '@/stores/formsStore';
  import AddLocationParams from '../../core/params/add.location.params';
  import { LocationTypeEnum } from '../../core/constant/location.type.enum';
  import type locationShowModel from '../../core/models/location.show.model';
import TranslationParams from '@/base/Core/Params/translationParams';

  const emit = defineEmits<{
    updateData: [params: AddLocationParams];
  }>();

  const props = defineProps<{
    location?: locationShowModel;
    formKey?: string;
    loading?: boolean;
  }>();

  const formStore = useFormsStore();
  const locationOptions = Object.entries(LocationTypeEnum).map(([title, id]) => ({ id, title }));

  const translations = ref<Record<string, string>>({});
  const code = ref<string | undefined>();
  const locationType = ref<TitleInterface<string | number> | null>(null);

  onBeforeRouteLeave((to, from) => {
    const savedData = props.formKey ? formStore.getFormData(props.formKey) : null;
    if (savedData && to.path !== from.path && props.formKey) {
      formStore.showReturnWarning(props.formKey);
    }
  });

  watch(
    () => props.location,
    (location) => {
      if (!location) return;
      translations.value = { ...location.translations.title };
      code.value = location.code;
      locationType.value = location.type
        ? (locationOptions.find((option) => option.id === location.type) ?? null)
        : null;
    },
    { immediate: true },
  );

  const updateData = () => {
    const translations = new TranslationParams({ title: title.value });
    emit(
      'updateData',
      new AddLocationParams({
        code: code.value,
        type: locationType.value?.id as
          | (typeof LocationTypeEnum)[keyof typeof LocationTypeEnum]
          | undefined,
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
      <h3>{{ $t('location.form_title') }}</h3>
      <p>{{ $t('location.form_description') }}</p>
    </header>

    <div class="form-fields" :class="{ disabled: loading }">
      <div class="field-group">
        {{ translations }}
        <MultiLangInput
          field-key="title"
          :label="$t('location.title')"
          :languages="['en', 'ar']"
          :model-value="translations"
          type="title"
          @update:model-value="updateTranslations"
        />
      </div>

        <!-- <div class="field-group">
          <label class="field-label" for="location-code">{{ $t('location.code') }}</label>
          <div class="input-wrap">
            <input
              id="location-code"
              v-model="code"
              class="field-input"
              :placeholder="$t('location.code_placeholder')"
              @input="updateData"
            />
          </div>
        </div> -->

      <div class="field-group">
        <UpdatedCustomInputSelect
          id="location-type"
          v-model="locationType"
          :label="$t('location.type')"
          :placeholder="$t('location.type_placeholder')"
          :static-options="locationOptions"
          required
          @update:model-value="updateData"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .field-input {
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
