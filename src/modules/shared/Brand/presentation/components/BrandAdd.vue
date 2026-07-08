<script setup lang="ts">
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';
  import BrandController from '../controllers/brand.controller.ts';
  import type AddBrandParams from '../../core/params/add.brand.params.ts';
  import BrandForm from './BrandForm.vue';

  const controller = BrandController.getInstance();
  const route = useRoute();
  const formKey = route.fullPath;

  const params = ref<AddBrandParams | null>(null);
  const loading = ref(false);

  const saveBrand = async () => {
    if (!params.value) return;
    loading.value = true;
    try {
      console.log(params, 'params');
      await controller.create(params.value, undefined, formKey);
    } finally {
      loading.value = false;
    }
  };

  const updateData = (updatedParams: AddBrandParams) => {
    params.value = updatedParams;
  };
</script>

<template>
  <div class="document-crud-example">
    <BrandForm :form-key="formKey" :loading="loading" @update-data="updateData" />

    <!-- <AppButton :title="$t('save_document')" size="sm" icon="right" type="submit" @click="saveDocument">
      {{ $t('save_document') }}
      <template #icon>
        <IconAccept />
      </template>
</AppButton> -->
    <div class="actions" :class="{ disabled: loading }">
      <button
        :disabled="loading"
        :class="{ 'btn--loading': loading }"
        class="btn btn-primary w-full"
        type="submit"
        @click="saveBrand"
      >
        <span v-if="loading" class="loader"></span>
        <span v-else>
          {{ $t('save_brand') }}
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
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
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
