<script setup lang="ts">
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
  import { ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import LaborForm from './LaborForm.vue';
  import LaborController from '../controllers/labor.controller.ts';
  import type AddLaborParams from '../../core/params/add.labor.params.ts';

  const controller = LaborController.getInstance();
  const route = useRoute();
  const router = useRouter();
  const formKey = route.fullPath;
  const params = ref<AddLaborParams | null>(null);
  const loading = ref(false);
  const goBack = () => void router.push({ name: 'Labor' });

  const updateData = (updatedParams: AddLaborParams) => {
    params.value = updatedParams;
  };

  const saveLabor = async () => {
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
  <StandardFormLayout mode="create" class="labor-crud-page">
    <LaborForm :form-key="formKey" :loading="loading" @update-data="updateData" />

    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>

    <template #actions>
      <div class="actions form-action-pair" :class="{ disabled: loading }">
        <button
          :disabled="loading"
          :class="{ 'btn--loading': loading }"
          class="btn btn-primary w-full"
          type="button"
          @click="saveLabor"
        >
          <span v-if="loading" class="loader"></span>
          <span v-else>{{ $t('labor.save') }}</span>
        </button>
        <button class="btn btn-secondary back-button" type="button" @click="goBack">
          {{ $t('common.back') }}
        </button>
      </div>
    </template>
  </StandardFormLayout>
</template>

<style scoped lang="scss">
@use '@/styles/mixins/form_action_pair' as form-actions;

.labor-crud-page {
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
  border: 1px solid var(--danger-light);
  border-radius: 4px;
}

.form-action-pair {
  @include form-actions.layout;
}
</style>
