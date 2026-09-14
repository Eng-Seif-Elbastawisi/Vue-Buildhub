
<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';

import type AddStageParams from '../../core/params/add.stges.params';
import StageController from '../controllers/stage.controller';
import StageForm from './StageForm.vue';

const controller = StageController.getInstance();
const route = useRoute();

const params = ref<AddStageParams | null>(null);
const loading = ref(false);

const saveStage = async () => {
  if (!params.value) return;

  loading.value = true;

  try {
    await controller.create(
      params.value,
      undefined,
      route.fullPath,
    );
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="Stage-crud-page">
    <StageForm
      :loading="loading"
      @update-data="params = $event"
    />

    <button
      class="btn btn-primary"
      :class="{ 'btn--loading': loading }"
      type="button"
      :disabled="loading"
      @click="saveStage"
    >
      {{ $t('save') }}
    </button>

    <div
      v-if="controller.errorMessage.value"
      class="error"
    >
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped>
.Stage-crud-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.error {
  margin-top: 20px;
  padding: 10px;
  background-color: var(--danger-light);
  color: var(--danger-dark);
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}

.btn-primary {
  width: 100%;
}
</style>
