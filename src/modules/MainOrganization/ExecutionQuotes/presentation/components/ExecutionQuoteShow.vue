<script setup lang="ts">
import Accordion from 'primevue/accordion';
import AccordionContent from 'primevue/accordioncontent';
import AccordionHeader from 'primevue/accordionheader';
import AccordionPanel from 'primevue/accordionpanel';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import { ClientTypeEnum } from '@/modules/MainOrganization/client/core/constant/client.type.enum';
import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
import AppButton from '@/shared/HelpersComponents/AppButton.vue';

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
import type {
  ExecutionQuoteStageItemSummary,
  ExecutionQuoteStageSummary,
} from '../../core/models/execution.quote.show.model';
import ShowExecutionQuoteParams from '../../core/params/show.execution.quote.params';
import ExecutionQuoteController from '../controllers/execution.quote.controller';

const route = useRoute();
const controller = ExecutionQuoteController.getInstance();
const { locale, t } = useI18n();

const state = computed(() => controller.itemState.value);
const quoteId = computed(() => Number(route.params.id));
const activeShowSection = ref('stages');
const activeQuoteStages = ref<string[]>(['0']);

const fetchQuote = async () => {
  if (!Number.isInteger(quoteId.value) || quoteId.value <= 0) return;

  await controller.fetchOne(new ShowExecutionQuoteParams({ executionQuoteId: quoteId.value }));
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

const itemSourceLabel = (quoteItem: ExecutionQuoteStageItemSummary) => {
  const itemSource = quoteItem.itemType as ExecutionQuoteItemSource | undefined;
  const isKnownSource =
    itemSource && Object.values(ExecutionQuoteItemSourceEnum).includes(itemSource);

  return isKnownSource
    ? t(getExecutionQuoteItemSourceTitleKey(itemSource))
    : (quoteItem.itemableType ?? '—');
};

const formatNumber = (rawNumber: number | undefined) => {
  if (rawNumber === undefined) return '—';

  return new Intl.NumberFormat(locale.value, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(rawNumber);
};

const itemTotal = (quoteItem: ExecutionQuoteStageItemSummary) => {
  if (quoteItem.expectedPrice === undefined || quoteItem.quantity === undefined) return undefined;
  return quoteItem.expectedPrice * quoteItem.quantity;
};

const stageTotal = (quoteStage: ExecutionQuoteStageSummary) => {
  if (quoteStage.totalPrice !== undefined) return quoteStage.totalPrice;

  return quoteStage.items.reduce(
    (total, quoteItem) => total + (itemTotal(quoteItem) ?? 0),
    0,
  );
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

onMounted(fetchQuote);
</script>

<template>
  <section class="execution-quote-show">
    <header class="execution-quote-show__header">
      <div>
        <span class="execution-quote-show__eyebrow">
          {{ $t('execution_quote.show.eyebrow', { id: quoteId }) }}
        </span>
        <h1>{{ $t('execution_quote.show.title') }}</h1>
        <p>{{ $t('execution_quote.show.description') }}</p>
      </div>

      <AppButton :to="{ name: 'Execution Quotes' }" theme="secondary" outline icon="left">
        <template #icon>
          <i class="pi pi-arrow-right" aria-hidden="true"></i>
        </template>
        {{ $t('execution_quote.show.back') }}
      </AppButton>
    </header>

    <DataStatusBuilder :controller="state" :on-retry="fetchQuote" use-skeleton>
      <template #success="{ data: quote }">
        <div class="execution-quote-show__content">
          <section class="execution-quote-show__hero">
            <div class="execution-quote-show__hero-copy">
              <div class="execution-quote-show__badges">
                <span>
                  <i class="pi pi-file" aria-hidden="true"></i>
                  {{ $t('execution_quote.show.eyebrow', { id: quote.id }) }}
                </span>
                <span> {{ quoteSourceLabel(quote) }} </span>
              </div>

              <h2>{{ quote.project?.title ?? $t('execution_quote.show.project_fallback') }}</h2>
              <p>
                {{ quote.client?.name ?? '—' }}
                <span aria-hidden="true">•</span>
                {{ quote.organization?.name ?? '—' }}
              </p>

              <div class="execution-quote-show__created">
                <i class="pi pi-calendar" aria-hidden="true"></i>
                <span>{{ $t('execution_quote.show.created_at') }}</span>
                <strong>{{ formatDateTime(quote.createdAt) }}</strong>
              </div>
            </div>

            <div class="execution-quote-show__type-card">
              <span>{{ $t('execution_quote.fields.quote_type') }}</span>
              <strong>{{ quoteTypeLabel(quote) }}</strong>
            </div>
          </section>

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
                <span class="execution-quote-show__status" :class="{
                  'execution-quote-show__status--active': quote.client?.status === 1,
                }">
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

          <Accordion v-model:value="activeShowSection" class="execution-quote-show__stages-accordion">
            <AccordionPanel value="stages" class="execution-quote-show__stages-panel">
              <AccordionHeader class="execution-quote-show__stages-header">
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
                <Accordion v-if="quote.quoteStages.length" v-model:value="activeQuoteStages" multiple
                  class="execution-quote-show__stage-list">
                  <AccordionPanel v-for="(stage, stageIndex) in quote.quoteStages"
                    :key="stage.id ?? `${stage.stageId}-${stage.subStageId}`" :value="stageIndex.toString()"
                    class="execution-quote-show__stage-panel">
                    <AccordionHeader class="execution-quote-show__stage-accordion-header">
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
                              {{ stage.subStage?.title }}
                            </strong>
                          </span>
                          <!-- <span>
                            {{ $t('execution_quote.show.stage_record') }} #{{ stage.id ?? '—' }}
                          </span> -->
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

                    <AccordionContent class="execution-quote-show__stage-content">
                      <!-- <dl class="execution-quote-show__stage-meta"> -->
                      <!-- <div>
                          <dt>{{ $t('execution_quote.show.quote_reference') }}</dt>
                          <dd>#{{ stage.quoteId ?? '—' }}</dd>
                        </div> -->
                      <!-- <div>
                          <dt>{{ $t('execution_quote.show.project_reference') }}</dt>
                          <dd>#{{ stage.projectId ?? '—' }}</dd>
                        </div> -->
                      <!-- <div>
                          <dt>{{ $t('execution_quote.show.stage_created_at') }}</dt>
                          <dd>{{ formatDateTime(stage.createdAt) }}</dd>
                        </div> -->
                      <!-- </dl> -->

                      <div v-if="stage.items.length" class="execution-quote-show__items-table-wrap">
                        <table class="execution-quote-show__items-table">
                          <thead>
                            <tr>
                              <th scope="col">{{ $t('execution_quote.show.item') }}</th>
                              <th scope="col">{{ $t('execution_quote.show.item_source') }}</th>
                              <th scope="col">{{ $t('execution_quote.show.itemable_type') }}</th>
                              <th scope="col">{{ $t('execution_quote.show.expected_price') }}</th>
                              <th scope="col">{{ $t('execution_quote.show.quantity') }}</th>
                              <th scope="col">{{ $t('execution_quote.show.total') }}</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="quoteItem in stage.items" :key="quoteItem.id ?? quoteItem.itemableId">
                              <td>
                                <strong>{{ quoteItem.itemable?.title ?? '—' }}</strong>
                                <small>
                                  #{{ quoteItem.id ?? '—' }} ·
                                  {{ $t('execution_quote.show.itemable_id') }} #{{
                                    quoteItem.itemableId ?? '—'
                                  }}
                                </small>
                              </td>
                              <td>
                                {{ itemSourceLabel(quoteItem) }}
                              </td>
                              <td>{{ quoteItem.itemableType ?? '—' }}</td>
                              <td>{{ formatNumber(quoteItem.expectedPrice) }}</td>
                              <td>{{ formatNumber(quoteItem.quantity) }}</td>

                              <td class="execution-quote-show__item-total">
                                {{ formatNumber(itemTotal(quoteItem)) }}
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
              </AccordionContent>
            </AccordionPanel>
          </Accordion>
        </div>
      </template>
    </DataStatusBuilder>
  </section>
