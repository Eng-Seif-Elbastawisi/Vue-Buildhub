<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import type AddClientParams from '../../core/params/add.client.params.ts';
  import EditClientParams from '../../core/params/edit.client.params.ts';
  import ShowClientParams from '../../core/params/show.client.params.ts';
  import ClientController from '../controllers/client.controller.ts';
  import ClientForm from './clientForm.vue';

  const controller = ClientController.getInstance();
  const route = useRoute();
  const formKey = route.fullPath;
  const params = ref<EditClientParams | null>(null);
  const loading = ref(false);
  const clientId = Number(route.params.client_id);

  const updateData = (data: AddClientParams) => {
    params.value = new EditClientParams({ client_id: clientId, ...data.toMap() });
  };

  const saveClient = async () => {
    if (!params.value) return;
    loading.value = true;
    try {
      await controller.update(params.value, undefined, formKey);
    } finally {
      loading.value = false;
    }
  };

  onMounted(async () => {
    await controller.fetchOne(new ShowClientParams({ client_id: clientId, allLocales: true }));
  });
</script>

<template>
  <div class="material-crud-page">
    <ClientForm
      :client="controller.itemData.value!"
      :form-key="formKey"
      :loading="loading"
      @update-data="updateData"
    />

    <div class="actions" :class="{ disabled: loading }">
      <button
        :disabled="loading"
        :class="{ 'btn--loading': loading }"
        class="btn btn-primary w-full"
        type="button"
        @click="saveClient"
      >
        <span v-if="loading" class="loader"></span>
        <span v-else>{{ $t('client.update') }}</span>
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
    margin-top: 20px;
    padding: 10px;
    background-color: var(--danger-light);
    color: var(--danger-dark);
    border: 1px solid #f5c6cb;
    border-radius: 4px;
  }
</style>
