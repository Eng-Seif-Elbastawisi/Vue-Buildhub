<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import type ShowQuestionsModel from '../../core/models/show.questions.model';
  import AddquestionsParams from '../../core/params/add.question.params';
  import BasicQuestionDataForm from './FormComponent/BasicQuestionDataForm.vue';
  import QuestionAnswersDataForm from './FormComponent/QuestionAnswersDataForm.vue';
  import EditquestionsParams from '../../core/params/edit.question.params';
  import FolderIcon from '@/shared/icons/Question/FolderIcon.vue';
  import { CustomToast } from '../subComponents/CustomTosat.ts';

  const route = useRoute();
  const emit = defineEmits(['updateData']);
  const { question } = defineProps<{
    question?: ShowQuestionsModel;
  }>();

  const updateData = () => {
    let params: EditquestionsParams | AddquestionsParams;
    if (route.params.id) {
      params = new EditquestionsParams({
        id: Number(route.params.id),
        title: BasicData.value?.title,
        image: BasicData.value?.image,
        questionType: BasicData.value?.questionType,
        subjectId: BasicData.value?.subjectId,
        skills: BasicData.value?.skills,
        difficultyLevel: BasicData.value?.difficultyLevel,
        topics: BasicData.value?.topics ?? undefined,
        questionSequenceId: BasicData.value?.questionSequenceId,
        questionSource: BasicData.value?.questionSource,
        answers: AnswerData.value?.answers,
        isQuestionClarification: AnswerData.value?.isQuestionClarification,
        questionClarification: AnswerData.value?.questionClarification,
        isSolutionSteps: AnswerData.value?.isSolutionSteps,
        solutionSteps: AnswerData.value?.solutionSteps,
        isSolutionHint: AnswerData.value?.isSolutionHint,
        solutionHint: AnswerData.value?.solutionHint,
        answerEvaluation: AnswerData.value?.answers?.[0]?.answerEvaluation,
        similarPrecentage: AnswerData.value?.answers?.[0]?.similarPrecentage,
        parentId: BasicData.value?.parentId,
      });
    } else {
      params = new AddquestionsParams({
        title: BasicData.value?.title,
        image: BasicData.value?.image,
        questionType: BasicData.value?.questionType,
        subjectId: BasicData.value?.subjectId,
        skills: BasicData.value?.skills,
        difficultyLevel: BasicData.value?.difficultyLevel,
        topics: BasicData.value?.topics ?? undefined,
        questionSequenceId: BasicData.value?.questionSequenceId,
        questionSource: BasicData.value?.questionSource,
        answers: AnswerData.value?.answers,
        isQuestionClarification: AnswerData.value?.isQuestionClarification,
        questionClarification: AnswerData.value?.questionClarification,
        isSolutionSteps: AnswerData.value?.isSolutionSteps,
        solutionSteps: AnswerData.value?.solutionSteps,
        isSolutionHint: AnswerData.value?.isSolutionHint,
        solutionHint: AnswerData.value?.solutionHint,
        answerEvaluation: AnswerData.value?.answers?.[0]?.answerEvaluation,
        similarPrecentage: AnswerData.value?.answers?.[0]?.similarPrecentage,
        parentId: BasicData.value?.parentId,
      });
    }

    emit('updateData', params);
  };

  const BasicData = ref<AddquestionsParams>();
  const GetAllBasicData = (data: AddquestionsParams) => {
    BasicData.value = new AddquestionsParams({
      title: data.title,
      image: data.image,
      questionType: data.questionType,
      subjectId: data.subjectId,
      skills: data.skills,
      difficultyLevel: data.difficultyLevel,
      topics: data.topics,
      questionSequenceId: data.questionSequenceId,
      questionSource: data.questionSource,
      parentId: route.query.article_id ? Number(route.query.article_id) : null,
    });
    updateData();
  };

  const AnswerData = ref<AddquestionsParams>();
  const GetAllAnswers = (data: AddquestionsParams) => {
    AnswerData.value = new AddquestionsParams({
      answers: data.answers,
      isQuestionClarification: data.isQuestionClarification,
      questionClarification: data.questionClarification,
      isSolutionSteps: data.isSolutionSteps,
      solutionSteps: data.solutionSteps,
      isSolutionHint: data.isSolutionHint,
      solutionHint: data.solutionHint,
    });
    updateData();
  };

  watch(
    () => question,
    (newquestion) => {
      if (newquestion) {
      }
    },
    { immediate: true },
  );
  const QuestionDraftData = ref<AddquestionsParams>();

  // const draftRef = localStorage.getItem('question-draft') ? CustomToast() : null;
  const draftRef = !route.params.id && localStorage.getItem('question-draft')
    ? CustomToast()
    : null;

  watch(draftRef!, (newVal) => {
    if (newVal) {
      QuestionDraftData.value = newVal;
      BasicData.value = newVal;
      AnswerData.value = newVal;
    }
  });

</script>

<template>
  <div class="questions-details-form-card">
    <header class="form-header">
      <div class="form-title">
        <div class="header-text">
          <h3>
            <FolderIcon />
            <span>
              {{ route.params.id ? 'Edit Question' : 'Add New Question' }}
            </span>
          </h3>
        </div>
      </div>
    </header>

    <BasicQuestionDataForm
      :draft-data="QuestionDraftData"
      :question-data="question"
      @update-data="GetAllBasicData"
    />
    <QuestionAnswersDataForm
      :draft-data="QuestionDraftData"
      :question-data="question!"
      :question-type="BasicData?.questionType!"
      @update-data="GetAllAnswers"
    />
  </div>
</template>
