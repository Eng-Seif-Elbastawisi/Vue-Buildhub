<script setup lang="ts">
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
  import Accordion from 'primevue/accordion';
  import AccordionContent from 'primevue/accordioncontent';
  import AccordionHeader from 'primevue/accordionheader';
  import AccordionPanel from 'primevue/accordionpanel';
  import Dialog from 'primevue/dialog';
  import { computed, onMounted, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRoute } from 'vue-router';
  import { ClientTypeEnum } from '@/modules/MainOrganization/client/core/constant/client.type.enum';
  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import ConfirmCancelDialog from '@/base/Presentation/Dialogs/ConfirmCancelDialog.vue';
  import { dialogManager } from '@/base/Presentation/Dialogs/dialog.manager';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import ProjectWorkspaceApps from './ProjectWorkspaceApps.vue';
  import PageHeaderIcon from '@/shared/FeatureHeader/PageHeaderIcon.vue';

  import {
    ExecutionQuoteItemSourceEnum,
    getExecutionQuoteItemSourceTitleKey,
    type ExecutionQuoteItemSource,
  } from '../../core/constants/execution.quote.item.source.enum';
  import {
    ExecutionQuoteTypeEnum,
    getExecutionQuoteTypeTitleKey,
    type ExecutionQuoteType,
  } from '../../core/constants/execution.quote.type.enum';
  import { getQuoteSourceTitleKey } from '../../core/constants/quote.source.enum';
  import type ExecutionQuoteShowModel from '../../core/models/execution.quote.show.model';
  import type ExecutionQuoteStageItemModel from '../../core/models/execution.quote.stage-item.model';
  import type ExecutionQuoteStageModel from '../../core/models/execution.quote.stage.model';
  import DeleteExecutionQuoteItemParams from '../../core/params/delete.execution.quote.item.params';
  import FetchQuoteStatusHistoryParams from '../../core/params/fetch.quote.status.history.params';
  import ShowExecutionQuoteParams from '../../core/params/show.execution.quote.params';
  import UpdateExecutionQuoteItemParams from '../../core/params/update.execution.quote.item.params';
  import ExecutionQuoteController from '../controllers/execution.quote.controller';
  import type {
    ExecutionQuoteItemDraft,
    ExecutionQuoteItemState,
  } from '../types/execution.quote.ui.types';
  import ExecutionQuoteAttachments from './ExecutionQuoteAttachments.vue';
  import ExecutionQuoteStatusHistory from './ExecutionQuoteStatusHistory.vue';
  import ExecutionQuoteShowSkeleton from './ExecutionQuoteShowSkeleton.vue';
  import ExecutionQuoteItemForm from './builder/ExecutionQuoteItemForm.vue';
  import ExecutionQuoteItemSourceCards from './builder/ExecutionQuoteItemSourceCards.vue';

  const route = useRoute();
  const controller = ExecutionQuoteController.getInstance();
  const { locale, t } = useI18n();

  const state = computed(() => controller.itemState.value);
  const statusHistoryState = computed(() => controller.quoteStatusHistoryState.value);
  const quoteId = computed(() => Number(route.params.id));
  const activeShowSection = ref('stages');
  const activeQuoteStages = ref<string[]>(['0']);
  const selectedQuoteItem = ref<ExecutionQuoteStageItemModel | null>(null);
  const selectedQuoteStage = ref<ExecutionQuoteStageModel | null>(null);
  const showEditDialog = ref(false);
  const showDeleteDialog = ref(false);
  const editItemSource = ref<ExecutionQuoteItemSource | null>(null);
  const editingQuoteItemId = ref<number>();
  const deletingQuoteItemId = ref<number>();

  interface QuoteItemEditValues {
    itemId: number;
    source: ExecutionQuoteItemSource;
    sourceId: number;
    unitId: number;
    expectedPrice: number;
    quantity: number;
    sourceTitle?: string;
    unitName?: string;
  }

  const quoteItemSource = (
    quoteItem: ExecutionQuoteStageItemModel,
  ): ExecutionQuoteItemSource | null => {
    const itemSource = quoteItem.itemType as ExecutionQuoteItemSource | undefined;
    return itemSource && Object.values(ExecutionQuoteItemSourceEnum).includes(itemSource)
      ? itemSource
      : null;
  };

  const quoteItemEditValues = (
    quoteItem: ExecutionQuoteStageItemModel,
  ): QuoteItemEditValues | null => {
    const source = quoteItemSource(quoteItem);
    const sourceId = quoteItem.itemableId ?? quoteItem.itemable?.id;
    const unitId = quoteItem.unitId ?? quoteItem.measurementUnit?.id;
    if (
      !quoteItem.id ||
      !source ||
      !sourceId ||
      !unitId ||
      quoteItem.expectedPrice === undefined ||
      quoteItem.quantity === undefined
    ) {
      return null;
    }

    return {
      itemId: quoteItem.id,
      source,
      sourceId,
      unitId,
      expectedPrice: quoteItem.expectedPrice,
      quantity: quoteItem.quantity,
      sourceTitle: quoteItem.itemable?.title,
      unitName: quoteItem.measurementUnit?.title,
    };
  };

  const toEditItemState = (
    editValues: QuoteItemEditValues,
    quoteStage: ExecutionQuoteStageModel,
  ): ExecutionQuoteItemState => ({
    id: String(editValues.itemId),
    stage_id: quoteStage.stageId ?? quoteStage.id ?? 0,
    sub_stage_id: quoteStage.subStageId ?? quoteStage.id ?? 0,
    source_type: editValues.source,
    source_id: editValues.sourceId,
    quantity: editValues.quantity,
    unit_price: editValues.expectedPrice,
    unit_id: editValues.unitId,
    source_title: editValues.sourceTitle,
    unit_name: editValues.unitName,
    persisted: true,
  });

  const editItemState = computed<ExecutionQuoteItemState | null>(() => {
    const quoteStage = selectedQuoteStage.value;
    const editValues = selectedQuoteItem.value
      ? quoteItemEditValues(selectedQuoteItem.value)
      : null;

    return quoteStage && editValues ? toEditItemState(editValues, quoteStage) : null;
  });

  const fetchQuote = async () => {
    if (!Number.isInteger(quoteId.value) || quoteId.value <= 0) return;

    await controller.fetchOne(new ShowExecutionQuoteParams({ executionQuoteId: quoteId.value }));
  };

  const fetchQuoteStatusHistory = async () => {
    if (!Number.isInteger(quoteId.value) || quoteId.value <= 0) return;

    await controller.fetchQuoteStatusHistory(
      new FetchQuoteStatusHistoryParams({ quoteId: quoteId.value }),
    );
  };

  const quoteTypeLabel = (quote: ExecutionQuoteShowModel) => {
    const quoteType = quote.quoteType?.id;
    const isKnownType = Object.values(ExecutionQuoteTypeEnum).includes(
      quoteType as ExecutionQuoteType,
    );

    if (isKnownType) return t(getExecutionQuoteTypeTitleKey(quoteType as ExecutionQuoteType));

    return quote.quoteType?.title?.replace(/_/g, ' ') ?? '—';
  };

  const parsedDate = (rawDate: string | undefined) => {
    if (!rawDate) return undefined;

    const date = new Date(rawDate.includes(' ') ? rawDate.replace(' ', 'T') : rawDate);
    return Number.isNaN(date.getTime()) ? undefined : date;
  };

  const formatDateTime = (rawDate: string | undefined) => {
    const date = parsedDate(rawDate);
    if (!date) return rawDate ?? '—';

    return new Intl.DateTimeFormat(locale.value, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  const formatDate = (rawDate: string | undefined) => {
    const date = parsedDate(rawDate);
    if (!date) return rawDate ?? '—';

    return new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium' }).format(date);
  };

  const clientStatusKey = (status: number | undefined) => {
    if (status === undefined) return 'execution_quote.not_available';

    return status === 1 ? 'execution_quote.show.active' : 'execution_quote.show.inactive';
  };

  const quoteSourceLabel = (quote: ExecutionQuoteShowModel) => {
    const titleKey = getQuoteSourceTitleKey(quote.quoteSource);
    return titleKey ? t(titleKey) : '—';
  };

  const itemSourceLabel = (quoteItem: ExecutionQuoteStageItemModel) => {
    const itemSource = quoteItem.itemType as ExecutionQuoteItemSource | undefined;
    const isKnownSource =
      itemSource && Object.values(ExecutionQuoteItemSourceEnum).includes(itemSource);

    return isKnownSource
      ? t(getExecutionQuoteItemSourceTitleKey(itemSource))
      : (quoteItem.itemableType ?? '—');
  };

  const formatNumber = (rawNumber: number | null | undefined) => {
    if (rawNumber == null) return '—';

    return new Intl.NumberFormat(locale.value, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(rawNumber);
  };

  const itemTotal = (quoteItem: ExecutionQuoteStageItemModel) => {
    if (quoteItem.expectedPrice === undefined || quoteItem.quantity === undefined) return undefined;
    return quoteItem.expectedPrice * quoteItem.quantity;
  };

  const stageTotal = (quoteStage: ExecutionQuoteStageModel) => {
    if (quoteStage.totalPrice !== undefined) return quoteStage.totalPrice;

    return quoteStage.items.reduce((total, quoteItem) => total + (itemTotal(quoteItem) ?? 0), 0);
  };

  const clientTypeLabel = (type: number | undefined) => {
    switch (type) {
      case ClientTypeEnum.INDIVIDUAL:
        return t('INDIVIDUAL');
      case ClientTypeEnum.COMPANY:
        return t('COMPANY');
      case ClientTypeEnum.DEVELOPER:
        return t('DEVELOPER');
      default:
        return '—';
    }
  };

  const clearSelectedQuoteItem = () => {
    selectedQuoteItem.value = null;
    selectedQuoteStage.value = null;
    editItemSource.value = null;
  };

  const openEditDialog = (
    quoteItem: ExecutionQuoteStageItemModel,
    quoteStage: ExecutionQuoteStageModel,
  ) => {
    if (!quoteItem.id) return;

    selectedQuoteItem.value = quoteItem;
    selectedQuoteStage.value = quoteStage;
    editItemSource.value = quoteItemSource(quoteItem);
    showEditDialog.value = true;
  };

  const updateEditDialogVisibility = (visible: boolean) => {
    if (editingQuoteItemId.value !== undefined) return;

    showEditDialog.value = visible;
    if (!visible) clearSelectedQuoteItem();
  };

  const quoteItemUpdateParams = (draft: ExecutionQuoteItemDraft) => {
    const quoteItemId = selectedQuoteItem.value?.id;
    const itemType = editItemSource.value;
    const morphId = Number(draft.source_id);
    const unit = Number(draft.unit_id);
    if (!quoteItemId || !itemType || !Number.isInteger(morphId) || !Number.isInteger(unit)) {
      return undefined;
    }

    return new UpdateExecutionQuoteItemParams({
      quoteItemId,
      itemType,
      morphId,
      expectedPrice: draft.unit_price,
      quantity: draft.quantity,
      unit,
    });
  };

  const updateQuoteItem = async (params: UpdateExecutionQuoteItemParams) => {
    editingQuoteItemId.value = params.quoteItemId;
    try {
      const response = await controller.updateExecutionQuoteItem(params);
      if (!(response instanceof DataSuccess)) return;

      showEditDialog.value = false;
      clearSelectedQuoteItem();
      await fetchQuote();
    } finally {
      editingQuoteItemId.value = undefined;
    }
  };

  const submitQuoteItemUpdate = async (draft: ExecutionQuoteItemDraft) => {
    if (editingQuoteItemId.value !== undefined) return;

    const params = quoteItemUpdateParams(draft);
    if (!params) {
      dialogManager.toastWarning(t('execution_quote.validation.item_values'));
      return;
    }

    const validation = params.validate();
    if (!validation.isValid) {
      dialogManager.toastWarning(
        validation.errors[0]?.message ?? t('execution_quote.validation.item_values'),
      );
      return;
    }

    await updateQuoteItem(params);
  };

  const openDeleteDialog = (quoteItem: ExecutionQuoteStageItemModel) => {
    if (!quoteItem.id || deletingQuoteItemId.value !== undefined) return;

    selectedQuoteItem.value = quoteItem;
    showDeleteDialog.value = true;
  };

  const deleteQuoteItem = async (params: DeleteExecutionQuoteItemParams) => {
    deletingQuoteItemId.value = params.quoteItemId;
    try {
      const response = await controller.deleteExecutionQuoteItem(params);
      if (!(response instanceof DataSuccess)) return;

      showDeleteDialog.value = false;
      clearSelectedQuoteItem();
      await fetchQuote();
    } finally {
      deletingQuoteItemId.value = undefined;
    }
  };

  const deleteSelectedQuoteItem = async () => {
    const quoteItemId = selectedQuoteItem.value?.id;
    if (!quoteItemId || deletingQuoteItemId.value !== undefined) return;

    const params = new DeleteExecutionQuoteItemParams({ quoteItemId });
    if (!params.validate().isValid) return;

    await deleteQuoteItem(params);
  };

  const cancelDeleteQuoteItem = () => {
    if (deletingQuoteItemId.value !== undefined) return;

    showDeleteDialog.value = false;
    clearSelectedQuoteItem();
  };
  const quoteBuilderRoute = (stageId?: number) => ({
    name: 'Build Execution Quote',
    ...(stageId ? { params: { stageId: String(stageId) } } : {}),
    query: { id: String(quoteId.value) },
  });

  onMounted(() => {
    void fetchQuote();
    void fetchQuoteStatusHistory();
  });
</script>

<template>
  <StandardFormLayout as="section" mode="show" class="execution-quote-show">
    <header class="execution-quote-show__header">
      <div>
        <h1>{{ $t('project_workspace.title') }}</h1>
      </div>

      <div class="execution-quote-show__header-actions">
        <AppButton class="execution-quote-show__add-items" :to="quoteBuilderRoute()" icon="left">
          <template #icon>
            <i class="pi pi-plus" aria-hidden="true"></i>
          </template>
          {{ $t('execution_quote.show.add_items') }}
        </AppButton>

        <AppButton :to="{ name: 'Execution Quotes' }" theme="secondary" outline icon="left">
          <template #icon>
            <i class="pi pi-arrow-right" aria-hidden="true"></i>
          </template>
          {{ $t('execution_quote.show.back') }}
        </AppButton>
      </div>
    </header>

    <DataStatusBuilder :controller="state" :on-retry="fetchQuote">
      <template #success="{ data: quote }">
        <div class="execution-quote-show__content">
          <section class="execution-quote-show__hero">
            <div class="execution-quote-show__hero-copy">
              <h2>{{ quote.project?.title ?? $t('execution_quote.show.project_fallback') }}</h2>
              <div class="execution-quote-show__badges">
                <span>
                  <i class="pi pi-file" aria-hidden="true"></i>
                  {{ $t('execution_quote.show.eyebrow') }}
                </span>
                <span>{{ quoteSourceLabel(quote) }}</span>
              </div>
              <dl class="execution-quote-show__hero-parties">
                <div>
                  <dt>{{ $t('execution_quote.fields.client') }}</dt>
                  <dd>{{ quote.client?.name ?? '—' }}</dd>
                </div>
                <div>
                  <dt>{{ $t('Organization') }}</dt>
                  <dd>{{ quote.organization?.name ?? '—' }}</dd>
                </div>
              </dl>
            </div>
            <div class="execution-quote-show__hero-mark" aria-hidden="true">
              <PageHeaderIcon kind="project" />
            </div>
          </section>

          <ProjectWorkspaceApps :quote-id="quoteId" />
          <details class="workspace-project-details">
            <summary>
              <span class="workspace-project-details__icon" aria-hidden="true"
                ><i class="pi pi-file"></i
              ></span>
              <span class="workspace-project-details__title">{{
                $t('project_workspace.details')
              }}</span>
              <i
                class="pi pi-chevron-down workspace-project-details__toggle"
                aria-hidden="true"
              ></i>
            </summary>
            <dl class="workspace-project-meta">
              <div>
                <dt>{{ $t('execution_quote.show.created_at') }}</dt>
                <dd>{{ formatDateTime(quote.createdAt) }}</dd>
              </div>
              <div>
                <dt>{{ $t('execution_quote.fields.quote_type') }}</dt>
                <dd>{{ quoteTypeLabel(quote) }}</dd>
              </div>
            </dl>
            <div class="execution-quote-show__grid">
              <section class="execution-quote-show__card">
                <div class="execution-quote-show__section-title">
                  <span class="execution-quote-show__section-icon">
                    <i class="pi pi-building" aria-hidden="true"></i>
                  </span>
                  <div>
                    <h2>{{ $t('execution_quote.show.project_section') }}</h2>
                    <p>{{ $t('execution_quote.show.project_section_hint') }}</p>
                  </div>
                </div>

                <section
                  class="execution-quote-show__finance"
                  aria-labelledby="quote-finance-title"
                >
                  <header class="execution-quote-show__finance-header">
                    <span class="execution-quote-show__finance-header-icon" aria-hidden="true">
                      <i class="pi pi-chart-line"></i>
                    </span>
                    <div>
                      <h3 id="quote-finance-title">
                        {{ $t('execution_quote.show.financial_summary') }}
                      </h3>
                      <p>
                        {{
                          $t(
                            quote.quoteType?.id === ExecutionQuoteTypeEnum.SUPERVISION
                              ? 'execution_quote.show.supervision_financial_summary_hint'
                              : 'execution_quote.show.financial_summary_hint',
                          )
                        }}
                      </p>
                    </div>
                  </header>

                  <dl
                    class="execution-quote-show__finance-values"
                    :class="{
                      'execution-quote-show__finance-values--supervision':
                        quote.quoteType?.id === ExecutionQuoteTypeEnum.SUPERVISION,
                    }"
                  >
                    <div class="execution-quote-show__finance-value">
                      <span class="execution-quote-show__finance-value-icon" aria-hidden="true">
                        <i class="pi pi-calculator"></i>
                      </span>
                      <dt>{{ $t('execution_quote.show.total_quote_price') }}</dt>
                      <dd>
                        <strong>{{ formatNumber(quote.totalQuotePrice) }}</strong>
                        <small v-if="quote.totalQuotePrice !== undefined">
                          {{ $t('execution_quote.table.currency_egp') }}
                        </small>
                      </dd>
                    </div>

                    <div
                      v-if="quote.quoteType?.id === ExecutionQuoteTypeEnum.LUMP_SUM"
                      class="execution-quote-show__finance-value execution-quote-show__finance-value--highlight"
                    >
                      <span class="execution-quote-show__finance-value-icon" aria-hidden="true">
                        <i class="pi pi-wallet"></i>
                      </span>
                      <dt>{{ $t('execution_quote.show.client_quote_price') }}</dt>
                      <dd>
                        <strong>{{ formatNumber(quote.clientQuotePrice) }}</strong>
                        <small v-if="quote.clientQuotePrice !== undefined">
                          {{ $t('execution_quote.table.currency_egp') }}
                        </small>
                      </dd>
                    </div>

                    <div
                      v-if="quote.quoteType?.id === ExecutionQuoteTypeEnum.SUPERVISION"
                      class="execution-quote-show__finance-value execution-quote-show__finance-value--percentage"
                    >
                      <span class="execution-quote-show__finance-value-icon" aria-hidden="true">
                        <i class="pi pi-percentage"></i>
                      </span>
                      <dt>{{ $t('execution_quote.show.supervision_percentage') }}</dt>
                      <dd>
                        <strong>{{ formatNumber(quote.supervisionPercentage) }}</strong>
                        <small v-if="quote.supervisionPercentage !== undefined">%</small>
                      </dd>
                    </div>

                    <div
                      v-if="quote.quoteType?.id === ExecutionQuoteTypeEnum.SUPERVISION"
                      class="execution-quote-show__finance-value execution-quote-show__finance-value--highlight"
                    >
                      <span class="execution-quote-show__finance-value-icon" aria-hidden="true">
                        <i class="pi pi-verified"></i>
                      </span>
                      <dt>{{ $t('execution_quote.show.supervision_price') }}</dt>
                      <dd>
                        <strong>{{ formatNumber(quote.supervisionFee) }}</strong>
                        <small v-if="quote.supervisionFee !== undefined">
                          {{ $t('execution_quote.table.currency_egp') }}
                        </small>
                      </dd>
                    </div>
                  </dl>
                </section>

                <dl class="execution-quote-show__details">
                  <div>
                    <dt>{{ $t('execution_quote.fields.project') }}</dt>
                    <dd>{{ quote.project?.title ?? '—' }}</dd>
                  </div>
                  <div>
                    <dt>{{ $t('execution_quote.show.project_client') }}</dt>
                    <dd>{{ quote.project?.client?.title ?? quote.client?.name ?? '—' }}</dd>
                  </div>
                  <div>
                    <dt>{{ $t('execution_quote.show.project_date') }}</dt>
                    <dd>{{ formatDate(quote.project?.date) }}</dd>
                  </div>
                  <div>
                    <dt>{{ $t('execution_quote.show.project_created_at') }}</dt>
                    <dd>{{ formatDateTime(quote.project?.createdAt) }}</dd>
                  </div>
                  <div v-if="quote.priceEmployee?.name">
                    <dt>{{ $t('execution_quote.fields.price_employee') }}</dt>
                    <dd>{{ quote.priceEmployee.name }}</dd>
                  </div>
                  <div class="execution-quote-show__details-wide">
                    <dt>{{ $t('execution_quote.show.description_label') }}</dt>
                    <dd>
                      {{ quote.project?.description ?? $t('execution_quote.show.no_description') }}
                    </dd>
                  </div>
                </dl>
              </section>

              <section class="execution-quote-show__card">
                <div class="execution-quote-show__section-title">
                  <span class="execution-quote-show__section-icon">
                    <i class="pi pi-user" aria-hidden="true"></i>
                  </span>
                  <div>
                    <h2>{{ $t('execution_quote.show.client_section') }}</h2>
                    <p>{{ $t('execution_quote.show.client_section_hint') }}</p>
                  </div>
                  <span
                    class="execution-quote-show__status"
                    :class="{
                      'execution-quote-show__status--active': quote.client?.status === 1,
                    }"
                  >
                    {{ $t(clientStatusKey(quote.client?.status)) }}
                  </span>
                </div>

                <dl class="execution-quote-show__details">
                  <div>
                    <dt>{{ $t('execution_quote.fields.client') }}</dt>
                    <dd>{{ quote.client?.name ?? '—' }}</dd>
                  </div>
                  <div>
                    <dt>{{ $t('execution_quote.show.phone') }}</dt>
                    <dd>
                      <a v-if="quote.client?.phone" :href="`tel:${quote.client.phone}`">
                        {{ quote.client.phone }}
                      </a>
                      <template v-else>—</template>
                    </dd>
                  </div>
                  <div>
                    <dt>{{ $t('execution_quote.show.address') }}</dt>
                    <dd>{{ quote.client?.address ?? '—' }}</dd>
                  </div>
                  <div>
                    <dt>{{ $t('execution_quote.show.client_type') }}</dt>
                    <dd>{{ clientTypeLabel(quote.client?.type) }}</dd>
                  </div>
                  <div>
                    <dt>{{ $t('execution_quote.show.client_source') }}</dt>
                    <dd>
                      {{ quote.client?.clientSource?.title ?? $t('execution_quote.not_available') }}
                    </dd>
                  </div>
                  <div>
                    <dt>{{ $t('execution_quote.show.client_created_at') }}</dt>
                    <dd>{{ formatDateTime(quote.client?.createdAt) }}</dd>
                  </div>
                </dl>
              </section>
            </div>

            <ExecutionQuoteAttachments
              v-if="quote.attachments?.length"
              :attachments="quote.attachments"
            />

            <ExecutionQuoteStatusHistory
              :state="statusHistoryState"
              @retry="fetchQuoteStatusHistory"
            />

            <Accordion
              v-model:value="activeShowSection"
              class="execution-quote-show__stages-accordion mt-2"
            >
              <AccordionPanel value="stages" class="execution-quote-show__stages-panel">
                <AccordionHeader class="execution-quote-show__stages-header">
                  <template #toggleicon="{ active }">
                    <span class="execution-quote-show__accordion-toggle" aria-hidden="true">
                      <i :class="active ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"></i>
                    </span>
                  </template>

                  <div class="execution-quote-show__section-title">
                    <span class="execution-quote-show__section-icon">
                      <i class="pi pi-list-check" aria-hidden="true"></i>
                    </span>
                    <div>
                      <h2>{{ $t('execution_quote.show.stages_section') }}</h2>
                      <p>
                        {{
                          $t('execution_quote.show.stages_section_hint', {
                            stages: quote.quoteStagesCount,
                            items: quote.quoteItemsCount,
                          })
                        }}
                      </p>
                    </div>
                  </div>
                </AccordionHeader>

                <AccordionContent class="execution-quote-show__stages-content">
                  <div class="execution-quote-show__stages-actions">
                    <AppButton
                      class="execution-quote-show__add-stage-button"
                      :to="quoteBuilderRoute()"
                      size="sm"
                      icon="left"
                    >
                      <template #icon>
                        <i class="pi pi-sitemap" aria-hidden="true"></i>
                      </template>
                      {{ $t('execution_quote.table.add_stage') }}
                    </AppButton>
                  </div>

                  <!-- {{ console.log(quote.quoteStages) }} -->
                  <Accordion
                    v-if="quote.quoteStages.length"
                    v-model:value="activeQuoteStages"
                    multiple
                    class="execution-quote-show__stage-list"
                  >
                    <AccordionPanel
                      v-for="(stage, stageIndex) in quote.quoteStages"
                      :key="`${stage.id ?? 'stage'}-${stage.stageId}-${stage.subStageId ?? 'root'}`"
                      :value="stageIndex.toString()"
                      class="execution-quote-show__stage-panel"
                    >
                      <AccordionHeader class="execution-quote-show__stage-accordion-header">
                        <template #toggleicon="{ active }">
                          <span class="execution-quote-show__accordion-toggle" aria-hidden="true">
                            <i :class="active ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"></i>
                          </span>
                        </template>

                        <div class="execution-quote-show__stage-header">
                          <div>
                            <span>{{ $t('execution_quote.show.main_stage') }}</span>
                            <h3>{{ stage.stage?.title }}</h3>
                          </div>
                          <div class="execution-quote-show__stage-badges">
                            <span class="execution-quote-show__stage-badge">
                              <span class="execution-quote-show__stage-badge-label">
                                {{ $t('execution_quote.show.sub_stage') }}:
                              </span>
                              <strong class="execution-quote-show__stage-badge-value">
                                {{ stage.subStage?.map((item) => item.subStage?.title).join(', ') }}
                              </strong>
                            </span>
                            <span
                              v-if="quote.quoteType?.id !== ExecutionQuoteTypeEnum.SUPERVISION"
                              class="execution-quote-show__stage-badge"
                            >
                              <span class="execution-quote-show__stage-badge-label">
                                {{ $t('execution_quote.client_stage_price') }}:
                              </span>

                              <strong class="execution-quote-show__stage-badge-value">
                                {{ formatNumber(stage.clientPrice) }}
                              </strong>
                            </span>

                            <span class="execution-quote-show__stage-badge">
                              <span class="execution-quote-show__stage-badge-label">
                                {{ $t('execution_quote.show.stage_total') }}:
                              </span>
                              <strong class="execution-quote-show__stage-badge-value">
                                {{ formatNumber(stageTotal(stage)) }}
                              </strong>
                            </span>

                            <span class="execution-quote-show__stage-badge">
                              <span class="execution-quote-show__stage-badge-label">
                                {{ $t('execution_quote.show.stage_created_at') }}:
                              </span>
                              <strong class="execution-quote-show__stage-badge-value">
                                {{ formatDateTime(stage.createdAt) }}
                              </strong>
                            </span>
                          </div>
                        </div>
                      </AccordionHeader>

                      <AccordionContent
                        v-for="sub in stage.subStage"
                        :key="sub.id"
                        class="execution-quote-show__stage-content"
                      >
                        <div class="execution-quote-show__stage-actions">
                          <AppButton
                            class="execution-quote-show__add-item-button"
                            :to="quoteBuilderRoute(stage.stageId)"
                            size="sm"
                            icon="left"
                          >
                            <template #icon>
                              <i class="pi pi-plus" aria-hidden="true"></i>
                            </template>
                            {{ $t('execution_quote.table.add_item') }}
                          </AppButton>
                        </div>

                        <div class="execution-quote-show__sub-stage-header">
                          <div>
                            <span>{{ $t('execution_quote.show.sub_stage') }}</span>
                            <h3>{{ sub.subStage?.title }}</h3>
                          </div>
                        </div>
                        <div
                          v-if="sub.items.length"
                          class="execution-quote-show__items-table-wrap workspace-table-scroll"
                        >
                          <table class="execution-quote-show__items-table workspace-data-table">
                            <thead>
                              <tr>
                                <th scope="col">{{ $t('execution_quote.show.item') }}</th>
                                <th scope="col">{{ $t('execution_quote.show.item_source') }}</th>
                                <th scope="col">{{ $t('execution_quote.show.itemable_type') }}</th>
                                <th scope="col">{{ $t('execution_quote.show.expected_price') }}</th>
                                <th scope="col">{{ $t('execution_quote.show.quantity') }}</th>
                                <th scope="col">{{ $t('execution_quote.item_fields.unit') }}</th>
                                <th scope="col">{{ $t('execution_quote.show.total') }}</th>
                                <th scope="col">{{ $t('execution_quote.show.actions') }}</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr
                                v-for="quoteItem in sub.items"
                                :key="quoteItem.id ?? quoteItem.itemableId"
                              >
                                <td>
                                  {{ quoteItem.itemable?.title ?? '—' }}
                                </td>
                                <td>
                                  {{ itemSourceLabel(quoteItem) }}
                                </td>
                                <td>{{ quoteItem.itemableType ?? '—' }}</td>
                                <td>{{ formatNumber(quoteItem.expectedPrice) }}</td>
                                <td>{{ formatNumber(quoteItem.quantity) }}</td>
                                <td>{{ quoteItem.measurementUnit?.title ?? '—' }}</td>

                                <td class="execution-quote-show__item-total">
                                  {{ formatNumber(itemTotal(quoteItem)) }}
                                </td>
                                <td>
                                  <div class="execution-quote-show__item-actions">
                                    <AppButton
                                      class="execution-quote-show__item-action execution-quote-show__item-action--edit"
                                      action-tone="edit"
                                      size="sm"
                                      theme="secondary"
                                      outline
                                      icon-only
                                      :disabled="
                                        !quoteItem.id ||
                                        editingQuoteItemId !== undefined ||
                                        deletingQuoteItemId !== undefined
                                      "
                                      :title="$t('common.edit')"
                                      :aria-label="$t('common.edit')"
                                      @click.stop="openEditDialog(quoteItem, stage)"
                                    >
                                      <template #icon>
                                        <i class="pi pi-pencil" aria-hidden="true"></i>
                                      </template>
                                    </AppButton>

                                    <AppButton
                                      class="execution-quote-show__item-action execution-quote-show__item-action--delete"
                                      action-tone="delete"
                                      size="sm"
                                      theme="danger"
                                      outline
                                      icon-only
                                      :loading="deletingQuoteItemId === quoteItem.id"
                                      :disabled="
                                        !quoteItem.id ||
                                        editingQuoteItemId !== undefined ||
                                        (deletingQuoteItemId !== undefined &&
                                          deletingQuoteItemId !== quoteItem.id)
                                      "
                                      :title="$t('common.delete')"
                                      :aria-label="$t('common.delete')"
                                      @click.stop="openDeleteDialog(quoteItem)"
                                    >
                                      <template #icon>
                                        <i class="pi pi-trash" aria-hidden="true"></i>
                                      </template>
                                    </AppButton>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <p v-else class="execution-quote-show__empty-items">
                          {{ $t('execution_quote.show.no_stage_items') }}
                        </p>
                      </AccordionContent>
                    </AccordionPanel>
                  </Accordion>

                  <p v-else class="execution-quote-show__empty-items">
                    {{ $t('execution_quote.show.no_stages') }}
                  </p>

                  <Dialog
                    :visible="showEditDialog"
                    modal
                    append-to="body"
                    class="execution-quote-show__edit-dialog workspace-dialog"
                    :closable="editingQuoteItemId === undefined"
                    :dismissable-mask="editingQuoteItemId === undefined"
                    :draggable="false"
                    @update:visible="updateEditDialogVisibility"
                  >
                    <template #header>
                      <div class="execution-quote-show__edit-dialog-header">
                        <span aria-hidden="true">
                          <i class="pi pi-pencil"></i>
                        </span>
                        <h2>{{ $t('execution_quote.show.edit_item_title') }}</h2>
                      </div>
                    </template>

                    <div class="execution-quote-show__edit-form">
                      <div class="execution-quote-show__itemable-type">
                        <span>{{ $t('execution_quote.show.itemable_type') }}</span>
                        <strong>{{ selectedQuoteItem?.itemableType ?? '—' }}</strong>
                      </div>

                      <ExecutionQuoteItemSourceCards
                        v-model="editItemSource"
                        :disabled="editingQuoteItemId !== undefined"
                      />

                      <ExecutionQuoteItemForm
                        :source="editItemSource"
                        :sub-stage-id="selectedQuoteStage?.subStageId ?? selectedQuoteStage?.id"
                        :editing-item="editItemState"
                        :loading="editingQuoteItemId !== undefined"
                        :clear-after-submit="false"
                        @add="submitQuoteItemUpdate"
                        @cancel-edit="updateEditDialogVisibility(false)"
                      />
                    </div>
                  </Dialog>

                  <ConfirmCancelDialog
                    v-model="showDeleteDialog"
                    :hasbtn="false"
                    :title="$t('execution_quote.show.delete_item_title')"
                    :message="$t('execution_quote.show.delete_item_message')"
                    :confirm-label="$t('confirm')"
                    :cancel-label="$t('common.cancel')"
                    confirm-theme="danger"
                    :disabled="deletingQuoteItemId !== undefined"
                    @confirm="deleteSelectedQuoteItem"
                    @cancel="cancelDeleteQuoteItem"
                  />
                </AccordionContent>
              </AccordionPanel>
            </Accordion>
          </details>
        </div>
      </template>

      <template #loader>
        <ExecutionQuoteShowSkeleton />
      </template>

      <template #initial>
        <ExecutionQuoteShowSkeleton />
      </template>
    </DataStatusBuilder>
  </StandardFormLayout>
</template>

<style scoped lang="scss">
@use 'workspace-glass' as glass;

.execution-quote-show {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.execution-quote-show__header,
.execution-quote-show__section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.execution-quote-show__header {
  animation: execution-quote-show-enter 340ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.execution-quote-show__header-actions {
  display: flex;
  flex: 0 0 auto;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.execution-quote-show h1,
.execution-quote-show h2,
.execution-quote-show p,
.execution-quote-show dl,
.execution-quote-show dd {
  margin: 0;
}

.execution-quote-show__header p,
.execution-quote-show__section-title p {
  color: var(--subtitle-color);
}

.execution-quote-show__eyebrow {
  color: var(--PrimaryColor);
  font-size: var(--xs-size);
  font-weight: 700;
}

.execution-quote-show :is(p, h1, h2, h3, dt, dd) {
  text-transform: none;
}

.execution-quote-show__content {
  display: grid;
  gap: 1rem;
}

.execution-quote-show__content > * {
  animation: none;
}

.workspace-project-details {
  border: 1px solid var(--quote-line, var(--border-weak));
  border-radius: var(--radius-md, 14px);
  background: var(--quote-paper, var(--bg-card));
  padding-block-end: 1.25rem;
}

.workspace-project-details:not([open]) {
  padding-block-end: 0;
}

.workspace-project-details > summary {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: inherit;
  cursor: pointer;
  background: var(--SecondaryColor);
  color: var(--secondary-text-color, var(--white));
  font-size: 1.25rem;
  font-weight: 600;
  list-style: none;
  transition: background-color 220ms ease;
}

.workspace-project-details > summary:hover {
  background: color-mix(
    in sRGB,
    var(--SecondaryColor),
    var(--secondary-text-color, var(--white)) 10%
  );
}

.workspace-project-details > summary::-webkit-details-marker {
  display: none;
}

.workspace-project-details__icon {
  display: grid;
  place-items: center;
  flex: 0 0 2.75rem;
  height: 2.75rem;
  border: 1px solid var(--PrimaryColor);
  border-radius: var(--radius-sm, 8px);
  color: color-mix(in sRGB, var(--PrimaryColor), var(--secondary-text-color, var(--white)) 65%);
}

.workspace-project-details__title {
  min-width: 0;
  overflow-wrap: anywhere;
}

.workspace-project-details__toggle {
  margin-inline-start: auto;
  flex-shrink: 0;
  color: color-mix(in sRGB, var(--PrimaryColor), var(--secondary-text-color, var(--white)) 65%);
  transition: transform 220ms ease;
}

.workspace-project-details[open] > summary {
  margin-block-end: 1.5rem;
  border-end-start-radius: 0;
  border-end-end-radius: 0;
}

.workspace-project-details[open] .workspace-project-details__toggle {
  transform: rotate(180deg);
}

.workspace-project-details > summary:focus-visible {
  outline: 2px solid
    color-mix(in sRGB, var(--PrimaryColor), var(--secondary-text-color, var(--white)) 65%);
  outline-offset: -4px;
}

.workspace-project-details > :not(summary) {
  margin-inline: 1.25rem;
}

@media (prefers-reduced-motion: reduce) {
  .workspace-project-details > summary,
  .workspace-project-details__toggle {
    transition: none;
  }
}

.execution-quote-show__content > :nth-child(1) {
  animation-delay: 50ms;
}

.execution-quote-show__content > :nth-child(2) {
  animation-delay: 100ms;
}

.execution-quote-show__content > :nth-child(3) {
  animation-delay: 150ms;
}

.execution-quote-show__content > :nth-child(4) {
  animation-delay: 200ms;
}

.execution-quote-show__hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  overflow: hidden;
  min-height: 11rem;
  padding: 2rem;
  border: 1px solid
    color-mix(in sRGB, var(--SecondaryColor), var(--secondary-text-color, var(--white)) 20%);
  border-radius: var(--radius-md, 14px);
  background: var(--SecondaryColor);
  color: var(--secondary-text-color, var(--white));
}

.execution-quote-show__hero-copy {
  position: relative;
  display: grid;
  flex: 1;
  min-width: 0;
  gap: 1.25rem;
}

.execution-quote-show__hero .execution-quote-show__badges {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.execution-quote-show__hero .execution-quote-show__badges span {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  border: 1px solid var(--bh-line);
  border-radius: var(--radius-full, 9999px);
  color: var(--bh-blue-ink);
  background: var(--bh-blue-soft);
  font-size: var(--bh-text-xs);
  font-weight: 600;
}

.execution-quote-show__hero .execution-quote-show__badges span:first-child {
  background: var(--PrimaryColor);
  color: var(--button-primary-color, var(--white));
}

.execution-quote-show .execution-quote-show__hero h2 {
  max-width: 24ch;
  margin: 0;
  color: var(--bh-text);
  font-family: var(--bh-font);
  font-size: var(--bh-text-page);
  font-weight: 700;
  line-height: 1.2;
  overflow-wrap: anywhere;
  text-wrap: balance;
}

.execution-quote-show__hero-parties {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem 2rem;
  max-width: 65ch;
  margin: 0;
  padding-block-start: 1.25rem;
  border-block-start: 1px solid var(--bh-line);
}

.execution-quote-show__hero-parties > div {
  min-width: 0;
}

.execution-quote-show .execution-quote-show__hero .execution-quote-show__hero-parties dt {
  margin-block-end: 0.4rem;
  color: var(--bh-muted);
  font-size: 0.8rem;
  font-weight: 600;
}

.execution-quote-show .execution-quote-show__hero .execution-quote-show__hero-parties dd {
  margin: 0;
  color: var(--bh-text);
  font-weight: 600;
  overflow-wrap: anywhere;
}

.execution-quote-show__hero-mark {
  display: grid;
  place-items: center;
  flex: 0 0 104px;
  height: 104px;
  border: 1px solid var(--PrimaryColor);
  border-radius: var(--radius-md, 14px);
  background: color-mix(
    in sRGB,
    var(--SecondaryColor),
    var(--secondary-text-color, var(--white)) 10%
  );
}

.execution-quote-show__hero-mark :deep(.page-header-icon) {
  flex: none;
  width: 84px;
  height: 84px;
  background: transparent;
  color: color-mix(in sRGB, var(--PrimaryColor), var(--secondary-text-color, var(--white)) 65%);
  animation: none;
}

.execution-quote-show__hero-mark :deep(.page-header-icon__path) {
  animation: none;
}

.workspace-project-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem 3rem;
  padding-block-end: 1.5rem;
}

.workspace-project-meta dt {
  color: var(--subtitle-color);
  font-size: 0.8rem;
}

.workspace-project-meta dd {
  padding-block-start: 0.4rem;
  font-weight: 600;
}

@media (max-width: 640px) {
  .execution-quote-show__hero {
    min-height: 0;
    padding: 1.25rem;
  }

  .execution-quote-show .execution-quote-show__hero h2 {
    font-size: var(--bh-text-page);
  }

  .execution-quote-show__hero-parties {
    grid-template-columns: minmax(0, 1fr);
  }

  .execution-quote-show__hero-mark {
    display: none;
  }

  .execution-quote-show__header-actions {
    display: flex;
    flex-wrap: nowrap;
  }

  .execution-quote-show__header-actions :deep(.app-btn) {
    width: auto;
    flex: 1;
    padding: 0.65rem 0.75rem;
    font-size: 0.75rem;
  }
}

.execution-quote-show__card {
  display: grid;
  gap: 1.25rem;
  padding: 1.25rem;
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-md);
  background: var(--bg-card);
  box-shadow: none;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast),
    transform var(--transition-fast);
}

.execution-quote-show__card:hover {
  border-color: var(--PrimaryColor-alpha-30);
  box-shadow: none;
  transform: translateY(-2px);
}

.execution-quote-show__sub-stage-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-block-end: 1px solid var(--border-weak);
  background: var(--bg-section);
}

