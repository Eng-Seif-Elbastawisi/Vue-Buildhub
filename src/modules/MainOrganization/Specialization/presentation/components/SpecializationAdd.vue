<script setup lang="ts">
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';
  import type AddSpecializationParams from '../../core/params/add.specialization.params.ts';
  import SpecializationController from '../controllers/specialization.controller.ts';
  import SpecializationForm from './SpecializationForm.vue';

  const controller = SpecializationController.getInstance();
  const route = useRoute();
  const params = ref<AddSpecializationParams | null>(null);
  const loading = ref(false);

  const saveSpecialization = async () => {
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
  <div class="Specialization-crud-page">
    <SpecializationForm :loading="loading" @update-data="params = $event" />
    <button
      :class="{ 'btn--loading': loading }"
      class="btn btn-primary"
      type="button"
      :disabled="loading"
      @click="saveSpecialization"
    >
      {{ $t('save') }}
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
    color: var(--danger-dark);
  }

  .btn-primary {
    width: 100%;
  }
</style>
