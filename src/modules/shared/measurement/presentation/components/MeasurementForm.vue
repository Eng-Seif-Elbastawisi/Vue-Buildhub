<script setup lang="ts">
import { ref, watch } from 'vue';
import MultiLangInput from '@/shared/MultiLangInput.vue';
import AddMeasurementParams from '../../core/params/add.measurement.params';
import EditMeasurementParams from '../../core/params/edit.measurement.params';
import type measurementModel from '../../core/models/measurement.model';

const emit = defineEmits<{
  updateData: [params: AddMeasurementParams | EditMeasurementParams];
}>();

const props = defineProps<{
  stage?: measurementModel;
  loading?: boolean;
  resetKey?: number;
}>();

const translations = ref<{ [key: string]: string }>({});
const code = ref<string>('');
const symbol = ref<{ [key: string]: string }>({});
const precision = ref<number>(0);

const updateData = () => {
  if (props.stage?.id) {
    emit(
      'updateData',
      new EditMeasurementParams({
        id: props.stage.id,
        translations: { title: translations.value },
        code: code.value,
        symbol: {
          title: symbol.value,
        },
        precision: precision.value,
      }),
    );

    return;
  }

  emit(
    'updateData',
    new AddMeasurementParams({
      translations: { title: translations.value },
      code: code.value,
      symbol: {
        title: symbol.value,
      },
      precision: precision.value,
    }),
  );
};

watch(
  () => props.stage,
  (newStage) => {
    translations.value = newStage?.translations?.title ?? {};
    code.value = newStage?.code ?? '';
    symbol.value = newStage?.symbol?.title ?? {};
    precision.value = newStage?.precision ?? 0;

    updateData();
  },
  { immediate: true },
);

watch(
  () => props.resetKey,
  () => {
    translations.value = {};
  },
);
</script>

<template>
  <div class="measurement-form">
    <!-- Measurement Title -->
    <div class="field-group" :class="{ disabled: props.loading }">
      <MultiLangInput v-model="translations" field-key="title" :label="$t('measurement_title')"
        :languages="['en', 'ar']" type="title" @update:model-value="updateData" />
    </div>

    <!-- Code -->
    <div class="field-group" :class="{ disabled: props.loading }">
      <label for="code">
        {{ $t('code') }}
      </label>

      <input id="code" v-model="code" class="field-input" type="text" :placeholder="$t('code')" @input="updateData" />
    </div>

    <!-- Symbol -->
    <!-- Measurement Title -->
    <div class="field-group" :class="{ disabled: props.loading }">
      <MultiLangInput v-model="symbol" field-key="symbol" :label="$t('symbol')" :languages="['en', 'ar']" type="title"
        @update:model-value="updateData" />
    </div>

    <!-- Precision -->
    <div class="field-group" :class="{ disabled: props.loading }">
      <label for="precision">
        {{ $t('precision') }}
      </label>

      <input id="precision" v-model.number="precision" class="field-input" type="number" min="0" step="1"
        :placeholder="$t('precision')" @input="updateData" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.measurement-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem 1rem;
  width: 100%;
  padding: 1.25rem;
}

.field-group {
  min-width: 0;
  width: 100%;

  &.disabled {
    cursor: not-allowed;
    pointer-events: none;
    opacity: 0.65;
  }

  // label {
  //   display: block;
  //   margin-bottom: 0.5rem;
  //   font-family: 'Medium', sans-serif;
  //   font-size: var(--sm-size);
  //   font-weight: 500;
  //   line-height: 1.4;
  //   color: var(--bread-crumb-color-span);
  // }
}

.field-input {
  display: block;
  width: 100%;
  min-width: 0;
  height: 46px;
  padding: 0 1rem;

  border: 1px solid var(--border-weak);
  border-radius: 12px;

  background: var(--white);
  color: var(--bread-crumb-color-span);

  outline: none;
  font-family: 'Medium', sans-serif;
  font-size: var(--sm-size);
  font-weight: 400;

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;

  &::placeholder {
    color: var(--text-muted, #999);
    opacity: 0.8;
  }

  &:hover:not(:disabled) {
    border-color: var(--border-medium, #cfcfcf);
  }

  &:focus {
    border-color: var(--primary-color, #b28f57);
    box-shadow: 0 0 0 3px rgba(178, 143, 87, 0.1);
  }

  &:disabled {
    cursor: not-allowed;
    background: var(--background-light, #f7f7f7);
  }
}

/* Remove browser number arrows when not needed */
input[type='number'] {
  appearance: textfield;

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    margin: 0;
    appearance: none;
  }
}

/* Tablet */
@media (max-width: 768px) {
  .measurement-form {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

/* Mobile */
@media (max-width: 480px) {
  .measurement-form {
    gap: 0.875rem;
  }

  .field-input {
    height: 44px;
    padding: 0 0.875rem;
    border-radius: 10px;
  }

  .field-group label {
    margin-bottom: 0.4rem;
  }
}
</style>