.execution-quote-show__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.execution-quote-show__section-title {
  justify-content: flex-start;
}

.execution-quote-show__section-title h2 {
  color: color-mix(in sRGB, var(--SecondaryColor) 20%, var(--gray-800));
  font-size: 1.05rem;
}

.execution-quote-show__section-icon {
  display: grid;
  flex: 0 0 auto;
  width: 2.75rem;
  height: 2.75rem;
  place-items: center;
  border-radius: var(--radius-sm);
  background: var(--PrimaryColor-light);
  color: var(--PrimaryColor);
}

.execution-quote-show__status {
  margin-inline-start: auto;
  padding: 0.3rem 0.65rem;
  border-radius: var(--radius-full);
  background: var(--gray-100);
  color: var(--gray-600);
  font-size: var(--xs-size);
  font-weight: 700;
}

.execution-quote-show__status--active {
  background: var(--light-green-bg);
  color: var(--primary-green);
}

.execution-quote-show__details {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.execution-quote-show__details > div {
  display: grid;
  gap: 0.35rem;
  padding: 0.9rem;
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-sm);
  background: var(--bg-section);
  transition:
    border-color var(--transition-fast),
    background-color var(--transition-fast),
    transform var(--transition-fast);
}

.execution-quote-show__details > div:hover {
  border-color: var(--PrimaryColor-alpha-30);
  background: var(--bg-card);
  transform: translateY(-1px);
}

