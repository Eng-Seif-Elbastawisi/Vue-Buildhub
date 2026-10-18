<script setup lang="ts">
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
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
  import type ExecutionQuoteStageModel from '../../core/models/execution.quote.stage.model';
  import ShowExecutionQuoteParams from '../../core/params/show.execution.quote.params';
  import type { ExecutionQuoteStagePricingDraft } from '../../core/params/set.execution.quote.stage.pricing.params';
  import type SetExecutionQuoteSupervisionPricingParams from '../../core/params/set.execution.quote.supervision.pricing.params';
  import type StoreExecutionQuoteDetailsParams from '../../core/params/store.execution.quote.details.params';
  import ExecutionQuoteController from '../controllers/execution.quote.controller';
  import ExecutionQuoteForm from './ExecutionQuoteForm.vue';

  const controller = ExecutionQuoteController.getInstance();
  const route = useRoute();
  const router = useRouter();
  const { t } = useI18n();

  const baseParams = ref<AddExecutionQuoteParams | null>(null);
  const detailsParams = ref<StoreExecutionQuoteDetailsParams[]>([]);
  const pricingDrafts = ref<ExecutionQuoteStagePricingDraft[]>([]);
  const supervisionPricing = ref<SetExecutionQuoteSupervisionPricingParams | null>(null);
  const supervisionPricingTouched = ref(false);
  const initialQuoteType = ref<ExecutionQuoteType | null>(null);
  const initialQuoteStages = ref<ExecutionQuoteStageModel[]>([]);
  const initialSupervisionPercentage = ref<number | null>(null);
  const initialTotalQuotePrice = ref<number | undefined>();
  const initialSupervisionFee = ref<number | undefined>();
  const loading = ref(false);
  const builderResetKey = ref(0);
  const isBuilderPage = computed(() => route.name === 'Build Execution Quote');
  const hasSavableBuilderChanges = computed(
    () =>
      detailsParams.value.length > 0 ||
      pricingDrafts.value.some((pricingDraft) => Boolean(pricingDraft.quoteStageId)) ||
      Boolean(supervisionPricing.value) ||
      supervisionPricingTouched.value,
  );

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
      initialQuoteStages.value = response.data.quoteStages;
      initialSupervisionPercentage.value = response.data.supervisionPercentage ?? null;
      initialTotalQuotePrice.value = response.data.totalQuotePrice;
      initialSupervisionFee.value = response.data.supervisionFee;
      supervisionPricing.value = null;
      supervisionPricingTouched.value = false;
    } finally {
      loading.value = false;
    }
  };

  watch(
    [isBuilderPage, executionQuoteId],
    ([builderPage, quoteId]) => {
      if (!builderPage) {
        initialQuoteType.value = null;
        initialQuoteStages.value = [];
        initialSupervisionPercentage.value = null;
        initialTotalQuotePrice.value = undefined;
        initialSupervisionFee.value = undefined;
        supervisionPricing.value = null;
        supervisionPricingTouched.value = false;
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

  const builderRequestsAreValid = () => {
    const requiresSupervisionPercentage =
      initialQuoteType.value === ExecutionQuoteTypeEnum.SUPERVISION &&
      !currentStageId.value &&
      supervisionPricingTouched.value &&
      !supervisionPricing.value;

    if (requiresSupervisionPercentage) {
      dialogManager.toastWarning(t('execution_quote.validation.percentage'));
      return false;
    }

    const requests = [
      ...detailsParams.value,
      ...pricingDrafts.value,
      ...(supervisionPricing.value ? [supervisionPricing.value] : []),
    ];
    const invalidRequest = requests.find((request) => !request.validate().isValid);
    if (!invalidRequest) return true;

    const validation = invalidRequest.validate();
    dialogManager.toastWarning(
      validation.errors[0]?.message ?? t('execution_quote.validation.required_data'),
    );
    return false;
  };

  const storeBuilderRequests = async (quoteId: number) => {
    loading.value = true;

    try {
      const response = await controller.storeBuilderChanges({
        detailRequests: detailsParams.value,
        pricingDrafts: pricingDrafts.value,
        supervisionPricing: supervisionPricing.value,
        quoteId,
        formKey: route.fullPath,
      });
      return response instanceof DataSuccess;
    } finally {
      loading.value = false;
    }
  };

  const continueAtCurrentStage = async (quoteId: number) => {
    detailsParams.value = [];
    pricingDrafts.value = [];
    supervisionPricing.value = null;
    supervisionPricingTouched.value = false;
    await loadStoredQuote(quoteId);
    builderResetKey.value += 1;

    await router.replace({
      name: 'Build Execution Quote',
      params: { stageId: currentStageId.value },
      query: { id: String(quoteId) },
    });
  };

  const saveExecutionQuoteDetails = async () => {
    const quoteId = executionQuoteId.value;
    if (!hasSavableBuilderChanges.value || !quoteId || !builderRequestsAreValid()) return;

    const stored = await storeBuilderRequests(quoteId);
    if (stored) await continueAtCurrentStage(quoteId);
  };

  const updateSupervisionPricing = (pricing: SetExecutionQuoteSupervisionPricingParams | null) => {
    supervisionPricing.value = pricing;
    supervisionPricingTouched.value = true;
  };
</script>

<template>
  <StandardFormLayout mode="create" class="execution-quote-add">
    <ExecutionQuoteForm
      :key="isBuilderPage ? builderResetKey : 0"
      :loading="loading"
      :execution-quote-id="executionQuoteId"
      :initial-quote-type="initialQuoteType"
      :initial-quote-stages="initialQuoteStages"
      :initial-supervision-percentage="initialSupervisionPercentage"
      :initial-total-quote-price="initialTotalQuotePrice"
      :initial-supervision-fee="initialSupervisionFee"
      @update-data="baseParams = $event"
      @update-details="detailsParams = $event"
      @update-pricing="pricingDrafts = $event"
      @update-supervision-pricing="updateSupervisionPricing"
    />

    <section v-if="!isBuilderPage" class="execution-quote-add__setup-dock">
      <div class="execution-quote-add__action-copy">
        <span class="execution-quote-add__action-icon" aria-hidden="true">
          <i class="pi pi-arrow-right"></i>
        </span>
        <span>
          <strong>{{ $t('execution_quote.setup_ready_title') }}</strong>
          <small>{{ $t('execution_quote.setup_ready_hint') }}</small>
        </span>
      </div>

      <AppButton
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
    </section>

    <section v-else class="execution-quote-add__action-bar">
      <div class="execution-quote-add__action-copy">
        <strong>{{ $t('execution_quote.save_batch_title') }}</strong>
        <span>{{ $t('execution_quote.save_batch_hint') }}</span>
      </div>

      <AppButton
        class="execution-quote-add__save execution-quote-add__save--details"
        icon="right"
        :disabled="loading || !hasSavableBuilderChanges"
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
  </StandardFormLayout>
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
  margin-inline: 0;
  border-radius: var(--radius-md);
  box-shadow: none;
  transition:
    box-shadow var(--transition-fast),
    transform var(--transition-fast);
}

.execution-quote-add__save:hover:not(:disabled) {
  box-shadow: none;
  transform: translateY(-1px);
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
  box-shadow: none;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
  animation: execution-quote-actions-enter 360ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.execution-quote-add__setup-dock {
  display: flex;
  position: sticky;
  z-index: 5;
  bottom: 1rem;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  /* max-width: calc(96rem - 3rem); */
  width: 100%;
  margin-inline: auto;
  padding: 0.85rem 0.9rem;
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-lg);
  background: var(--gray-900-alpha-95);
  box-shadow: none;
  color: var(--white);
  backdrop-filter: blur(10px);
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
  animation: execution-quote-actions-enter 360ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.execution-quote-add__action-bar:hover,
.execution-quote-add__action-bar:focus-within {
  border-color: var(--PrimaryColor-alpha-30);
  box-shadow: none;
}

.execution-quote-add__setup-dock:hover,
.execution-quote-add__setup-dock:focus-within {
  border-color: var(--PrimaryColor-alpha-50);
  box-shadow: none;
}

.execution-quote-add__action-copy {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-align: start;
}

.execution-quote-add__action-copy > span:last-child {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.execution-quote-add__action-bar .execution-quote-add__action-copy {
  align-items: flex-start;
  flex-direction: column;
  gap: 0.2rem;
}

.execution-quote-add__action-icon {
  display: grid;
  width: 2.4rem;
  height: 2.4rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 0.75rem 0.75rem 0.25rem;
  background: var(--PrimaryColor);
  color: var(--white);
}

.execution-quote-add__action-bar .execution-quote-add__action-copy strong {
  color: var(--title-card-color);
}

.execution-quote-add__action-copy small,
.execution-quote-add__action-bar .execution-quote-add__action-copy span {
  color: var(--subtitle-color);
  font-size: var(--xs-size);
}

.execution-quote-add__setup-dock .execution-quote-add__action-copy small {
  color: var(--gray-300);
}

:global([dir='rtl'] .execution-quote-add__action-icon i) {
  transform: scaleX(-1);
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
  animation: execution-quote-actions-enter 240ms ease-out both;
}

@keyframes execution-quote-actions-enter {
  from {
    opacity: 0;
    transform: translateY(0.75rem);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 700px) {
  .execution-quote-add__save {
    align-self: stretch;
  }

  .execution-quote-add__setup-dock,
  .execution-quote-add__action-bar {
    position: static;
    align-items: stretch;
    flex-direction: column;
    margin-inline: 0.75rem;
  }

  .execution-quote-add__setup-dock {
    width: calc(100% - 1.5rem);
  }

  .execution-quote-add__setup-dock .execution-quote-add__save,
  .execution-quote-add__action-bar .execution-quote-add__save {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .execution-quote-add__save,
  .execution-quote-add__action-bar,
  .execution-quote-add__setup-dock,
  .execution-quote-add__error {
    animation: none;
    transition: none;
  }

  .execution-quote-add__save:hover:not(:disabled) {
    transform: none;
  }
}
</style>
