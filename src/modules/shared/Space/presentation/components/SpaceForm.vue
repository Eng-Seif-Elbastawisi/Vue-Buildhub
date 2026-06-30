<script setup lang="ts">
  import { ref, watch } from 'vue';

  import TranslationParams from '@/base/Core/Params/translationParams';

  import MultiLangInput from '@/shared/MultiLangInput.vue';

  import type SpaceShowModel from '../../core/models/space.show.model';
  import AddSpaceParams from '../../core/params/add.space.params';

  const emit = defineEmits<{
    updateData: [params: AddSpaceParams];
  }>();

  const props = defineProps<{
    Space?: SpaceShowModel;
    loading?: boolean;
  }>();

  const translations = ref<Record<string, string>>({});

  const updateData = () => {
    emit(
      'updateData',
      new AddSpaceParams({
        translations: new TranslationParams({
          title: translations.value,
        }),
      }),
    );
  };

  const updateTranslations = (value: Record<string, string>) => {
    translations.value = value;
    updateData();
  };

  watch(
    () => props.Space,
    (Space) => {
      if (!Space) return;

      translations.value = {
        ...(Space.translations?.title ?? {}),
      };

      updateData();
    },
    { immediate: true },
  );
</script>

<template>
  <div class="Space-form-card">
    <header>
      <h3>{{ $t('Space.form_title') }}</h3>
      <p>{{ $t('Space.form_description') }}</p>
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
    </div>
  </div>
</template>

<style scoped lang="scss">
  .Space-form-card {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  header p {
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

  @media (max-width: 768px) {
    .form-fields {
      grid-template-columns: 1fr;
    }
  }
</style>