</template>

<style scoped lang="scss">
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

.execution-quote-show__content {
  display: grid;
  gap: 1rem;
}

.execution-quote-show__hero {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
  overflow: hidden;
  min-height: 15rem;
  padding: clamp(1.25rem, 4vw, 2.5rem);
  border-radius: var(--radius-md);
  background: var(--gray-950);
  color: var(--white);
  box-shadow: var(--shadow-md);
}

.execution-quote-show__hero::after {
  position: absolute;
  inset-block-start: -7rem;
  inset-inline-end: -5rem;
  width: 16rem;
  height: 16rem;
  border: 2.2rem solid var(--PrimaryColor-alpha-30);
  border-radius: var(--radius-full);
  content: '';
}

.execution-quote-show__hero-copy,
.execution-quote-show__type-card {
  position: relative;
  z-index: 1;
}

.execution-quote-show__hero-copy {
  display: grid;
  gap: 1rem;
}

.execution-quote-show__badges,
.execution-quote-show__created {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.execution-quote-show__badges span {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.7rem;
  border-radius: var(--radius-full);
  background: var(--white-alpha-15);
  color: var(--white);
  font-size: var(--xs-size);
  font-weight: 700;
}

.execution-quote-show__hero h2 {
  font-size: clamp(1.8rem, 4vw, 3rem);
}

.execution-quote-show__hero-copy>p,
.execution-quote-show__created {
  color: var(--white-alpha-75);
}

.execution-quote-show__created strong {
  color: var(--white);
}

.execution-quote-show__type-card {
  display: grid;
  place-items: center;
  min-width: min(100%, 14rem);
  gap: 0.4rem;
  padding: 1.15rem;
  border: 1px solid var(--white-alpha-20);
  border-radius: var(--radius-md);
  background: var(--white-alpha-15);
}

.execution-quote-show__type-card span,
.execution-quote-show__type-card small {
  color: var(--white-alpha-75);
}

.execution-quote-show__type-card strong {
  color: var(--PrimaryColor);
  font-size: var(--xl-size-1);
}

.execution-quote-show__card {
  display: grid;
  gap: 1.25rem;
  padding: 1.25rem;
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-md);
  background: var(--bg-card);
  box-shadow: var(--shadow-sm);
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
  color: var(--title-card-color);
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

.execution-quote-show__details>div {
  display: grid;
  gap: 0.35rem;
  padding: 0.9rem;
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-sm);
  background: var(--bg-section);
}

