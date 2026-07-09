<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import type AddSpecializationParams from '../../core/params/add.specialization.params.ts';
  import EditSpecializationParams from '../../core/params/edit.specialization.params.ts';
  import ShowSpecializationParams from '../../core/params/show.specialization.params.ts';
  import SpecializationController from '../controllers/specialization.controller.ts';
  import SpecializationForm from './SpecializationForm.vue';

  const controller = SpecializationController.getInstance();
  const route = useRoute();
  const specializationId = Number(route.params.specialization_id);
  const params = ref<EditSpecializationParams | null>(null);
  const loading = ref(false);
  const updateData = (data: AddSpecializationParams) => {
    params.value = new EditSpecializationParams({
      specializationId,
      translations: data.translations,
    });
  };
  const saveSpecialization = async () => {
    if (!params.value) return;
    loading.value = true;
    try {
      await controller.update(params.value, undefined, route.fullPath);
    } finally {
      loading.value = false;
    }
  };
  onMounted(async () => {
    await controller.fetchOne(new ShowSpecializationParams({ specializationId, allLocales: true }));
  });
</script>

<template>
  <div class="Specialization-crud-page">
    <SpecializationForm
      :Specialization="controller.itemData.value!"
      :loading="loading"
      @update-data="updateData"
    />
    <button
      :class="{ 'btn--loading': loading }"
      class="btn btn-primary"
      type="button"
      :disabled="loading"
      @click="saveSpecialization"
    >
      {{ $t('Specialization.update') }}
    </button>
    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped>
  .Specialization-crud-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .error {
    margin-top: 20px;
    padding: 10px;
    background-color: var(--danger-light);
    color: var(--danger-dark);
    border: 1px solid #f5c6cb;
    border-radius: 4px;
  }

  .btn-primary {
    width: 100%;
  }
</style>
