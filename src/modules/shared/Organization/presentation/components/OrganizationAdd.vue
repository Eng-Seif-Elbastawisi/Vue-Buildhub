<script setup lang="ts">
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';
  import OrganizationController from '../controllers/organization.controller.ts';
  import OrganizationForm from './OrganizationForm.vue';
  import type AddOrganizationParams from '../../core/params/add.organization.params.ts';

  const controller = OrganizationController.getInstance();
  const route = useRoute();
  const formKey = route.fullPath;

  const params = ref<AddOrganizationParams | null>(null);
  const loading = ref(false);

  const saveOrganization = async () => {
    if (!params.value) return;
    loading.value = true;
    try {
      await controller.create(params.value, undefined, formKey);
    } finally {
      loading.value = false;
    }
  };

  const updateData = (updatedParams: AddOrganizationParams) => {
    params.value = updatedParams;
  };
</script>

<template>
  <div class="document-crud-example">
    <OrganizationForm :form-key="formKey" :loading="loading" @update-data="updateData" />

    <!-- <AppButton :title="$t('supplier.update')" size="sm" icon="right" type="submit" @click="saveDocument">
      {{ $t('supplier.update') }}
      <template #icon>
        <IconAccept />
      </template>
</AppButton> -->
    <div class="actions" :class="{ disabled: loading }">
      <button class="btn btn-primary w-full" type="submit" @click="saveOrganization">
        <span v-if="loading" class="loader"></span>
        <span v-else>
          {{ $t('organization.save') }}
        </span>
      </button>
    </div>

    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped lang="scss">
  .document-crud-example {
    margin: 0 auto;
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
    border: 1px solid #f5c6cb;
    border-radius: 4px;
  }
</style>
