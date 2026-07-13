<script setup lang="ts">
  import { computed, useAttrs } from 'vue';
  import type { TabItem } from './projectShow.types';

  defineProps<{
    tabs: TabItem[];
    activeTab: string;
  }>();

  const attrs = useAttrs();
  const ariaLabel = computed(() =>
    typeof attrs['aria-label'] === 'string' ? attrs['aria-label'] : undefined,
  );

  defineEmits<{
    select: [tabId: string];
  }>();
</script>

<template>
  <nav class="project-tabs" :aria-label="ariaLabel">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      class="project-tab"
      :class="{ active: activeTab === tab.id }"
      type="button"
      @click="$emit('select', tab.id)"
    >
      <i :class="tab.icon"></i>
      {{ tab.label }}
    </button>
  </nav>
</template>
