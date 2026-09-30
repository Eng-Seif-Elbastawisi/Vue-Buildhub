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
    background: #f1f5f9;
    color: #64748b;
  }

  &.status-pending-validation {
    background: #fef3c7;
    color: #d97706;
  }

  &.status-revision-required {
    background: #fee2e2;
    color: #dc2626;
  }

  &.status-sent-to-client {
    background: #dcfce7;
    color: #16a34a;
  }

  &.status-default {
    background: #f3f4f6;
    color: #6b7280;
  }
}
</style>
