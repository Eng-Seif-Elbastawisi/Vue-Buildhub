<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue';

  import TranslationParams from '@/base/Core/Params/translationParams';
  import MultiLangInput from '@/shared/MultiLangInput.vue';
  import ToggleSwitch from 'primevue/toggleswitch';

  import type QuoteTypeModel from '../../core/models/quote.types.model';
  import AddQuoteTypeParams from '../../core/params/add.quote.types.params';

  const emit = defineEmits<{
    updateData: [params: AddQuoteTypeParams];
  }>();

  const props = defineProps<{
    quoteType?: QuoteTypeModel;
    loading?: boolean;
  }>();
  const descriptionTranslations = ref<Record<string, string>>({});

  const translations = ref<Record<string, string>>({});
  const status = ref(true);
  const updateDescriptionTranslations = (value: Record<string, string>) => {
    descriptionTranslations.value = value;
    updateData();
  };

  const updateData = () => {
    emit(
      'updateData',
      new AddQuoteTypeParams({
        translations: new TranslationParams({
          title: translations.value,
          description: descriptionTranslations.value,
        }),
        status: status.value,
      }),
    );
  };

  const updateTranslations = (value: Record<string, string>) => {
    translations.value = value;

    updateData();
  };

  onMounted(updateData);

  watch(
    () => props.quoteType,
    (quoteType) => {
      if (!quoteType) return;

      translations.value = {
        ...(quoteType.translations?.title ?? {}),
      };

      status.value = quoteType.status ?? true;
      descriptionTranslations.value = {
        ...(quoteType.translations?.description ?? {}),
      };

      updateData();
    },
    { immediate: true },
  );
</script>

<template>
  <div class="QuoteType-form-card">
    <header>
      <h3>{{ $t('quote_type.form_title') }}</h3>
      <p>{{ $t('quote_type.form_description') }}</p>
    </header>

    <div class="form-fields" :class="{ disabled: loading }">
      <div class="field-group full-row">
        <MultiLangInput
          field-key="title"
          :label="$t('title')"
          :languages="['ar', 'en']"
          :model-value="translations"
          type="title"
          required
          @update:model-value="updateTranslations"
        />
      </div>

      <div class="form-fields" :class="{ disabled: loading }">
        <div class="field-group full-row">
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

      <div class="status-toggle-wrapper">
        <ToggleSwitch
          v-model="status"
          input-id="quote-type-status"
          :disabled="loading"
          @update:model-value="updateData"
        />

        <span class="status-text" :class="{ active: status }">
          {{ status ? $t('active') : $t('inactive') }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .QuoteType-form-card {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .status-toggle-wrapper {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    height: 46px;
  }

  header p {
    color: var(--gray-5);
  }

  .form-fields {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;

    &.disabled {
      pointer-events: none;
      opacity: 0.7;
    }
  }

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .full-row {
    grid-column: 1 / -1;
  }
</style>
