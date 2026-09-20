<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import type AddlaborParams from '../../core/params/add.labor.params.ts';
  import EditlaborParams from '../../core/params/edit.labor.params.ts';
  import ShowlaborParams from '../../core/params/show.labor.params.ts';
  import laborController from '../controllers/labor.controller.ts';
  import LaborForm from './LaborForm.vue';

  const controller = laborController.getInstance();
  const route = useRoute();
  const formKey = route.fullPath;
  const laborId = Number(route.params.labor_id);
  const params = ref<EditlaborParams | null>(null);

  const loading = ref(false);

  const updateData = (data: AddlaborParams) => {
    params.value = new EditlaborParams({
      labor_id: laborId,
      brandId: data.brandId,
      measurementId: data.measurementId,
      price: data.price,
      translations: data.translations,
    });
  };

  const saveLabor = async () => {
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
      new ShowlaborParams({
        labor_id: laborId,
        allLocales: true,
      }),
      {
        headers: {
          'accept-language': '*',
        },
      },
    );
  });
</script>

<template>
  <div class="labor-crud-page">
    <!-- <pre>
      {{ controller.itemData.value! }}
    </pre> -->
    <LaborForm
      :labor="controller.itemData.value!"
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
        @click="saveLabor"
      >
        <span v-if="loading" class="loader"></span>
        <span v-else>{{ $t('labor.update') }}</span>
      </button>
    </div>

    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped lang="scss">
  .labor-crud-page {
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
