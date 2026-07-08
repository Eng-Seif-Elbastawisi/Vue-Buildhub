<script setup lang="ts">
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';
  import ClientController from '../controllers/client.controller.ts';
  import type AddClientParams from '../../core/params/add.client.params.ts';
  import ClientForm from './clientForm.vue';

  const controller = ClientController.getInstance();
  const route = useRoute();
  const formKey = route.fullPath;
  const params = ref<AddClientParams | null>(null);
  const loading = ref(false);

  const saveClient = async () => {
    if (!params.value) return;
    loading.value = true;
    try {
      await controller.create(params.value, undefined, formKey);
    } finally {
      loading.value = false;
    }
  };
</script>

<template>
  <div class="material-crud-page">
    <ClientForm :form-key="formKey" :loading="loading" @update-data="params = $event" />

    <div class="actions" :class="{ disabled: loading }">
      <button
        :disabled="loading"
        :class="{ 'btn--loading': loading }"
        class="btn btn-primary w-full"
        type="button"
        @click="saveClient"
      >
        <span v-if="loading" class="loader"></span>
        <span v-else>{{ $t('client.save') }}</span>
      </button>
    </div>

    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped lang="scss">
  .material-crud-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .actions.disabled {
    pointer-events: none;
    opacity: 0.7;
  }

  .error {
    color: var(--danger-dark);
  }
</style>
