<script setup lang="ts">
import { ref } from 'vue';
import AppButton from '@/shared/HelpersComponents/AppButton.vue';
import IconAccept from '@/shared/icons/IconAccept.vue';
import { useRoute } from 'vue-router';
import MeasurementForm from './MeasurementForm.vue';
import type AddMeasurementParams from '../../core/params/add.measurement.params.ts';
import EditMeasurementParams from '../../core/params/edit.measurement.params.ts';
import MeasurementController from '../controllers/measurement.controller.ts';
import type measurementModel from '../../core/models/measurement.model.ts';

const { stage } = defineProps<{
  stage?: measurementModel;
}>();

const emit = defineEmits<{
  saved: [];
}>();

const controller = MeasurementController.getInstance();
const route = useRoute();
const formKey = route.fullPath;
const params = ref<AddMeasurementParams | EditMeasurementParams | null>(null);
const loading = ref(false);

const saveStage = async () => {
  loading.value = true;
  try {
    if (!params.value) {
      console.error('No stage parameters to save');
      return;
    }

    const paramsToSave = params.value;

    const result =
      paramsToSave instanceof EditMeasurementParams
        ? await controller.update(paramsToSave, { useJson: true })
        : await controller.create(paramsToSave, { useJson: true });

    if (result) {
      emit('saved');
    }
  } catch (error) {
    console.error('Error saving email:', error);
  } finally {
    loading.value = false;
  }
};

const updateData = (updatedParams: AddMeasurementParams | EditMeasurementParams) => {
  params.value = updatedParams;
};
</script>

<template>
  <div class="email-crud-example">
    <div class="email-form-card">
      <MeasurementForm :form-key="formKey" :stage="stage" :loading="loading" @update-data="updateData" />

      <div class="actions" :class="{ disabled: loading }">
        <AppButton :title="$t('save')" size="sm" icon="right" type="submit" @click="saveStage">
          {{ $t('save') }}

          <template #icon>
            <IconAccept />
          </template>
        </AppButton>
      </div>

      <!-- Error Display -->
      <div v-if="controller.errorMessage.value" class="error">
        {{ controller.errorMessage.value }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.email-crud-example {
  padding: 0;
  padding-block: 20px;
}

:deep(.input-file) {
  border: 1px solid var(--input-file-border) !important;
  padding: 11px;
  border-radius: 20px !important;
  cursor: pointer;
}

.actions {
  padding: 0 0 10px 20px;
}

.actions {
  &.disabled {
    cursor: not-allowed;
    pointer-events: none;
    opacity: 0.7;
  }
}
</style>
