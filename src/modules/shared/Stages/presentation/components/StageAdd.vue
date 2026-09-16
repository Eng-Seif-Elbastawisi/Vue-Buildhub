<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import type AddStageParams from '../../core/params/add.stges.params';
import StageController from '../controllers/stage.controller';
import StageForm from './StageForm.vue';

const controller = StageController.getInstance();
const route = useRouter();

const params = ref<AddStageParams | null>(null);
const loading = ref(false);

const saveStage = async () => {
  if (!params.value) return;

  loading.value = true;

  try {
    await controller.create(
      params.value,
      undefined,
      route.currentRoute.value.fullPath,
    );
  } finally {
    loading.value = false;
  }
};


</script>

<template>
  <div class="Stage-crud-page">
    <StageForm :loading="loading" @update-data="params = $event" />


    <div class="form-footer">
      <button
class="btn btn-primary" :class="{ 'btn--loading': loading }" type="button" :disabled="loading"
        @click="saveStage">
        {{ $t('save') }}
      </button>
      <button class="btn btn-cancel" type="button" @click="route.back()">
        {{ $t('cancel') }}
      </button>
    </div>


    <div v-if="controller.errorMessage.value" class="error">
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
.form-footer {
  display: flex;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
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
