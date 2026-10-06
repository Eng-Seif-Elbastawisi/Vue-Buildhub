<script setup lang="ts">
  import { computed, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import DeleteDialog from '@/base/Presentation/Dialogs/MainDialogs/DeleteDialog.vue';
  import DeleteContractorParams from '../../core/params/delete.contractor.params';
  import ShowContractorParams from '../../core/params/show.contractor.params';
  import ContractorController from '../controllers/contractor.controller';

  const controller = ContractorController.getInstance();
  const route = useRoute();
  const router = useRouter();
  const contractorId = Number(route.params.contractor_id);
  const contractor = computed(() => controller.itemData.value);

  const deleteContractor = async () => {
    const result = await controller.delete(new DeleteContractorParams(contractorId));
    if (result instanceof DataSuccess) await router.push('/organization/contractors');
  };

  onMounted(() => controller.fetchOne(new ShowContractorParams(contractorId)));
</script>

<template>
  <div class="standard-crud-page">
    <template v-if="contractor">
      <h1>{{ contractor.name }}</h1>
      <div class="field-group">
        <strong>{{ $t('Contractor.main_stages') }}</strong>
        <p>{{ contractor.stages.map((stage) => stage.title).join(', ') || $t('no_data_found') }}</p>
      </div>
      <div class="row-actions">
        <router-link class="btn btn-primary" :to="`/organization/contractors/edit/${contractorId}`">
          {{ $t('Contractor.edit') }}
        </router-link>
        <DeleteDialog
          :title="$t('Contractor.delete_confirm')"
          :message="$t('This action cannot be undone.')"
          :hasbtn="true"
          @delete="deleteContractor"
        >
          <template #btn>
            <button class="btn" type="button">{{ $t('Delete') }}</button>
          </template>
        </DeleteDialog>
      </div>
    </template>
    <p v-else-if="controller.errorMessage.value">{{ controller.errorMessage.value }}</p>
    <p v-else>{{ $t('loading') }}</p>
  </div>
</template>

<style scoped lang="scss">
  .row-actions {
    display: flex;
    gap: 1rem;
  }
</style>
