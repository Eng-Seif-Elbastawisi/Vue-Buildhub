<script lang="ts" setup>
  import Skeleton from 'primevue/skeleton';

  defineProps<{
    rows: number;
    cols: number;
  }>();
</script>

<template>
  <div class="container">
    <div class="cards">
      <div v-for="i in rows" :key="i" class="item">
        <div class="flex items-center justify-between gap-2 headerCard">
          <div class="total">
            <p>
              <Skeleton width="50px" />
            </p>
            <h3 class="number">
              <Skeleton width="80px" />
            </h3>
          </div>
          <div class="lamp">
            <Skeleton shape="circle" size="2rem" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
