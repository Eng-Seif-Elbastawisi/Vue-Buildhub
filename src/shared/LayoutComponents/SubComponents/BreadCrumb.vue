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

  const translateLabel = (label: unknown) => (typeof label === 'string' ? label : '');

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
          <span @click="$router.push(item.url!)">{{ $t(translateLabel(item.label)) }}</span>
        </template>
      </Breadcrumb>
    </div>
  </div>
</template>
