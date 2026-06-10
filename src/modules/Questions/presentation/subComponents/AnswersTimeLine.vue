<script setup lang="ts">
  import { AnswerTypeHelper } from '@/modules/Questions/presentation/subComponents/AnswersTypes/GetAnswerTypeHelper';
  import type { QuestionTypeEnum } from '@/modules/Questions/core/constant/question.type.enum';
  import type AnswerModel from '../../core/models/subModels/answer.model';
  import type AnswersParams from '../../core/params/subParams/answers.params';

  const { questionType, questionData, draftData } = defineProps<{
    questionType: QuestionTypeEnum;
    questionData?: AnswerModel[];
    draftData?: AnswersParams[];
  }>();

  const emit = defineEmits(['update:data']);
</script>

<template>
  <component
    :draftData="draftData"
    :is="AnswerTypeHelper(questionType)"
    :question-data="questionData!"
    @update:data="emit('update:data', $event);"
  />
  <!--  -->
</template>
