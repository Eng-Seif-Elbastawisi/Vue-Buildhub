<script setup lang="ts">
  import { ref, watch } from 'vue';
  import type MaterialStatsModel from '../../../core/models/material.stats.model';

  const props = defineProps<{
    stats?: MaterialStatsModel;
  }>();

  const animatedMaterialCount = ref(0);
  const animatedTotal = ref(0);

  const animateCounter = (target: number, state: typeof animatedMaterialCount, duration = 800) => {
    const start = 0;
    const startTime = performance.now();

    const update = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);

      state.value = Math.floor(start + (target - start) * progress);

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  };

  watch(
    () => props.stats,
    (stats) => {
      if (!stats) return;

      animateCounter(stats.materialCount ?? 0, animatedMaterialCount);

      animateCounter(stats.total ?? 0, animatedTotal);
    },
    {
      immediate: true,
    },
  );
</script>

<template>
  <div class="stats-wrapper">
    <div class="stat-card">
      <div class="icon">📦</div>

      <div class="content-stats">
        <span class="stat-label">
          {{ $t('total_materials') }}
        </span>

        <strong class="stat-value">
          {{ animatedMaterialCount }}
        </strong>
      </div>
    </div>

    <div class="stat-card">
      <div class="icon">💰</div>

      <div class="content-stats">
        <span class="stat-label">
          {{ $t('total_price') }}
        </span>

        <strong class="stat-value">
          {{ animatedTotal }}
        </strong>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .stats-wrapper {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 1rem;

    padding: 1.25rem;

    border-radius: 18px;

    background: var(--white);

    border: 1px solid var(--border-weak);

    transition: 0.25s ease;

    &:hover {
      transform: translateY(-3px);
    }
  }

  .icon {
    width: 48px;
    height: 48px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 14px;

    background: var(--surface-ground);

    font-size: 1.5rem;
  }

  .content-stats {
    display: flex;
    flex-direction: column;

    gap: 0.35rem;
  }

  .stat-label {
    color: var(--gray-5);

    font-size: var(--sm-size);
  }

  .stat-value {
    font-size: 1.8rem;

    font-weight: 700;

    color: var(--bread-crumb-color-span);
  }

  @media (max-width: 768px) {
    .stats-wrapper {
      grid-template-columns: 1fr;
    }
  }
</style>
