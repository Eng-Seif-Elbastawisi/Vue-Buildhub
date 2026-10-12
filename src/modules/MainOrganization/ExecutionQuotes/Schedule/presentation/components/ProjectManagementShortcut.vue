<script setup lang="ts">
  defineProps<{
    title: string;
    openLabel?: string;
    description: string;
    icon: string;
    to: string;
    state: 'loading' | 'error' | 'available' | 'unavailable';
    status?: string | number | null;
    metrics: { label: string; value: string | number | null | undefined }[];
  }>();
</script>
<template>
  <RouterLink :to="to" class="project-shortcut">
    <div class="project-shortcut__heading">
      <span class="project-shortcut__icon"><i :class="icon" aria-hidden="true"></i></span>
      <div>
        <h3>{{ title }}</h3>
        <p>{{ description }}</p>
      </div>
      <span
        v-if="state === 'available' && status !== undefined && status !== null"
        class="project-shortcut__badge"
        >{{ status }}</span
      >
    </div>
    <p v-if="state === 'loading'" role="status">{{ $t('schedule.loading') }}</p>
    <p v-else-if="state === 'error'" role="status">{{ $t('schedule.metrics_error') }}</p>
    <p v-else-if="state === 'unavailable'">{{ $t('schedule.not_available') }}</p>
    <dl v-else class="project-shortcut__metrics">
      <div v-for="metric in metrics" :key="metric.label">
        <dt>{{ metric.label }}</dt>
        <dd>
          {{
            metric.value === '' || metric.value === null || metric.value === undefined
              ? $t('schedule.not_available')
              : metric.value
          }}
        </dd>
      </div>
    </dl>
    <span class="project-shortcut__cta"
      >{{ openLabel || $t('schedule.open') }} <i class="pi pi-arrow-up-right" aria-hidden="true"></i
    ></span>
  </RouterLink>
</template>
<style scoped lang="scss">
  .project-shortcut {
    display: grid;
    gap: 1.25rem;
    padding: 1.5rem;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-md);
    background: var(--bg-card);
    color: var(--title-card-color);
    text-decoration: none;
    box-shadow: var(--shadow-sm);
    transition:
      border-color 180ms ease,
      box-shadow 180ms ease,
      transform 180ms ease;
  }

  .project-shortcut:hover {
    text-decoration: none;
    transform: translateY(-2px);
    border-color: var(--PrimaryColor-alpha-20);
    box-shadow: var(--shadow-md);
  }

  .project-shortcut:focus-visible {
    outline: 3px solid var(--PrimaryColor-alpha-20);
    outline-offset: 3px;
  }

  .project-shortcut__heading {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .project-shortcut h3,
  .project-shortcut p,
  .project-shortcut dl {
    margin: 0;
  }

  .project-shortcut h3 {
    margin-block-end: 0.35rem;
    font-size: 1.125rem;
  }

  .project-shortcut p,
  .project-shortcut dt {
    color: var(--subtitle-color);
    font-size: var(--xs-size);
  }

  .project-shortcut__icon {
    display: grid;
    flex: 0 0 3rem;
    place-items: center;
    height: 3rem;
    border-radius: var(--radius-sm);
    background: var(--PrimaryColor-alpha-8);
    color: var(--PrimaryColor);
    font-size: 1.3rem;
  }

  .project-shortcut__badge {
    margin-inline-start: auto;
    padding: 0.35rem 0.75rem;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-full);
    color: var(--PrimaryColor);
    font-size: var(--xs-size);
  }

  .project-shortcut__metrics {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1rem;
  }

  .project-shortcut dd {
    margin: 0.35rem 0 0;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    overflow-wrap: anywhere;
  }

  .project-shortcut__cta {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
    color: var(--PrimaryColor);
    font-weight: 700;
  }

  @media (max-width: 640px) {
    .project-shortcut__metrics {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .project-shortcut {
      transition: none;
    }

    .project-shortcut:hover {
      text-decoration: none;
      transform: none;
    }
  }
</style>
