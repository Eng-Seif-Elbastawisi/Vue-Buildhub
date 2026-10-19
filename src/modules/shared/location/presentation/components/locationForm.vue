<script setup lang="ts">
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
  import { onMounted, ref, watch } from 'vue';
  import { onBeforeRouteLeave } from 'vue-router';
  import MultiLangInput from '@/shared/MultiLangInput.vue';
  import { useFormsStore } from '@/stores/formsStore';
  import AddLocationParams from '../../core/params/add.location.params';
  import type locationShowModel from '../../core/models/location.show.model';
  import TranslationParams from '@/base/Core/Params/translationParams';
  import type { LocationTypeEnum } from '../../core/constant/location.type.enum';
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

  const translations = ref<{ [key: string]: string }>({});
  const type = ref<LocationTypeEnum>(props.location?.type ?? 1);

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
        translations: translationParams,
        type: type.value,
      }),
    );
  };
  watch(
    () => props.location,
    (newLocation) => {
      translations.value = newLocation?.translations?.title ?? {};
      type.value = newLocation?.type ?? 1;
    },
    { immediate: true },
  );

  const updateTranslations = (value: Record<string, string>) => {
    translations.value = value;
    updateData();
  };

  onMounted(updateData);
</script>

<template>
  <StandardFormLayout class="material-form-card">
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
    </div>
  </StandardFormLayout>
</template>

<style scoped lang="scss">
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
  border-radius: var(--bh-radius-control);
  background: var(--bh-surface-raised);
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
