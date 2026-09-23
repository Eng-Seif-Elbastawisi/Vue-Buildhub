<script setup lang="ts">
  import { computed, onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRoute } from 'vue-router';

  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';

  import {
    ExecutionQuoteTypeEnum,
    getExecutionQuoteTypeTitleKey,
    type ExecutionQuoteType,
  } from '../../core/constants/execution.quote.type.enum';
  import { getQuoteSourceTitleKey } from '../../core/constants/quote.source.enum';
  import type ExecutionQuoteShowModel from '../../core/models/execution.quote.show.model';
  import ShowExecutionQuoteParams from '../../core/params/show.execution.quote.params';
  import ExecutionQuoteController from '../controllers/execution.quote.controller';

  const route = useRoute();
  const controller = ExecutionQuoteController.getInstance();
  const { locale, t } = useI18n();

  const state = computed(() => controller.itemState.value);
  const quoteId = computed(() => Number(route.params.id));

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

      <AppButton
        :to="{ name: 'Execution Quotes' }"
        theme="secondary"
        outline
        icon="left"
      >
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
                <span>
                  {{ quoteSourceLabel(quote) }}
                </span>
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
              <small>#{{ quote.quoteType?.id ?? '—' }}</small>
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
                  <dt>{{ $t('execution_quote.show.email') }}</dt>
                  <dd>
                    <a v-if="quote.client?.email" :href="`mailto:${quote.client.email}`">
                      {{ quote.client.email }}
                    </a>
                    <template v-else>—</template>
                  </dd>
                </div>
                <div>
                  <dt>{{ $t('execution_quote.show.address') }}</dt>
                  <dd>{{ quote.client?.address ?? '—' }}</dd>
                </div>
              </dl>
            </section>
          </div>

          <section class="execution-quote-show__card execution-quote-show__ownership">
            <div class="execution-quote-show__section-title">
              <span class="execution-quote-show__section-icon">
                <i class="pi pi-sitemap" aria-hidden="true"></i>
              </span>
              <div>
                <h2>{{ $t('execution_quote.show.ownership_section') }}</h2>
                <p>{{ $t('execution_quote.show.ownership_section_hint') }}</p>
              </div>
            </div>

            <dl class="execution-quote-show__ownership-grid">
              <div>
                <dt>{{ $t('execution_quote.show.organization') }}</dt>
                <dd>{{ quote.organization?.name ?? '—' }}</dd>
                <small>{{ quote.organization?.address ?? '—' }}</small>
              </div>
              <div>
                <dt>{{ $t('execution_quote.show.created_by') }}</dt>
                <dd>{{ quote.employee?.name ?? '—' }}</dd>
                <small>#{{ quote.employee?.id ?? '—' }}</small>
              </div>
              <div>
                <dt>{{ $t('execution_quote.fields.price_employee') }}</dt>
                <dd>{{ quote.priceEmployee?.name ?? '—' }}</dd>
                <small>#{{ quote.priceEmployee?.id ?? '—' }}</small>
              </div>
              <div>
                <dt>{{ $t('execution_quote.show.client_owner') }}</dt>
                <dd>{{ quote.client?.employee?.name ?? '—' }}</dd>
                <small>#{{ quote.client?.employee?.id ?? '—' }}</small>
              </div>
            </dl>
          </section>
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

  .execution-quote-show__hero-copy > p,
  .execution-quote-show__created {
    color: var(--white-alpha-75);
  }

  .execution-quote-show__created strong {
    color: var(--white);
  }

  .execution-quote-show__type-card {
    display: grid;
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
    font-size: var(--xl-size);
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

  .execution-quote-show__details,
  .execution-quote-show__ownership-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
  }

  .execution-quote-show__details > div,
  .execution-quote-show__ownership-grid > div {
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

  .execution-quote-show dt,
  .execution-quote-show__ownership-grid small {
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

  .execution-quote-show__ownership-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  @media (max-width: 900px) {
    .execution-quote-show__ownership-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    .execution-quote-show__header,
    .execution-quote-show__hero {
      align-items: stretch;
      flex-direction: column;
    }

    .execution-quote-show__grid,
    .execution-quote-show__details,
    .execution-quote-show__ownership-grid {
      grid-template-columns: 1fr;
    }

    .execution-quote-show__details-wide {
      grid-column: auto;
    }
  }
</style>
