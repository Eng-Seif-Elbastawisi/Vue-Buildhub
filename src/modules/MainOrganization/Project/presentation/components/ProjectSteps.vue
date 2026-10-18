<script setup lang="ts">
defineProps<{
  currentStep: 1 | 2 | 3;
}>();

const steps = [
  {
    id: 1,
    titleKey: 'Project.steps.request_data',
    descriptionKey: 'Project.steps.request_data_description',
  },
  {
    id: 2,
    titleKey: 'Project.steps.request_preview',
    descriptionKey: 'Project.steps.request_preview_description',
  },
  {
    id: 3,
    titleKey: 'Project.steps.request_floors',
    descriptionKey: 'Project.steps.request_floors_description',
  },
];
</script>

<template>
  <nav class="project-steps" :aria-label="$t('Project.steps.progress_label')">
    <ol class="project-steps__track">
      <li
        v-for="(step, index) in steps"
        :key="step.id"
        class="project-steps__item"
        :class="{
          active: currentStep === step.id,
          completed: currentStep > step.id,
        }"
        :aria-current="currentStep === step.id ? 'step' : undefined"
      >
        <span class="project-steps__circle" aria-hidden="true">
          <span v-if="currentStep > step.id">✓</span>
          <span v-else>{{ step.id }}</span>
        </span>

        <span class="project-steps__content">
          <strong>{{ $t(step.titleKey) }}</strong>
          <small>{{ $t(step.descriptionKey) }}</small>
        </span>

        <span
          v-if="index < steps.length - 1"
          class="project-steps__line"
          :class="{ completed: currentStep > step.id }"
          aria-hidden="true"
        ></span>
      </li>
    </ol>
  </nav>
</template>

<style scoped lang="scss">
.project-steps {
  display: grid;
  width: 100%;
  min-height: 7rem;
  padding: 1.25rem clamp(1rem, 2.5vw, 2rem);
  place-items: center;
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-lg);
  background: var(--bg-card);
  box-shadow: none;
}

.project-steps__track {
  display: grid;
  width: min(100%, 90rem);
  margin: 0;
  padding: 0;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  list-style: none;
}

.project-steps__item {
  position: relative;
  display: grid;
  min-width: 0;
  justify-items: center;
  gap: 0.6rem;
  text-align: center;
  animation: project-step-enter 420ms cubic-bezier(0.2, 0.8, 0.2, 1) both;

  &.active {
    .project-steps__circle {
      border-color: var(--PrimaryColor);
      background: var(--PrimaryColor);
      color: var(--standard-white);
      box-shadow: none;

      &::after {
        position: absolute;
        inset: -0.45rem;
        border: 2px solid var(--PrimaryColor-alpha-30);
        border-radius: var(--radius-full);
        content: '';
        animation: project-step-pulse 1.8s ease-out infinite;
      }
    }

    .project-steps__content {
      background: var(--PrimaryColor-alpha-4);
    }

    strong {
      color: var(--PrimaryColor);
    }
  }

  &.completed {
    .project-steps__circle {
      border-color: var(--PrimaryColor);
      background: var(--PrimaryColor);
      color: var(--standard-white);
    }
  }
}

.project-steps__item:nth-child(2) {
  animation-delay: 70ms;
}

.project-steps__item:nth-child(3) {
  animation-delay: 140ms;
}

.project-steps__circle {
  position: relative;
  z-index: 2;
  display: grid;
  width: 2.65rem;
  height: 2.65rem;
  place-items: center;
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-full);
  background: var(--bg-card);
  color: var(--gray-600);
  font-family: 'Bold';
  font-size: 0.9rem;
  transition:
    color var(--transition-fast),
    border-color var(--transition-fast),
    background-color var(--transition-fast),
    box-shadow var(--transition-fast),
    transform var(--transition-fast);
}

.project-steps__content {
  z-index: 2;
  display: grid;
  max-width: 13rem;
  gap: 0.2rem;
  padding: 0.35rem 0.7rem;
  border-radius: var(--radius-md);
  transition: background-color var(--transition-fast);

  strong {
    margin: 0;
    font-size: var(--sm-size);
    color: var(--gray-800);
    transition: color var(--transition-fast);
  }

  small {
    margin: 0;
    color: var(--gray-500);
    font-size: var(--xs-size);
    line-height: 1.45;
  }
}

.project-steps__line {
  position: absolute;
  z-index: 1;
  top: 1.3rem;
  inset-inline-start: 50%;
  width: 100%;
  height: 2px;
  background: var(--border-weak);
  transform-origin: center;
  transition: background-color 320ms ease;

  &.completed {
    background: var(--PrimaryColor);
  }
}

@keyframes project-step-enter {
  from {
    opacity: 0;
    transform: translateY(0.5rem);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes project-step-pulse {
  0% {
    opacity: 0.75;
    transform: scale(0.8);
  }

  70%,
  100% {
    opacity: 0;
    transform: scale(1.35);
  }
}

@media (max-width: 768px) {
  .project-steps {
    min-height: auto;
    padding: 1rem;
  }

  .project-steps__track {
    width: min(100%, 24rem);
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .project-steps__item {
    grid-template-columns: 2.65rem minmax(0, 1fr);
    justify-items: start;
    align-items: center;
    text-align: start;
  }

  .project-steps__content {
    max-width: none;
  }

  .project-steps__line {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .project-steps__item,
  .project-steps__item.active .project-steps__circle::after {
    animation: none;
  }

  .project-steps__circle,
  .project-steps__content,
  .project-steps__line {
    transition: none;
  }
}
</style>
