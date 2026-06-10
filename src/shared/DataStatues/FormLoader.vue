<script setup lang="ts">
  import Skeleton from 'primevue/skeleton';
  // import PrimaryButton from "@/components/HelpersComponents/PrimaryButton.vue";

  defineProps<{
    inputsCount: number;
  }>();
</script>

<template>
  <form class="grid grid-cols-1 md:grid-cols-4 gap-md">
    <div v-for="i in inputsCount" :key="i" class="col-span-2 input-wrapper gap-4">
      <Skeleton height="0.5rem" width="20%"></Skeleton>
      <Skeleton height="3rem" width="100%"></Skeleton>
    </div>
    <div class="col-span-3 button-wrapper">
      <button class="btn btn-primary" type="submit">Submit</button>
      <!--      <PrimaryButton :title="'Add'" :type="'submit'" />-->
    </div>
  </form>
</template>

<style scoped></style>
