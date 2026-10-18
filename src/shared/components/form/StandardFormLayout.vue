<script setup lang="ts">
  withDefaults(
    defineProps<{
      as?: 'div' | 'section' | 'main' | 'form';
      mode?: 'create' | 'edit' | 'show';
      title?: string;
      description?: string;
      columns?: 1 | 2 | 3;
      loading?: boolean;
      disabled?: boolean;
      embedded?: boolean;
    }>(),
    {
      as: 'div',
      mode: undefined,
      title: '',
      description: '',
      columns: 2,
      loading: false,
      disabled: false,
      embedded: false,
    },
  );
</script>

<template>
  <component
    :is="as"
    class="standard-form-layout"
    :class="{
      'standard-form-layout--embedded': embedded,
      'standard-form-layout--three-columns': columns === 3,
    }"
    :data-form-mode="mode"
    :aria-busy="loading || undefined"
    :aria-disabled="disabled || undefined"
    :style="{ '--form-columns': columns }"
  >
    <header v-if="title || $slots.header" class="standard-form-layout__header">
      <slot name="header">
        <h2>{{ title }}</h2>
        <p v-if="description">{{ description }}</p>
      </slot>
    </header>
    <slot v-if="loading" name="loading" />
    <slot />
    <footer v-if="$slots.actions" class="standard-form-layout__actions">
      <slot name="actions" />
    </footer>
  </component>
</template>
