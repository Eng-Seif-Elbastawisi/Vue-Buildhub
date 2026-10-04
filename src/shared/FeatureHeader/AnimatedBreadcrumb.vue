<script setup lang="ts">
  import Breadcrumb from 'primevue/breadcrumb';
  import type { MenuItem } from 'primevue/menuitem';
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRoute, useRouter } from 'vue-router';
  import {
    buildBreadcrumb,
    type BreadcrumbItem,
  } from '@/shared/LayoutComponents/SubComponents/RouteHelper';

  const props = withDefaults(
    defineProps<{
      currentLabel?: string;
      showHomeIcon?: boolean;
    }>(),
    { currentLabel: undefined, showHomeIcon: false },
  );

  const route = useRoute();
  const router = useRouter();
  const { t, locale } = useI18n();

  const items = computed(() => {
    void locale.value;
    const routeItems = buildBreadcrumb(route, router);

    return routeItems.map((item, index) =>
      index === routeItems.length - 1 && props.currentLabel !== undefined
        ? { ...item, label: props.currentLabel, labelKey: undefined }
        : item,
    );
  });

  // The locale can update labels in place. Only navigation changes the transition key.
  const navigationKey = computed(() => route.fullPath ?? route.path);
  const currentItem = computed(() => items.value[items.value.length - 1]);

  const getLabel = (item: BreadcrumbItem | MenuItem) => {
    if ('labelKey' in item && typeof item.labelKey === 'string') return t(item.labelKey);
    return typeof item.label === 'function' ? item.label() : (item.label ?? '');
  };
</script>

