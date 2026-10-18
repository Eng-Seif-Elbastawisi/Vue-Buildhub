<script setup lang="ts">
  import { computed } from 'vue';

  import type TitleInterface from '@/base/Data/Models/titleInterface';
  import type TermModel from '@/modules/MainOrganization/Term/core/models/term.model';

  const props = defineProps<{
    modelValue: TitleInterface<number>[];
    options: TermModel[];
  }>();

  const emit = defineEmits<{
    'update:modelValue': [terms: TitleInterface<number>[]];
  }>();

  const selectedTerms = computed(() =>
    props.modelValue.map((selectedTerm) => {
      const fullTerm = props.options.find(
        (availableTerm) => Number(availableTerm.id) === Number(selectedTerm.id),
      );

      return {
        id: Number(selectedTerm.id),
        title: fullTerm?.title || selectedTerm.title,
        description: fullTerm?.description,
      };
    }),
  );

  const removeTerm = (termId: number) => {
    emit(
      'update:modelValue',
      props.modelValue.filter((selectedTerm) => Number(selectedTerm.id) !== termId),
    );
  };
</script>

<template>
  <section class="term-gallery">
    <header class="term-gallery__header">
      <div>
        <h5>{{ $t('project.term_gallery_title') }}</h5>
        <p>{{ $t('project.term_gallery_hint') }}</p>
      </div>

      <span v-if="modelValue.length" class="term-gallery__count" role="status">
        {{ $t('project.selected_terms_count', { count: modelValue.length }) }}
      </span>
    </header>

    <div v-if="selectedTerms.length" class="term-gallery__grid">
      <article v-for="term in selectedTerms" :key="term.id" class="term-gallery__card">
        <span class="term-gallery__check" aria-hidden="true">
          <i class="pi pi-check" />
        </span>

        <span class="term-gallery__content">
          <strong>{{ term.title || $t('project.untitled_term') }}</strong>
          <span>{{ term.description || $t('project.term_without_description') }}</span>
        </span>

        <button
          type="button"
          class="term-gallery__remove"
          :aria-label="
            $t('project.remove_selected_term', {
              title: term.title || $t('project.untitled_term'),
            })
          "
          :title="
            $t('project.remove_selected_term', {
              title: term.title || $t('project.untitled_term'),
            })
          "
          @click="removeTerm(term.id)"
        >
          <i class="pi pi-times" aria-hidden="true" />
        </button>
      </article>
    </div>

    <div v-else class="term-gallery__empty">
      <i class="pi pi-bookmark" aria-hidden="true" />
      <span>{{ $t('project.no_selected_terms') }}</span>
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
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  min-width: 0;
  min-height: 94px;
  padding: 0.9rem;
  border: 1px solid var(--PrimaryColor-alpha-30);
  border-radius: var(--radius-md);
  color: var(--gray-900);
  text-align: start;
  background-color: var(--PrimaryColor-alpha-4);
  box-shadow: none;
}

.term-gallery__check {
  display: grid;
  flex: 0 0 30px;
  width: 30px;
  height: 30px;
  place-items: center;
  border: 1px solid var(--PrimaryColor);
  border-radius: var(--radius-full);
  color: var(--white);
  background-color: var(--PrimaryColor);
  font-size: 0.75rem;
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

.term-gallery__remove {
  display: grid;
  flex: 0 0 30px;
  width: 30px;
  height: 30px;
  margin-inline-start: auto;
  place-items: center;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-full);
  color: var(--gray-500);
  background-color: var(--bg-card);

  &:hover {
    border-color: var(--danger);
    color: var(--danger);
    background-color: var(--danger-light);
  }

  &:focus-visible {
    outline: 3px solid var(--PrimaryColor-alpha-20);
    outline-offset: 2px;
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
