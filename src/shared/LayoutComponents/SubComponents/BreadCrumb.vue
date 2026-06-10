<script setup lang="ts">
  import Breadcrumb from 'primevue/breadcrumb';
  import { computed, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { buildBreadcrumb } from './RouteHelper';

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
  <div class="breadcrump-container">
    <div class="breadcrump">
      <Breadcrumb :model="items">
        <template #item="{ item }">
          <span @click="$router.push(item.url!)">{{ item.label }}</span>
        </template>
      </Breadcrumb>
    </div>
  </div>
</template>
