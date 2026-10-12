<script setup lang="ts">
  import Skeleton from 'primevue/skeleton';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  defineProps<{
    title: string;
    icon?: string;
    count?: number;
    loading: boolean;
    error?: string;
    empty: boolean;
    emptyMessage: string;
  }>();
  const emit = defineEmits<{ retry: [] }>();
</script>
<template>
  <details class="work-items-section" :aria-label="title" :aria-busy="loading">
    <summary class="work-items-section-header">
      <div class="work-items-section-title">
        <i v-if="icon" :class="icon" aria-hidden="true"></i>
        <h2>{{ title }}</h2>
      </div>
      <span
        v-if="!loading && !error && count !== undefined"
        class="work-items-section-count"
        :aria-label="`${title}: ${count}`"
        >{{ count }}</span
      >
      <i class="pi pi-chevron-down work-items-section-toggle" aria-hidden="true"></i>
    </summary>
    <div class="work-items-section-body">
      <slot name="filters" />
      <div v-if="loading" class="work-items-skeleton">
        <Skeleton v-for="row in 3" :key="row" height="3.5rem" />
      </div>
      <div v-else-if="error" class="work-items-empty" role="alert">
        <p>{{ error }}</p>
        <AppButton theme="secondary" @click="emit('retry')">{{ $t('work_items.retry') }}</AppButton>
      </div>
      <div v-else-if="empty" class="work-items-empty">
        <p>{{ emptyMessage }}</p>
      </div>
      <slot v-else />
    </div>
  </details>
</template>
