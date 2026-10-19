<script setup lang="ts">
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';
  import type AddContractorParams from '../../core/params/add.contractor.params';
  import ContractorController from '../controllers/contractor.controller';
  import ContractorForm from './ContractorForm.vue';

  const controller = ContractorController.getInstance();
  const route = useRoute();
  const params = ref<AddContractorParams | null>(null);
  const loading = ref(false);

  const saveContractor = async () => {
    if (!params.value) return;
    loading.value = true;
    try {
      await controller.create(params.value, undefined, route.fullPath);
    } finally {
      loading.value = false;
    }
  };
</script>

<template>
  <StandardFormLayout mode="create" class="standard-crud-page">
    <ContractorForm :loading="loading" @update-data="params = $event" />

    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>

    <template #actions>
      <button
        :class="{ 'btn--loading': loading }"
        class="btn btn-primary"
        type="button"
        :disabled="loading"
        @click="saveContractor"
      >
        {{ $t('save') }}
      </button>
    </template>
  </StandardFormLayout>
</template>
