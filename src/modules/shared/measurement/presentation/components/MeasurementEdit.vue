<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import IconAccept from '@/shared/icons/IconAccept.vue';

  import type AddMeasurementParams from '../../core/params/add.measurement.params';
  import EditMeasurementParams from '../../core/params/edit.measurement.params';
  import ShowMeasurementParams from '../../core/params/show.measurement.params';

  import MeasurementController from '../controllers/measurement.controller';
  import MeasurementForm from './MeasurementForm.vue';

  const controller = MeasurementController.getInstance();

  const route = useRoute();
  const router = useRouter();

  const measurementId = Number(route.params.id);

  const params = ref<EditMeasurementParams | null>(null);
  const loading = ref(false);

  const routePrefix = route.path.startsWith('/admin') ? '/admin' : '/organization';

  const updateData = (data: EditMeasurementParams | AddMeasurementParams) => {
    if (data instanceof EditMeasurementParams) {
      params.value = data;
    } else {
      params.value = new EditMeasurementParams({
        id: measurementId,
        translations: data.translations,
        code: data.code,
        precision: data.precision,
        status: data.status,
      });
    }
  };

  const saveMeasurement = async () => {
    if (!params.value) return;

    loading.value = true;

    try {
      await controller.update(params.value, undefined, route.fullPath);
    } finally {
      loading.value = false;
    }
  };

  const cancelMeasurement = () => {
    void router.push(`${routePrefix}/measurement`);
  };

  onMounted(async () => {
    if (!measurementId || Number.isNaN(measurementId)) {
      console.error('Invalid Measurement ID:', route.params.id);
      return;
    }

    await controller.fetchOne(new ShowMeasurementParams(measurementId, true));
  });
</script>

<template>
  <div class="Measurement-crud-page">
    <MeasurementForm
      :measurement="controller.itemData.value!"
      :loading="loading"
      :is-edit="true"
      @update-data="updateData"
    />

    <div class="actions" :class="{ disabled: loading }">
      <AppButton
        :loading="loading"
        class="btn-save"
        :title="$t('measurement.save')"
        size="sm"
        type="submit"
        @click="saveMeasurement"
      >
        {{ $t('measurement.save') }}

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
