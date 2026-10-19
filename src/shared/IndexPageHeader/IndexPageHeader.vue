<script setup lang="ts">
  import { computed, useSlots } from 'vue';
  import { useRoute } from 'vue-router';
  import PageHeaderIcon from '@/shared/FeatureHeader/PageHeaderIcon.vue';
  import { getPageHeaderIcon } from '@/shared/FeatureHeader/pageHeaderIcon';

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
  const route = useRoute();

  const hasToolbar = computed(() => Boolean(slots.search || slots.filters));
  const resolvedIcon = computed(() => getPageHeaderIcon(route?.path ?? ''));
</script>

<template>
  <div
    class="index-page-header page-header--animated"
    :class="{ 'index-page-header--with-toolbar': hasToolbar }"
  >
    <header class="index-page-heading">
      <div :key="route?.path" class="index-page-heading__identity">
        <PageHeaderIcon v-if="resolvedIcon" :kind="resolvedIcon" />
        <div class="index-page-heading__copy">
          <slot name="eyebrow" />
          <h1 class="index-page-heading__title page-header__title">
            {{ title }}
          </h1>
          <p v-if="subtitle" class="index-page-heading__subtitle page-header__subtitle">
            {{ subtitle }}
          </p>
          <div v-if="$slots.meta" class="index-page-heading__meta">
            <slot name="meta" />
          </div>
        </div>
      </div>
      <div v-if="$slots.actions" class="index-page-heading__actions">
        <slot name="actions" />
      </div>
      <slot name="decoration" />
    </header>

    <section v-if="hasToolbar" class="index-page-toolbar">
      <div v-if="$slots.search" class="index-page-toolbar__primary">
        <div class="index-page-toolbar__search">
          <slot name="search" />
        </div>
      </div>

      <div v-if="$slots.filters" class="index-page-toolbar__filters">
        <slot name="filters" />
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
  @use 'workspace-glass' as glass;

  .index-page-header {
    --quote-copper-soft: var(--PrimaryColor-light);
    --quote-copper-dark: var(--PrimaryColor);

    display: flex;
    flex-direction: column;
    gap: 0;
    width: 100%;
    min-width: 0;
  }

  .index-page-header.page-header--animated .index-page-heading {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--bh-space-6);
    width: 100%;
    min-height: 112px;
    padding: var(--bh-space-6);
    border-radius: var(--bh-radius-card);

    @include glass.surface;

    color: var(--bh-text);
    isolation: isolate;
  }

  .index-page-heading__copy {
    flex: 1 1 auto;
    min-width: 0;
  }

  .index-page-heading__identity {
    display: flex;
    flex: 1 1 auto;
    align-items: center;
    gap: var(--bh-space-4);
    min-width: 0;
  }

  .index-page-header .index-page-heading .index-page-heading__title {
    margin: 0;
    color: var(--bh-text);
    font-family: var(--bh-font);
    font-size: var(--bh-text-page);
    font-weight: 700;
    line-height: 1.2;
    overflow-wrap: anywhere;
  }

  .index-page-header .index-page-heading .index-page-heading__subtitle {
    max-width: 68ch;
    margin: 6px 0 0;
    color: var(--bh-muted);
    font-size: var(--bh-text-sm);
    line-height: 1.5;
    overflow-wrap: anywhere;
  }

  .index-page-heading__actions {
    display: flex;
    flex: 0 0 auto;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    margin-inline-start: auto;
  }

  .index-page-heading__meta {
    margin-block-start: 12px;
  }

  .index-page-header.index-page-header--with-toolbar .index-page-toolbar {
    display: flex;
    min-height: calc(var(--control-height) + 26px);
    flex-direction: column;
    gap: 12px;
    width: 100%;
    padding: 12px;
    margin-block-start: 12px;
    border: 0;
    border-radius: var(--bh-radius-card);
    background-color: var(--bg-card);
    box-shadow: none;
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
    color: var(--gray-600);
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
    color: var(--SecondaryColor);
    background-color: var(--bg-card);
    font-family: var(--bh-font);
    font-size: var(--sm-size);
  }

  .index-page-toolbar__search :deep(input::placeholder) {
    color: var(--gray-600);
  }

  .index-page-toolbar__search :deep(input:focus) {
    border-color: var(--PrimaryColor) !important;
    outline: 2px solid var(--PrimaryColor);
    outline-offset: 2px;
    box-shadow: none;
  }

  .index-page-toolbar__filters {
    min-width: 0;
    width: 100%;
  }

  .index-page-toolbar__primary + .index-page-toolbar__filters {
    padding-block-start: 12px;
    border-block-start: 1px solid var(--border-strong);
  }

  .index-page-header--with-toolbar .index-page-heading {
    border-end-start-radius: 0;
    border-end-end-radius: 0;
  }

  .index-page-heading__identity,
  .index-page-heading__actions {
    position: relative;
    z-index: 1;
  }

  .index-page-heading__identity :deep(.page-header-icon) {
    border: 0;
    width: var(--bh-control-height);
    height: var(--bh-control-height);
    flex-basis: var(--bh-control-height);
    border-radius: var(--bh-radius-control);
    background: color-mix(in sRGB, var(--bh-surface-raised) 65%, var(--bh-blue-soft));
    color: var(--bh-blue-ink);
  }

  .index-page-heading__copy :deep(.breadcrumb),
  .index-page-heading__copy :deep(.breadcrumb a) {
    color: var(--bh-muted);
  }

  .index-page-heading__copy :deep(.breadcrumb [aria-current='page']) {
    color: color-mix(in sRGB, var(--PrimaryColor), var(--secondary-text-color, var(--white)) 65%);
  }

  .index-page-heading__copy :deep(.breadcrumb a:hover) {
    color: var(--bh-text);
    text-decoration: underline;
    text-underline-offset: 0.2em;
  }

  .index-page-header .index-page-heading__actions :deep(.btn),
  .index-page-header .index-page-heading__actions :deep(.btn-add) {
    font-size: var(--bh-text-sm);
  }

  .index-page-heading__actions :deep(a:focus-visible),
  .index-page-heading__actions :deep(button:focus-visible),
  .index-page-heading__copy :deep(a:focus-visible) {
    outline: 2px solid var(--bh-focus);
    outline-offset: 3px;
  }

  .index-page-header .index-page-toolbar__filters :deep(.p-select-label:not(.p-placeholder)),
  .index-page-header .index-page-toolbar__filters :deep(.p-multiselect-label:not(.p-placeholder)) {
    color: color-mix(in sRGB, var(--SecondaryColor) 20%, var(--gray-800)) !important;
  }

  @media (max-width: 767px) {
    .index-page-header.page-header--animated .index-page-heading {
      min-height: 0;
      align-items: stretch;
      flex-direction: column;
      gap: var(--bh-space-4);
      padding: var(--bh-space-5) var(--bh-space-4);
    }

    .index-page-header .index-page-heading .index-page-heading__title {
      font-size: var(--bh-text-page);
    }

    .index-page-heading__actions {
      width: 100%;
      margin-inline-start: 0;
    }

    .index-page-heading__actions :deep(.btn),
    .index-page-heading__actions :deep(.btn-add),
    .index-page-heading__actions :deep(button) {
      flex: 1 1 auto;
      justify-content: center;
    }

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
  }

  @media (max-width: 479px) {
    .index-page-header.index-page-header--with-toolbar .index-page-toolbar {
      padding: 10px;
    }
  }
</style>
