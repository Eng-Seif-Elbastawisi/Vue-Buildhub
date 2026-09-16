<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

import TranslationParams from '@/base/Core/Params/translationParams';
import MultiLangInput from '@/shared/MultiLangInput.vue';
import ToggleSwitch from 'primevue/toggleswitch';
import type StageShowModel from '../../core/models/stage.model';
import AddStageParams from '../../core/params/add.stges.params';

const emit = defineEmits<{
  updateData: [params: AddStageParams];
}>();

const props = defineProps<{
  stage?: StageShowModel;
  loading?: boolean;
}>();

const translations = ref<Record<string, string>>({});
const status = ref(true);
const updateData = () => {
  emit(
    'updateData',
    new AddStageParams({
      translations: new TranslationParams({
        title: translations.value,
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
  () => props.stage,
  (stage) => {
    if (!stage) return;

    translations.value = {
      ...(stage.translations?.title ?? {}),
    };

    updateData();
  },
  { immediate: true },
);
</script>

<template>
  <div class="Stage-form-card">
    <header>
      <h3>{{ $t('stage.form_title') }}</h3>
      <p>{{ $t('stage.form_description') }}</p>
    </header>

    <div class="form-fields" :class="{ disabled: loading }">
      <div class="field-group full-row">
        <MultiLangInput
field-key="title" :label="$t('title')" :languages="['ar', 'en']" :model-value="translations"
          type="title" required @update:model-value="updateTranslations" />
      </div>

      <div class="status-toggle-wrapper">
        <ToggleSwitch v-model="status" input-id="stage-status" :disabled="loading" @update:model-value="updateData" />
        <span class="status-text" :class="{ active: status }">
          {{ status ? $t('active') : $t('inactive') }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.Stage-form-card {
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
