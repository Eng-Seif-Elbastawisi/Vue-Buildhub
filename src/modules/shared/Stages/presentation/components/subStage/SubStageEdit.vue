<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import type AddStageParams from '../../../core/params/add.stges.params.ts';
import type EditStageParams from '../../../core/params/edit.stage.params.ts';
import ShowStageParams from '../../../core/params/show.stage.params.ts';
import StageController from '../../controllers/stage.controller.ts';
import StageForm from './SubStageForm.vue';

const controller = StageController.getInstance();
const route = useRouter();

const stageId = Number(route.currentRoute.value.params.id);
const parentId = Number(route.currentRoute.value.params.parent_id);

const params = ref<EditStageParams | null>(null);
const loading = ref(false);

const updateData = (data: EditStageParams) => {
  params.value = data
};

const saveStage = async () => {
  if (!params.value) return;

  loading.value = true;

  try {
    await controller.update(params.value, undefined, route.currentRoute.value.fullPath);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  if (!stageId || Number.isNaN(stageId)) {
    console.error('Invalid SubStage ID:', route.currentRoute.value.params.id);
    return;
  }

  if (!parentId || Number.isNaN(parentId)) {
    console.error('Invalid Parent Stage ID:', route.currentRoute.value.params.parent_id);
    return;
  }

  await controller.fetchOne(
    new ShowStageParams({
      id: stageId,
      allLocales: true,
    }),
  );
});
</script>

<template>
  <div class="Stage-crud-page">

    <StageForm
:stage="controller.itemData.value!" :parent-id="parentId" :loading="loading" :is-edit="true"
      @update-data="updateData" />

    <button
class="btn btn-primary" :class="{ 'btn--loading': loading }" type="button" :disabled="loading"
      @click="saveStage">
      {{ $t('stage.update') }}
    </button>

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