.execution-quote-show__details-wide {
  grid-column: 1 / -1;
}

.execution-quote-show__finance {
  overflow: hidden;
  border: 1px solid var(--PrimaryColor-alpha-20);
  border-radius: var(--radius-md);
  background: var(--bg-card);
  box-shadow: none;
}

.execution-quote-show__finance-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-block-end: 1px solid var(--PrimaryColor-alpha-12);
  background: var(--bh-surface);
}

.execution-quote-show__finance-header-icon,
.execution-quote-show__finance-value-icon {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  border-radius: var(--radius-sm);
}

.execution-quote-show__finance-header-icon {
  width: 2.5rem;
  height: 2.5rem;
  background: var(--PrimaryColor);
  color: var(--button-primary-color, var(--white));
}

.execution-quote-show__finance-header h3 {
  color: color-mix(in sRGB, var(--SecondaryColor) 20%, var(--gray-800));
  font-size: 0.95rem;
}

.execution-quote-show__finance-header p {
  margin-block-start: 0.15rem;
  color: var(--subtitle-color);
  font-size: var(--xs-size);
}

.execution-quote-show__finance-values {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.execution-quote-show__finance-values--supervision {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.execution-quote-show__finance-value {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 0.25rem 0.75rem;
  min-width: 0;
  padding: 1rem;
  transition:
    background-color var(--transition-fast),
    transform var(--transition-fast);
}

.execution-quote-show__finance-value + .execution-quote-show__finance-value {
  border-inline-start: 1px solid var(--border-weak);
}

.execution-quote-show__finance-value:hover {
  background: var(--bg-section);
  transform: translateY(-1px);
}

.execution-quote-show__finance-value--highlight {
  background: var(--PrimaryColor-alpha-4);
}

.execution-quote-show__finance-value--highlight:hover {
  background: var(--PrimaryColor-alpha-8);
}

.execution-quote-show__finance-value--percentage {
  background: var(--bg-section);
}

.execution-quote-show__finance-value--percentage .execution-quote-show__finance-value-icon {
  background: var(--PrimaryColor-light);
  color: var(--PrimaryColor);
}

.execution-quote-show__finance-value-icon {
  grid-row: 1 / 3;
  width: 2.75rem;
  height: 2.75rem;
  background: var(--bg-section);
  color: var(--subtitle-color);
  font-size: 1.05rem;
}

.execution-quote-show__finance-value--highlight .execution-quote-show__finance-value-icon {
  background: var(--PrimaryColor);
  color: var(--button-primary-color, var(--white));
}

.execution-quote-show__finance-value dt {
  color: var(--subtitle-color);
  font-weight: 700;
}

.execution-quote-show__finance-value dd {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.35rem;
}

.execution-quote-show__finance-value strong {
  color: color-mix(in sRGB, var(--SecondaryColor) 20%, var(--gray-800));
  font-size: clamp(1.2rem, 2.5vw, 1.6rem);
  font-weight: 900;
  line-height: 1.2;
}

.execution-quote-show__finance-value--highlight strong {
  color: var(--PrimaryColor);
}

.execution-quote-show__finance-value small {
  color: var(--subtitle-color);
  font-size: var(--xs-size);
  font-weight: 700;
}

.execution-quote-show dt {
  color: var(--subtitle-color);
  font-size: var(--xs-size);
}

.execution-quote-show dd {
  overflow-wrap: anywhere;
  color: color-mix(in sRGB, var(--SecondaryColor) 20%, var(--gray-800));
  font-weight: 700;
}

.execution-quote-show a {
  text-decoration: none;
}

.execution-quote-show a:focus-visible {
  outline: 3px solid var(--PrimaryColor-alpha-20);
  outline-offset: 2px;
}

.execution-quote-show a:hover {
  text-decoration: underline;
  text-underline-offset: 0.2rem;
}

.execution-quote-show__stage-list {
  display: grid;
  gap: 1rem;
}

.execution-quote-show__stages-accordion {
  overflow: hidden;
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-md);
  background: var(--bg-card);
  box-shadow: none;
}

.execution-quote-show__stages-accordion :deep(.p-collapsible-enter-active),
.execution-quote-show__stages-accordion :deep(.p-collapsible-leave-active) {
  display: grid;
  overflow: hidden;
  transition:
    grid-template-rows 320ms cubic-bezier(0.4, 0, 0.2, 1),
    opacity 220ms ease;
}

.execution-quote-show__stages-accordion :deep(.p-collapsible-enter-from),
.execution-quote-show__stages-accordion :deep(.p-collapsible-leave-to) {
  grid-template-rows: 0fr;
  opacity: 0;
}

.execution-quote-show__stages-accordion :deep(.p-collapsible-enter-to),
.execution-quote-show__stages-accordion :deep(.p-collapsible-leave-from) {
  grid-template-rows: 1fr;
  opacity: 1;
}

.execution-quote-show__stages-accordion :deep(.p-accordioncontent-wrapper) {
  min-height: 0;
  overflow: hidden;
}

.execution-quote-show__accordion-toggle {
  display: grid;
  flex: 0 0 2.5rem;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid var(--PrimaryColor-alpha-20);
  border-radius: var(--radius-full);
  background: var(--bg-card);
  color: var(--PrimaryColor);
  box-shadow: none;
  transition:
    color var(--transition-fast),
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    transform var(--transition-fast);
}

:deep(.execution-quote-show__stages-header:hover) .execution-quote-show__accordion-toggle,
:deep(.execution-quote-show__stage-accordion-header:hover) .execution-quote-show__accordion-toggle,
:deep(.execution-quote-show__stages-header[data-p-active='true'])
  .execution-quote-show__accordion-toggle,
:deep(.execution-quote-show__stage-accordion-header[data-p-active='true'])
  .execution-quote-show__accordion-toggle {
  border-color: var(--PrimaryColor);
  background: var(--PrimaryColor);
  color: var(--button-primary-color, var(--white));
  transform: translateY(-1px);
}

:deep(.execution-quote-show__stages-panel),
:deep(.execution-quote-show__stage-panel) {
  border: 0;
}

:deep(.execution-quote-show__stages-header) {
  padding: 1.25rem;
  background: var(--bg-card);
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

:deep(.execution-quote-show__stages-header) .execution-quote-show__section-title {
  flex: 1;
}

:deep(.execution-quote-show__stages-header:hover),
:deep(.execution-quote-show__stage-accordion-header:hover) {
  background: var(--PrimaryColor-alpha-8);
}

:deep(.execution-quote-show__stages-header:focus-visible),
:deep(.execution-quote-show__stage-accordion-header:focus-visible) {
  z-index: 1;
  outline: 3px solid var(--PrimaryColor-alpha-20);
  outline-offset: -3px;
}

:deep(.execution-quote-show__stages-content > .p-accordioncontent-content) {
  padding: 0 1.25rem 1.25rem;
}

.execution-quote-show__stages-actions,
.execution-quote-show__stage-actions {
  display: flex;
  justify-content: flex-end;
}

.execution-quote-show__stages-actions {
  padding-block-end: 1rem;
}

:deep(.execution-quote-show__stage-panel) {
  overflow: hidden;
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-md);
  background: var(--bg-section);
  transition:
    border-color 280ms ease,
    box-shadow 280ms ease;
}

:deep(.execution-quote-show__stage-panel.p-accordionpanel-active) {
  border-color: var(--PrimaryColor);
  box-shadow: none;
}

:deep(.execution-quote-show__stage-accordion-header) {
  min-height: 5.5rem;
  padding: 1rem 1.15rem;
  background: var(--bg-section);
  color: color-mix(in sRGB, var(--SecondaryColor) 20%, var(--gray-800));
  cursor: pointer;
  transition:
    color var(--transition-fast),
    background-color var(--transition-fast);
}

:deep(.execution-quote-show__stage-accordion-header[data-p-active='true']) {
  border-block-end: 1px solid var(--PrimaryColor-alpha-20);
  background: var(--PrimaryColor-alpha-8);
}

:deep(.execution-quote-show__stage-accordion-header[data-p-active='true'])
  .execution-quote-show__stage-header
  h3 {
  color: var(--PrimaryColor);
}

:deep(.execution-quote-show__stage-content > .p-accordioncontent-content) {
  display: grid;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-card);
}

