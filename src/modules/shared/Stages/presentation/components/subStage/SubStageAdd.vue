<script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';

  import type AddStageParams from '../../../core/params/add.stges.params.ts';
  import StageController from '../../controllers/stage.controller.ts';
  import StageForm from './SubStageForm.vue';

  const controller = StageController.getInstance();
  const route = useRouter();

  const parentId = Number(route.currentRoute.value.params.parent_id);

  const params = ref<AddStageParams | null>(null);
  const loading = ref(false);

  const updateData = (data: AddStageParams) => {
    params.value = data;
  };

  const saveStage = async () => {
    if (!params.value) return;

    loading.value = true;

    try {
      params.value.parentId = parentId;

      await controller.create(params.value, undefined, route.currentRoute.value.fullPath);
    } finally {
      loading.value = false;
    }
  };
</script>

<template>
  <div class="Stage-crud-page">
    <StageForm
      :parent-id="parentId"
      :loading="loading"
      :is-edit="false"
      @update-data="updateData"
    />
  
    <div class="form-footer form-action-pair">
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
