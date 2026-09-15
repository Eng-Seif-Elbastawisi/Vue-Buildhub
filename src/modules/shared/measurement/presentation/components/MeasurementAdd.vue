<script setup lang="ts">
  import { ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import IconAccept from '@/shared/icons/IconAccept.vue';

  import type AddMeasurementParams from '../../core/params/add.measurement.params';
  import MeasurementController from '../controllers/measurement.controller';
  import MeasurementForm from './MeasurementForm.vue';

  const controller = MeasurementController.getInstance();

  const route = useRoute();
  const router = useRouter();

  const params = ref<AddMeasurementParams | null>(null);
  const loading = ref(false);

  const routePrefix = route.path.startsWith('/admin') ? '/admin' : '/organization';

  const saveMeasurement = async () => {
    if (!params.value) return;

    loading.value = true;

    try {
      await controller.create(params.value, undefined, route.fullPath);
    } finally {
      loading.value = false;
    }
  };

  const cancelMeasurement = () => {
    void router.push(`${routePrefix}/measurement`);
  };
</script>

<template>
  <div class="Measurement-crud-page">
    <MeasurementForm :loading="loading" @update-data="params = $event" />

    <div class="actions" :class="{ disabled: loading }">
      <AppButton
        :loading="loading"
        class="btn-save"
        :title="$t('save')"
        size="sm"
        icon="right"
        type="submit"
        @click="saveMeasurement"
      >
        {{ $t('save') }}

        <template #icon>
          <IconAccept />
        </template>
      </AppButton>

      <AppButton
        class="btn-cancel"
        theme="secondary"
        :title="$t('cancel')"
        type="button"
        @click="cancelMeasurement"
      >
        {{ $t('cancel') }}
      </AppButton>
    </div>

    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped>
  .Measurement-crud-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .actions {
    display: flex;
    gap: 0.75rem;
  }

  .btn-save {
    flex: 1;
    width: 100%;
  }

  .btn-cancel {
    flex: 0 0 auto;
  }

  .actions.disabled {
    cursor: not-allowed;
    pointer-events: none;
    opacity: 0.7;
  }

  .error {
    margin-top: 20px;
    padding: 10px;
    background-color: var(--danger-light);
    color: var(--danger-dark);
    border: 1px solid #f5c6cb;
    border-radius: 4px;
  }
</style>
