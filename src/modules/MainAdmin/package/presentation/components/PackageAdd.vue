<script setup lang="ts">
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';
  import type AddPackageParams from '../../core/params/add.package.params';
  import PackageController from '../controllers/package.controller';
  import PackageForm from './PackageForm.vue';

  const controller = PackageController.getInstance();
  const formKey = useRoute().fullPath;
  const params = ref<AddPackageParams | null>(null);
  const loading = ref(false);

  const savePackage = async () => {
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
  <StandardFormLayout mode="create" class="package-crud-page">
    <PackageForm :form-key="formKey" :loading="loading" @update-data="params = $event" />

    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>

    <template #actions>
      <div class="actions" :class="{ disabled: loading }">
        <button
          :class="{ 'btn--loading': loading }"
          :disabled="loading"
          class="btn btn-primary w-full"
          type="button"
          @click="savePackage"
        >
          <span v-if="loading" class="loader"></span>
          <span v-else>{{ $t('package.save') }}</span>
        </button>
      </div>
    </template>
  </StandardFormLayout>
</template>

<style scoped lang="scss">
.package-crud-page {
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
  border: 1px solid var(--danger-dark);
  border-radius: 4px;
  background-color: var(--danger-light);
  color: var(--danger-dark);
}
</style>
