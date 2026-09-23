<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRoute, useRouter } from 'vue-router';

  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import { dialogManager } from '@/base/Presentation/Dialogs/dialog.manager';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';

  import {
    ExecutionQuoteTypeEnum,
    type ExecutionQuoteType,
  } from '../../core/constants/execution.quote.type.enum';
  import type AddExecutionQuoteParams from '../../core/params/add.execution.quote.params';
  import ShowExecutionQuoteParams from '../../core/params/show.execution.quote.params';
  import type StoreExecutionQuoteDetailsParams from '../../core/params/store.execution.quote.details.params';
  import ExecutionQuoteController from '../controllers/execution.quote.controller';
  import ExecutionQuoteForm from './ExecutionQuoteForm.vue';

  const controller = ExecutionQuoteController.getInstance();
  const route = useRoute();
  const router = useRouter();
  const { t } = useI18n();

  const baseParams = ref<AddExecutionQuoteParams | null>(null);
  const detailsParams = ref<StoreExecutionQuoteDetailsParams[]>([]);
  const initialQuoteType = ref<ExecutionQuoteType | null>(null);
  const loading = ref(false);
  const builderResetKey = ref(0);
  const isBuilderPage = computed(() => route.name === 'Build Execution Quote');

  const executionQuoteId = computed<number | null>(() => {
    if (!isBuilderPage.value) return null;

    const rawId = Array.isArray(route.query.id) ? route.query.id[0] : route.query.id;
    const id = Number(rawId);
    return Number.isInteger(id) && id > 0 ? id : null;
  });

  const currentStageId = computed<string | undefined>(() => {
    const rawStageId = Array.isArray(route.params.stageId)
      ? route.params.stageId[0]
      : route.params.stageId;
    const stageId = Number(rawStageId);
    return Number.isInteger(stageId) && stageId > 0 ? String(stageId) : undefined;
  });

  const resolveCreatedExecutionQuoteId = (responseData: unknown): number | null => {
    if (!responseData || typeof responseData !== 'object') return null;

    const responseRecord = responseData as Record<string, unknown>;
    const directId = Number(responseRecord.id);

    if (Number.isInteger(directId) && directId > 0) {
      return directId;
    }

    const nestedData = responseRecord.data;

    if (nestedData && typeof nestedData === 'object') {
      const nestedId = Number((nestedData as Record<string, unknown>).id);
      if (Number.isInteger(nestedId) && nestedId > 0) return nestedId;
    }

    return null;
  };

  const toExecutionQuoteType = (rawQuoteType: unknown): ExecutionQuoteType | null => {
    const quoteType = Number(rawQuoteType);
    return Object.values(ExecutionQuoteTypeEnum).includes(quoteType as ExecutionQuoteType)
      ? (quoteType as ExecutionQuoteType)
      : null;
  };

  const loadStoredQuote = async (quoteId: number) => {
    loading.value = true;

    try {
      const response = await controller.fetchOne(
        new ShowExecutionQuoteParams({ executionQuoteId: quoteId }),
      );

      if (!(response instanceof DataSuccess) || !response.data) return;

      initialQuoteType.value = toExecutionQuoteType(response.data.quoteType?.id);
    } finally {
      loading.value = false;
    }
  };

  watch(
    [isBuilderPage, executionQuoteId],
    ([builderPage, quoteId]) => {
      if (!builderPage) {
        initialQuoteType.value = null;
        return;
      }

      if (!quoteId) {
        dialogManager.toastWarning(t('execution_quote.validation.base_quote_required'));
        void router.replace({ name: 'Add Execution Quote' });
        return;
      }

      void loadStoredQuote(quoteId);
    },
    { immediate: true },
  );

  const storeBaseExecutionQuote = async (
    params: AddExecutionQuoteParams,
  ): Promise<number | null> => {
    const response = await controller.createBase(params);
    if (!(response instanceof DataSuccess)) return null;

    const quoteId = resolveCreatedExecutionQuoteId(response.data);
    if (!quoteId) {
      dialogManager.toastWarning(t('execution_quote.validation.required_data'));
    }

    return quoteId;
  };

  const saveBaseExecutionQuote = async () => {
    if (!baseParams.value || isBuilderPage.value) return;

    const validation = baseParams.value.validate();

    if (!validation.isValid) {
      dialogManager.toastWarning(
        validation.errors[0]?.message ?? t('execution_quote.validation.required_data'),
      );
      return;
    }

    let storedQuoteId: number | null = null;

    loading.value = true;
    try {
      storedQuoteId = await storeBaseExecutionQuote(baseParams.value);
    } finally {
      loading.value = false;
    }

    if (!storedQuoteId) return;

    await router.push({
      name: 'Build Execution Quote',
      query: { id: String(storedQuoteId) },
    });
  };

  const detailRequestsAreValid = () => {
    const invalidRequest = detailsParams.value.find((params) => !params.validate().isValid);
    if (!invalidRequest) return true;

    const validation = invalidRequest.validate();
    dialogManager.toastWarning(
      validation.errors[0]?.message ?? t('execution_quote.validation.required_data'),
    );
    return false;
  };

  const storeDetailRequests = async () => {
    loading.value = true;

    try {
      const response = await controller.storeDetails(detailsParams.value, route.fullPath);
      return response instanceof DataSuccess;
    } finally {
      loading.value = false;
    }
  };

  const continueAtCurrentStage = async (quoteId: number) => {
    detailsParams.value = [];
    builderResetKey.value += 1;

    await router.replace({
      name: 'Build Execution Quote',
      params: { stageId: currentStageId.value },
      query: { id: String(quoteId) },
    });
  };

  const saveExecutionQuoteDetails = async () => {
    const quoteId = executionQuoteId.value;
    if (!detailsParams.value.length || !quoteId || !detailRequestsAreValid()) return;

    const stored = await storeDetailRequests();
    if (stored) await continueAtCurrentStage(quoteId);
  };
