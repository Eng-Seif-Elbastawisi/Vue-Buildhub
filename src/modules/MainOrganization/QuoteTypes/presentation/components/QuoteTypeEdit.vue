<script setup lang="ts">
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
  import { computed, onMounted, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  import type AddQuoteTypeParams from '../../core/params/add.quote.types.params';
  import type EditQuoteTypeParams from '../../core/params/edit.quote.types.params';
  import ShowQuoteTypeParams from '../../core/params/show.quote.types.params';

  import QuoteTypeController from '../controllers/quote.types.controller';
  import QuoteTypeForm from './QuoteTypeForm.vue';

  const route = useRoute();
  const router = useRouter();

  const controller = QuoteTypeController.getInstance();

  const loading = ref(false);

  const quoteTypeId = computed(() => {
    const id = Number(route.params.id);

    return Number.isNaN(id) ? null : id;
  });

  const isEdit = computed(() => quoteTypeId.value !== null);

  const params = ref<AddQuoteTypeParams | EditQuoteTypeParams | null>(null);

  const updateData = (
    data: AddQuoteTypeParams | EditQuoteTypeParams,
  ) => {
    params.value = data;
  };

  const saveQuoteType = async () => {
    if (!params.value) {
      return;
    }

    loading.value = true;

    try {
      if (isEdit.value && quoteTypeId.value) {
        await controller.update(
          params.value as EditQuoteTypeParams,
          undefined,
          route.fullPath,
        );

        return;
      }

      await controller.store(
        params.value as AddQuoteTypeParams,
        undefined,
        route.fullPath,
      );
    } finally {
      loading.value = false;
    }
  };

  onMounted(async () => {
    if (!isEdit.value) {
      return;
    }

    if (!quoteTypeId.value) {
      console.error('Invalid Quote Type ID:', route.params.id);

      return;
    }

    await controller.fetchOne(
      new ShowQuoteTypeParams({
        id: quoteTypeId.value,
        allLocales: true,
      }),
    );
  });
</script>

<template>
  <StandardFormLayout mode="edit" class="QuoteType-crud-page">
    <QuoteTypeForm
      :quote-type="controller.itemData.value ?? undefined"
      :loading="loading"
      @update-data="updateData"
    />

    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>

    <template #actions>
      <button
        class="btn btn-primary"
        :class="{ 'btn--loading': loading }"
        type="button"
        :disabled="loading"
        @click="saveQuoteType"
      >
        {{ isEdit ? $t('quote_type.update') : $t('quote_type.save') }}
      </button>
    </template>
  </StandardFormLayout>
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
