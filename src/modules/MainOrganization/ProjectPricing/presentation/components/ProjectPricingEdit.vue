<script setup lang="ts">
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import ProjectPricingController from '../controllers/project.pricing.controller.ts';
  import ProjectPricingForm from './ProjectPricingForm.vue';
  import type AddProjectPricingParams from '../../core/params/add.project.pricing.params.ts';
  import EditProjectPricingParams from '../../core/params/edit.project.pricing.params.ts';
  import ShowProjectPricingParams from '../../core/params/show.project.pricing.params.ts';

  const controller = ProjectPricingController.getInstance();
  const route = useRoute();
  const formKey = route.fullPath;
  const params = ref<EditProjectPricingParams | null>(null);
  const loading = ref(false);
  const itemId = Number(route.params.id);

  const updateData = (data: AddProjectPricingParams) => {
    params.value = new EditProjectPricingParams({
      project_pricing_id: itemId,
      total_tax: data.total_tax,
      discount_type: data.discount_type,
      discount_value: data.discount_value,
    });
  };

  const saveItem = async () => {
    if (!params.value) return;
    loading.value = true;
    try {
      await controller.update(params.value, undefined, formKey);
    } finally {
      loading.value = false;
    }
  };

  onMounted(async () => {
    await controller.fetchOne(
      new ShowProjectPricingParams({ project_pricing_id: itemId, allLocales: true }),
    );
  });
</script>

<template>
  <StandardFormLayout mode="edit" class="material-crud-page">
    <ProjectPricingForm
      :item="controller.itemData.value!"
      :form-key="formKey"
      :loading="loading"
      @update-data="updateData"
    />

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
          @click="saveItem"
        >
          <span v-if="loading" class="loader"></span>
          <span v-else>{{ $t('project_pricing.update') }}</span>
        </button>
      </div>
    </template>
  </StandardFormLayout>
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
  margin-top: 20px;
  padding: 10px;
  background-color: var(--danger-light);
  color: var(--danger-dark);
  border: 1px solid var(--bh-coral-soft);
  border-radius: 4px;
}
</style>