<template>
  <div class="dashboard-breadcrumb">
    <Transition name="dashboard-crumb-motion" :duration="{ enter: 560, leave: 140 }">
      <Breadcrumb
        :key="navigationKey"
        :model="items"
        class="dashboard-breadcrumb__trail"
        :aria-label="$t('breadcrumb')"
      >
        <template #item="{ item }">
          <RouterLink
            v-if="item.url"
            :class="
              item === currentItem ? 'dashboard-breadcrumb__current' : 'dashboard-breadcrumb__link'
            "
            :to="item.url"
            :aria-current="item === currentItem ? 'page' : undefined"
          >
            <i v-if="showHomeIcon && item === items[0]" class="pi pi-home" aria-hidden="true"></i>
            <span>{{ getLabel(item) }}</span>
          </RouterLink>
          <span v-else class="dashboard-breadcrumb__current" aria-current="page">
            <span>{{ getLabel(item) }}</span>
          </span>
        </template>
        <template #separator>
          <svg
            class="dashboard-breadcrumb__separator"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path d="m6 3.5 4.5 4.5L6 12.5" stroke="currentColor" stroke-width="1.5" />
          </svg>
        </template>
      </Breadcrumb>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
  .dashboard-breadcrumb {
    --breadcrumb-inline-motion: -22px;
    --breadcrumb-chevron-direction: 1;
    --breadcrumb-underline-origin: left center;

    position: relative;
    width: max-content;
    max-width: 100%;
    min-height: 37px;
    padding: 0 0 6px;
    overflow-x: auto;
    border: 0;
    background: transparent;
    scrollbar-width: thin;
  }

  :global([dir='rtl'] .dashboard-breadcrumb) {
    --breadcrumb-inline-motion: 22px;
    --breadcrumb-chevron-direction: -1;
    --breadcrumb-underline-origin: right center;
  }

  .dashboard-breadcrumb__trail {
    padding: 0;
    overflow: visible;
    border: 0;
    background: transparent;
  }

  .dashboard-breadcrumb :deep(.p-breadcrumb-list) {
    position: relative;
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: 8px;
    min-height: 31px;
    white-space: nowrap;
  }

  .dashboard-breadcrumb :deep(.p-breadcrumb-item) {
    min-width: 0;
  }

  .dashboard-breadcrumb__link,
  .dashboard-breadcrumb__current {
    position: relative;
    display: inline-flex;
    min-height: 31px;
    align-items: center;
    gap: 6px;
    max-width: 38ch;
    overflow: hidden;
    color: var(--quote-muted, var(--gray-500));
    font-family: 'Medium', var(--font-family);
    font-size: 15px;
    font-style: normal;
    font-weight: 600;
    line-height: 1.35;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .dashboard-breadcrumb__link > span,
  .dashboard-breadcrumb__current > span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .dashboard-breadcrumb__link {
    text-decoration: none;
    transition: color var(--motion-fast, 140ms) var(--motion-ease, ease-out);
  }

  .dashboard-breadcrumb__current::after {
    position: absolute;
    inset-block-end: 0;
    inset-inline: 0;
    height: 3px;
    background: var(--quote-copper, var(--PrimaryColor));
    clip-path: polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%);
    content: '';
    transform-origin: var(--breadcrumb-underline-origin);
  }

  .dashboard-breadcrumb__link:hover,
  .dashboard-breadcrumb__link:focus-visible {
    color: var(--quote-copper-dark, var(--PrimaryColor));
  }

  .dashboard-breadcrumb__link:focus-visible {
    border-radius: 3px;
    outline: 2px solid var(--quote-copper, var(--PrimaryColor));
    outline-offset: 2px;
  }

  .dashboard-breadcrumb__current {
    color: var(--quote-ink, var(--gray-600));
    font-family: 'Bold', var(--font-family);
    font-size: 17px;
    font-weight: 700;
    text-decoration: none;
  }

  .dashboard-breadcrumb__current:focus-visible {
    border-radius: 3px;
    outline: 2px solid var(--quote-copper, var(--PrimaryColor));
    outline-offset: 2px;
  }

  .dashboard-breadcrumb__separator {
    width: 11px;
    height: 11px;
    flex: 0 0 auto;
    color: var(--quote-muted, var(--gray-400));
    opacity: 0.55;
    transform: scaleX(var(--breadcrumb-chevron-direction));
  }

  .dashboard-crumb-motion-enter-active,
  .dashboard-crumb-motion-leave-active {
    transition:
      opacity var(--motion-slow, 280ms) var(--motion-ease, ease-out),
      transform var(--motion-slow, 280ms) var(--motion-ease, ease-out);
  }

  .dashboard-crumb-motion-leave-active {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
    pointer-events: none;
    transition-duration: var(--motion-fast, 140ms);
  }

  .dashboard-crumb-motion-enter-from {
    opacity: 0;
    transform: translateX(var(--breadcrumb-inline-motion));
  }

  .dashboard-crumb-motion-leave-to {
    opacity: 0;
    transform: none;
  }

  .dashboard-crumb-motion-enter-active .dashboard-breadcrumb__current::after {
    animation: dashboard-crumb-underline var(--motion-slow, 280ms) var(--motion-ease, ease-out)
      var(--motion-slow, 280ms) both;
  }

  @keyframes dashboard-crumb-underline {
    from {
      transform: scaleX(0);
    }

    to {
      transform: scaleX(1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .dashboard-crumb-motion-enter-active,
    .dashboard-crumb-motion-leave-active {
      transition: opacity var(--motion-fast, 140ms) ease-out;
    }

    .dashboard-crumb-motion-enter-active .dashboard-breadcrumb__current::after {
      animation: none;
    }

    .dashboard-breadcrumb__link,
    .dashboard-breadcrumb__current {
      transition: none;
    }

    .dashboard-crumb-motion-enter-from {
      opacity: 0;
      transform: none;
    }

    .dashboard-crumb-motion-leave-to {
      opacity: 0;
      transform: none;
    }
  }

  @media (max-width: 680px) {
    .dashboard-breadcrumb__link,
    .dashboard-breadcrumb__current {
      max-width: 26ch;
      font-size: 14px;
    }

    .dashboard-breadcrumb__current {
      font-size: 16px;
    }
  }
</style>
