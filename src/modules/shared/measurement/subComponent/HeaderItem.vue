<script setup lang="ts">
  defineProps<{
    item: any;
  }>();
</script>
<template>
  <div>
    <h1>{{ item?.header }}</h1>
    <p>{{ item?.content }}</p>
    <p>{{ item?.id }}</p>
  </div>
</template>
