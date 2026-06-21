<script setup lang="ts">
  defineProps<{
    item: any;
  }>();
</script>
<template>
  <div>
    <p>{{ item?.content }}</p>
    <h1>{{ item?.header }}</h1>
    <p>{{ item?.id }}</p>
    <p>{{ item?.text }}</p>
  </div>
</template>
