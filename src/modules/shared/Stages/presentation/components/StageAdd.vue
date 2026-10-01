<script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter, useRoute } from 'vue-router';

  import type AddStageParams from '../../core/params/add.stges.params';
  import StageController from '../controllers/stage.controller';
  import StageForm from './StageForm.vue';
  import ConfirmCancelDialog from '@/base/Presentation/Dialogs/ConfirmCancelDialog.vue';

  const controller = StageController.getInstance();
  const route = useRoute();
  const router = useRouter();
  const routePrefix = route.path.startsWith('/admin') ? '/admin' : '/organization';

  const params = ref<AddStageParams | null>(null);
  const loading = ref(false);

  const saveStage = async () => {
    if (!params.value) return;

    loading.value = true;

    try {
      await controller.create(params.value, undefined, route.fullPath);
    } finally {
      loading.value = false;
    }
  };

  const cancelStageAdd = () => {
    void router.push(`${routePrefix}/stages`);
  };
</script>

<template>
  <div class="Stage-crud-page">
    <StageForm :loading="loading" @update-data="params = $event" />

    <div class="form-footer form-action-pair">
      <button
        class="btn btn-primary"
        :class="{ 'btn--loading': loading }"
        type="button"
        :disabled="loading"
        @click="saveStage"
      >
        {{ $t('save') }}
      </button>

      <ConfirmCancelDialog
        ref="confirmCancelRef"
        class="btn btn-secondary"
        :title="$t('cancel_changes')"
        :message="$t('are_you_sure_you_want_to_leave')"
        :trigger-label="$t('common.back')"
        trigger-class="back-button"
        @confirm="cancelStageAdd"
      />
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
