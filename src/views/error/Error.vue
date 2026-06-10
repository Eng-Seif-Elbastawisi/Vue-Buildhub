<script setup lang="ts">
  import ErrorIcon404 from '@/shared/icons/Error/ErrorIcon404.vue';
</script>
<template>
  <div class="error-container">
    <h2 class="error-404">404</h2>
    <ErrorIcon404 class="error-icon" />
    <h3 class="error-text">Opp! Page Not Found</h3>
    <p class="error-description">
      We couldn’t find the page you were looking for. It might have been moved or deleted.
    </p>
  </div>
</template>

<style scoped lang="scss">
  .error-container {
    width: 100%;
    height: 100vh;
    position: relative;
  }

  .error-404 {
    font-size: 600px;
    font-weight: bold;
    color: var(--PrimaryColor-alpha-10);
    text-align: center;
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .error-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -60%);
    z-index: -1;
  }

  .error-text {
    font-size: 94px;
    font-weight: 700;
    color: var(--gray-800);
    text-align: center;
    position: absolute;
    top: 70%;
    left: 50%;
    width: 100%;
    transform: translate(-50%, -50%);
    z-index: 99;
  }

  .error-description {
    font-size: 20px;
    font-weight: 500;
    color: var(--gray-500);
    text-align: center;
    position: absolute;
    top: 80%;
    left: 50%;
    width: 40%;
    transform: translate(-50%, -50%);
    z-index: 99;

    @media (max-width: 768px) {
      top: 90%;
      width: 100%;
    }
  }
</style>
