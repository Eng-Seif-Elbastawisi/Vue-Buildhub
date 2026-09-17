<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRouter } from 'vue-router';

  import type AddQuoteTypeParams from '../../core/params/add.quote.types.params.ts';
  import EditQuoteTypeParams from '../../core/params/edit.quote.types.params.ts';
  import ShowQuoteTypeParams from '../../core/params/show.quote.types.params.ts';

  import QuoteTypeController from '../controllers/quote.types.controller.ts';
  import QuoteTypeForm from './QuoteTypeForm.vue';

  const controller = QuoteTypeController.getInstance();

  const route = useRouter();

  const quoteTypeId = Number(route.currentRoute.value.params.id);

  const params = ref<EditQuoteTypeParams | null>(null);
  const loading = ref(false);

  const updateData = (data: AddQuoteTypeParams) => {
    params.value = new EditQuoteTypeParams({
      id: quoteTypeId,
      translations: data.translations,
      status: data.status,
    });
  };

  const saveQuoteType = async () => {
    if (!params.value) return;

    loading.value = true;

    try {
      await controller.update(params.value, undefined, route.currentRoute.value.fullPath);
    } finally {
      loading.value = false;
    }
  };

  onMounted(async () => {
    if (!quoteTypeId || Number.isNaN(quoteTypeId)) {
      console.error('Invalid Quote Type ID:', route.currentRoute.value.params.id);

      return;
    }

    await controller.fetchOne(
      new ShowQuoteTypeParams({
        id: quoteTypeId,
        allLocales: true,
      }),
    );
  });
</script>

<template>
  <div class="QuoteType-crud-page">
    <QuoteTypeForm
      :quote-type="controller.itemData.value!"
      :loading="loading"
      @update-data="updateData"
    />

    <button
      class="btn btn-primary"
      :class="{ 'btn--loading': loading }"
      type="button"
      :disabled="loading"
      @click="saveQuoteType"
    >
      {{ $t('quote_type.update') }}
    </button>

    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped>
  .QuoteType-crud-page {
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
