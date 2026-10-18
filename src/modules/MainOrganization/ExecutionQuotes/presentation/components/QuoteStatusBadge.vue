<script setup lang="ts">
  import { computed } from 'vue';
  import StatusBadge from '@/shared/ConstructionStates/StatusBadge.vue';
  import { useI18n } from 'vue-i18n';
  import {
    type QuoteStatusEnum,
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
  <StatusBadge class="quote-status-badge" :class="badgeClass" :label="label" />
</template>
