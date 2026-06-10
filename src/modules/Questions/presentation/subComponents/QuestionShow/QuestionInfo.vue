<script setup lang="ts">
  import { QuestionTypeEnum } from '@/modules/Questions/core/constant/question.type.enum';
  import type ShowQuestionsModel from '../../../core/models/show.questions.model';
  import { QuestionDifficultyEnum } from '@/modules/Questions/core/constant/question.difficulty.enum';

  const { questionInfo } = defineProps<{ questionInfo: ShowQuestionsModel }>();

  const getQuestionType = (value: QuestionTypeEnum) => {
    switch (value) {
      case QuestionTypeEnum.mcq:
        return 'Multiple Choice Question';
      case QuestionTypeEnum.ranking:
        return 'Ranking Question';
      case QuestionTypeEnum.true_false:
        return 'True False Question';
      case QuestionTypeEnum.complate:
        return 'Complete Question';
      case QuestionTypeEnum.matching:
        return 'Matching Question';
    }
  };

  const getDifficultyClass = (value: QuestionDifficultyEnum) => {
    switch (value) {
      case QuestionDifficultyEnum.easy:
        return 'Easy';
      case QuestionDifficultyEnum.medium:
        return 'Medium';
      case QuestionDifficultyEnum.hard:
        return 'Hard';
    }
  };
</script>

<template>
  <div class="question-info-wrapper">
    <!-- Dynamic Info List -->
    <div class="question-info-categories">
      <div class="question-info-item">
        <label>Question Type :</label>

        <p>
          {{ getQuestionType(questionInfo?.questionType!) }}
        </p>
      </div>

      <div class="question-info-item">
        <label>Difficulty: </label>

        <p>
          {{ getDifficultyClass(questionInfo?.difficulty!) }}
        </p>
      </div>
      <div class="question-info-item">
        <label>Topics :</label>

        <p>
          {{ questionInfo?.topics?.map((topic: any) => topic?.title).join('  ,  ') }}
        </p>
      </div>
    </div>

    <!-- Question Body -->
    <div class="question-show-body">
      <div class="question-body-text">
        <label>Question</label>

        <h2>
          {{ questionInfo?.questionTitle }}
        </h2>
      </div>

      <div class="question-body-img">
        <img :src="questionInfo?.questionImage?.[0]?.file" :alt="questionInfo?.questionTitle" />
      </div>
    </div>
  </div>
</template>
