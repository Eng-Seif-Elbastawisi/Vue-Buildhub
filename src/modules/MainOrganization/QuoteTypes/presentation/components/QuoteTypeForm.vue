<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue';
  import { useRoute } from 'vue-router';

  import TranslationParams from '@/base/Core/Params/translationParams';
  import MultiLangInput from '@/shared/MultiLangInput.vue';
  import ToggleSwitch from 'primevue/toggleswitch';

  import type QuoteTypeModel from '../../core/models/quote.types.model';
  import AddQuoteTypeParams from '../../core/params/add.quote.types.params';
  import EditQuoteTypeParams from '../../core/params/edit.quote.types.params';
  import ShowQuoteTypeParams from '../../core/params/show.quote.types.params';

  import QuoteTypeController from '../controllers/quote.types.controller';

  const route = useRoute();
  const controller = QuoteTypeController.getInstance();

  const isEdit = ref(false);
  const loading = ref(false);

  const quoteTypeId = ref<number | null>(null);

  const props = defineProps<{
    quoteType?: QuoteTypeModel;
  }>();

  const emit = defineEmits<{
    updateData: [params: AddQuoteTypeParams | EditQuoteTypeParams];
  }>();

  const translations = ref<Record<string, string>>({});
  const descriptionTranslations = ref<Record<string, string>>({});
  const status = ref(true);

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
        }),
      );

      return;
    }

    emit(
      'updateData',
      new AddQuoteTypeParams({
        translations: translationParams,
        status: status.value,
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

  const loadQuoteType = async () => {
    if (!isEdit.value || !quoteTypeId.value) {
      return;
    }

    await controller.fetchOne(
      new ShowQuoteTypeParams({
        id: quoteTypeId.value,
        allLocales: true,
      }),
    );
  };

  onMounted(async () => {
    const id = Number(route.params.id);

    if (route.params.id && !Number.isNaN(id)) {
      isEdit.value = true;
      quoteTypeId.value = id;

      await loadQuoteType();
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
