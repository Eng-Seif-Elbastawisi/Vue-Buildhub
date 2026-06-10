<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import UnitController from '../controllers/unit.controller';
  import type EditUnitParams from '../../core/params/edit.unit.params';
  import ShowUnitParams from '../../core/params/show.unit.params';
  import UnitForm from './UnitForm.vue';

  // Controller instance
  const controller = UnitController.getInstance();

  // Form state
  const params = ref<EditUnitParams | null>(null);
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

  const updateData = (updatedParams: EditUnitParams) => {
    params.value = updatedParams;
    // saveEmail();
  };

  const route = useRoute();
  onMounted(async () => {
    await controller.fetchOne(new ShowUnitParams(Number(route.params.id)));
  });
</script>

<template>
  <div class="email-crud-example">
    <UnitForm :unit="controller.itemData.value!" :loading="loading" @update-data="updateData" />

    <div class="actions" :class="{ disabled: loading }">
      <button type="button" @click="saveEmail">Save Email</button>
    </div>

    <!-- Error Display -->
    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped lang="scss">
  .actions {
    &.disabled {
      cursor: not-allowed;
      pointer-events: none;
      opacity: 0.7;
    }
  }
</style>

<!-- <style scoped>
  .email-crud-example {
    padding: 20px;
    /* max-width: 800px; */
    margin: 0 auto;
  }

  .email-list {
    margin-bottom: 30px;
  }

  .email-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border: 1px solid var(--crud-border);
    border-radius: 4px;
    margin-bottom: 10px;
  }

  .email-type {
    color: var(--crud-muted-text);
    font-size: 0.9em;
  }

  .actions {
    display: flex;
    gap: 10px;
  }

  .email-form {
    padding: 20px;
    border: 1px solid var(--border-weak);
    border-radius: 4px;
    background-color: var(--bg-section);
  }

  .email-form input,
  .email-form select {
    width: 100%;
    padding: 8px;
    margin-bottom: 10px;
    border: 1px solid var(--border-weak);
    border-radius: 4px;
  }

  .form-actions {
    display: flex;
    gap: 10px;
  }

  button {
    padding: 8px 16px;
    background-color: var(--btn-action-bg);
    color: var(--BgWhite);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 12px;
  }

  button:hover {
    background-color: var(--btn-action-hover);
  }

  .error {
    margin-top: 20px;
    padding: 10px;
    background-color: var(--error-bg);
    color: var(--error-text);
    border: 1px solid var(--error-border);
    border-radius: 4px;
  }
</style> -->
