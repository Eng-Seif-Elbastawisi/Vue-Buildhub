<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import ToggleSwitch from 'primevue/toggleswitch';

import MultiLangInput from '@/shared/MultiLangInput.vue';
import ConfirmCancelDialog from '@/base/Presentation/Dialogs/ConfirmCancelDialog.vue';

import AddMeasurementParams from '../../core/params/add.measurement.params';
import EditMeasurementParams from '../../core/params/edit.measurement.params';
import type MeasurementModel from '../../core/models/measurement.model';


// -----------------------------------------------------------------------------
// Router
// -----------------------------------------------------------------------------

const router = useRouter();


// -----------------------------------------------------------------------------
// Props / Emits
// -----------------------------------------------------------------------------

const emit = defineEmits<{
  updateData: [
    params: AddMeasurementParams | EditMeasurementParams
  ];
}>();


const props = defineProps<{
  measurement?: MeasurementModel;
  loading?: boolean;
  isEdit?: boolean;
}>();


// -----------------------------------------------------------------------------
// State
// -----------------------------------------------------------------------------

const translations = ref<Record<string, string>>({});
const symbol = ref<Record<string, string>>({});

const code = ref('');
const precision = ref(0);
const status = ref(true);

const showCancelDialog = ref(false);


// -----------------------------------------------------------------------------
// Update Form Data
// -----------------------------------------------------------------------------

const updateData = () => {

  const data = {

    translations: {
      title: translations.value,
      symbol: symbol.value,
    },

    code: code.value,

    precision: precision.value,

    status: status.value,

  };


  if (props.measurement?.id) {

    emit(
      'updateData',
      new EditMeasurementParams({
        id: props.measurement.id,
        ...data,
      }),
    );

    return;
  }


  emit(
    'updateData',
    new AddMeasurementParams(data),
  );

};


// -----------------------------------------------------------------------------
// Translation Updates
// -----------------------------------------------------------------------------

const updateTranslations = (
  value: Record<string, string>
) => {

  translations.value = value;

  updateData();

};


const updateSymbol = (
  value: Record<string, string>
) => {

  symbol.value = value;

  updateData();

};


// -----------------------------------------------------------------------------
// Edit Data Binding
// -----------------------------------------------------------------------------

let isInitializing = true;

watch(
  () => props.measurement,

  (newMeasurement) => {

    translations.value = {
      ...(newMeasurement?.translations?.title ?? {}),
    };


    code.value =
      newMeasurement?.code ?? '';



    symbol.value = {
      ...(newMeasurement?.translations?.symbol ?? {}),
    };


    precision.value =
      newMeasurement?.precision ?? 0;



    status.value =
      newMeasurement?.status !== undefined

        ? (
          typeof newMeasurement.status === 'number'

            ? newMeasurement.status === 1

            : Boolean(newMeasurement.status)

        )

        : true;



    if (isInitializing) {
      isInitializing = false;
      return;
    }

  },

  {
    immediate: true,
  },

);




const confirmCancel = () => {
  router.back();
};

</script>


<template>

  <div class="measurement-form">

    <div class="field-group" :class="{ disabled: loading }">
      <MultiLangInput
field-key="title" :label="$t('measurement_title')" :languages="['en', 'ar']"
        :model-value="translations" type="title" @update:model-value="updateTranslations" />
    </div>

    <div class="field-group" :class="{ disabled: loading }">
      <MultiLangInput
field-key="symbol" :label="$t('symbol')" :languages="['en', 'ar']" :model-value="symbol"
        type="title" @update:model-value="updateSymbol" />
    </div>

    <div class="field-group" :class="{ disabled: loading || isEdit }">
      <label for="code">
        {{ $t('code') }}
      </label>
      <input
id="code" v-model="code" class="field-input" type="text" :placeholder="$t('code')"
        :disabled="loading || isEdit" @input="updateData" />
    </div>

    <div class="field-group" :class="{ disabled: loading || isEdit }">
      <label for="precision">
        {{ $t('precision') }}
      </label>
      <input
id="precision" v-model.number="precision" class="field-input" type="number" min="0" step="1"
        :placeholder="$t('precision')" :disabled="loading || isEdit" @input="updateData" />
    </div>

    <div class="field-group status-group" :class="{ disabled: loading }">
      <label for="measurement-status">
        {{ $t('status') }}
      </label>
      <div class="status-toggle-wrapper">
        <ToggleSwitch
v-model="status" input-id="measurement-status" :disabled="loading"
          @update:model-value="updateData" />
        <span class="status-text" :class="{ active: status }">
          {{ status ? $t('active') : $t('inactive') }}
        </span>
      </div>
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
    border-color: var(--PrimaryColor);
    box-shadow: 0 0 0 3px var(--PrimaryColor-alpha-10);
  }

  &:disabled {
    cursor: not-allowed;
    background: var(--background-light, #f7f7f7);
  }
}

input[type='number'] {
  appearance: textfield;

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    margin: 0;
    appearance: none;
  }
}

@media (max-width: 768px) {
  .measurement-form {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

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

.status-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.status-toggle-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  height: 46px;
}

.status-text {
  font-family: 'Medium', sans-serif;
  font-size: var(--sm-size);
  color: var(--text-muted, #999);
  transition: color 0.2s ease;

  &.active {
    color: var(--primary-color, #b28f57);
    font-weight: 500;
  }
}
</style>
