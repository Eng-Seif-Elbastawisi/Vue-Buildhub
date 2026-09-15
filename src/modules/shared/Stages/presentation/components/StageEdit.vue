<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';

  import type AddStageParams from '../../core/params/add.stges.params';
  import EditStageParams from '../../core/params/edit.stage.params';
  import ShowStageParams from '../../core/params/show.stage.params';
  import StageController from '../controllers/stage.controller';
  import StageForm from './StageForm.vue';

  const controller = StageController.getInstance();
  const route = useRoute();

  const stageId = Number(route.params.id);
  const params = ref<EditStageParams | null>(null);
  const loading = ref(false);

  const updateData = (data: AddStageParams) => {
    params.value = new EditStageParams({
      id: stageId,
      translations: data.translations,
    });
  };

  const saveStage = async () => {
    if (!params.value) return;

    loading.value = true;

    try {
      await controller.update(params.value, undefined, route.fullPath);
    } finally {
      loading.value = false;
    }
  };

  onMounted(async () => {
    if (!stageId || Number.isNaN(stageId)) {
      console.error('Invalid Stage ID:', route.params.stage_id);
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
    <StageForm :Stage="controller.itemData.value!" :loading="loading" @update-data="updateData" />

    <button
      class="btn btn-primary"
      :class="{ 'btn--loading': loading }"
      type="button"
      :disabled="loading"
      @click="saveStage"
    >
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
