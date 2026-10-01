<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRouter } from 'vue-router';

  import type AddStageParams from '../../core/params/add.stges.params';
  import EditStageParams from '../../core/params/edit.stage.params';
  import ShowStageParams from '../../core/params/show.stage.params';
  import StageController from '../controllers/stage.controller';
  import StageForm from './StageForm.vue';

  const controller = StageController.getInstance();
  const router = useRouter();

  const stageId = Number(router.currentRoute.value.params.id);
  const params = ref<EditStageParams | null>(null);
  const loading = ref(false);

  const updateData = (data: AddStageParams) => {
    params.value = new EditStageParams({
      id: stageId,
      translations: data.translations,
      status: data.status,
    });
  };

  const saveStage = async () => {
    if (!params.value) return;

    loading.value = true;

    try {
      await controller.update(params.value, undefined, router.currentRoute.value.fullPath);
    } finally {
      loading.value = false;
    }
  };

  onMounted(async () => {
    if (!stageId || Number.isNaN(stageId)) {
      console.error('Invalid Stage ID:', router.currentRoute.value.params.stage_id);
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
    <StageForm :stage="controller.itemData.value!" :loading="loading" @update-data="updateData" />

    <div class="form-actions form-action-pair">
      <button
        class="btn btn-primary"
        :class="{ 'btn--loading': loading }"
        type="button"
        :disabled="loading"
        @click="saveStage"
      >
        {{ $t('stage.update') }}
      </button>
      <button
        class="btn btn-secondary back-button"
        type="button"
        @click="router.push?.({ name: 'Stages' })"
      >
        {{ $t('common.back') }}
      </button>
    </div>

    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped lang="scss">
  @use '@/styles/mixins/form_action_pair' as form-actions;

  .Stage-crud-page {
    display: flex;
    flex-direction: column;
  }

  .form-action-pair {
    @include form-actions.layout;
  }
</style>
