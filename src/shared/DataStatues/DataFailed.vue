<script setup lang="ts">
const {
  title,
  description,
  link = "/",
  addText = "Home",
} = defineProps<{
  title?: string;
  description?: string;
  link?: string;
  addText?: string;
}>();
</script>

<template>
  <div class="data-empty">
    <img
      alt="imageFailed"
      class="data-empty-image"
      src="@/assets/images/app/system-failed.png"
    />
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
    <router-link :to="link" class="btn btn-primary">
      {{ addText }}
    </router-link>
  </div>
</template>

<style scoped></style>
