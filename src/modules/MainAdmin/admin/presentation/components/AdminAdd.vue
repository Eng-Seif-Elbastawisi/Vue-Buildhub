<script setup lang="ts">
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';
  import type AddAdminParams from '../../core/params/add.admin.params';
  import AdminController from '../controllers/admin.controller';
  import AdminForm from './AdminForm.vue';

  const controller = AdminController.getInstance();
  const route = useRoute();
  const formKey = route.fullPath;
  const params = ref<AddAdminParams | null>(null);
  const loading = ref(false);

  const saveAdmin = async () => {
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
  <div class="admin-crud-page">
    <AdminForm :form-key="formKey" :loading="loading" @update-data="params = $event" />

    <div class="actions" :class="{ disabled: loading }">
      <button class="btn btn-primary w-full" type="button" @click="saveAdmin">
        <span v-if="loading" class="loader"></span>
        <span v-else>{{ $t('admin.save') }}</span>
      </button>
    </div>

    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped lang="scss">
  .admin-crud-page {
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