.execution-quote-show__stage-header {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-around;
  gap: 1rem;
}

.execution-quote-show__stage-header h3,
.execution-quote-show__stage-header span {
  margin: 0;
}

.execution-quote-show__stage-header > div:first-child > span {
  color: var(--subtitle-color);
  font-size: var(--xs-size);
}

.execution-quote-show__stage-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.execution-quote-show__stage-badges > span {
  padding: 0.35rem 0.7rem;
  border-radius: var(--radius-full);
  background: var(--PrimaryColor-light);
  color: var(--PrimaryColor);
  font-size: var(--xs-size);
  font-weight: 700;
}

.execution-quote-show__stage-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.execution-quote-show__stage-badge-label {
  color: var(--subtitle-color);
  font-weight: 500;
}

.execution-quote-show__stage-badge-value {
  color: var(--PrimaryColor);
  font-weight: 700;
}

.execution-quote-show__items-table-wrap {
  overflow-x: auto;
  border: 1px solid var(--border-weak);
  border-radius: var(--bh-radius-card);
  background: var(--bg-card);
}

.execution-quote-show__items-table {
  width: 100%;
  border-collapse: collapse;
  text-align: start;
}

.execution-quote-show__items-table th,
.execution-quote-show__items-table td {
  padding: 0.85rem;
  border-block-end: 1px solid var(--border-weak);
  text-align: start;
  white-space: nowrap;
}

