<script setup lang="ts">
  import Skeleton from 'primevue/skeleton';
  defineProps<{
    title: string;
    value?: string | number | null;
    note: string;
    to: string;
    loading?: boolean;
    failed?: boolean;
  }>();
  defineEmits<{ retry: [] }>();
</script>
<template>
  <article class="analytics-kpi">
    <RouterLink :to="to" class="analytics-kpi__title"
      >{{ title }} <i class="pi pi-arrow-up-right" aria-hidden="true"
    /></RouterLink>
    <Skeleton v-if="loading" height="2.3rem" width="65%" />
    <template v-else>
      <strong>{{ failed || value == null ? $t('intelligence.unavailable') : value }}</strong>
      <button
        v-if="failed"
        type="button"
        class="analytics-retry"
        :aria-label="`${$t('intelligence.retry')} · ${title}`"
        @click="$emit('retry')"
      >
        {{ $t('intelligence.retry') }}
      </button>
    </template>
    <small>{{ note }}</small>
  </article>
</template>
