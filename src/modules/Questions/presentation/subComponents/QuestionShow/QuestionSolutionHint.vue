<script setup lang="ts">
import SolutionHintIcon from '@/shared/icons/Question/SolutionHint.vue';
import type SolutionHintModel from '@/modules/Questions/core/models/subModels/solution.hint.model';

const { solutionHint } = defineProps<{ solutionHint: SolutionHintModel }>();
</script>

<template>
  <div class="question-solution-hint-wrapper">
    <div class="card-content">
      <div class="question-solution-hint-header">
        <SolutionHintIcon />
        <h2>Solution Hint</h2>
      </div>

      <div class="question-solution-hint-body">
        <p class="description">
          {{ solutionHint?.hint }}
        </p>

        <div v-if="solutionHint?.attachments[0]?.file" class="question-solution-hint-img">
          <img :src="solutionHint?.attachments[0]?.file" alt="" />
        </div>
      </div>
    </div>
  </div>
</template>
