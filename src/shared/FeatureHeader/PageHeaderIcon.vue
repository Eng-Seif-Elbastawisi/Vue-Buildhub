<script setup lang="ts">
  import { computed } from 'vue';
  import type { PageHeaderAction, PageHeaderIconKind } from './pageHeaderIcon';

  const props = defineProps<{
    kind: PageHeaderIconKind;
    action?: PageHeaderAction;
  }>();

  const paths: Record<PageHeaderIconKind, string[]> = {
    person: [
      'M10 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z',
      'M3.5 20v-2.2A5.8 5.8 0 0 1 9.3 12h1.4a5.8 5.8 0 0 1 4.8 2.5',
    ],
    people: [
      'M9 10a3.3 3.3 0 1 0 0-6.6A3.3 3.3 0 0 0 9 10Z',
      'M2.5 20v-2a5.5 5.5 0 0 1 5.5-5.5h2a5.5 5.5 0 0 1 5.5 5.5v2',
      'M17 4.5a3 3 0 0 1 0 5.8',
      'M18.5 12.8a4.5 4.5 0 0 1 3 4.2v3',
    ],
    building: [
      'M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16',
      'M2 21h20',
      'M8 7h2m4 0h2M8 11h2m4 0h2M8 15h2m4 0h2',
      'M10 21v-3h4v3',
    ],
    project: ['M3 20V7l9-4 9 4v13', 'M3 7l9 4 9-4M12 11v9', 'M3 20h18'],
    truck: [
      'M2 5h12v12H2z',
      'M14 9h4l4 4v4h-8',
      'M5 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm13 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
    ],
    box: ['M12 2 21 7v10l-9 5-9-5V7l9-5Z', 'M3 7l9 5 9-5M12 12v10'],
    document: ['M6 2h9l4 4v16H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z', 'M15 2v5h4M8 12h8M8 16h8'],
    wallet: [
      'M4 5h14a2 2 0 0 1 2 2v13H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z',
      'M2 9h20v8h-7a4 4 0 0 1 0-8h7',
      'M16 13h.01',
    ],
    location: [
      'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z',
      'M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
    ],
    hierarchy: ['M12 3v6M5 21v-5h14v5M5 16v-3h14v3', 'M9 3h6v6H9zM2 20h6v2H2zM16 20h6v2h-6z'],
    tag: ['M3 4h9l9 9-8 8-9-9V4Z', 'M8 8h.01'],
  };

  const mainPaths = computed(() => paths[props.kind]);
</script>

<template>
  <span class="page-header-icon" :data-icon-kind="kind" aria-hidden="true">
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <g class="page-header-icon__main">
        <path
          v-for="path in mainPaths"
          :key="path"
          :d="path"
          pathLength="1"
          class="page-header-icon__path"
        />
      </g>
      <g v-if="action === 'add'" class="page-header-icon__accent">
        <circle cx="18.5" cy="18.5" r="4" fill="var(--quote-copper-soft, var(--bg-card))" />
        <path d="M18.5 16v5M16 18.5h5" />
      </g>
      <g v-else-if="action === 'edit'" class="page-header-icon__accent">
        <path
          d="m15.2 20.6 1-3 4-4 2 2-4 4-3 1ZM19.2 14.6l2 2"
          fill="var(--quote-copper-soft, var(--bg-card))"
        />
      </g>
    </svg>
  </span>
</template>

<style lang="scss" src="./page-header-motion.scss"></style>
