<script setup lang="ts">
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
  import { ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import SuppliersController from '../controllers/Suppliers.controller.ts';
  import SuppliersForm from './SuppliersForm.vue';
  import type AddSuppliersParams from '../../core/params/add.Suppliers.params.ts';

  const controller = SuppliersController.getInstance();
  const route = useRoute();
  const router = useRouter();
  const formKey = route.fullPath;

  const params = ref<AddSuppliersParams | null>(null);
  const loading = ref(false);
  const goBack = () => void router.push({ name: 'Suppliers' });

  const saveDocument = async () => {
    if (!params.value) return;
    loading.value = true;
    try {
      await controller.create(params.value, undefined, formKey);
    } finally {
      loading.value = false;
    }
  };

  const updateData = (updatedParams: AddSuppliersParams) => {
    params.value = updatedParams;
  };
</script>

<template>
  <StandardFormLayout mode="create" class="document-crud-example">
    <SuppliersForm :form-key="formKey" :loading="loading" @update-data="updateData" />

    <!-- <AppButton :title="$t('supplier.update')" size="sm" icon="right" type="submit" @click="saveDocument">
      {{ $t('supplier.update') }}
      <template #icon>
        <IconAccept />
      </template>
</AppButton> -->

    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>

    <template #actions>
      <div class="actions form-action-pair" :class="{ disabled: loading }">
        <button
          :disabled="loading"
          :class="{ 'btn--loading': loading }"
          class="btn btn-primary w-full"
          type="submit"
          @click="saveDocument"
        >
          <span v-if="loading" class="loader"></span>
          <span v-else>
            {{ $t('supplier.save') }}
          </span>
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

.document-crud-example {
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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
