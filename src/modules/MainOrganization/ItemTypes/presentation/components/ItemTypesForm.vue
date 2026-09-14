<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue';

  import TranslationParams from '@/base/Core/Params/translationParams';
  import MultiLangInput from '@/shared/MultiLangInput.vue';
  import TitleInterface from '@/base/Data/Models/titleInterface';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';

  import type ItemTypesShowModel from '../../core/models/item.types.show.model';
  import AddItemTypesParams from '../../core/params/add.item.types.params';
  import { ItemTypeEnum } from '../../core/constant/item.type.enum';

  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  const emit = defineEmits<{
    updateData: [params: AddItemTypesParams];
  }>();

  const props = defineProps<{
    ItemTypes?: ItemTypesShowModel;
    loading?: boolean;
  }>();

  const selectedType = ref<TitleInterface<number> | null>(null);

  const code = ref<string | undefined>();

  const translations = ref<Record<string, string>>({});

  const descriptionTranslations = ref<Record<string, string>>({});

  const typeOptions = computed<TitleInterface<number>[]>(() => [
    new TitleInterface({
      id: ItemTypeEnum.LABOR,
      title: t('LABOR'),
    }),
    new TitleInterface({
      id: ItemTypeEnum.MATERIALS,
      title: t('MATERIALS'),
    }),
    new TitleInterface({
      id: ItemTypeEnum.PRODUCTS,
      title: t('PRODUCTS'),
    }),
  ]);

  const updateData = () => {
    emit(
      'updateData',
      new AddItemTypesParams({
        translations: new TranslationParams({
          title: translations.value,
          description: descriptionTranslations.value,
        }),
        type: selectedType.value?.id as ItemTypeEnum,
        code: code.value,
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

  onMounted(updateData);

  watch(
    () => props.ItemTypes,
    (ItemTypes) => {
      if (!ItemTypes) return;

      translations.value = {
        ...(ItemTypes.translations?.title ?? {}),
      };

      descriptionTranslations.value = {
        ...(ItemTypes.translations?.description ?? {}),
      };

      selectedType.value = typeOptions.value.find((item) => item.id === ItemTypes.type) ?? null;

      code.value = ItemTypes.code;

      updateData();
    },
    { immediate: true },
  );
</script>

<template>
  <div class="ItemTypes-form-card">
    <header>
      <h3>{{ $t('ItemTypes.form_title') }}</h3>
      <p>{{ $t('ItemTypes.form_description') }}</p>
    </header>

    <div class="form-fields" :class="{ disabled: loading }">
      <!-- Title - Full Row -->
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

      <!-- Description - Full Row -->
      <div id="description-field" class="field-group col-span-2">
        <MultiLangInput
          field-key="description"
          :label="$t('description')"
          :languages="['ar', 'en']"
          :model-value="descriptionTranslations"
          type="description"
          required
          @update:model-value="updateDescriptionTranslations"
        />
      </div>

      <!-- Type -->
      <div class="field-group">
        <UpdatedCustomInputSelect
          id="type"
          v-model="selectedType"
          :label="$t('type')"
          :placeholder="$t('type_placeholder')"
          :static-options="typeOptions"
          required
          @update:model-value="updateData"
        />
      </div>

      <!-- Code -->
      <div class="field-group">
        <label for="code">
          {{ $t('code') }}
        </label>

        <input
          id="code"
          v-model="code"
          type="text"
          class="field-input"
          :placeholder="$t('code_placeholder')"
          @input="updateData"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .ItemTypes-form-card {
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

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .full-row {
    grid-column: 1 / -1;
  }

  .field-input {
    width: 100%;
  }

  @media (max-width: 768px) {
    .form-fields {
      grid-template-columns: 1fr;
    }

    .full-row {
      grid-column: auto;
    }
  }
</style>
