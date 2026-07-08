<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import EditLocationParams from '../../../core/params/edit.location.params.ts';
  import ShowLocationParams from '../../../core/params/show.location.params.ts';
  import LocationController from '../../controllers/location.controller.ts';
  import LocationForm from './locationForm.vue';
  import type AddLocationParams from '../../../core/params/add.location.params.ts';

  const controller = LocationController.getInstance();
  const route = useRoute();
  const formKey = route.fullPath;
  const params = ref<EditLocationParams | null>(null);
  const loading = ref(false);
  const location_id = Number(route.params.id);

  const updateData = (data: AddLocationParams) => {
    params.value = new EditLocationParams({
      location_id: location_id,
      parentId: data.parentId,
      code: data.code,
      type: data.type,
      translations: data.translations,
    });
  };

  const saveLocation = async () => {
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
      new ShowLocationParams({ location_id: location_id, allLocales: true }),
    );
  });
</script>

<template>
  <div class="material-crud-page">
    <LocationForm
      :location="controller.itemData.value!"
      :form-key="formKey"
      :loading="loading"
      @update-data="updateData"
    />

    <div class="actions" :class="{ disabled: loading }">
      <button
        :disabled="loading"
        :class="{ 'btn--loading': loading }"
        class="btn btn-primary w-full"
        type="button"
        @click="saveLocation"
      >
        <span v-if="loading" class="loader"></span>
        <span v-else>{{ $t('location.update') }}</span>
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
