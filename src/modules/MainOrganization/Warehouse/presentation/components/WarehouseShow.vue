<script setup lang="ts">
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
  import { computed, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import DeleteDialog from '@/base/Presentation/Dialogs/MainDialogs/DeleteDialog.vue';
  import DeleteWarehouseParams from '../../core/params/delete.warehouse.params';
  import ShowWarehouseParams from '../../core/params/show.warehouse.params';
  import WarehouseController from '../controllers/warehouse.controller';

  const controller = WarehouseController.getInstance();
  const route = useRoute();
  const router = useRouter();
  const warehouseId = Number(route.params.warehouse_id);
  const warehouse = computed(() => controller.itemData.value);

  const deleteWarehouse = async () => {
    const result = await controller.delete(new DeleteWarehouseParams({ warehouseId }));
    if (result instanceof DataSuccess) await router.push('/organization/warehouse');
  };

  onMounted(() => controller.fetchOne(new ShowWarehouseParams({ warehouseId, allLocales: true })));
</script>

<template>
  <StandardFormLayout mode="show" class="standard-crud-page">
    <template v-if="warehouse">
      <div class="Warehouse-form-card">
        <header>
          <h3>{{ $t('Warehouse.show_title') }}</h3>
          <p>{{ $t('Warehouse.show_description') }}</p>
        </header>
        <div class="form-fields">
          <div class="field-group">
            <strong>{{ $t('title_ar') }}</strong>
            <p>
              <bdi dir="rtl">{{ warehouse.translations?.title?.ar }}</bdi>
            </p>
          </div>
          <div class="field-group">
            <strong>{{ $t('title_en') }}</strong>
            <p>
              <bdi dir="ltr">{{ warehouse.translations?.title?.en }}</bdi>
            </p>
          </div>
        </div>
      </div>
      <div class="row-actions">
        <router-link class="btn btn-primary" :to="`/organization/warehouse/edit/${warehouseId}`">{{
          $t('Warehouse.update')
        }}</router-link>
        <DeleteDialog
          :title="$t('Warehouse.delete_confirm')"
          :message="$t('This action cannot be undone.')"
          :hasbtn="true"
          @delete="deleteWarehouse"
        >
          <template #btn
            ><button class="btn" type="button">{{ $t('Delete') }}</button></template
          >
        </DeleteDialog>
      </div>
    </template>
    <p v-else-if="controller.errorMessage.value">{{ controller.errorMessage.value }}</p>
    <p v-else>{{ $t('loading') }}</p>
  </StandardFormLayout>
</template>

<style scoped lang="scss">
.Warehouse-form-card {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.Warehouse-form-card header p {
  color: var(--gray-5);
}

.form-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  align-items: end;
}

.row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

@media (max-width: 768px) {
  .form-fields {
    grid-template-columns: 1fr;
  }
}
</style>
