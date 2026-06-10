<script setup lang="ts">
import QuestionClarificationModel from '@/modules/Questions/core/models/subModels/question.clarification.model';
import ClerificationIcon from '@/shared/icons/Question/ClerificationIcon.vue';
const props = defineProps({
  clarification: {
    type: QuestionClarificationModel,
    required: true,
  },
});
</script>

<template>
  <div class="question-clarification-wrapper">
    <div class="card-content">
      <!-- Header -->
      <div class="question-clarification-header">
        <ClerificationIcon />
        <h2>Question Clarification</h2>
      </div>

      <!-- Body -->
      <div class="question-clarification-body">
        <!-- Dynamic Info -->
        <div class="question-clarification-info">
          <div class="info-item">
            <label class="question-clarification-text"> documents: </label>

            <span> {{ clarification?.documents?.title }}</span>
          </div>
          <div class="info-item">
            <label class="question-clarification-text"> source: </label>

            <span> {{ clarification?.source }}</span>
          </div>
        </div>

        <!-- Description -->
        <p class="description">{{ clarification?.clarification }}</p>

        <!-- Image -->
        <div v-if="clarification?.attachments![0]?.file" class="question-clarification-img">
          <img :src="clarification?.attachments[0]?.file" alt="question clarification" />
        </div>
      </div>
    </div>
  </div>
</template>
