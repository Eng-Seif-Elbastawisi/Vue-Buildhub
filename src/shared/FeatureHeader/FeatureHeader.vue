<script setup lang="ts">
  import Breadcrumb from 'primevue/breadcrumb';
  import type { MenuItem } from 'primevue/menuitem';
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRoute, useRouter } from 'vue-router';
  import {
    buildBreadcrumb,
    type BreadcrumbItem,
  } from '../LayoutComponents/SubComponents/RouteHelper';
  import FeatureHeader from '@/assets/images/FeatureHeader.jpg';
  const route = useRoute();
  const router = useRouter();
  const { t, locale } = useI18n();

  const isProjectShowRoute = computed(() => route.name === 'show-project');

  const items = computed(() => {
    void locale.value;
    return buildBreadcrumb(route, router);
  });

  const getLabel = (breadcrumbItem?: BreadcrumbItem | MenuItem) => {
    if (!breadcrumbItem) return '';
    if ('labelKey' in breadcrumbItem && typeof breadcrumbItem.labelKey === 'string') {
      return t(breadcrumbItem.labelKey);
    }

    return typeof breadcrumbItem.label === 'function'
      ? breadcrumbItem.label()
      : (breadcrumbItem.label ?? '');
  };
</script>

<template>
  <div v-if="!isProjectShowRoute" class="feature-header-container">
    <img class="header-img" :src="FeatureHeader" :alt="$t('feature_header_image_alt')" />
    <div class="content">
      <div class="breadcrump">
        <Breadcrumb :model="items">
          <template #item="{ item }">
            <button type="button" class="breadcrumb-link" @click="$router.push(item.url!)">
              {{ getLabel(item) }}
            </button>
          </template>
          <template #separator> / </template>
        </Breadcrumb>
      </div>
      <h1 class="title">
        {{ getLabel(items[items.length - 1]) }}
      </h1>
    </div>
    <div class="actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>
