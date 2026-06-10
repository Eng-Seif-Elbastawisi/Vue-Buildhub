<script setup lang="ts">
  defineProps<{ level: number; maxLevels: number }>();
</script>

<template>
  <!-- Level 0: Education Type (folder icon) -->
  <svg
    v-if="level != maxLevels"
    viewBox="0 0 20 20"
    fill="none"
    width="16"
    height="16"
    class="node-icon"
  >
    <path
      d="M3 7a2 2 0 012-2h3.5l1.5 1.5H15a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
      stroke="#4caf50"
      stroke-width="1.3"
      fill="none"
    />
  </svg>

  <!-- Level 1: Branch (folder icon variant) -->
  <svg
    v-else-if="level === 1"
    viewBox="0 0 20 20"
    fill="none"
    width="16"
    height="16"
    class="node-icon"
  >
    <path
      d="M3 7a2 2 0 012-2h3.5l1.5 1.5H15a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
      stroke="#4caf50"
      stroke-width="1.3"
      fill="#e8f5e9"
    />
  </svg>

  <!-- Level 2+: Leaf (document/lines icon) -->
  <svg v-else viewBox="0 0 20 20" fill="none" width="16" height="16" class="node-icon">
    <rect
      x="4"
      y="3"
      width="12"
      height="14"
      rx="2"
      stroke="#4caf50"
      stroke-width="1.3"
      fill="none"
    />
    <path d="M7 8h6M7 11h6M7 14h4" stroke="#4caf50" stroke-width="1.1" stroke-linecap="round" />
  </svg>
</template>

<style scoped>
  .node-icon {
    flex-shrink: 0;
  }
</style>
