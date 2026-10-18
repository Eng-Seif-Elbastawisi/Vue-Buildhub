<script setup lang="ts">
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
  import { onMounted, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import type EditLaborParams from '../../core/params/edit.labor.params.ts';
  import ShowLaborParams from '../../core/params/show.labor.params.ts';
  import LaborController from '../controllers/labor.controller.ts';
  import LaborForm from './LaborForm.vue';

  const controller = LaborController.getInstance();
  const route = useRoute();
  const router = useRouter();
  const formKey = route.fullPath;
  const laborId = Number(route.params.labor_id);
  const params = ref<EditLaborParams | null>(null);

  const loading = ref(false);
  const goBack = () => void router.push({ name: 'Labor' });

  const updateData = (updatedParams: EditLaborParams) => {
    params.value = updatedParams;
  };

  const saveLabor = async () => {
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
      new ShowLaborParams({
        labor_id: laborId,
        allLocales: true,
      }),
      {
        headers: {
          'accept-language': '*',
        },
      },
    );
  });
</script>

<template>
  <StandardFormLayout mode="edit" class="labor-crud-page">
    <LaborForm
      :labor="controller.itemData.value!"
      :form-key="formKey"
      :loading="loading"
      @update-data="updateData"
    />

    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>

    <template #actions>
      <div class="actions form-action-pair" :class="{ disabled: loading }">
        <button
          :disabled="loading"
          :class="{ 'btn--loading': loading }"
          class="btn btn-primary w-full"
          type="button"
          @click="saveLabor"
        >
          <span v-if="loading" class="loader"></span>
          <span v-else>{{ $t('labor.update') }}</span>
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

.labor-crud-page {
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
  border: 1px solid var(--danger-light);
  border-radius: 4px;
}

.form-action-pair {
  @include form-actions.layout;
}
</style>
