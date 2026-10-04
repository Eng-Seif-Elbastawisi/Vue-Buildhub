<script setup lang="ts">
  withDefaults(
    defineProps<{
      title: string;
      description?: string;
      icon?: string;
    }>(),
    { description: '', icon: 'pi pi-clone' },
  );
</script>

<template>
  <header class="standard-form-section-header">
    <span class="standard-form-section-header__icon" aria-hidden="true">
      <i :class="icon"></i>
    </span>
    <span class="standard-form-section-header__copy">
      <h2>{{ title }}</h2>
      <p v-if="description">{{ description }}</p>
    </span>
  </header>
</template>
