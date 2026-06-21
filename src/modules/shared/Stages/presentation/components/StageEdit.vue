<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import StageController from '../controllers/stage.controller';
  import type EditStageParams from '../../core/params/edit.stage.params';
  import StageForm from './StageForm.vue';
  import ShowStageParams from '../../core/params/show.stage.params';

  // Controller instance
  const controller = StageController.getInstance();

  // Form state
  const params = ref<EditStageParams | null>(null);
  const loading = ref(false);
  /**
   * Save (create or update) email
   */
  const saveEmail = async () => {
    if (!params.value) {
      console.error('No email parameters to save');
      return;
    }

    loading.value = true;
    try {
      await controller.update(params.value);
    } finally {
      loading.value = false;
    }
  };

  const updateData = (updatedParams: EditStageParams) => {
    params.value = updatedParams;
    // saveEmail();
  };

  const route = useRoute();
  onMounted(async () => {
    await controller.fetchOne(new ShowStageParams(Number(route.params.id)));
  });
</script>

<template>
  <div class="email-crud-example">
    <div class="email-form-card">
      <StageForm :stage="controller.itemData.value!" :loading="loading" @update-data="updateData" />

      <div class="actions" :class="{ disabled: loading }">
        <button type="button" @click="saveEmail">Save stage</button>
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
