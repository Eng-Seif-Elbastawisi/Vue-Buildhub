<script setup lang="ts">
  import { computed, useSlots } from 'vue';

  withDefaults(
    defineProps<{
      title: string;
      subtitle?: string;
    }>(),
    {
      subtitle: '',
    },
  );

  const slots = useSlots();

  const hasPrimaryControls = computed(() => Boolean(slots.search || slots.actions));
  const hasToolbar = computed(() => Boolean(hasPrimaryControls.value || slots.filters));
</script>

<template>
  <div class="index-page-header">
    <header class="index-page-heading">
      <div class="index-page-heading__copy">
        <slot name="eyebrow" />
        <h1 class="index-page-heading__title">
          {{ title }}
        </h1>
        <p v-if="subtitle" class="index-page-heading__subtitle">
          {{ subtitle }}
        </p>
        <div v-if="$slots.meta" class="index-page-heading__meta">
          <slot name="meta" />
        </div>
      </div>
      <slot name="decoration" />
    </header>

    <section v-if="hasToolbar" class="index-page-toolbar">
      <div v-if="hasPrimaryControls" class="index-page-toolbar__primary">
        <div v-if="$slots.search" class="index-page-toolbar__search">
          <slot name="search" />
        </div>
        <div v-if="$slots.actions" class="index-page-toolbar__actions">
          <slot name="actions" />
        </div>
      </div>

      <div v-if="$slots.filters" class="index-page-toolbar__filters">
        <slot name="filters" />
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
  .index-page-header {
    display: flex;
    flex-direction: column;
    gap: var(--page-section-gap);
    width: 100%;
    min-width: 0;
  }

  .index-page-heading {
    position: relative;
    display: flex;
    align-items: flex-start;
    width: 100%;
    overflow: hidden;
    padding-block: 2px 18px;
    border-bottom: 1px solid var(--border-weak);
  }

  .index-page-heading__copy {
    flex: 1 1 auto;
    min-width: 0;
  }

  .index-page-heading__title {
    margin: 0;
    color: var(--form-title);
    font-family: 'Bold', var(--font-family);
    font-size: clamp(1.25rem, 2vw, 1.6rem);
    font-weight: 700;
    line-height: 1.3;
  }

  .index-page-heading__subtitle {
    max-width: 70ch;
    margin: 4px 0 0;
    color: var(--gray-500);
    font-size: var(--sm-size);
    line-height: 1.6;
  }

  .index-page-heading__meta {
    margin-block-start: 12px;
  }

  .index-page-toolbar {
    display: flex;
    min-height: calc(var(--control-height) + 26px);
    flex-direction: column;
    gap: 12px;
    width: 100%;
    padding: 12px;
    border: 1px solid var(--border-weak);
    border-radius: var(--card-radius);
    background-color: var(--bg-card);
    box-shadow: var(--shadow-sm);
  }

  .index-page-toolbar__primary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    min-width: 0;
  }

  .index-page-toolbar__search {
    flex: 1 1 280px;
    width: min(100%, 520px);
    min-width: 220px;
    max-width: 520px;
  }

  .index-page-toolbar__search :deep(.search-field),
  .index-page-toolbar__search :deep(.search-box),
  .index-page-toolbar__search :deep(.input-search) {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    max-width: none;
  }

  .index-page-toolbar__search :deep(.search-icon) {
    position: absolute;
    inset-block-start: 50%;
    right: auto !important;
    left: auto !important;
    inset-inline-start: 14px !important;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--gray-400);
    pointer-events: none;
    transform: translateY(-50%);
  }

  .index-page-toolbar__search :deep(input) {
    width: 100%;
    min-height: var(--control-height) !important;
    padding-block: 10px !important;
    padding-inline: 42px 14px !important;
    border: 1px solid var(--border-strong) !important;
    border-radius: var(--control-radius) !important;
    outline: none;
    color: var(--gray-800);
    background-color: var(--bg-main);
    font-family: var(--font-family);
    font-size: var(--sm-size);
  }

  .index-page-toolbar__search :deep(input::placeholder) {
    color: var(--gray-400);
  }

  .index-page-toolbar__search :deep(input:focus) {
    border-color: var(--PrimaryColor) !important;
    box-shadow: var(--focus-ring);
  }

  .index-page-toolbar__actions {
    display: flex;
    flex: 0 0 auto;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    margin-inline-start: auto;
  }

  .index-page-toolbar__filters {
    min-width: 0;
    width: 100%;
  }

  .index-page-toolbar__primary + .index-page-toolbar__filters {
    padding-block-start: 12px;
    border-top: 1px solid var(--border-weak);
  }

  @media (max-width: 767px) {
    .index-page-toolbar__primary {
      align-items: stretch;
      flex-direction: column;
    }

    .index-page-toolbar__search {
      flex-basis: auto;
      width: 100%;
      min-width: 0;
      max-width: none;
    }

    .index-page-toolbar__actions {
      width: 100%;
      margin-inline-start: 0;
    }

    .index-page-toolbar__actions :deep(.btn),
    .index-page-toolbar__actions :deep(.btn-add),
    .index-page-toolbar__actions :deep(button) {
      flex: 1 1 auto;
      justify-content: center;
    }
  }

  @media (max-width: 479px) {
    .index-page-toolbar {
      padding: 10px;
    }
  }
</style>
