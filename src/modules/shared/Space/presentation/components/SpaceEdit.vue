<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import type AddSpaceParams from '../../core/params/add.space.params.ts';
  import EditSpaceParams from '../../core/params/edit.space.params.ts';
  import ShowSpaceParams from '../../core/params/show.space.params.ts';
  import SpaceController from '../controllers/space.controller.ts';
  import SpaceForm from './SpaceForm.vue';

  const controller = SpaceController.getInstance();
  const route = useRoute();
  const spaceId = Number(route.params.space_id);
  const params = ref<EditSpaceParams | null>(null);
  const loading = ref(false);
  const updateData = (data: AddSpaceParams) => {
    params.value = new EditSpaceParams({
      spaceId,
      translations: data.translations,
    });
  };
  const saveSpace = async () => {
    if (!params.value) return;
    loading.value = true;
    try {
      await controller.update(params.value, undefined, route.fullPath);
    } finally {
      loading.value = false;
    }
  };
  onMounted(async () => {
    await controller.fetchOne(new ShowSpaceParams({ spaceId, allLocales: true }));
  });
</script>

<template>
  <div class="Space-crud-page">
    <SpaceForm :Space="controller.itemData.value!" :loading="loading" @update-data="updateData" />
    <button class="btn btn-primary" type="button" :disabled="loading" @click="saveSpace">
      {{ $t('Space.update') }}
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
    color: var(--danger-dark);
  }

  .btn-primary {
    width: 100%;
  }
</style>
