<script setup lang="ts">
  import Breadcrumb from 'primevue/breadcrumb';
  import { computed, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { buildBreadcrumb } from '../LayoutComponents/SubComponents/RouteHelper';
  import FeatureHeader from '@/assets/images/FeatureHeader.jpg';
  const route = useRoute();
  const router = useRouter();

  const items = computed(() => {
    const breadcrumb = buildBreadcrumb(route, router);
    return breadcrumb;
  });

  watch(
    () => route,
    () => {
      buildBreadcrumb(route, router);
    },
    { immediate: true, deep: true },
  );
</script>

<template>
  <div class="feature-header-container">
    <img class="header-img" :src="FeatureHeader" alt="header" />
    <div class="content">
      <p class="title">
        {{ items[items.length - 1]?.label }}
      </p>
      <div class="breadcrump">
        <Breadcrumb :model="items">
          <template #item="{ item }">
            <span @click="$router.push(item.url!)">{{ item.label }}</span>
          </template>
          <template #separator> / </template>
        </Breadcrumb>
      </div>
    </div>
    <div class="actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>
