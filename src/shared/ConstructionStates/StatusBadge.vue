<script setup lang="ts">
  withDefaults(
    defineProps<{
      label?: string;
      severity?: 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'brand' | 'review';
      variant?: 'solid' | 'dot';
      icon?: string;
    }>(),
    { label: '', severity: 'neutral', variant: 'solid', icon: undefined },
  );
</script>

<template>
  <span
    class="bh-status"
    :class="[`bh-status--${severity}`, { 'bh-status--dot': variant === 'dot' }]"
  >
    <i v-if="icon" :class="icon" aria-hidden="true" />
    <slot>{{ label }}</slot>
  </span>
</template>
