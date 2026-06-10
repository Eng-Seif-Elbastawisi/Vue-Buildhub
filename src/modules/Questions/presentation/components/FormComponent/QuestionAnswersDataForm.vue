<script setup lang="ts">
  import Accordion from 'primevue/accordion';
  import AccordionPanel from 'primevue/accordionpanel';
  import AccordionHeader from 'primevue/accordionheader';
  import AccordionContent from 'primevue/accordioncontent';
  import AccordionToggleIcon from '@/shared/icons/questions/AccordionToggleIcon.vue';
  import { computed, ref, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import AddquestionsParams from '@/modules/Questions/core/params/add.question.params';
  import EditquestionsParams from '@/modules/Questions/core/params/edit.question.params';
  import AnswersTimeLine from '../../subComponents/AnswersTimeLine.vue';
  import AnswersParams from '@/modules/Questions/core/params/subParams/answers.params';
  import QuestionClarification from '../../subComponents/QuestionClarification.vue';
  import QuestionClarificationParams from '@/modules/Questions/core/params/subParams/question.clarification.params';
  import QuestionSolutionSteps from '../../subComponents/QuestionSolutionSteps.vue';
  import SolutionStepsParams from '@/modules/Questions/core/params/subParams/soluation.steps.params';
  import QuestionSolutionHints from '../../subComponents/QuestionSolutionHints.vue';
  import type ShowQuestionsModel from '@/modules/Questions/core/models/show.questions.model';
  import type QuestionClarificationModel from '@/modules/Questions/core/models/subModels/question.clarification.model';
  import type SolutionStepsModel from '@/modules/Questions/core/models/subModels/solution.steps.model';
  import type SolutionHintModel from '@/modules/Questions/core/models/subModels/solution.hint.model';
  import AttachmentsParams from '@/modules/Questions/core/params/subParams/attachments.params';
  import type { QuestionTypeEnum } from '@/modules/Questions/core/constant/question.type.enum';

  const emit = defineEmits(['updateData']);
  const route = useRoute();
  const { questionType, questionData, draftData } = defineProps<{
    questionType: QuestionTypeEnum;
    questionData: ShowQuestionsModel;
    draftData?: AddquestionsParams;
  }>();
  const updateData = () => {
    let params: any;
    if (route.params.id) {
      params = new EditquestionsParams({
        id: Number(route.params.id),
        answers: Answers.value?.map(
          (item: AnswersParams) =>
            new AnswersParams({
              title: item.title,
              file: item.file?.map(
                (file) =>
                  new AttachmentsParams({
                    alt: '',
                    file: file.file,
                  }),
              ),
              isCorrect: item.isCorrect,
              correctOrder: item.correctOrder,
              matchAnswer: item.matchAnswer,
              answerEvaluation: item.answerEvaluation,
              similarPrecentage: item.similarPrecentage,
              rank: item.rank,
            }),
        ),
        isQuestionClarification: isQuestionClarification.value,
        questionClarification: QuestionClarifications.value!,
        isSolutionSteps: isSolutionSteps.value,
        solutionSteps: SolutionSteps.value!,
        isSolutionHint: isSolutionHints.value,
        solutionHint: SolutionHints.value!,
      });
    } else {
      params = new AddquestionsParams({
        answers: Answers.value?.map(
          (item: AnswersParams) =>
            new AnswersParams({
              title: item.title,
              file: item.file?.map(
                (file) =>
                  new AttachmentsParams({
                    alt: '',
                    file: file.file,
                  }),
              ),
              isCorrect: item.isCorrect,
              correctOrder: item.correctOrder,
              matchAnswer: item.matchAnswer,
              answerEvaluation: item.answerEvaluation,
              similarPrecentage: item.similarPrecentage,
              rank: item.rank,
            }),
        ),
        isQuestionClarification: isQuestionClarification.value,
        questionClarification: QuestionClarifications.value!,
        isSolutionSteps: isSolutionSteps.value,
        solutionSteps: SolutionSteps.value!,
        isSolutionHint: isSolutionHints.value,
        solutionHint: SolutionHints.value!,
      });
    }
    emit('updateData', params);
  };

  const Answers = ref<AnswersParams[]>([]);
  const GetAnswers = (data: AnswersParams[]) => {
    Answers.value = data;
    updateData();
  };

  const isQuestionClarification = ref(false);
  const QuestionClarifications = ref<QuestionClarificationParams>();
  const GetClarification = (data: {
    data: QuestionClarificationParams;
    isClarification: boolean;
  }) => {
    isQuestionClarification.value = data.isClarification;
    QuestionClarifications.value = new QuestionClarificationParams({
      documentId: data?.data?.documentId,
      source: data?.data?.source,
      clarification: data?.data?.clarification,
      file: data?.data?.file?.map(
        (file) =>
          new AttachmentsParams({
            alt: 'clarification image',
            file: file.file,
          }),
      ),
    });

    updateData();
  };

  const isSolutionSteps = ref(false);
  const SolutionSteps = ref<SolutionStepsParams>();
  const GetSolutionSteps = (data: { data: SolutionStepsParams; isSolutionSteps: boolean }) => {
    isSolutionSteps.value = data.isSolutionSteps;
    SolutionSteps.value = new SolutionStepsParams({
      image: data.data.image?.map(
        (file) =>
          new AttachmentsParams({
            alt: 'solution step image',
            file: file.file,
          }),
      ),
      explanation: data.data.explanation,
    });
    updateData();
  };

  const isSolutionHints = ref(false);
  const SolutionHints = ref<SolutionStepsParams>();
  const GetSolutionHints = (data: { data: SolutionStepsParams; isSolutionHints: boolean }) => {
    isSolutionHints.value = data.isSolutionHints;
    SolutionHints.value = new SolutionStepsParams({
      image: data.data.image?.map(
        (file) =>
          new AttachmentsParams({
            alt: 'solution hint image',
            file: file.file,
          }),
      ),
      explanation: data.data.explanation,
    });
    updateData();
  };

  const ClarificationData = ref<QuestionClarificationModel>();
  const isClarification = ref<boolean>(false);
  const SolutionStepsData = ref<SolutionStepsModel>();
  const isSolutionStepsData = ref<boolean>(false);
  const SolutionHintsData = ref<SolutionHintModel>();
  const isSolutionHintsData = ref<boolean>(false);
  watch(
    () => questionData,
    (newValue) => {
      ClarificationData.value = newValue?.questionClarification
        ? newValue.questionClarification!
        : undefined;
      isClarification.value = newValue?.isClarification ? newValue.isClarification! : false;
      SolutionStepsData.value = newValue?.solutionSteps ? newValue.solutionSteps : undefined;
      isSolutionStepsData.value = newValue?.isQusetionSteps ? newValue.isQusetionSteps! : false;
      SolutionHintsData.value = newValue?.solutionHint ? newValue.solutionHint! : undefined;
      isSolutionHintsData.value = newValue?.isQusetionHints ? newValue.isQusetionHints! : false;
    },
  );
  const safeAnswers = computed(() => questionData ?? []);
  const isActive = ref(true);
  const accordionTransition = {
    enterFromClass: 'accordion-enter-from',
    enterActiveClass: 'accordion-enter-active',
    enterToClass: 'accordion-enter-to',
    leaveFromClass: 'accordion-leave-from',
    leaveActiveClass: 'accordion-leave-active',
    leaveToClass: 'accordion-leave-to',
  };
</script>

<template>
  <Accordion
    value="0"
    :pt="{ root: 'answers-data-form', panel: 'accordion-panel' }"
    @update:value="isActive = !isActive"
  >
    <AccordionPanel value="0">
      <AccordionHeader>
        <template #toggleicon>
          <div class="toggll-container">
            <p class="title">answers</p>
            <AccordionToggleIcon :class="{ 'rotate-180': !isActive }" />
          </div>
          <span class="dashed-border"></span>
        </template>
      </AccordionHeader>
      <AccordionContent
        :pt="{
          root: 'accordion-content-root',
          content: 'accordion-content-inner',
          transition: accordionTransition,
        }"
      >
        <AnswersTimeLine
          :draft-data="draftData?.answers"
          :question-data="safeAnswers.answers"
          :question-type="questionType"
          @update:data="GetAnswers"
        />
        <QuestionClarification
          :ClarificationData="ClarificationData!"
          :isclarification="isClarification"
          :draft-data="draftData"
          @update-data="GetClarification"
        />
        <QuestionSolutionSteps
          :SolutionStepsData="SolutionStepsData!"
          :is-solution-steps-data="isSolutionStepsData"
          :draft-data="draftData"
          @update-data="GetSolutionSteps"
        />
        <QuestionSolutionHints
          :SolutionHintsData="SolutionHintsData!"
          :is-solution-hints-data="isSolutionHintsData"
          :draft-data="draftData"
          @update-data="GetSolutionHints"
        />
      </AccordionContent>
    </AccordionPanel>
  </Accordion>
</template>

<style scoped lang="scss">
  .accordion-enter-active,
  .accordion-leave-active {
    display: grid;
    transition: grid-template-rows 0.3s ease;
  }

  .accordion-enter-from,
  .accordion-leave-to {
    grid-template-rows: 0fr;
    transform: translateY(-50%);
    opacity: 0;
  }

  .accordion-enter-to,
  .accordion-leave-from {
    grid-template-rows: 1fr;
    transform: translateY(0);
    opacity: 1;
  }

  .accordion-content-inner {
    min-height: 0;
    transition: all 0.3s linear;
  }
</style>
