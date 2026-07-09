<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue';

  import TranslationParams from '@/base/Core/Params/translationParams';

  import MultiLangInput from '@/shared/MultiLangInput.vue';

  import type SpecializationShowModel from '../../core/models/specialization.show.model';
  import AddSpecializationParams from '../../core/params/add.specialization.params';

  const emit = defineEmits<{
    updateData: [params: AddSpecializationParams];
  }>();

  const props = defineProps<{
    Specialization?: SpecializationShowModel;
    loading?: boolean;
  }>();

  const translations = ref<Record<string, string>>({});

  const updateData = () => {
    emit(
      'updateData',
      new AddSpecializationParams({
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

  onMounted(updateData);

  watch(
    () => props.Specialization,
    (Specialization) => {
      if (!Specialization) return;

      translations.value = {
        ...(Specialization.translations?.title ?? {}),
      };

      updateData();
    },
    { immediate: true },
  );
</script>

<template>
  <div class="Specialization-form-card">
    <header>
      <h3>{{ $t('Specialization.form_title') }}</h3>
      <p>{{ $t('Specialization.form_description') }}</p>
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
  .Specialization-form-card {
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
