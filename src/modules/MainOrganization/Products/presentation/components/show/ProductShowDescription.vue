<script setup lang="ts">
  import { useI18n } from 'vue-i18n';

  defineProps<{
    description?: string;
  }>();
</script>

<template>
  <section class="card full-width">
    <div class="card-header">
      <div class="card-title-wrap">
        <span class="num">04</span>

        <div>
          <h3>
            {{ $t('description') }}
          </h3>
        </div>
      </div>
    </div>

    <div class="description-box">
      <span class="quote">“</span>

      <p>
        {{ description || '—' }}
      </p>
    </div>
  </section>
</template>

<style scoped lang="scss">
  .card {
    grid-column: 1 / -1;
    padding: 1.35rem;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 1rem;
    box-shadow: 0 1px 3px rgb(0 0 0 / 0.04);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.25rem;
  }

  .card-title-wrap {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    .num {
      width: 34px;
      height: 34px;

      display: flex;
      align-items: center;
      justify-content: center;

      border-radius: 0.5rem;
      background: #fff7ed;
      color: #b45309;

      font-size: 0.75rem;
      font-weight: 800;
    }

    h3 {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 700;
      color: #0f172a;
    }
  }

  .description-box {
    display: flex;
    gap: 0.75rem;

    padding: 1.15rem 1.25rem;

    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;

    .quote {
      font-size: 1.75rem;
      font-weight: 800;
      color: #b45309;
      line-height: 1;
    }

    p {
      margin: 0;

      font-size: 0.95rem;
      line-height: 1.8;
      color: #334155;

      white-space: pre-line;
    }
  }
</style>
