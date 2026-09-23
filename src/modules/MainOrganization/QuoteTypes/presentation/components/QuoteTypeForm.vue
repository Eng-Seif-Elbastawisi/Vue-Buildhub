<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue';
  import { useRoute } from 'vue-router';

  import TranslationParams from '@/base/Core/Params/translationParams';
  import MultiLangInput from '@/shared/MultiLangInput.vue';
  import ToggleSwitch from 'primevue/toggleswitch';

  import type QuoteTypeModel from '../../core/models/quote.types.model';
  import AddQuoteTypeParams from '../../core/params/add.quote.types.params';
  import EditQuoteTypeParams from '../../core/params/edit.quote.types.params';

  const route = useRoute();

  const isEdit = ref(false);
  const quoteTypeId = ref<number | null>(null);

  const props = defineProps<{
    quoteType?: QuoteTypeModel;
    loading?: boolean;
    disabled?: boolean;
  }>();

  const emit = defineEmits<{
    updateData: [params: AddQuoteTypeParams | EditQuoteTypeParams];
  }>();

  const translations = ref<Record<string, string>>({});
  const descriptionTranslations = ref<Record<string, string>>({});
  const status = ref(true);
  const typeCode = ref('');
  const calculationModel = ref('');

  const updateData = () => {
    const translationParams = new TranslationParams({
      title: translations.value,
      description: descriptionTranslations.value,
    });

    if (isEdit.value && quoteTypeId.value) {
      emit(
        'updateData',
        new EditQuoteTypeParams({
          id: quoteTypeId.value,
          translations: translationParams,
          status: status.value,
          typeCode: typeCode.value,
        }),
      );

      return;
    }

    emit(
      'updateData',
      new AddQuoteTypeParams({
        translations: translationParams,
        status: status.value,
        typeCode: typeCode.value,
      }),
    );
  };

  const updateTranslations = (value: Record<string, string>) => {
    translations.value = value;

    updateData();
  };

  const updateDescriptionTranslations = (value: Record<string, string>) => {
    descriptionTranslations.value = value;

    updateData();
  };

  onMounted(() => {
    const id = Number(route.params.id);

    if (route.params.id && !Number.isNaN(id)) {
      isEdit.value = true;
      quoteTypeId.value = id;
    }

    updateData();
  });

  watch(
    () => props.quoteType,
    (quoteType) => {
      if (!quoteType) {
        return;
      }

      translations.value = {
        ...(quoteType.translations?.title ?? {}),
      };

      descriptionTranslations.value = {
        ...(quoteType.translations?.description ?? {}),
      };

      status.value = quoteType.status ?? true;
      typeCode.value = quoteType.typeCode ?? '';
      calculationModel.value = quoteType.calculationModel ?? '';

      updateData();
    },
    { immediate: true },
  );
</script>

<template>
  <div class="QuoteType-form-card">
    <header>
      <h3>
        {{ isEdit ? $t('quote_type.update') : $t('quote_type.form_title') }}
      </h3>

      <p>{{ $t('quote_type.form_description') }}</p>
    </header>

    <section class="configuration-fields" :aria-label="$t('quote_type.configuration_fields')">
      <div class="configuration-field">
        <label for="quote-type-code">
          {{ $t('quote_type.type_code') }}
          <span aria-hidden="true">*</span>
        </label>
        <input
          id="quote-type-code"
          v-model.trim="typeCode"
          class="configuration-field-input"
          :class="{ readonly: isEdit }"
          type="text"
          maxlength="100"
          autocomplete="off"
          autocapitalize="characters"
          spellcheck="false"
          required
          :disabled="loading || disabled"
          :readonly="isEdit || disabled"
          :aria-readonly="isEdit || disabled"
          :placeholder="$t('quote_type.type_code_placeholder')"
          @input="updateData"
        />
        <small>
          {{ $t(isEdit ? 'quote_type.type_code_readonly_hint' : 'quote_type.type_code_hint') }}
        </small>
      </div>

      <div class="configuration-field">
        <label for="quote-type-calculation-model">
          {{ $t('quote_type.calculation_model') }}
        </label>
        <input
          id="quote-type-calculation-model"
          class="configuration-field-input readonly"
          type="text"
          :value="calculationModel"
          :disabled="loading || disabled"
          :readonly="isEdit || disabled"
          :aria-readonly="isEdit || disabled"
          :placeholder="$t('quote_type.calculation_model_placeholder')"
        />
        <small>{{ $t('quote_type.calculation_model_hint') }}</small>
      </div>
    </section>

    <div class="form-fields" :class="{ disabled: loading }">
      <div class="field-group full-row">
        <MultiLangInput
          field-key="title"
          :label="$t('title')"
          :languages="['ar', 'en']"
          :model-value="translations"
          type="title"
          required
          :disabled="loading || disabled"
          :readonly="isEdit || disabled"
          :aria-readonly="isEdit || disabled"
          @update:model-value="updateTranslations"
        />
      </div>

      <div class="field-group full-row">
        <MultiLangInput
          field-key="description"
          :label="$t('description')"
          :languages="['ar', 'en']"
          :model-value="descriptionTranslations"
          type="description"
          :disabled="loading || disabled"
          :readonly="isEdit || disabled"
          :aria-readonly="isEdit || disabled"
          @update:model-value="updateDescriptionTranslations"
        />
      </div>

      <div class="status-toggle-wrapper">
        <ToggleSwitch
          v-model="status"
          input-id="quote-type-status"
          :disabled="loading || disabled"
          :readonly="isEdit || disabled"
          :aria-readonly="isEdit || disabled"
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

  .configuration-fields {
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 1rem;
    padding: 1rem;
    background: var(--bg-section);
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-lg);
  }

  .configuration-field {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 0.5rem;

    small {
      color: var(--subtitle-color);
      font-size: var(--xs-size);
    }

    label {
      color: var(--title-card-color);
      font-size: var(--sm-size);
      font-weight: 600;
    }

    span {
      color: var(--danger-color);
    }
  }

  .configuration-field-input {
    width: 100%;
    min-height: 2.75rem;
    padding: 0.7rem 0.85rem;
    color: var(--title-card-color);
    background: var(--white);
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-md);
    font-family: inherit;
    cursor: text;

    &::placeholder {
      color: var(--gray-500);
    }

    &.readonly {
      color: var(--gray-600);
      background: var(--gray-100);
      cursor: default;
    }
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

  @media (max-width: 768px) {
    .configuration-fields {
      grid-template-columns: 1fr;
    }
  }
</style>
