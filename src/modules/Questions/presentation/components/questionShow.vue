# QuestionShowPage.vue ```vue
<script setup lang="ts">
  import { computed, onMounted } from 'vue';
  import questionsController from '../controllers/questions.controller';
  import QuestionAnswers from '../subComponents/QuestionShow/QuestionAnswers.vue';
  import QuestionClarification from '../subComponents/QuestionShow/QuestionClarification.vue';
  import QuestionHeader from '../subComponents/QuestionShow/QuestionHeader.vue';
  import QuestionInfo from '../subComponents/QuestionShow/QuestionInfo.vue';
  import QuestionLogHistory from '../subComponents/QuestionShow/QuestionLogHistory.vue';
  import QuestionReviewProcedures from '../subComponents/QuestionShow/QuestionReviewProcedures.vue';
  import QuestionSolutionHint from '../subComponents/QuestionShow/QuestionSolutionHint.vue';
  import QuestionSolutionSteps from '../subComponents/QuestionShow/QuestionSolutionSteps.vue';
  import QuestionStatusBox from '../subComponents/QuestionShow/QuestionStatusBox.vue';
  import QuestionTree from '../subComponents/QuestionShow/QuestionTree.vue';
  import ShowquestionsParams from '../../core/params/show.question.params';
  import { useRoute } from 'vue-router';
  const route = useRoute();
  const controller = questionsController.getInstance();
  const showState = computed(() => controller.itemState.value);
  onMounted(() => {
    const params = new ShowquestionsParams(Number(route.params.id));
    controller.fetchOne(params);
  });
</script>

<template>
  <QuestionHeader v-if="showState?.data" :question-data="showState?.data" />

  <div class="question-show-page">
    <div class="main-content-row">
      <QuestionInfo v-if="showState?.data" :question-info="showState?.data" />

      <QuestionAnswers
        v-if="showState?.data?.answers?.length"
        :answers="showState?.data?.answers"
      />

      <QuestionClarification
        v-if="showState?.data?.questionClarification"
        :clarification="showState?.data?.questionClarification"
      />

      <div class="solution-container">
        <QuestionSolutionHint
          v-if="showState?.data?.solutionHint"
          :solution-hint="showState?.data?.solutionHint"
        />

        <QuestionSolutionSteps
          v-if="showState?.data?.solutionSteps"
          :solution-steps="showState?.data?.solutionSteps!"
        />
      </div>

      <QuestionReviewProcedures />
    </div>

    <div class="side-content">
      <QuestionStatusBox v-if="showState?.data" :question-data="showState?.data" />

      <QuestionTree v-if="showState?.data" :question-data="showState?.data" />

      <QuestionLogHistory
        v-if="showState?.data?.questionLogHistory"
        :logs="showState?.data?.questionLogHistory"
      />
    </div>
  </div>
</template>
