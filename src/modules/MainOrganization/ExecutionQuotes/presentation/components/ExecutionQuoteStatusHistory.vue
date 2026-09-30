<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import type { DataState } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
import AppButton from '@/shared/HelpersComponents/AppButton.vue';

import type QuoteStatusModel from '../../core/models/quote.status.model';
import QuoteStatusBadge from './QuoteStatusBadge.vue';

defineProps<{
  state: DataState<QuoteStatusModel[]>;
}>();

const emit = defineEmits<{
  (event: 'retry'): void;
}>();

const { locale, t } = useI18n();

const formatDateTime = (rawDate?: string) => {
  if (!rawDate) return '—';

  const date = new Date(rawDate.includes(' ') ? rawDate.replace(' ', 'T') : rawDate);
  if (Number.isNaN(date.getTime())) return rawDate;

  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};
</script>

<template>
  <section class="execution-quote-history" aria-labelledby="execution-quote-history-title">
    <header class="execution-quote-history__header">
      <span class="execution-quote-history__icon" aria-hidden="true">
        <i class="pi pi-history"></i>
      </span>
      <div>
        <h2 id="execution-quote-history-title">
          {{ t('execution_quote.show.status_history') }}
        </h2>
        <p>{{ t('execution_quote.show.status_history_hint') }}</p>
      </div>
    </header>

    <DataStatusBuilder :controller="state" @retry="emit('retry')">
      <template #success="{ data: histories }">
        <ol v-if="histories?.length" class="execution-quote-history__timeline">
          <li v-for="history in histories" :key="history.id ?? history.createdAt">
            <span class="execution-quote-history__marker" aria-hidden="true"></span>
            <div class="execution-quote-history__entry">
              <div class="execution-quote-history__entry-header">
                <div class="execution-quote-history__transition">
                  <QuoteStatusBadge :status="history.fromStatus" />
                  <i :class="locale.startsWith('ar') ? 'pi pi-arrow-left' : 'pi pi-arrow-right'" aria-hidden="true"></i>
                  <QuoteStatusBadge :status="history.toStatus" />
                </div>
                <div class="execution-quote-history__meta">
                  <span v-if="history.employee?.name">
                    <i class="pi pi-user" aria-hidden="true"></i>
                    {{
                      t('execution_quote.show.status_history_employee', {
                        name: history.employee.name,
                      })
                    }}
                  </span>
                  <time :datetime="history.createdAt">
                    {{ formatDateTime(history.createdAt) }}
                  </time>
                </div>
              </div>
              <p v-if="history.note">{{ history.note }}</p>
            </div>
          </li>
        </ol>

        <div v-else class="execution-quote-history__empty">
          <i class="pi pi-clock" aria-hidden="true"></i>
          <p>{{ t('execution_quote.show.status_history_empty') }}</p>
        </div>
      </template>

      <template #loader>
        <div class="execution-quote-history__loading" role="status" aria-busy="true">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </template>

      <template #initial>
        <div class="execution-quote-history__loading" role="status" aria-busy="true">
          <span></span>
          <span></span>
        </div>
      </template>

      <template #failed="{ error }">
        <div class="execution-quote-history__error" role="alert">
          <p>{{ error?.displayMessage ?? t('execution_quote.show.status_history_failed') }}</p>
          <AppButton size="sm" theme="secondary" outline @click="emit('retry')">
            {{ t('try_again') }}
          </AppButton>
        </div>
      </template>
    </DataStatusBuilder>
  </section>
</template>

<style scoped lang="scss">
.execution-quote-history {
  display: grid;
  gap: 1.25rem;
  padding: 1.25rem;
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-md);
  background: var(--bg-card);
  box-shadow: var(--shadow-sm);
}

.execution-quote-history__header,
.execution-quote-history__entry-header,
.execution-quote-history__transition,
.execution-quote-history__meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.execution-quote-history__header h2,
.execution-quote-history__header p,
.execution-quote-history__entry p,
.execution-quote-history__empty p,
.execution-quote-history__error p {
  margin: 0;
}

.execution-quote-history__header h2 {
  color: var(--title-card-color);
  font-size: 1.05rem;
}

.execution-quote-history__header p,
.execution-quote-history__entry time,
.execution-quote-history__empty,
.execution-quote-history__error {
  color: var(--subtitle-color);
}

.execution-quote-history__icon {
  display: grid;
  flex: 0 0 2.75rem;
  width: 2.75rem;
  height: 2.75rem;
  place-items: center;
  border-radius: var(--radius-sm);
  background: var(--PrimaryColor-light);
  color: var(--PrimaryColor);
}

.execution-quote-history__timeline {
  display: grid;
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.execution-quote-history__timeline li {
  position: relative;
  display: grid;
  grid-template-columns: 1rem minmax(0, 1fr);
  gap: 0.75rem;
}

.execution-quote-history__timeline li:not(:last-child)::after {
  position: absolute;
  inset-block: 1rem -1rem;
  inset-inline-start: 0.4375rem;
  width: 2px;
  background: var(--border-weak);
  content: '';
}

.execution-quote-history__marker {
  z-index: 1;
  width: 0.9rem;
  height: 0.9rem;
  margin-block-start: 1rem;
  border: 3px solid var(--bg-card);
  border-radius: var(--radius-full);
  background: var(--PrimaryColor);
  box-shadow: 0 0 0 1px var(--PrimaryColor-alpha-30);
}

.execution-quote-history__entry {
  display: grid;
  gap: 0.65rem;
  padding: 0.85rem;
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-sm);
  background: var(--bg-section);
}

.execution-quote-history__entry-header {
  justify-content: space-between;
}

.execution-quote-history__meta {
  flex-wrap: wrap;
  justify-content: flex-end;
  color: var(--subtitle-color);
  font-size: var(--xs-size);
}

.execution-quote-history__meta span {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.execution-quote-history__transition>i {
  color: var(--subtitle-color);
  font-size: var(--xs-size);
}

.execution-quote-history__entry time {
  font-size: var(--xs-size);
}

.execution-quote-history__entry p {
  color: var(--title-card-color);
}

.execution-quote-history__empty,
.execution-quote-history__error {
  display: grid;
  place-items: center;
  gap: 0.75rem;
  min-height: 7rem;
  padding: 1rem;
  border-radius: var(--radius-sm);
  background: var(--bg-section);
  text-align: center;
}

.execution-quote-history__empty i {
  font-size: 1.5rem;
}

.execution-quote-history__loading {
  display: grid;
  gap: 0.75rem;
}

.execution-quote-history__loading span {
  display: block;
  height: 4.5rem;
  border-radius: var(--radius-sm);
  background: var(--bg-section);
  animation: execution-quote-history-pulse 1.2s ease-in-out infinite alternate;
}

@keyframes execution-quote-history-pulse {
  from {
    opacity: 0.45;
  }

  to {
    opacity: 1;
  }
}

@media (max-width: 640px) {
  .execution-quote-history__entry-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .execution-quote-history__meta {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (prefers-reduced-motion: reduce) {
  .execution-quote-history__loading span {
    animation: none;
  }
}
</style>
