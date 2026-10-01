<template>
  <div
    class="project-pdf-content project-show-skeleton"
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <span class="project-show-skeleton__accessible-label">{{ $t('loading') }}</span>

    <section class="project-command-hero" aria-hidden="true">
      <div class="project-hero project-show-skeleton__hero">
        <div class="project-hero__inner">
          <span class="project-show-skeleton__bar project-show-skeleton__breadcrumb" />

          <div class="project-hero__body project-show-skeleton__hero-body">
            <div class="project-hero__content project-show-skeleton__identity">
              <span class="project-show-skeleton__bar project-show-skeleton__type" />
              <div class="project-show-skeleton__title-row">
                <span class="project-show-skeleton__bar project-show-skeleton__title" />
                <span class="project-show-skeleton__bar project-show-skeleton__status" />
              </div>
              <div class="project-show-skeleton__metadata">
                <span v-for="item in 3" :key="item" class="project-show-skeleton__bar" />
              </div>
            </div>
            <span class="project-show-skeleton__bar project-show-skeleton__action" />
          </div>
        </div>
      </div>

      <div class="project-tabs project-show-skeleton__tabs">
        <span v-for="tab in 7" :key="tab" class="project-show-skeleton__tab">
          <span class="project-show-skeleton__bar project-show-skeleton__tab-icon" />
          <span class="project-show-skeleton__bar project-show-skeleton__tab-label" />
        </span>
      </div>
    </section>

    <section class="project-content-surface" aria-hidden="true">
      <div class="project-stats project-show-skeleton__stats">
        <div v-for="stat in 4" :key="stat" class="project-stat-card project-show-skeleton__stat">
          <span class="project-show-skeleton__bar project-show-skeleton__stat-icon" />
          <div class="project-show-skeleton__stat-copy">
            <span class="project-show-skeleton__bar project-show-skeleton__stat-label" />
            <span class="project-show-skeleton__bar project-show-skeleton__stat-value" />
            <span class="project-show-skeleton__bar project-show-skeleton__stat-caption" />
          </div>
        </div>
      </div>

      <div class="project-dashboard-grid">
        <div class="project-dashboard-main">
          <section class="project-card project-show-skeleton__panel project-show-skeleton__info">
            <div class="project-show-skeleton__panel-heading">
              <span class="project-show-skeleton__bar project-show-skeleton__panel-icon" />
              <span class="project-show-skeleton__bar project-show-skeleton__panel-title" />
            </div>
            <div class="project-show-skeleton__info-grid">
              <div v-for="field in 8" :key="field" class="project-show-skeleton__field">
                <span class="project-show-skeleton__bar project-show-skeleton__field-label" />
                <span class="project-show-skeleton__bar project-show-skeleton__field-value" />
              </div>
            </div>
          </section>

          <section class="project-card project-show-skeleton__panel project-show-skeleton__floors">
            <div class="project-show-skeleton__panel-heading">
              <span class="project-show-skeleton__bar project-show-skeleton__panel-icon" />
              <span class="project-show-skeleton__bar project-show-skeleton__panel-title" />
            </div>
            <div v-for="floor in 2" :key="floor" class="project-show-skeleton__list-row">
              <span class="project-show-skeleton__bar project-show-skeleton__list-name" />
              <span class="project-show-skeleton__bar project-show-skeleton__list-detail" />
            </div>
          </section>

          <section class="project-card project-show-skeleton__panel project-show-skeleton__spaces">
            <div class="project-show-skeleton__panel-heading">
              <span class="project-show-skeleton__bar project-show-skeleton__panel-icon" />
              <span class="project-show-skeleton__bar project-show-skeleton__panel-title" />
            </div>
            <div class="project-show-skeleton__compact-fields">
              <div v-for="field in 3" :key="field" class="project-show-skeleton__field">
                <span class="project-show-skeleton__bar project-show-skeleton__field-label" />
                <span class="project-show-skeleton__bar project-show-skeleton__field-value" />
              </div>
            </div>
          </section>

          <section class="project-card project-show-skeleton__panel project-show-skeleton__pricing">
            <div class="project-show-skeleton__panel-heading">
              <span class="project-show-skeleton__bar project-show-skeleton__panel-icon" />
              <span class="project-show-skeleton__bar project-show-skeleton__panel-title" />
            </div>
            <div class="project-show-skeleton__compact-fields">
              <div v-for="field in 3" :key="field" class="project-show-skeleton__field">
                <span class="project-show-skeleton__bar project-show-skeleton__field-label" />
                <span class="project-show-skeleton__bar project-show-skeleton__field-value" />
              </div>
            </div>
          </section>
        </div>

        <div class="project-dashboard-side">
          <section class="project-card project-show-skeleton__panel project-show-skeleton__preview">
            <div class="project-show-skeleton__panel-heading">
              <span class="project-show-skeleton__bar project-show-skeleton__panel-icon" />
              <span class="project-show-skeleton__bar project-show-skeleton__panel-title" />
            </div>
            <span class="project-show-skeleton__bar project-show-skeleton__preview-image" />
            <div class="project-show-skeleton__compact-fields">
              <div v-for="field in 2" :key="field" class="project-show-skeleton__field">
                <span class="project-show-skeleton__bar project-show-skeleton__field-label" />
                <span class="project-show-skeleton__bar project-show-skeleton__field-value" />
              </div>
            </div>
          </section>

          <section class="project-card project-show-skeleton__panel project-show-skeleton__items">
            <div class="project-show-skeleton__panel-heading">
              <span class="project-show-skeleton__bar project-show-skeleton__panel-icon" />
              <span class="project-show-skeleton__bar project-show-skeleton__panel-title" />
            </div>
            <div v-for="item in 3" :key="item" class="project-show-skeleton__list-row">
              <span class="project-show-skeleton__bar project-show-skeleton__list-name" />
              <span class="project-show-skeleton__bar project-show-skeleton__list-detail" />
            </div>
          </section>

          <section class="project-card project-show-skeleton__panel project-show-skeleton__terms">
            <div class="project-show-skeleton__panel-heading">
              <span class="project-show-skeleton__bar project-show-skeleton__panel-icon" />
              <span class="project-show-skeleton__bar project-show-skeleton__panel-title" />
            </div>
            <span class="project-show-skeleton__bar project-show-skeleton__terms-line" />
            <span class="project-show-skeleton__bar project-show-skeleton__terms-line" />
          </section>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
  .project-show-skeleton {
    width: 100%;
    min-width: 0;
    pointer-events: none;
  }

  .project-show-skeleton__accessible-label {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .project-show-skeleton__bar {
    display: block;
    width: 100%;
    height: 10px;
    border-radius: 4px;
    background: var(--gray-200);
    animation: project-show-skeleton-pulse 2.2s ease-in-out infinite;
  }

  .project-show-skeleton__hero {
    background: linear-gradient(115deg, var(--gray-900), var(--gray-800));
  }

  .project-show-skeleton__hero .project-show-skeleton__bar {
    background: color-mix(in sRGB, var(--white) 38%, transparent);
  }

  .project-show-skeleton__breadcrumb {
    width: 150px;
    height: 9px;
  }

  .project-show-skeleton__hero-body {
    justify-content: space-between;
    gap: 1rem;
  }

  .project-show-skeleton__identity {
    flex: 1 1 auto;
    min-width: 0;
  }

  .project-show-skeleton__type {
    width: 120px;
    height: 24px;
    border-radius: 999px;
  }

  .project-show-skeleton__title-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    width: min(100%, 560px);
  }

  .project-show-skeleton__title {
    width: min(70%, 410px);
    height: 34px;
  }

  .project-show-skeleton__status {
    width: 88px;
    height: 26px;
    border-radius: 999px;
  }

  .project-show-skeleton__metadata {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .project-show-skeleton__metadata .project-show-skeleton__bar {
    width: clamp(84px, 10vw, 132px);
    height: 9px;
  }

  .project-show-skeleton__action {
    width: 142px;
    height: 44px;
    flex: 0 0 auto;
    border-radius: 12px;
  }

  .project-show-skeleton__tabs {
    pointer-events: none;
    scrollbar-width: none;
  }

  .project-show-skeleton__tabs::-webkit-scrollbar {
    display: none;
  }

  .project-show-skeleton__tab {
    display: flex;
    min-width: 132px;
    min-height: 40px;
    align-items: center;
    gap: 8px;
    padding-inline: 0.8rem;
  }

  .project-show-skeleton__tab-icon {
    width: 26px;
    height: 26px;
    flex: 0 0 auto;
    border-radius: 8px;
  }

  .project-show-skeleton__tab-label {
    width: 65px;
    height: 8px;
  }

  .project-show-skeleton__stat-icon {
    width: 54px;
    height: 54px;
    border-radius: 12px;
  }

  .project-show-skeleton__stat-copy {
    min-width: 0;
  }

  .project-show-skeleton__stat-label {
    width: 68%;
    height: 8px;
  }

  .project-show-skeleton__stat-value {
    width: 80%;
    height: 20px;
  }

  .project-show-skeleton__stat-caption {
    width: 52%;
    height: 7px;
  }

  .project-show-skeleton__panel {
    display: grid;
    gap: 1rem;
  }

  .project-show-skeleton__panel-heading {
    display: flex;
    align-items: center;
    gap: 0.65rem;
  }

  .project-show-skeleton__panel-icon {
    width: 28px;
    height: 28px;
    flex: 0 0 auto;
    border-radius: 8px;
  }

  .project-show-skeleton__panel-title {
    width: clamp(100px, 25%, 180px);
    height: 12px;
  }

  .project-show-skeleton__info-grid,
  .project-show-skeleton__compact-fields {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0;
    border: 1px solid var(--border-weak);
    border-radius: 10px;
    overflow: hidden;
  }

  .project-show-skeleton__field {
    display: grid;
    min-width: 0;
    gap: 0.7rem;
    padding: 1rem;
    border-inline-end: 1px solid var(--border-weak);
    border-block-end: 1px solid var(--border-weak);
  }

  .project-show-skeleton__field-label {
    width: 52%;
    height: 7px;
  }

  .project-show-skeleton__field-value {
    width: 76%;
    height: 12px;
  }

  .project-show-skeleton__list-row {
    display: flex;
    min-width: 0;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    min-height: 42px;
    border-block-start: 1px solid var(--border-weak);
  }

  .project-show-skeleton__list-name {
    width: min(45%, 220px);
  }

  .project-show-skeleton__list-detail {
    width: min(22%, 100px);
  }

  .project-show-skeleton__preview-image {
    height: 118px;
    border-radius: 10px;
    background: var(--gray-100);
  }

  .project-show-skeleton__preview .project-show-skeleton__compact-fields {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .project-show-skeleton__terms-line {
    width: 88%;
  }

  .project-show-skeleton__terms-line:last-child {
    width: 62%;
  }

  @keyframes project-show-skeleton-pulse {
    0%,
    100% {
      opacity: 0.62;
    }

    50% {
      opacity: 0.9;
    }
  }

  @media (max-width: 1050px) {
    .project-show-skeleton__info-grid,
    .project-show-skeleton__compact-fields {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 680px) {
    .project-show-skeleton__hero-body {
      align-items: flex-start;
      flex-direction: column;
    }

    .project-show-skeleton__title {
      width: min(65%, 280px);
      height: 27px;
    }

    .project-show-skeleton__metadata .project-show-skeleton__bar {
      width: 85px;
    }

    .project-show-skeleton__info-grid,
    .project-show-skeleton__compact-fields,
    .project-show-skeleton__preview .project-show-skeleton__compact-fields {
      grid-template-columns: minmax(0, 1fr);
    }

    .project-show-skeleton__field {
      border-inline-end: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .project-show-skeleton__bar {
      animation: none;
    }
  }
</style>
