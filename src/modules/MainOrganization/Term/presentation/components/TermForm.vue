<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue';

  import TranslationParams from '@/base/Core/Params/translationParams';

  import MultiLangInput from '@/shared/MultiLangInput.vue';

  import type TermShowModel from '../../core/models/term.show.model';
  import AddTermParams from '../../core/params/add.term.params';

  const emit = defineEmits<{
    updateData: [params: AddTermParams];
  }>();

  const props = defineProps<{
    Term?: TermShowModel;
    loading?: boolean;
  }>();

  const translations = ref<Record<string, string>>({});

  const updateData = () => {
    emit(
      'updateData',
      new AddTermParams({
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
    () => props.Term,
    (Term) => {
      if (!Term) return;

      translations.value = {
        ...(Term.translations?.title ?? {}),
      };

      updateData();
    },
    { immediate: true },
  );
</script>

<template>
  <div class="Term-form-card">
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
    </div>
  </div>
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
