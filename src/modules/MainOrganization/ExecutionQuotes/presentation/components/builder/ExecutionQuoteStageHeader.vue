<script setup lang="ts">
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';

  defineProps<{
    stageTitle?: string;
    quoteTypeTitle?: string;
    active?: boolean | number;
  }>();

  const emit = defineEmits<{
    (event: 'back'): void;
  }>();
</script>

<template>
  <section class="execution-builder-card stage-header">
    <div>
      <AppButton
        class="stage-header__back"
        theme="secondary"
        size="sm"
        outline
        icon="left"
        @click="emit('back')"
      >
        <template #icon>
          <i class="pi pi-arrow-right" aria-hidden="true"></i>
        </template>
        {{ $t('execution_quote.back_to_stages') }}
      </AppButton>

      <div class="stage-header__meta">
        <span class="stage-header__badge">{{ $t('execution_quote.stage_details') }}</span>
        <span v-if="quoteTypeTitle" class="stage-header__type">{{ quoteTypeTitle }}</span>
        <span v-if="active !== undefined" class="stage-header__status">
          {{ active ? $t('active') : $t('inactive') }}
        </span>
      </div>

      <h2>{{ stageTitle || $t('execution_quote.stage_details') }}</h2>
      <p>{{ $t('execution_quote.stage_details_hint') }}</p>
    </div>
  </section>
</template>

<style scoped lang="scss">
  .execution-builder-card {
    padding: 1.1rem;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-md);
    background: var(--bg-card);
    box-shadow: var(--shadow-sm);
  }

  .stage-header__back {
    margin-bottom: 0.7rem;
    width: fit-content;
    margin-inline-start: auto;
  }

  .stage-header__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
  }

  .stage-header__badge,
  .stage-header__type,
  .stage-header__status {
    display: inline-flex;
    width: fit-content;
    padding: 0.25rem 0.55rem;
    border-radius: var(--radius-full);
    font-size: var(--xs-size);
    font-weight: 700;
  }

  .stage-header__badge {
    background: var(--PrimaryColor-light);
    color: var(--PrimaryColor);
  }

  .stage-header__type {
    background: var(--btn-easy);
    color: var(--PrimaryColor);
  }

  .stage-header__status {
    background: var(--light-green-bg);
    color: var(--primary-green);
  }

  .stage-header h2 {
    margin: 0.55rem 0 0;
    color: var(--title-card-color);
  }

  .stage-header p {
    margin: 0.3rem 0 0;
    color: var(--subtitle-color);
    font-size: var(--sm-size);
  }
</style>
