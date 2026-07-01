<script setup lang="ts">
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';
  import LocationController from '../../controllers/location.controller.ts';
  import type AddLocationParams from '../../../core/params/add.location.params.ts';
  import LocationForm from './locationForm.vue';

  const controller = LocationController.getInstance();
  const route = useRoute();
  const formKey = route.fullPath;
  const params = ref<AddLocationParams | null>(null);
  const loading = ref(false);

  const saveLocation = async () => {
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
  <div class="location-crud-page">
    <LocationForm :form-key="formKey" :loading="loading" @update-data="params = $event" />

    <div class="actions" :class="{ disabled: loading }">
      <button class="btn btn-primary w-full" type="button" @click="saveLocation">
        <span v-if="loading" class="loader"></span>
        <span v-else>{{ $t('location.save') }}</span>
      </button>
    </div>

    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped lang="scss">
  .material-crud-page {
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
