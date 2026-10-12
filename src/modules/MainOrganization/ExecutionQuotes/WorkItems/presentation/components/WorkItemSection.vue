<script setup lang="ts">
  import Skeleton from 'primevue/skeleton';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  defineProps<{
    title: string;
    loading: boolean;
    error?: string;
    empty: boolean;
    emptyMessage: string;
  }>();
  const emit = defineEmits<{ retry: [] }>();
</script>
<template>
  <section class="work-items-section" :aria-label="title" :aria-busy="loading">
    <header>
      <h2>{{ title }}</h2>
      <slot name="actions" />
    </header>
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
  </section>
</template>
