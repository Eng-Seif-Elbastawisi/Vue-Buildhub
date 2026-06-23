<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import MeasurementForm from './MeasurementForm.vue';
  import MeasurementController from '../controllers/measurement.controller.ts';
  import type EditMeasurementParams from '../../core/params/edit.measurement.params.ts';
  import ShowMeasurementParams from '../../core/params/show.measurement.params.ts';
  import type AddMeasurementParams from '../../core/params/add.measurement.params.ts';

  // Controller instance
  const controller = MeasurementController.getInstance();

  // Form state
  const params = ref<EditMeasurementParams | null>(null);
  const loading = ref(false);
  /**
   * Save (create or update) email
   */
  const saveEmail = async () => {
    if (!params.value) {
      console.error('No email parameters to save');
      return;
    }

    loading.value = true;
    try {
      await controller.update(params.value);
    } finally {
      loading.value = false;
    }
  };

  // const updateData = (updatedParams: EditMeasurementParams ) => {
  //   params.value = updatedParams;
  //   // saveEmail();
  // };
  const updateData = (updatedParams: AddMeasurementParams | EditMeasurementParams) => {
    params.value = updatedParams as EditMeasurementParams;
  };

  const route = useRoute();
  onMounted(async () => {
    await controller.fetchOne(new ShowMeasurementParams(Number(route.params.id), true));
  });
</script>

<template>
  <div class="email-crud-example">
    <div class="email-form-card">
      <MeasurementForm
        :stage="controller.itemData.value!"
        :loading="loading"
        @update-data="updateData"
      />

      <div class="actions" :class="{ disabled: loading }">
        <button type="button" @click="saveEmail">Save stage</button>
      </div>

      <!-- Error Display -->
      <div v-if="controller.errorMessage.value" class="error">
        {{ controller.errorMessage.value }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .email-crud-example {
    padding: 0;
    padding-block: 20px;
  }

  .actions {
    padding: 0 0 10px 20px;
  }

  .actions {
    &.disabled {
      cursor: not-allowed;
      pointer-events: none;
      opacity: 0.7;
    }
  }
</style>
