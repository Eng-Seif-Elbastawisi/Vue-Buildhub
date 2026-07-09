<script setup lang="ts">
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';
  import type AddSpaceParams from '../../core/params/add.space.params.ts';
  import SpaceController from '../controllers/space.controller.ts';
  import SpaceForm from './SpaceForm.vue';

  const controller = SpaceController.getInstance();
  const route = useRoute();
  const params = ref<AddSpaceParams | null>(null);
  const loading = ref(false);

  const saveSpace = async () => {
    if (!params.value) return;
    loading.value = true;
    try {
      await controller.create(params.value, undefined, route.fullPath);
    } finally {
      loading.value = false;
    }
  };
</script>

<template>
  <div class="Space-crud-page">
    <SpaceForm :loading="loading" @update-data="params = $event" />
    <button
      :class="{ 'btn--loading': loading }"
      class="btn btn-primary"
      type="button"
      :disabled="loading"
      @click="saveSpace"
    >
      {{ $t('save') }}
    </button>
    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped>
  .Space-crud-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .error {
    margin-top: 20px;
    padding: 10px;
    background-color: var(--danger-light);
    color: var(--danger-dark);
    border: 1px solid #f5c6cb;
    border-radius: 4px;
  }

  .btn-primary {
    width: 100%;
  }
</style>
