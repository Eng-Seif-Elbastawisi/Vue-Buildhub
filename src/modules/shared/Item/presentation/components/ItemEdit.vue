<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import ItemController from '../controllers/Item.controller.ts';
  import ItemForm from './ItemForm.vue';
  import type AddItemParams from '../../core/params/add.Item.params.ts';
  import EditItemParams from '../../core/params/edit.Item.params.ts';
  import ShowItemParams from '../../core/params/show.Item.params.ts';
  import { useUserStore } from '@/stores/user.ts';
  import { getItemServiceTypeFromQuery } from '../utils/itemRouteServiceType';
  const userStore = useUserStore();
  const router = useRouter();
  const controller = ItemController.getInstance();
  const route = useRoute();
  const formKey = route.fullPath;
  const params = ref<EditItemParams | null>(null);
  const loading = ref(false);
  const itemId = Number(route.params.id);

  const updateData = (itemParams: AddItemParams) => {
    params.value = new EditItemParams({
      item_id: itemId,
      translations: itemParams.translations,
      type: itemParams.type,
      status: itemParams.status,
      service_type: getItemServiceTypeFromQuery(route.query.service_type),
      stage_id: itemParams.stage_id,
      department_id: itemParams.department_id,
      measurement_unit_id: itemParams.measurement_unit_id,
      price: itemParams.price,
      notes: itemParams.notes,
    });
  };

  const saveItem = async () => {
    if (!params.value) return;
    loading.value = true;
    try {
      await controller.update(params.value, undefined, formKey);
      // router.push(userStore.user?.type === 1 ? '/mainportal/item' : '/organization/item');
    } finally {
      loading.value = false;
    }
  };

  onMounted(async () => {
    await controller.fetchOne(new ShowItemParams({ item_id: itemId, allLocales: true }));
  });
</script>

<template>
  <div class="material-crud-page">
    <ItemForm
      :item="controller.itemData.value!"
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
        @click="saveItem"
      >
        <span v-if="loading" class="loader"></span>
        <span v-else>{{ $t('item.update') }}</span>
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
    margin-top: 20px;
    padding: 10px;
    background-color: var(--danger-light);
    color: var(--danger-dark);
    border: 1px solid #f5c6cb;
    border-radius: 4px;
  }
</style>
