<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import type EditClientSourceParams from '../../core/params/edit.client.source.params.ts';
  import ClientSourceController from '../controllers/client.source.controller.ts';
  import ShowClientSourceParams from '../../core/params/show.client.source.params.ts';
  import ClientSourceForm from './ClientSourceForm.vue';

  // Controller instance
  const controller = ClientSourceController.getInstance();

  // Form state
  const params = ref<EditClientSourceParams | null>(null);
  const loading = ref(false);
  const resetKey = ref(0);
  /**
   * Save (create or update) email
   */
  const saveClientSource = async () => {
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

  const updateData = (updatedParams: EditClientSourceParams) => {
    params.value = updatedParams;
    // saveEmail();
  };

  const clearInputs = () => {
    params.value = null;
    resetKey.value += 1;
  };

  const route = useRoute();
  onMounted(async () => {
    await controller.fetchOne(new ShowClientSourceParams(Number(route.params.id), true));
  });
</script>

<template>
  <div class="email-crud-example">
    <div class="email-form-card">
      <ClientSourceForm
        :client-source="controller.itemData.value!"
        :loading="loading"
        :reset-key="resetKey"
        @update-data="updateData"
      />

      <div class="actions" :class="{ disabled: loading }">
        <button
          class="btn btn-primary"
          :class="{ 'btn--loading': loading }"
          type="button"
          :disabled="loading"
          @click="saveClientSource"
        >
          {{ $t('client_source.save') }}
        </button>
        <button type="button" @click="clearInputs">{{ $t('cancel') }}</button>
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
    display: flex;
    gap: 0.75rem;
  }

  .actions {
    &.disabled {
      cursor: not-allowed;
      pointer-events: none;
      opacity: 0.7;
    }
  }
</style>
