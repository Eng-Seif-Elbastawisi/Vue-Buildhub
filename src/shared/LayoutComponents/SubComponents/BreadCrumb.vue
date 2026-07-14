<script setup lang="ts">
  import Breadcrumb from 'primevue/breadcrumb';
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRoute, useRouter } from 'vue-router';
  import { buildBreadcrumb, type BreadcrumbItem } from './RouteHelper';

  const route = useRoute();
  const router = useRouter();
  const { t, locale } = useI18n();

  const items = computed(() => {
    void locale.value;
    return buildBreadcrumb(route, router);
  });

  const getLabel = (item: BreadcrumbItem) => (item.labelKey ? t(item.labelKey) : item.label);
</script>

<template>
  <div class="breadcrump-container">
    <div class="breadcrump">
      <Breadcrumb :model="items">
        <template #item="{ item }">
          <span @click="$router.push(item.url!)">{{ getLabel(item) }}</span>
        </template>
      </Breadcrumb>
    </div>
  </div>
</template>