</script>

<template>
  <div class="execution-quote-add">
    <ExecutionQuoteForm
      :key="isBuilderPage ? builderResetKey : 0"
      :loading="loading"
      :execution-quote-id="executionQuoteId"
      :initial-quote-type="initialQuoteType"
      @update-data="baseParams = $event"
      @update-details="detailsParams = $event"
    />

    <AppButton
      v-if="!isBuilderPage"
      class="execution-quote-add__save"
      icon="right"
      :loading="loading"
      @click="saveBaseExecutionQuote"
    >
      <template #icon>
        <i class="pi pi-save" aria-hidden="true"></i>
      </template>
      {{ $t('execution_quote.save') }}
    </AppButton>

    <section v-else class="execution-quote-add__action-bar">
      <div class="execution-quote-add__action-copy">
        <strong>{{ $t('execution_quote.save_batch_title') }}</strong>
        <span>{{ $t('execution_quote.save_batch_hint') }}</span>
      </div>

      <AppButton
        class="execution-quote-add__save execution-quote-add__save--details"
        icon="right"
        :disabled="loading || !detailsParams.length"
        :loading="loading"
        @click="saveExecutionQuoteDetails"
      >
        <template #icon>
          <i class="pi pi-save" aria-hidden="true"></i>
        </template>
        {{ $t('execution_quote.save_and_continue') }}
      </AppButton>
    </section>

    <div v-if="controller.errorMessage.value" class="execution-quote-add__error">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped>
  .execution-quote-add {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding-bottom: 1.5rem;
  }

  .execution-quote-add__save {
    display: inline-flex;
    align-items: center;
    align-self: flex-end;
    justify-content: center;
    gap: 0.5rem;
    min-width: 12rem;
    min-height: 3rem;
    margin-inline: 1.25rem;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
  }

  .execution-quote-add__action-bar {
    display: flex;
    position: sticky;
    z-index: 5;
    bottom: 1rem;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-inline: 1.25rem;
    padding: 0.85rem 1rem;
    border: 1px solid var(--PrimaryColor-alpha-20);
    border-radius: var(--radius-md);
    background: var(--bg-card);
    box-shadow: var(--shadow-md);
  }

  .execution-quote-add__action-copy {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    text-align: start;
  }

  .execution-quote-add__action-copy strong {
    color: var(--title-card-color);
  }

  .execution-quote-add__action-copy span {
    color: var(--subtitle-color);
    font-size: var(--xs-size);
  }

  .execution-quote-add__action-bar .execution-quote-add__save {
    flex: 0 0 auto;
    margin-inline: 0;
  }

  .execution-quote-add__error {
    padding: 0.75rem 1rem;
    border: 1px solid var(--danger);
    border-radius: var(--radius-sm);
    background: var(--danger-light);
    color: var(--danger-dark);
  }

  @media (max-width: 700px) {
    .execution-quote-add__save {
      align-self: stretch;
      margin-inline: 0.75rem;
    }

    .execution-quote-add__action-bar {
      position: static;
      align-items: stretch;
      flex-direction: column;
      margin-inline: 0.75rem;
    }

    .execution-quote-add__action-bar .execution-quote-add__save {
      width: 100%;
    }
  }
</style>
