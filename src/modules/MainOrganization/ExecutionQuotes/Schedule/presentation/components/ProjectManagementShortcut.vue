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
    <div
      v-if="icon.includes('calendar') || icon.includes('map-marker') || icon.includes('list-check')"
      class="project-shortcut__visual"
      aria-hidden="true"
    >
      <svg v-if="icon.includes('calendar')" viewBox="0 0 480 160" fill="none">
        <path
          class="project-shortcut__guide"
          d="M40 30H440M40 80H440M40 130H440M100 16V144M200 16V144M300 16V144M400 16V144"
        />
        <path class="project-shortcut__line" d="M65 43H215V80H315V117H410" />
        <rect x="65" y="33" width="150" height="20" rx="5" />
        <rect x="215" y="70" width="100" height="20" rx="5" />
        <rect x="315" y="107" width="95" height="20" rx="5" />
      </svg>
      <svg v-else-if="icon.includes('map-marker')" viewBox="0 0 480 160" fill="none">
        <path
          class="project-shortcut__guide"
          d="M105 17H375V143H105ZM195 17V91H105M195 91H275V143M275 17V77H375M275 77V91H195"
        />
        <path
          class="project-shortcut__line"
          d="M105 143V17H375V143H105M195 17V91H275V143M275 17V77H375"
        />
        <path d="M120 32H180V76H120ZM290 32H360V62H290ZM290 106H360V128H290Z" />
      </svg>
      <svg v-else viewBox="0 0 480 160" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path class="project-shortcut__guide" d="M180 54H350M180 96H350M180 138H300" />
        <rect x="125" y="25" width="28" height="28" rx="5" />
        <rect x="125" y="67" width="28" height="28" rx="5" />
        <rect x="125" y="109" width="28" height="28" rx="5" />
        <path
          class="project-shortcut__line"
          d="M132 38L139 45L150 32M132 80L139 87L150 74M180 39H350M180 81H350M180 123H300"
        />
      </svg>
    </div>
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
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    border: 1px solid var(--border-weak);
    border-radius: 16px;
    background: var(--bg-card);
    color: var(--title-card-color);
    text-decoration: none;
    transition:
      border-color 220ms ease,
      background-color 220ms ease;
  }

  .project-shortcut:hover {
    border-color: var(--PrimaryColor);
    text-decoration: none;
  }

  .project-shortcut:focus-visible {
    outline: 2px solid var(--PrimaryColor);
    outline-offset: 4px;
  }

  .project-shortcut__visual {
    display: grid;
    place-items: center;
    height: 10rem;
    overflow: hidden;
    background: var(--PrimaryColor-alpha-8);
    color: var(--PrimaryColor);
  }

  .project-shortcut__visual svg {
    width: 100%;
    height: 100%;
    max-width: 32rem;
    stroke: currentColor;
    stroke-width: 1.5;
    transition: transform 500ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .project-shortcut__visual rect {
    fill: var(--bg-card);
    stroke-width: 2;
  }

  .project-shortcut__guide {
    opacity: 0.3;
  }

  .project-shortcut__line {
    stroke-width: 2.5;
    stroke-dasharray: 1100;
    stroke-dashoffset: 0;
  }

  .project-shortcut:hover .project-shortcut__line,
  .project-shortcut:focus-visible .project-shortcut__line {
    animation: workspace-trace 700ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  .project-shortcut:hover svg {
    transform: scale(1.035);
  }

  .project-shortcut__heading {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    padding: 1.5rem 1.5rem 1rem;
  }

  .project-shortcut__heading > div {
    flex: 1;
    min-width: 0;
  }

  .project-shortcut h3,
  .project-shortcut p,
  .project-shortcut dl {
    margin: 0;
  }

  .project-shortcut h3 {
    margin-block-end: 0.4rem;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .project-shortcut p,
  .project-shortcut dt {
    color: var(--subtitle-color);
    font-size: 0.8rem;
    line-height: 1.65;
  }

  .project-shortcut > p {
    padding: 0 1.5rem 1rem;
  }

  .project-shortcut__icon {
    color: var(--PrimaryColor);
    font-size: 1.3rem;
  }

  .project-shortcut__badge {
    align-self: start;
    padding: 0.3rem 0.6rem;
    border-radius: var(--radius-full);
    background: var(--PrimaryColor-alpha-8);
    color: var(--PrimaryColor);
    font-size: 0.75rem;
  }

  .project-shortcut__metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(5rem, 1fr));
    gap: 0.75rem;
    padding: 0 1.5rem 1.5rem;
  }

  .project-shortcut dd {
    margin: 0.25rem 0 0;
    font-weight: 600;
    font-size: 0.85rem;
    font-variant-numeric: tabular-nums;
    overflow-wrap: anywhere;
  }

  .project-shortcut__cta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    margin-block-start: auto;
    padding: 1rem 1.5rem;
    border-block-start: 1px solid var(--border-weak);
    color: var(--title-card-color);
    font-size: 0.85rem;
    font-weight: 600;
  }

  .project-shortcut__cta .pi {
    transition: transform 220ms ease;
  }

  .project-shortcut:hover .project-shortcut__cta .pi {
    transform: translateY(-3px);
  }

  @keyframes workspace-trace {
    from {
      stroke-dashoffset: 1100;
    }

    to {
      stroke-dashoffset: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .project-shortcut,
    .project-shortcut__visual svg,
    .project-shortcut__cta .pi {
      transition: none;
    }

    .project-shortcut:hover svg,
    .project-shortcut:hover .project-shortcut__cta .pi {
      transform: none;
    }

    .project-shortcut:hover .project-shortcut__line,
    .project-shortcut:focus-visible .project-shortcut__line {
      animation: none;
    }
  }
</style>
