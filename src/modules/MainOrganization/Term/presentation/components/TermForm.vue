<script setup lang="ts">
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
  import { ref, watch } from 'vue';

  import TranslationParams from '@/base/Core/Params/translationParams';
  import MultiLangInput from '@/shared/MultiLangInput.vue';

  import type TermShowModel from '../../core/models/term.show.model';
  import AddTermParams from '../../core/params/add.term.params';

  const emit = defineEmits<{
    updateData: [params: AddTermParams];
  }>();

  const props = defineProps<{
    term?: TermShowModel;
    loading?: boolean;
  }>();

  const translations = ref<Record<string, string>>({});
  const descriptionTranslations = ref<Record<string, string>>({});

  const updateData = () => {
    emit(
      'updateData',
      new AddTermParams({
        translations: new TranslationParams({
          title: {
            ...translations.value,
          },
          description: {
            ...descriptionTranslations.value,
          },
        }),
      }),
    );
  };

  const updateTranslations = (value: Record<string, string>) => {
    translations.value = {
      ...value,
    };

    updateData();
  };

  const updateDescriptionTranslations = (value: Record<string, string>) => {
    descriptionTranslations.value = {
      ...value,
    };

    updateData();
  };

  watch(
    () => props.term,
    (term) => {
      if (!term) {
        translations.value = {};
        descriptionTranslations.value = {};
        return;
      }

      translations.value = {
        ...(term.translations?.title ?? {}),
      };

      descriptionTranslations.value = {
        ...(term.translations?.description ?? {}),
      };

      updateData();
    },
    {
      immediate: true,
      deep: true,
    },
  );
</script>

<template>
  <StandardFormLayout class="Term-form-card">
    <header>
      <h3>{{ $t('Term.form_title') }}</h3>
      <p>{{ $t('Term.form_description') }}</p>
    </header>

    <div class="form-fields" :class="{ disabled: loading }">
      <div class="field-group">
        <MultiLangInput
          field-key="title"
          :label="$t('title')"
          :languages="['ar', 'en']"
          :model-value="translations"
          type="title"
          @update:model-value="updateTranslations"
        />
      </div>

      <div class="field-group">
        <MultiLangInput
          field-key="description"
          :label="$t('description')"
          :languages="['ar', 'en']"
          :model-value="descriptionTranslations"
          type="description"
          @update:model-value="updateDescriptionTranslations"
        />
      </div>
    </div>
  </StandardFormLayout>
</template>

<style scoped lang="scss">
.Term-form-card {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

header p {
  color: var(--gray-5);
}

.form-fields {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1rem;
  align-items: end;

  &.disabled {
    pointer-events: none;
    opacity: 0.7;
  }
}

@media (max-width: 768px) {
  .form-fields {
    grid-template-columns: 1fr;
  }
}
</style>
