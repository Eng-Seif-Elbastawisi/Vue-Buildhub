<script setup lang="ts">
  import EmptyFolderIcon from '../icons/EmptyFolderIcon.vue';
  import RouteIcon from '../icons/RouteIcon.vue';

  const { title, description, route } = defineProps<{
    title?: string;
    description?: string;
    route?: string;
    buttonText?: string;
  }>();
</script>

<template>
  <div class="empty-state">
    <EmptyFolderIcon />
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>
    <router-link :to="route!" class="btn btn-primary empty-cta">
      <RouteIcon />
      <span>{{ buttonText }}</span>
    </router-link>
  </div>
</template>
