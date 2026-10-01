<script setup lang="ts">
  import { ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import type AddItemTypesParams from '../../core/params/add.item.types.params.js';
  import ItemTypesController from '../controllers/item.types.controller.js';
  import ItemTypesForm from './ItemTypesForm.vue';

  const controller = ItemTypesController.getInstance();
  const route = useRoute();
  const router = useRouter();
  const params = ref<AddItemTypesParams | null>(null);
  const loading = ref(false);
  const goBack = () => void router.push({ name: 'ItemTypes' });

  const saveItemTypes = async () => {
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
  <div class="ItemTypes-crud-page">
    <ItemTypesForm :loading="loading" @update-data="params = $event" />
    <div class="form-actions form-action-pair">
      <button
        :class="{ 'btn--loading': loading }"
        class="btn btn-primary"
        type="button"
        :disabled="loading"
        @click="saveItemTypes"
      >
        {{ $t('save') }}
      </button>
      <button class="btn btn-secondary back-button" type="button" @click="goBack">
        {{ $t('common.back') }}
      </button>
    </div>
    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped lang="scss">
  @use '@/styles/mixins/form_action_pair' as form-actions;

  .ItemTypes-crud-page {
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

  .form-action-pair {
    @include form-actions.layout;
  }
</style>
