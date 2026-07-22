<script setup lang="ts">
  import { computed } from 'vue';
  import Breadcrumb from 'primevue/breadcrumb';
  import type { MenuItem } from 'primevue/menuitem';
  import { useI18n } from 'vue-i18n';
  import { useRoute, useRouter } from 'vue-router';
  import {
    buildBreadcrumb,
    type BreadcrumbItem,
  } from '@/shared/LayoutComponents/SubComponents/RouteHelper';

  const props = defineProps<{
    currentLabel: string;
  }>();

  const route = useRoute();
  const router = useRouter();
  const { locale, t } = useI18n();

  const breadcrumbItems = computed(() => {
    void locale.value;

    const routeItems = buildBreadcrumb(route, router);

    return routeItems.map((routeItem, index) =>
      index === routeItems.length - 1
        ? { ...routeItem, label: props.currentLabel, labelKey: undefined }
        : routeItem,
    );
  });

  const getLabel = (breadcrumbItem: BreadcrumbItem | MenuItem) => {
    if ('labelKey' in breadcrumbItem && typeof breadcrumbItem.labelKey === 'string') {
      return t(breadcrumbItem.labelKey);
    }

    return typeof breadcrumbItem.label === 'function'
      ? breadcrumbItem.label()
      : (breadcrumbItem.label ?? '');
  };
</script>

<template>
  <nav class="project-hero-breadcrumb" :aria-label="$t('breadcrumb')">
    <Breadcrumb :model="breadcrumbItems">
      <template #item="{ item: breadcrumbItem }">
        <RouterLink
          v-if="breadcrumbItem.url"
          class="project-hero-breadcrumb__link"
          :to="breadcrumbItem.url"
          :aria-current="
            breadcrumbItem === breadcrumbItems[breadcrumbItems.length - 1] ? 'page' : undefined
          "
        >
          <i v-if="breadcrumbItem === breadcrumbItems[0]" class="pi pi-home" aria-hidden="true"></i>
          <span>{{ getLabel(breadcrumbItem) }}</span>
        </RouterLink>
        <span v-else class="project-hero-breadcrumb__link" aria-current="page">
          {{ getLabel(breadcrumbItem) }}
        </span>
      </template>
      <template #separator>
        <i class="pi pi-chevron-right" aria-hidden="true"></i>
      </template>
    </Breadcrumb>
  </nav>
</template>