.execution-quote-show__details-wide {
  grid-column: 1 / -1;
}

.execution-quote-show dt {
  color: var(--subtitle-color);
  font-size: var(--xs-size);
}

.execution-quote-show dd {
  overflow-wrap: anywhere;
  color: var(--title-card-color);
  font-weight: 700;
}

.execution-quote-show a {
  color: var(--PrimaryColor);
  text-decoration: none;
}

.execution-quote-show a:focus-visible {
  outline: 3px solid var(--PrimaryColor-alpha-20);
  outline-offset: 2px;
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
  box-shadow: var(--shadow-sm);
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

.execution-quote-show__stages-accordion :deep(.p-accordionheader-toggle-icon) {
  transition: transform 280ms cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.execution-quote-show__stages-panel),
:deep(.execution-quote-show__stage-panel) {
  border: 0;
}

:deep(.execution-quote-show__stages-header) {
  padding: 1.25rem;
  background: var(--bg-card);
}

:deep(.execution-quote-show__stages-header) .execution-quote-show__section-title {
  flex: 1;
}

:deep(.execution-quote-show__stages-header:hover),
:deep(.execution-quote-show__stage-accordion-header:hover) {
  background: var(--PrimaryColor-alpha-4);
}

:deep(.execution-quote-show__stages-content > .p-accordioncontent-content) {
  padding: 0 1.25rem 1.25rem;
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
  border-color: var(--PrimaryColor-alpha-30);
  box-shadow: var(--shadow-sm);
}

:deep(.execution-quote-show__stage-accordion-header) {
  padding: 1rem;
  background: var(--bg-section);
}

:deep(.execution-quote-show__stage-content > .p-accordioncontent-content) {
  display: grid;
  gap: 1rem;
  padding: 0 1rem 1rem;
}

.execution-quote-show__stage-header {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.execution-quote-show__stage-header h3,
.execution-quote-show__stage-header span {
  margin: 0;
}

.execution-quote-show__stage-header>div:first-child>span,
.execution-quote-show__stage-meta dt,
.execution-quote-show__items-table small {
  color: var(--subtitle-color);
  font-size: var(--xs-size);
}

.execution-quote-show__stage-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.execution-quote-show__stage-badges>span {
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

.execution-quote-show__stage-meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.execution-quote-show__stage-meta>div {
  display: grid;
  gap: 0.25rem;
  padding: 0.75rem;
  border-radius: var(--radius-sm);
  background: var(--bg-card);
}

.execution-quote-show__items-table-wrap {
  overflow-x: auto;
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-sm);
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

.execution-quote-show__items-table td:first-child {
  display: grid;
  gap: 0.25rem;
  white-space: normal;
}

.execution-quote-show__items-table tbody tr:last-child td {
  border-block-end: 0;
}

.execution-quote-show__item-total {
  color: var(--PrimaryColor);
  font-weight: 800;
}

.execution-quote-show__empty-items {
  padding: 1rem;
  border-radius: var(--radius-sm);
  background: var(--bg-section);
  color: var(--subtitle-color);
  text-align: center;
}

@media (max-width: 640px) {

  .execution-quote-show__header,
  .execution-quote-show__hero {
    align-items: stretch;
    flex-direction: column;
  }

  .execution-quote-show__grid,
  .execution-quote-show__details,
  .execution-quote-show__stage-meta {
    grid-template-columns: 1fr;
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

  .execution-quote-show__stages-accordion :deep(.p-collapsible-enter-active),
  .execution-quote-show__stages-accordion :deep(.p-collapsible-leave-active),
  .execution-quote-show__stages-accordion :deep(.p-accordionheader-toggle-icon),
  :deep(.execution-quote-show__stage-panel) {
    transition: none;
  }
}
</style>
