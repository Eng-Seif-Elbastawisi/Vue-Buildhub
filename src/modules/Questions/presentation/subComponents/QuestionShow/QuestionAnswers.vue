<script setup lang="ts">
import type AnswerModel from '@/modules/Questions/core/models/subModels/answer.model';

const { answers } = defineProps<{ answers: AnswerModel[] }>();
</script>
<template>
  <div class="question-answers-wrapper">
    <div class="question-answers-list">
      <div v-for="answer in answers" :key="answer?.id" class="question-answer-item"
        :class="{ correct: answer?.is_right_answer }">
        <div class="answer-content">
          <label> Answers No : {{ answer?.id }}</label>
          <h2 class="answer">{{ answer?.answer }}</h2>
        </div>
        <div class="answer-image">
          <img v-if="answer?.image" :src="answer?.image?.[0]?.file" :alt="answer?.answer" />
        </div>
      </div>
    </div>
  </div>
</template>
