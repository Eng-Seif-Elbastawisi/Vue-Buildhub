<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import IconAccept from '@/shared/icons/IconAccept.vue';
  import type AddSuppliersParams from '../../core/params/add.Suppliers.params.ts';
  import SuppliersController from '../controllers/Suppliers.controller.ts';
  import EditSuppliersParams from '../../core/params/edit.Suppliers.params.ts';
  import ShowSuppliersParams from '../../core/params/show.Suppliers.params.ts';
  import SuppliersForm from './SuppliersForm.vue';

  const controller = SuppliersController.getInstance();
  const route = useRoute();
  const formKey = route.fullPath;

  const params = ref<EditSuppliersParams | null>(null);
  const loading = ref(false);

  const saveDocument = async () => {
    if (!params.value) return;
    loading.value = true;
    try {
      await controller.update(params.value, undefined, formKey);
    } finally {
      loading.value = false;
    }
  };

  const updateData = (updatedParams: AddSuppliersParams) => {
    params.value = new EditSuppliersParams({
      suppliers_id: Number(route.params.id),
      name: updatedParams.name ?? '',
      Specialization: updatedParams.Specialization ?? '',
      phone: updatedParams.phone ?? '',
      materials: updatedParams.materials ?? '',
    });
  };

  onMounted(async () => {
    await controller.fetchOne(
      new ShowSuppliersParams({ suppliers_id: Number(route.params.id), allLocales: true }),
    );
  });
</script>

<template>
  <div class="document-crud-example">
    <SuppliersForm
      :supplier="controller.itemData.value!"
      :form-key="formKey"
      :loading="loading"
      @update-data="updateData"
    />

    <!-- <div class="actions" :class="{ disabled: loading }">
      <AppButton
        :title="$t('supplier.update')"
        size="sm"
        icon="right"
        type="submit"
        @click="saveDocument"
      >
        {{ $t('supplier.update') }}
        <template #icon>
          <IconAccept />
        </template>
</AppButton>
</div> -->
    <div class="actions" :class="{ disabled: loading }">
      <button class="btn btn-primary w-full" type="submit" @click="saveDocument">
        <span v-if="loading" class="loader"></span>
        <span v-else>
          {{ $t('supplier.update') }}
          <IconAccept />
        </span>
      </button>
    </div>

    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped lang="scss">
  .loader {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    border: 8px solid;
    border-color: #000 #0000;
    animation: l1 1s infinite;
  }

  @keyframes l1 {
    to {
      transform: rotate(0.5turn);
    }
  }

  @keyframes l7 {
    to {
      transform: rotate(0.5turn);
    }
  }

  .email-crud-example {
    padding: 20px;
    margin: 0 auto;
  }

  .actions {
    &.disabled {
      cursor: not-allowed;
      pointer-events: none;
      opacity: 0.7;
    }
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
