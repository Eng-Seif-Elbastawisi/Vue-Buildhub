<script setup lang="ts">
  import Skeleton from 'primevue/skeleton';
</script>

<template>
  <div class="execution-quote-show-skeleton" role="status" aria-live="polite" aria-busy="true">
    <span class="execution-quote-show-skeleton__status">{{ $t('loading') }}</span>

    <div class="execution-quote-show-skeleton__content" aria-hidden="true">
      <section class="execution-quote-show-skeleton__hero">
        <div class="execution-quote-show-skeleton__hero-copy">
          <div class="execution-quote-show-skeleton__badges">
            <Skeleton width="7.5rem" height="1.8rem" border-radius="2rem" />
            <Skeleton width="6rem" height="1.8rem" border-radius="2rem" />
          </div>
          <Skeleton width="min(24rem, 75%)" height="3rem" />
          <Skeleton width="min(18rem, 62%)" height="1rem" />
          <div class="execution-quote-show-skeleton__date">
            <Skeleton shape="circle" size="1.15rem" />
            <Skeleton width="6rem" height="0.8rem" />
            <Skeleton width="8.5rem" height="0.8rem" />
          </div>
        </div>

        <div class="execution-quote-show-skeleton__type">
          <Skeleton width="5rem" height="0.75rem" />
          <Skeleton width="8rem" height="1.5rem" />
        </div>
      </section>

      <div class="execution-quote-show-skeleton__details-grid">
        <section
          v-for="detailCardIndex in 2"
          :key="detailCardIndex"
          class="execution-quote-show-skeleton__card"
        >
          <div class="execution-quote-show-skeleton__section-title">
            <Skeleton shape="circle" size="2.75rem" />
            <div>
              <Skeleton width="9rem" height="1rem" />
              <Skeleton width="13rem" height="0.7rem" />
            </div>
          </div>

          <div class="execution-quote-show-skeleton__fields">
            <article v-for="fieldIndex in 5" :key="fieldIndex">
              <Skeleton width="45%" height="0.65rem" />
              <Skeleton width="72%" height="0.95rem" />
            </article>
          </div>
        </section>
      </div>

      <section class="execution-quote-show-skeleton__attachments">
        <div class="execution-quote-show-skeleton__attachments-header">
          <div class="execution-quote-show-skeleton__section-title">
            <Skeleton shape="circle" size="2.75rem" />
            <div>
              <Skeleton width="9rem" height="1rem" />
              <Skeleton width="14rem" height="0.7rem" />
            </div>
          </div>
          <Skeleton width="5rem" height="1.7rem" border-radius="2rem" />
        </div>

        <div class="execution-quote-show-skeleton__attachment-grid">
          <article
            v-for="attachmentIndex in 3"
            :key="attachmentIndex"
            class="execution-quote-show-skeleton__attachment"
          >
            <Skeleton width="4rem" height="4rem" />
            <div>
              <Skeleton width="70%" height="0.95rem" />
              <Skeleton width="45%" height="0.7rem" />
            </div>
          </article>
        </div>
      </section>

      <section class="execution-quote-show-skeleton__stages">
        <div class="execution-quote-show-skeleton__section-title">
          <Skeleton shape="circle" size="2.75rem" />
          <div>
            <Skeleton width="10rem" height="1rem" />
            <Skeleton width="14rem" height="0.7rem" />
          </div>
        </div>

        <div class="execution-quote-show-skeleton__stage">
          <div class="execution-quote-show-skeleton__stage-header">
            <div>
              <Skeleton width="5rem" height="0.65rem" />
              <Skeleton width="9rem" height="1.1rem" />
            </div>
            <div class="execution-quote-show-skeleton__stage-badges">
              <Skeleton v-for="badgeIndex in 4" :key="badgeIndex" width="7rem" height="1.8rem" />
            </div>
          </div>

          <div class="execution-quote-show-skeleton__table">
            <div
              v-for="tableRowIndex in 4"
              :key="tableRowIndex"
              class="execution-quote-show-skeleton__table-row"
            >
              <Skeleton
                v-for="tableCellIndex in 6"
                :key="tableCellIndex"
                :width="tableCellIndex === 1 ? '75%' : '58%'"
                :height="tableRowIndex === 1 ? '0.7rem' : '0.9rem'"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .execution-quote-show-skeleton__status {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .execution-quote-show-skeleton__content {
    display: grid;
    gap: 1rem;
  }

  .execution-quote-show-skeleton__hero {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 2rem;
    min-height: 15rem;
    padding: clamp(1.25rem, 4vw, 2.5rem);
    border-radius: var(--radius-md);
    background: var(--gray-950);
    box-shadow: var(--shadow-md);
  }

  .execution-quote-show-skeleton__hero-copy {
    display: grid;
    flex: 1;
    gap: 1rem;
  }

  .execution-quote-show-skeleton__badges,
  .execution-quote-show-skeleton__date,
  .execution-quote-show-skeleton__stage-badges {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }

  .execution-quote-show-skeleton__type {
    display: grid;
    min-width: min(100%, 14rem);
    place-items: center;
    gap: 0.6rem;
    padding: 1.15rem;
    border: 1px solid var(--white-alpha-20);
    border-radius: var(--radius-md);
    background: var(--white-alpha-15);
  }

  .execution-quote-show-skeleton__details-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  .execution-quote-show-skeleton__card,
  .execution-quote-show-skeleton__attachments,
  .execution-quote-show-skeleton__stages {
    display: grid;
    gap: 1.25rem;
    padding: 1.25rem;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-md);
    background: var(--bg-card);
    box-shadow: var(--shadow-sm);
  }

  .execution-quote-show-skeleton__section-title,
  .execution-quote-show-skeleton__attachments-header,
  .execution-quote-show-skeleton__stage-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .execution-quote-show-skeleton__section-title {
    justify-content: flex-start;
  }

  .execution-quote-show-skeleton__section-title > div,
  .execution-quote-show-skeleton__stage-header > div:first-child {
    display: grid;
    gap: 0.45rem;
  }

  .execution-quote-show-skeleton__fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
  }

  .execution-quote-show-skeleton__fields article {
    display: grid;
    gap: 0.45rem;
    padding: 0.9rem;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-sm);
    background: var(--bg-section);
  }

  .execution-quote-show-skeleton__fields article:last-child {
    grid-column: 1 / -1;
  }

  .execution-quote-show-skeleton__attachment-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
    gap: 0.75rem;
  }

  .execution-quote-show-skeleton__attachment {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    min-height: 5.5rem;
    padding: 0.75rem;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-sm);
    background: var(--bg-section);
  }

  .execution-quote-show-skeleton__attachment > div {
    display: grid;
    flex: 1;
    gap: 0.55rem;
  }

  .execution-quote-show-skeleton__stage {
    overflow: hidden;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-md);
    background: var(--bg-section);
  }

  .execution-quote-show-skeleton__stage-header {
    padding: 1rem;
  }

  .execution-quote-show-skeleton__table {
    overflow: hidden;
    border-block-start: 1px solid var(--border-weak);
    background: var(--bg-card);
  }

  .execution-quote-show-skeleton__table-row {
    display: grid;
    grid-template-columns: 1.4fr repeat(5, minmax(5rem, 1fr));
    gap: 0.75rem;
    align-items: center;
    min-width: 48rem;
    padding: 0.85rem;
    border-block-end: 1px solid var(--border-weak);
  }

  .execution-quote-show-skeleton__table-row:first-child {
    background: var(--bg-section);
  }

  .execution-quote-show-skeleton__table-row:last-child {
    border-block-end: 0;
  }

  @media (max-width: 800px) {
    .execution-quote-show-skeleton__hero,
    .execution-quote-show-skeleton__attachments-header,
    .execution-quote-show-skeleton__stage-header {
      align-items: stretch;
      flex-direction: column;
    }

    .execution-quote-show-skeleton__details-grid {
      grid-template-columns: 1fr;
    }

    .execution-quote-show-skeleton__type {
      width: 100%;
      min-width: 0;
    }
  }

  @media (max-width: 520px) {
    .execution-quote-show-skeleton__fields {
      grid-template-columns: 1fr;
    }

    .execution-quote-show-skeleton__fields article:last-child {
      grid-column: auto;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .execution-quote-show-skeleton :deep(.p-skeleton)::after {
      animation: none;
    }
  }
</style>
