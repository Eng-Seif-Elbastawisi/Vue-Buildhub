<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import SuppliersController from '../controllers/Suppliers.controller.ts';
import SuppliersForm from './SuppliersForm.vue';
import type AddSuppliersParams from '../../core/params/add.Suppliers.params.ts';

const controller = SuppliersController.getInstance();
const route = useRoute();
const formKey = route.fullPath;

const params = ref<AddSuppliersParams | null>(null);
const loading = ref(false);

const saveDocument = async () => {
  if (!params.value) return;
  loading.value = true;
  try {
    console.log(params, 'params');
    await controller.create(params.value, undefined, formKey);
  } finally {
    loading.value = false;
  }
};

const updateData = (updatedParams: AddSuppliersParams) => {
  params.value = updatedParams;
};
</script>

<template>
  <div class="document-crud-example">
    <SuppliersForm :form-key="formKey" :loading="loading" @update-data="updateData" />

    <!-- <AppButton :title="$t('save_document')" size="sm" icon="right" type="submit" @click="saveDocument">
      {{ $t('save_document') }}
      <template #icon>
        <IconAccept />
      </template>
</AppButton> -->
    <div class="actions" :class="{ disabled: loading }">
      <button class="btn btn-primary w-full" type="submit" @click="saveDocument">
        <span v-if="loading" class="loader"></span>
        <span v-else>
          {{ $t('save_suppliers') }}
        </span>
      </button>
    </div>

    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped lang="scss">
.document-crud-example {
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
