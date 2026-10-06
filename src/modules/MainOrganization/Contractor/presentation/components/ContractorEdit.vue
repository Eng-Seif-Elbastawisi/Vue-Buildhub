<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import type AddContractorParams from '../../core/params/add.contractor.params';
  import EditContractorParams from '../../core/params/edit.contractor.params';
  import ShowContractorParams from '../../core/params/show.contractor.params';
  import ContractorController from '../controllers/contractor.controller';
  import ContractorForm from './ContractorForm.vue';

  const controller = ContractorController.getInstance();
  const route = useRoute();
  const contractorId = Number(route.params.contractor_id);
  const params = ref<EditContractorParams | null>(null);
  const loading = ref(false);

  const updateData = (formParams: AddContractorParams) => {
    params.value = new EditContractorParams(contractorId, formParams.name, formParams.stageIds);
  };

  const saveContractor = async () => {
    if (!params.value) return;
    loading.value = true;
    try {
      await controller.update(params.value, undefined, route.fullPath);
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => controller.fetchOne(new ShowContractorParams(contractorId)));
</script>

<template>
  <div class="standard-crud-page">
    <ContractorForm
      :contractor="controller.itemData.value ?? undefined"
      :loading="loading"
      @update-data="updateData"
    />
    <button
      :class="{ 'btn--loading': loading }"
      class="btn btn-primary"
      type="button"
      :disabled="loading"
      @click="saveContractor"
    >
      {{ $t('Contractor.update') }}
    </button>
    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>
