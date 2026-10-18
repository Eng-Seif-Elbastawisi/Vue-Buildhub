<script setup lang="ts">
  defineProps<{
    description?: string;
  }>();
</script>

<template>
  <section class="description-card">
    <header class="section-header">
      <span class="section-icon" aria-hidden="true">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16h16V8z" />
          <path d="M14 2v6h6M8 13h8M8 17h6" />
        </svg>
      </span>
      <div>
        <h3>{{ $t('Products.show.additional_description') }}</h3>
        <p>{{ $t('Products.show.description_hint') }}</p>
      </div>
    </header>

    <p class="description-text">{{ description || '—' }}</p>
  </section>
</template>

<style scoped lang="scss">
.description-card {
  padding: 1.15rem;
  background: var(--bg-card);
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-lg);
  box-shadow: none;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 1rem;

  h3 {
    margin: 0;
    color: var(--title-color);
    font-size: var(--md-size);
    font-weight: 800;
  }

  p {
    margin: 0.15rem 0 0;
    color: var(--subtitle-color);
    font-size: var(--xs-size);
  }
}

.section-icon {
  display: grid;
  flex: 0 0 2.4rem;
  width: 2.4rem;
  height: 2.4rem;
  color: var(--PrimaryColor);
  background: var(--PrimaryColor-light);
  border-radius: var(--radius-sm);
  place-items: center;
}

.description-text {
  margin: 0;
  padding: 1rem;
  color: var(--gray-700);
  background: var(--gray-50);
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-sm);
  font-size: var(--sm-size);
  line-height: 1.9;
  white-space: pre-line;
}
</style>
