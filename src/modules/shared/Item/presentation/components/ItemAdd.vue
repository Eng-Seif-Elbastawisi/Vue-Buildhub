<script setup lang="ts">
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';
  import ItemController from '../controllers/Item.controller.ts';
  import AddItemParams from '../../core/params/add.Item.params.ts';
  import ItemForm from './ItemForm.vue';
  import { getItemServiceTypeFromQuery } from '../utils/itemRouteServiceType';

  const controller = ItemController.getInstance();
  const route = useRoute();
  const formKey = route.fullPath;
  const params = ref<AddItemParams | null>(null);
  const loading = ref(false);

  const updateData = (itemParams: AddItemParams) => {
    const serviceType = getItemServiceTypeFromQuery(route.query.service_type);

    params.value = serviceType
      ? new AddItemParams({
          ...itemParams,
          service_type: serviceType,
        })
      : itemParams;
  };

  const saveItem = async () => {
    if (!params.value) return;
    loading.value = true;
    try {
      await controller.create(params.value, undefined, formKey);
    } finally {
      loading.value = false;
    }
  };
</script>

<template>
  <div class="item-crud-page">
    <ItemForm :form-key="formKey" :loading="loading" @update-data="updateData" />

    <div class="actions" :class="{ disabled: loading }">
      <button
        :disabled="loading"
        :class="{ 'btn--loading': loading }"
        class="btn btn-primary w-full"
        type="button"
        @click="saveItem"
      >
        <span v-if="loading" class="loader"></span>
        <span v-else>{{ $t('item.save') }}</span>
      </button>
    </div>

    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped lang="scss">
  .actions.disabled {
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
