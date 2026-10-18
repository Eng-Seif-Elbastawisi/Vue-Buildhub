<script setup lang="ts">
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
  import StandardFormSectionHeader from '@/shared/components/form/StandardFormSectionHeader.vue';
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import AddClientSourceParams from '../../core/params/add.client.source.params.ts';
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

  const updateData = (updatedParams: AddClientSourceParams | EditClientSourceParams) => {
    params.value = updatedParams instanceof AddClientSourceParams ? null : updatedParams;
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
  <StandardFormLayout mode="edit" class="email-crud-example">
    <div class="email-form-card">
      <StandardFormSectionHeader :title="$t('client_source')" icon="pi pi-share-alt" />
      <ClientSourceForm
        :client-source="controller.itemData.value!"
        :loading="loading"
        :reset-key="resetKey"
        @update-data="updateData"
      />

      <div class="actions form-action-pair" :class="{ disabled: loading }">
        <button
          class="btn btn-primary"
          :class="{ 'btn--loading': loading }"
          type="button"
          :disabled="loading"
          @click="saveClientSource"
        >
          {{ $t('client_source.save') }}
        </button>
        <button class="btn btn-secondary" type="button" @click="clearInputs">
          {{ $t('cancel') }}
        </button>
      </div>

      <!-- Error Display -->
      <div v-if="controller.errorMessage.value" class="error">
        {{ controller.errorMessage.value }}
      </div>
    </div>
  </StandardFormLayout>
</template>

<style scoped lang="scss">
@use '@/styles/mixins/form_action_pair' as form-actions;

.email-crud-example {
  padding: 0;
  // padding-block: 20px;
}

.actions {
  &.disabled {
    cursor: not-allowed;
    pointer-events: none;
    opacity: 0.7;
  }
}

.error {
  margin-top: 20px;
  padding: 10px;
  background-color: var(--danger-light);
  color: var(--danger-dark);
  border: 1px solid var(--bh-coral-soft);
  border-radius: 4px;
}

.form-action-pair {
  @include form-actions.layout;
}
</style>
