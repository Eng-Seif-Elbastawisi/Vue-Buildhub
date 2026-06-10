<script setup lang="ts">
  import EmployeeBg from '@/assets/images/EmployeeBg.png';
  import Yellowback from '@/assets/images/Yellowback.png';
  defineProps<{
    title: string;
    subtitle?: string;
    img?: string;
  }>();
</script>
<template>
  <div class="employee-header">
    <div class="left-header-background">
      <img class="left-blue-background" :src="EmployeeBg" alt="bg" />
      <img class="left-yellow-background" :src="Yellowback" alt="bg" />
    </div>
    <div class="employee-header-text">
      <!-- <span>image</span> -->
      <img v-if="img" :src="img" alt="Header-img" />
      <div class="header-text">
        <p class="title">{{ title }}</p>
        <p class="subtitle">{{ subtitle }}</p>
      </div>
    </div>
    <div class="right-header-background">
      <img class="right-yellow-background" :src="Yellowback" alt="bg" />
      <img class="right-blue-background" :src="EmployeeBg" alt="bg" />
    </div>
  </div>
</template>
