<script setup lang="ts">
  import { computed } from 'vue';
  import Skeleton from 'primevue/skeleton';
  import {
    DataInitial,
    DataLoading,
    DataSuccess,
    type DataState,
  } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  const props = defineProps<{
    title: string;
    note: string;
    state?: DataState<unknown>;
    available?: boolean;
    to?: string;
  }>();
  defineEmits<{ retry: [] }>();
  const loading = computed(
    () => props.state instanceof DataLoading || props.state instanceof DataInitial,
  );
  const failed = computed(
    () => props.state !== undefined && !loading.value && !(props.state instanceof DataSuccess),
  );
</script>
<template>
  <article class="analytics-panel" :aria-busy="loading">
    <header>
      <div>
        <h2>{{ title }}</h2>
        <p>{{ note }}</p>
      </div>
      <RouterLink v-if="to" :to="to" :aria-label="`${$t('intelligence.explore')} · ${title}`"
        ><i class="pi pi-arrow-up-right" aria-hidden="true"
      /></RouterLink>
    </header>
    <Skeleton v-if="loading" height="13rem" />
    <div v-else-if="failed" class="analytics-message" role="status">
      <i class="pi pi-exclamation-circle" aria-hidden="true" />
      <p>{{ $t('intelligence.load_error') }}</p>
      <button type="button" class="analytics-retry" @click="$emit('retry')">
        {{ $t('intelligence.retry') }}
      </button>
    </div>
    <div v-else-if="available === false || !state" class="analytics-message">
      <i class="pi pi-database" aria-hidden="true" />
      <p>{{ $t('intelligence.unavailable') }}</p>
      <small>{{ $t('intelligence.source_needed') }}</small>
    </div>
    <slot v-else />
  </article>
</template>
