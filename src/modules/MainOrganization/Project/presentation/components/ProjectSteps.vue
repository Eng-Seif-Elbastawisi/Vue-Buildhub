<script setup lang="ts">
  const props = defineProps<{
    currentStep: 1 | 2 | 3;
  }>();

  const steps = [
    {
      id: 1,
      title: 'Project Data',
      description: 'Basic project information',
    },
    {
      id: 2,
      title: 'Project Preview',
      description: 'Engineer and site visit details',
    },
    {
      id: 3,
      title: 'Project Attachments',
      description: 'Project files and documents',
    },
  ];
</script>

<template>
  <div class="project-steps">
    <div
      v-for="(step, index) in steps"
      :key="step.id"
      class="project-steps__item"
      :class="{
        active: currentStep === step.id,
        completed: currentStep > step.id,
      }"
    >
      <div class="project-steps__circle">
        <span v-if="currentStep > step.id">✓</span>
        <span v-else>{{ step.id }}</span>
      </div>

      <div class="project-steps__content">
        <h4>{{ step.title }}</h4>
        <p>{{ step.description }}</p>
      </div>

      <div
        v-if="index < steps.length - 1"
        class="project-steps__line"
        :class="{ completed: currentStep > step.id }"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
  .project-steps {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 1rem;
    border: 1px solid var(--border-weak);
    border-radius: 18px;
    background: var(--white);
  }

  .project-steps__item {
    position: relative;
    display: flex;
    align-items: center;
    flex: 1;
    gap: 0.75rem;

    &.active {
      .project-steps__circle {
        border-color: var(--PrimaryColor);
        background: var(--PrimaryColor);
        color: var(--white);
      }

      h4 {
        color: var(--PrimaryColor);
      }
    }

    &.completed {
      .project-steps__circle {
        border-color: var(--PrimaryColor);
        background: var(--PrimaryColor);
        color: var(--white);
      }
    }
  }

  .project-steps__circle {
    z-index: 2;
    width: 38px;
    height: 38px;
    border: 1px solid var(--border-weak);
    border-radius: 50%;
    background: var(--white);
    color: var(--gray-6);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Bold';
    font-size: 0.9rem;
    transition: all 0.25s ease;
  }

  .project-steps__content {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;

    h4 {
      margin: 0;
      font-family: 'Bold';
      font-size: var(--sm-size);
      color: var(--gray-8);
    }

    p {
      margin: 0;
      font-size: 0.78rem;
      color: var(--gray-5);
    }
  }

  .project-steps__line {
    position: absolute;
    top: 19px;
    inset-inline-start: 48px;
    inset-inline-end: 16px;
    height: 2px;
    background: var(--border-weak);
    z-index: 1;

    &.completed {
      background: var(--PrimaryColor);
    }
  }

  @media (max-width: 768px) {
    .project-steps {
      flex-direction: column;
      align-items: stretch;
      gap: 1rem;
    }

    .project-steps__item {
      flex: unset;
    }

    .project-steps__line {
      display: none;
    }
  }
</style>
