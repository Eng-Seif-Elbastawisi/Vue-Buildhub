<script setup lang="ts">
import type SolutionStepsModel from '@/modules/Questions/core/models/subModels/solution.steps.model';
import SolutionStepsIcon from '@/shared/icons/Question/SolutionSteps.vue';

const { solutionSteps } = defineProps<{ solutionSteps: SolutionStepsModel }>();
</script>

<template>
  <div class="question-solution-steps-wrapper">
    <div class="card-content">
      <div class="question-solution-steps-header">
        <SolutionStepsIcon />
        <h2>Solution steps</h2>
      </div>

      <div class="question-solution-steps-body">
        <p class="description">
          {{ solutionSteps?.step }}
        </p>

        <div v-if="solutionSteps?.attachments[0]?.file" class="question-solution-steps-img">
          <img :src="solutionSteps?.attachments[0]?.file" alt="" />
        </div>
      </div>
    </div>
  </div>
</template>