.execution-quote-show__items-table th {
  background: var(--bg-section);
  color: var(--subtitle-color);
  font-size: var(--xs-size);
}

.execution-quote-show__items-table tbody td {
  transition: background-color var(--transition-fast);
}

.execution-quote-show__items-table tbody tr:hover td {
  background: var(--PrimaryColor-alpha-4);
}

.execution-quote-show__items-table tbody tr:last-child td {
  border-block-end: 0;
}

.execution-quote-show__item-total {
  color: var(--PrimaryColor);
  font-weight: 800;
}

.execution-quote-show__item-actions,
.execution-quote-show__edit-dialog-header {
  display: flex;
  align-items: center;
}

.execution-quote-show__item-actions {
  gap: 0.4rem;
}

.execution-quote-show__item-action {
  flex: 0 0 auto;
}

:deep(.execution-quote-show__edit-dialog) {
  width: min(64rem, calc(100vw - 2rem));
}

.execution-quote-show__edit-dialog-header {
  gap: 0.75rem;
}

.execution-quote-show__edit-dialog-header > span {
  display: grid;
  flex: 0 0 2.5rem;
  width: 2.5rem;
  height: 2.5rem;
  place-items: center;
  border-radius: var(--radius-sm);
  background: var(--PrimaryColor-light);
  color: var(--PrimaryColor);
}

