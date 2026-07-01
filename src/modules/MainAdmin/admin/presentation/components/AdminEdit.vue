<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import type AddAdminParams from '../../core/params/add.admin.params';
  import EditAdminParams from '../../core/params/edit.admin.params';
  import ShowAdminParams from '../../core/params/show.admin.params';
  import AdminController from '../controllers/admin.controller';
  import AdminForm from './AdminForm.vue';

  const controller = AdminController.getInstance();
  const route = useRoute();
  const formKey = route.fullPath;
  const adminId = Number(route.params.id);
  const params = ref<EditAdminParams | null>(null);
  const loading = ref(false);

  const updateData = (data: AddAdminParams) => {
    params.value = new EditAdminParams({
      id: adminId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password || undefined,
    });
  };

  const saveAdmin = async () => {
    if (!params.value) return;
    loading.value = true;
    try {
      await controller.update(params.value, undefined, formKey);
    } finally {
      loading.value = false;
    }
  };

  onMounted(async () => {
    await controller.fetchOne(new ShowAdminParams(adminId));
  });
</script>

<template>
  <div class="admin-crud-page">
    <AdminForm
      :admin="controller.itemData.value!"
      :form-key="formKey"
      :loading="loading"
      @update-data="updateData"
    />

    <div class="actions" :class="{ disabled: loading }">
      <button class="btn btn-primary w-full" type="button" @click="saveAdmin">
        <span v-if="loading" class="loader"></span>
        <span v-else>{{ $t('admin.update') }}</span>
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
