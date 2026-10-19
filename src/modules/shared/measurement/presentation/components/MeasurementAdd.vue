<script setup lang="ts">
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
  import { ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import StandardFormSectionHeader from '@/shared/components/form/StandardFormSectionHeader.vue';
  import IconAccept from '@/shared/icons/IconAccept.vue';

  import type AddMeasurementParams from '../../core/params/add.measurement.params';
  import MeasurementController from '../controllers/measurement.controller';
  import MeasurementForm from './MeasurementForm.vue';
  import ConfirmCancelDialog from '@/base/Presentation/Dialogs/ConfirmCancelDialog.vue';

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
  <StandardFormLayout mode="create" class="Measurement-crud-page">
    <StandardFormSectionHeader :title="$t('measurement')" icon="pi pi-sliders-h" />
    <MeasurementForm :loading="loading" @update-data="params = $event" />

    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>

    <template #actions>
      <div class="actions form-action-pair" :class="{ disabled: loading }">
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

        <ConfirmCancelDialog
          ref="confirmCancelRef"
          :title="$t('cancel_changes')"
          :message="$t('are_you_sure_you_want_to_leave')"
          @confirm="cancelMeasurement"
        />
      </div>
    </template>
  </StandardFormLayout>
</template>

<style scoped lang="scss">
@use '@/styles/mixins/form_action_pair' as form-actions;

.Measurement-crud-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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
  border: 1px solid var(--bh-coral-soft);
  border-radius: 4px;
}

.form-action-pair {
  @include form-actions.layout;
}
</style>
