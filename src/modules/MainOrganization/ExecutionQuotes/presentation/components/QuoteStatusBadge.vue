<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  QuoteStatusEnum,
  getQuoteStatusNameKey,
  getQuoteStatusBadgeClass,
} from '../../core/constants/quote.status.enum';

const props = defineProps<{
  status?: QuoteStatusEnum | number | null;
}>();

const { t } = useI18n();

const label = computed(() => {
  if (!props.status) return '-';
  return t(getQuoteStatusNameKey(props.status));
});

const badgeClass = computed(() => {
  return getQuoteStatusBadgeClass(props.status);
});
</script>

<template>
  <span class="quote-status-badge" :class="badgeClass">
    {{ label }}
  </span>
</template>

<style scoped lang="scss">
  .quote-status-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    white-space: nowrap;

    &.status-draft {
      background: var(--bh-canvas);
      color: var(--bh-muted);
    }

    &.status-pending-validation {
      background: var(--bh-amber-soft);
      color: var(--bh-amber-ink);
    }

    &.status-revision-required {
      background: var(--bh-coral-soft);
      color: var(--bh-coral-ink);
    }

    &.status-sent-to-client {
      background: var(--bh-green-soft);
      color: var(--bh-green-ink);
    }

    &.status-default {
      background: var(--bh-canvas);
      color: var(--bh-muted);
    }
  }
</style>