.execution-quote-show__edit-dialog-header h2 {
  margin: 0;
  color: color-mix(in sRGB, var(--SecondaryColor) 20%, var(--gray-800));
  font-size: 1.1rem;
}

.execution-quote-show__edit-form {
  display: grid;
  gap: 1rem;
}

.execution-quote-show__itemable-type {
  display: grid;
  gap: 0.45rem;
  padding: 0.9rem;
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-sm);
  background: var(--bg-section);
  color: color-mix(in sRGB, var(--SecondaryColor) 20%, var(--gray-800));
}

.execution-quote-show__itemable-type span {
  color: var(--subtitle-color);
  font-size: var(--xs-size);
}

.execution-quote-show__empty-items {
  padding: 1rem;
  border-radius: var(--radius-sm);
  background: var(--bg-section);
  color: var(--subtitle-color);
  text-align: center;
}

@keyframes execution-quote-show-enter {
  from {
    opacity: 0;
    transform: translateY(0.75rem);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 640px) {
  .execution-quote-show__header,
  .execution-quote-show__hero {
    align-items: stretch;
    flex-direction: column;
  }

  .execution-quote-show__header-actions {
    display: grid;
    grid-template-columns: 1fr;
    width: 100%;
  }

  .execution-quote-show__header-actions :deep(.app-btn) {
    width: 100%;
  }

  .execution-quote-show__stages-actions :deep(.app-btn),
  .execution-quote-show__stage-actions :deep(.app-btn) {
    width: 100%;
  }

  .execution-quote-show__grid,
  .execution-quote-show__details,
  .execution-quote-show__finance-values {
    grid-template-columns: 1fr;
  }

  .execution-quote-show__finance-value + .execution-quote-show__finance-value {
    border-block-start: 1px solid var(--border-weak);
    border-inline-start: 0;
  }

  .execution-quote-show__stage-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .execution-quote-show__details-wide {
    grid-column: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .execution-quote-show__header,
  .execution-quote-show__content > * {
    animation: none;
  }

  .execution-quote-show__hero,
  .execution-quote-show__hero::after,
  .execution-quote-show__card,
  .execution-quote-show__accordion-toggle,
  .execution-quote-show__details > div,
  .execution-quote-show__finance-value,
  .execution-quote-show__items-table tbody td,
  :deep(.execution-quote-show__stages-header),
  :deep(.execution-quote-show__stage-accordion-header),
  .execution-quote-show__stages-accordion :deep(.p-collapsible-enter-active),
  .execution-quote-show__stages-accordion :deep(.p-collapsible-leave-active),
  .execution-quote-show__stages-accordion :deep(.p-accordionheader-toggle-icon),
  :deep(.execution-quote-show__stage-panel) {
    transition: none;
  }

  .execution-quote-show__hero:hover::after,
  .execution-quote-show__card:hover,
  .execution-quote-show__details > div:hover,
  .execution-quote-show__finance-value:hover {
    transform: none;
  }
}

@media (max-width: 640px) {
  .execution-quote-show__header-actions {
    flex-wrap: nowrap;
  }

  .execution-quote-show__header-actions :deep(.app-btn) {
    width: auto;
    flex: 1;
    padding: 0.65rem 0.75rem;
    font-size: 0.75rem;
  }
}

.workspace-project-details .workspace-project-meta {
  gap: 1rem 3rem;
  padding-block-end: 1.25rem;
  margin-block-end: 1.25rem;
  border-block-end: 1px solid var(--quote-line, var(--border-weak));
}

.workspace-project-details .workspace-project-meta dt,
.workspace-project-details .execution-quote-show__details dt {
  color: var(--quote-muted, var(--subtitle-color));
  font-size: 0.8rem;
  font-weight: 600;
}

.workspace-project-details .workspace-project-meta dd,
.workspace-project-details .execution-quote-show__details dd {
  color: color-mix(in sRGB, var(--SecondaryColor) 20%, var(--gray-800));
  font-weight: 600;
  overflow-wrap: anywhere;
}

.workspace-project-details .execution-quote-show__card {
  align-content: start;
  border-color: var(--quote-line, var(--border-weak));
  background: var(--bg-card);
  box-shadow: none;
  transform: none;
}

.workspace-project-details .execution-quote-show__section-title h2 {
  color: color-mix(in sRGB, var(--SecondaryColor) 20%, var(--gray-800));
  font-size: 1.25rem;
}

.workspace-project-details .execution-quote-show__section-icon {
  background: var(--SecondaryColor);
  color: color-mix(in sRGB, var(--PrimaryColor), var(--secondary-text-color, var(--white)) 65%);
}

.workspace-project-details .execution-quote-show__details > div {
  padding: 0.75rem 0;
  border: 0;
  border-block-end: 1px solid var(--quote-line, var(--border-weak));
  border-radius: 0;
  background: transparent;
  transform: none;
}

@media (max-width: 640px) {
  .workspace-project-details > summary {
    gap: 0.75rem;
    padding: 1rem;
    font-size: 1.1rem;
  }

  .workspace-project-details > :not(summary) {
    margin-inline: 1rem;
  }

  .workspace-project-details .execution-quote-show__section-title h2 {
    font-size: 1.1rem;
  }
}

.execution-quote-show .execution-quote-show__hero {
  min-height: 0;
  padding: var(--bh-space-6);
  border-radius: var(--bh-radius-card);
  color: var(--bh-text);

  @include glass.surface;

  @media (max-width: 767px) {
    padding: var(--bh-space-5) var(--bh-space-4);
  }
}

.execution-quote-show .execution-quote-show__hero h2,
.execution-quote-show .execution-quote-show__hero dd {
  color: var(--bh-text);
}

.execution-quote-show .execution-quote-show__hero dt {
  color: var(--bh-muted);
}

.execution-quote-show .execution-quote-show__hero-mark {
  display: none;
}

.execution-quote-show .workspace-project-details {
  border: 0;
  border-radius: var(--bh-radius-card);
  background: var(--bh-surface);
}

.execution-quote-show .workspace-project-details > summary {
  color: var(--bh-text);
  background: var(--bh-surface);
  border: 0;
  border-radius: var(--bh-radius-card);
}

.execution-quote-show .workspace-project-details__icon,
.execution-quote-show .workspace-project-details__toggle {
  color: var(--bh-blue-ink);
  border: 0;
  background: var(--bh-blue-soft);
  border-radius: 50%;
}

.execution-quote-show .execution-quote-show__stage-card {
  border-color: var(--bh-line);
  border-radius: var(--bh-radius-card);
  background: var(--bh-surface);
  box-shadow: none;
}
</style>
