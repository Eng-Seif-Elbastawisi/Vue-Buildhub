<script setup lang="ts">
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';
  import ProjectPricingController from '../controllers/project.pricing.controller.ts';
  import type AddProjectPricingParams from '../../core/params/add.project.pricing.params.ts';
  import ProjectPricingForm from './ProjectPricingForm.vue';

  const controller = ProjectPricingController.getInstance();
  const route = useRoute();
  const formKey = route.fullPath;
  const params = ref<AddProjectPricingParams | null>(null);
  const loading = ref(false);

  const saveItem = async () => {
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
  <div class="item-crud-page">
    <ProjectPricingForm :form-key="formKey" :loading="loading" @update-data="params = $event" />

    <div class="actions" :class="{ disabled: loading }">
      <button class="btn btn-primary w-full" type="button" @click="saveItem">
        <span v-if="loading" class="loader"></span>
        <span v-else>{{ $t('project_pricing.save') }}</span>
      </button>
    </div>

    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped lang="scss">
  .item-crud-page {
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
