<script setup lang="ts">
  import { computed } from 'vue';

  import TitleInterface from '@/base/Data/Models/titleInterface';
  import type TermModel from '@/modules/MainOrganization/Term/core/models/term.model';

  const props = defineProps<{
    modelValue: TitleInterface<number>[];
    options: TermModel[];
    loading: boolean;
  }>();

  const emit = defineEmits<{
    'update:modelValue': [terms: TitleInterface<number>[]];
  }>();

  const selectedIds = computed(() => new Set(props.modelValue.map((term) => Number(term.id))));

  const isSelected = (term: TermModel): boolean =>
    term.id !== undefined && selectedIds.value.has(Number(term.id));

  const toggleTerm = (term: TermModel) => {
    if (term.id === undefined) return;

    const termId = Number(term.id);
    const nextSelection = isSelected(term)
      ? props.modelValue.filter((selectedTerm) => Number(selectedTerm.id) !== termId)
      : [...props.modelValue, new TitleInterface<number>({ id: termId, title: term.title })];

    emit('update:modelValue', nextSelection);
  };
</script>

<template>
  <section class="term-gallery" :aria-busy="loading">
    <header class="term-gallery__header">
      <div>
        <h5>{{ $t('project.term_gallery_title') }}</h5>
        <p>{{ $t('project.term_gallery_hint') }}</p>
      </div>

      <span v-if="modelValue.length" class="term-gallery__count" role="status">
        {{ $t('project.selected_terms_count', { count: modelValue.length }) }}
      </span>
    </header>

    <div v-if="loading" class="term-gallery__grid" aria-hidden="true">
      <div v-for="index in 4" :key="index" class="term-gallery__skeleton" />
    </div>

    <div v-else-if="options.length" class="term-gallery__grid">
      <button
        v-for="term in options"
        :key="term.id"
        type="button"
        class="term-gallery__card"
        :class="{ 'term-gallery__card--selected': isSelected(term) }"
        :disabled="term.id === undefined"
        :aria-pressed="isSelected(term)"
        @click="toggleTerm(term)"
      >
        <span class="term-gallery__check" aria-hidden="true">
          <i :class="isSelected(term) ? 'pi pi-check' : 'pi pi-plus'" />
        </span>

        <span class="term-gallery__content">
          <strong>{{ term.title || $t('project.untitled_term') }}</strong>
          <span>{{ term.description || $t('project.term_without_description') }}</span>
        </span>
      </button>
    </div>

    <div v-else class="term-gallery__empty">
      <i class="pi pi-bookmark" aria-hidden="true" />
      <span>{{ $t('project.no_terms_available') }}</span>
    </div>
  </section>
</template>

<style scoped lang="scss">
  .term-gallery {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    min-width: 0;
  }

  .term-gallery__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;

    h5,
    p {
      margin: 0;
    }

    h5 {
      color: var(--gray-800);
      font-family: 'Bold';
      font-size: var(--sm-size);
    }

    p {
      margin-block-start: 0.25rem;
      color: var(--gray-500);
      font-size: var(--xs-size);
      line-height: 1.5;
    }
  }

  .term-gallery__count {
    flex: 0 0 auto;
    padding: 0.35rem 0.7rem;
    border-radius: var(--radius-full);
    color: var(--PrimaryColor);
    background-color: var(--PrimaryColor-alpha-8);
    font-size: var(--xs-size);
    font-weight: 600;
  }

  .term-gallery__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
  }

  .term-gallery__card {
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    min-width: 0;
    min-height: 94px;
    padding: 0.9rem;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-md);
    color: var(--gray-700);
    text-align: start;
    background-color: var(--bg-card);
    box-shadow: var(--shadow-sm);
    transition:
      border-color var(--transition-fast),
      box-shadow var(--transition-fast),
      transform var(--transition-fast),
      background-color var(--transition-fast);

    &:hover:not(:disabled) {
      border-color: var(--PrimaryColor-alpha-50);
      box-shadow: var(--shadow-md);
      transform: translateY(-1px);
    }

    &:focus-visible {
      outline: 3px solid var(--PrimaryColor-alpha-20);
      outline-offset: 2px;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }

    &--selected {
      border-color: var(--PrimaryColor);
      color: var(--gray-900);
      background-color: var(--PrimaryColor-alpha-4);
      box-shadow: 0 0 0 1px var(--PrimaryColor-alpha-20);
    }
  }

  .term-gallery__check {
    display: grid;
    flex: 0 0 30px;
    width: 30px;
    height: 30px;
    place-items: center;
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-full);
    color: var(--gray-500);
    background-color: var(--gray-50);
    font-size: 0.75rem;

    .term-gallery__card--selected & {
      border-color: var(--PrimaryColor);
      color: var(--white);
      background-color: var(--PrimaryColor);
    }
  }

  .term-gallery__content {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 0.35rem;

    strong {
      color: var(--gray-900);
      font-family: 'Bold';
      font-size: var(--sm-size);
      line-height: 1.4;
    }

    span {
      display: -webkit-box;
      overflow: hidden;
      color: var(--gray-500);
      font-size: var(--xs-size);
      line-height: 1.55;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
    }
  }

  .term-gallery__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 100px;
    border: 1px dashed var(--border-strong);
    border-radius: var(--radius-md);
    color: var(--gray-500);
    background-color: var(--gray-50);
    font-size: var(--sm-size);
  }

  .term-gallery__skeleton {
    min-height: 94px;
    border-radius: var(--radius-md);
    background: linear-gradient(90deg, var(--gray-100), var(--gray-200), var(--gray-100));
    background-size: 200% 100%;
    animation: term-gallery-loading 1.2s ease-in-out infinite;
  }

  @keyframes term-gallery-loading {
    to {
      background-position: -200% 0;
    }
  }

  @media (max-width: 720px) {
    .term-gallery__grid {
      grid-template-columns: 1fr;
    }

    .term-gallery__header {
      flex-direction: column;
      gap: 0.6rem;
    }
  }
</style>
