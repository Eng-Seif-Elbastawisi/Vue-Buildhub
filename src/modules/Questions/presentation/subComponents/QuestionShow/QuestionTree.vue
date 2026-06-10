<script setup lang="ts">
// import { computed } from 'vue';

import Arrow from '@/shared/icons/Question/Arrow.vue';
import NextStepIcon from '@/shared/icons/Question/NextStepIcon.vue';
import type ShowQuestionsModel from '@/modules/Questions/core/models/show.questions.model';

const { questionData } = defineProps<{ questionData: ShowQuestionsModel }>();
</script>

<template>
  <div class="question-tree-card">
    <!-- Subject -->
    <div class="section">
      <h4>Subject</h4>

      <div class="subject-box">
        <div class="subject-info">
          <span>{{ questionData.subjectTree?.title }}</span>
          <!-- <NextStepIcon v-if="index !== subjectPath.length - 1" class="arrow-next" /> -->
        </div>

        <div class="language">
          <Arrow />

          <span v-for="(item, index) in questionData?.subjectTree?.children" :key="index">
            <!-- <NextStepIcon
              v-if="index !== questionData?.subjectTree?.children!.length - 1"
              class="arrow-next"
            /> -->
            {{ item.title }}
          </span>
        </div>
      </div>
    </div>

    <!-- Sequence -->
    <div class="section">
      <h4>Question Sequence</h4>

      <div class="sequence-list">
        <div class="sequence-item">
          {{ questionData.sequenceTree?.title }}
        </div>

        <!-- <NextStepIcon v-if="index !== sequencePath.length - 1" class="arrow-next" /> -->
        <!-- <NextStepIcon
          v-if="index !== questionData?.sequenceTree?.children!.length - 1"
          class="arrow-next"
        /> -->
        <span v-for="(item, index) in questionData?.sequenceTree?.children" :key="index">
          {{ item.title }}
        </span>
      </div>
    </div>

    <!-- Documents -->
    <div class="section">
      <h4>Documents</h4>

      <div class="document">
        <h5>
          {{ questionData.questionDocuments![0]?.title }}
        </h5>

        <NextStepIcon v-if="questionData?.questionDocuments![0]?.source" class="arrow-next" />
        <p>
          Source:
          {{ questionData.questionDocuments![0]?.source }}
        </p>
      </div>
    </div>

    <!-- Skills -->
    <div v-if="questionData.skills?.length" class="section">
      <h4>Skills</h4>

      <ul class="skills">
        <li v-for="skill in questionData?.skills" :key="skill.id">
          <span class="dot"></span>

          {{ skill.skill }}
        </li>
      </ul>
    </div>
  </div>
</template>
