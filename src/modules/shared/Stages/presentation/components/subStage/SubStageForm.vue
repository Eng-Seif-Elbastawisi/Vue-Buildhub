<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

import TranslationParams from '@/base/Core/Params/translationParams';
import MultiLangInput from '@/shared/MultiLangInput.vue';
import ToggleSwitch from 'primevue/toggleswitch';
import type StageShowModel from '../../../core/models/stage.model';
import AddStageParams from '../../../core/params/add.stges.params';
import EditStageParams from '../../../core/params/edit.stage.params';

const emit = defineEmits<{
  updateData: [params: AddStageParams];
}>();

const props = defineProps<{
  stage?: StageShowModel;
  parentId: number;
  loading?: boolean;
  isEdit?: boolean;
}>();

const status = ref(true);
const translations = ref<Record<string, string>>({});


const fillForm = () => {
  if (props.isEdit && props.stage) {
    translations.value = {
      ...(props.stage.translations?.title ?? {}),
    };

    status.value = Boolean(props.stage.status);
  } else {

    translations.value = {};
    status.value = true;
  }

  updateData();
};


const updateData = () => {
  if (props.isEdit) {
    emit(
      'updateData',
      new EditStageParams({
        id: props.stage?.id ?? 0,
        translations: new TranslationParams({
          title: translations.value,
        }),
        status: status.value,
      }),
    );
  } else {
    emit(
      'updateData',
      new AddStageParams({
        parentId: props.parentId,
        translations: new TranslationParams({
          title: translations.value,
        }),
        status: status.value,
      }),
    );
  };
}

const updateTranslations = (value: Record<string, string>) => {
  translations.value = value;
  updateData();
};


watch(
  () => [props.stage, props.isEdit],
  () => {
    fillForm();
  },
  { immediate: true },
);


onMounted(() => {
  fillForm();
});
</script>

<template>
  <div class="Stage-form-card">
    <header>
      <h3>
        {{ isEdit ? $t('sub_stage.edit_title') : $t('sub_stage.add_title') }}
      </h3>
      <p>{{ $t('sub_stage.form_description') }}</p>
    </header>

    <div class="form-fields" :class="{ disabled: loading }">
      <div class="field-group full-row">
        <MultiLangInput
field-key="title" :label="$t('title')" :languages="['ar', 'en']" :model-value="translations"
          type="title" required @update:model-value="updateTranslations" />
      </div>

      <div class="status-toggle-wrapper">
        <ToggleSwitch
v-model="status" input-id="sub-stage-status" :disabled="loading"
          @update:model-value="updateData" />
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
