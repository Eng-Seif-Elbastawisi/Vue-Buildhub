<script setup lang="ts">
  import { ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRoute } from 'vue-router';

  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import { dialogManager } from '@/base/Presentation/Dialogs/dialog.manager';

  import type AddExecutionQuoteParams from '../../core/params/add.execution.quote.params';
  import type StoreExecutionQuoteDetailsParams from '../../core/params/store.execution.quote.details.params';
  import ExecutionQuoteController from '../controllers/execution.quote.controller';
  import ExecutionQuoteForm from './ExecutionQuoteForm.vue';

  const controller = ExecutionQuoteController.getInstance();
  const route = useRoute();
  const { t } = useI18n();

  const baseParams = ref<AddExecutionQuoteParams | null>(null);
  const detailsParams = ref<StoreExecutionQuoteDetailsParams | null>(null);
  const executionQuoteId = ref<number | null>(null);
  const loading = ref(false);

  const resolveCreatedExecutionQuoteId = (responseData: unknown): number | null => {
    if (!responseData || typeof responseData !== 'object') return null;

    const data = responseData as Record<string, unknown>;
    const directId = Number(data.id);

    if (Number.isInteger(directId) && directId > 0) {
      return directId;
    }

    const nestedData = data.data;

    if (nestedData && typeof nestedData === 'object') {
      const nestedId = Number((nestedData as Record<string, unknown>).id);
      if (Number.isInteger(nestedId) && nestedId > 0) return nestedId;
    }

    return null;
  };

  const saveBaseExecutionQuote = async () => {
    if (!baseParams.value || executionQuoteId.value) return;

    const validation = baseParams.value.validate();

    if (!validation.isValid) {
      dialogManager.toastWarning(
        validation.errors[0]?.message ?? t('execution_quote.validation.required_data'),
      );
      return;
    }

    loading.value = true;

    try {
      const response = await controller.createBase(baseParams.value);

      if (!(response instanceof DataSuccess)) return;

      const id = resolveCreatedExecutionQuoteId(response.data);

      if (!id) {
        // The second request cannot be linked without the created quote id.
        dialogManager.toastWarning(t('execution_quote.validation.required_data'));
        return;
      }

      executionQuoteId.value = id;
    } finally {
      loading.value = false;
    }
  };

  const saveExecutionQuoteDetails = async () => {
    if (!detailsParams.value || !executionQuoteId.value) return;

    const validation = detailsParams.value.validate();

    if (!validation.isValid) {
      dialogManager.toastWarning(
        validation.errors[0]?.message ?? t('execution_quote.validation.required_data'),
      );
      return;
    }

    loading.value = true;

    try {
      await controller.storeDetails(detailsParams.value, undefined, route.fullPath);
    } finally {
      loading.value = false;
    }
  };
</script>

<template>
  <div class="execution-quote-add">
    <ExecutionQuoteForm
      :loading="loading"
      :execution-quote-id="executionQuoteId"
      @update-data="baseParams = $event"
      @update-details="detailsParams = $event"
    />

    <button
      v-if="!executionQuoteId"
      class="execution-quote-add__save btn btn-primary"
      :class="{ 'btn--loading': loading }"
      type="button"
      :disabled="loading"
      @click="saveBaseExecutionQuote"
    >
      {{ $t('execution_quote.save') }}
    </button>

    <button
      v-else
      class="execution-quote-add__save execution-quote-add__save--details btn btn-primary"
      :class="{ 'btn--loading': loading }"
      type="button"
      :disabled="loading || !detailsParams"
      @click="saveExecutionQuoteDetails"
    >
      {{ $t('execution_quote.save') }}
    </button>

    <div v-if="controller.errorMessage.value" class="execution-quote-add__error">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped>
  .execution-quote-add {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .execution-quote-add__save {
    align-self: flex-start;
    min-width: 10rem;
  }

  .execution-quote-add__error {
    padding: 0.75rem 1rem;
    border: 1px solid var(--danger);
    border-radius: var(--radius-sm);
    background: var(--danger-light);
    color: var(--danger-dark);
  }
</style>
