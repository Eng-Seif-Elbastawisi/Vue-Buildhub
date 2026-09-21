<script setup lang="ts">
  import { ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRoute } from 'vue-router';

  import { dialogManager } from '@/base/Presentation/Dialogs/dialog.manager';
  import type AddExecutionQuoteParams from '../../core/params/add.execution.quote.params';
  import ExecutionQuoteController from '../controllers/execution.quote.controller';
  import ExecutionQuoteForm from './ExecutionQuoteForm.vue';

  const controller = ExecutionQuoteController.getInstance();
  const route = useRoute();
  const { t } = useI18n();

  const params = ref<AddExecutionQuoteParams | null>(null);
  const loading = ref(false);

  const saveExecutionQuote = async () => {
    if (!params.value) return;

    const validation = params.value.validate();

    if (!validation.isValid) {
      dialogManager.toastWarning(
        validation.errors[0]?.message ?? t('execution_quote.validation.required_data'),
      );
      return;
    }

    loading.value = true;

    try {
      await controller.create(params.value, undefined, route.fullPath);
    } finally {
      loading.value = false;
    }
  };
</script>

<template>
  <div class="execution-quote-add">
    <ExecutionQuoteForm :loading="loading" @update-data="params = $event" />

    <button
      class="execution-quote-add__save btn btn-primary"
      :class="{ 'btn--loading': loading }"
      type="button"
      :disabled="loading"
      @click="saveExecutionQuote"
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
