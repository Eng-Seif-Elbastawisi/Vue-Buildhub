<script setup lang="ts">
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
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
  <StandardFormLayout mode="create" class="location-crud-page">
    <LocationForm :form-key="formKey" :loading="loading" @update-data="params = $event" />

    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>

    <template #actions>
      <div class="actions" :class="{ disabled: loading }">
        <button
          :disabled="loading"
          :class="{ 'btn--loading': loading }"
          class="btn btn-primary w-full"
          type="button"
          @click="saveLocation"
        >
          <span v-if="loading" class="loader"></span>
          <span v-else>{{ $t('location.save') }}</span>
        </button>
      </div>
    </template>
  </StandardFormLayout>
</template>

<style scoped lang="scss">
.location-crud-page {
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
  border: 1px solid var(--bh-coral-soft);
  border-radius: 4px;
}
</style>
