<script setup lang="ts">
  import FaqImg from '@/assets/images/faq-image.png';
  import { QuestionStatusEnum } from '@/modules/Questions/core/constant/question.status.enum';
  import EditIcon from '@/shared/icons/Privacy/EditIcon.vue';
  import type ShowQuestionsModel from '@/modules/Questions/core/models/show.questions.model';
  const props = defineProps<{ questionData: ShowQuestionsModel }>();

  const getStatusText = (status: QuestionStatusEnum) => {
    switch (status) {
      case QuestionStatusEnum.under_review:
        return 'Under Review';
      case QuestionStatusEnum.not_Reviewd:
        return 'Not Reviewed';
      case QuestionStatusEnum.rejected:
        return 'Rejected';
      case QuestionStatusEnum.approved:
        return 'Approved';
      default:
        return 'Unknown';
    }
  };

  const getStatusDescription = (status: QuestionStatusEnum) => {
    switch (status) {
      case QuestionStatusEnum.under_review:
        return 'complete all details of the question and the available procedures to can publish it';
      case QuestionStatusEnum.not_Reviewd:
        return 'View all details of the question and the available procedures according to its status.';
      case QuestionStatusEnum.rejected:
        return 'View all details of the question and reason of rejected';
      case QuestionStatusEnum.approved:
        return '';
      default:
        return 'Unknown';
    }
  };
</script>

<template>
  <div class="action-row-wrapper">
    <div class="info">
      <img :src="FaqImg" alt="question image" />
      <div class="name">
        <h3>{{ getStatusText(questionData?.status!) }} Question</h3>
        <p>{{ getStatusDescription(questionData?.status!) }}</p>
        <div v-if="questionData?.status === QuestionStatusEnum.approved" class="approved-case-info">
          <h4>
            <span>Approved by :</span>
            {{ questionData.approvedBy }}
          </h4>

          <h4>
            <span>Approved at :</span>
            {{ questionData.createdAt }}
          </h4>
        </div>
      </div>
    </div>
    <div class="question-actions">
      <button class="btn btn-primary"><EditIcon /> {{ $t('edit') }}</button>
      <button class="action-btn delete" title="Delete">
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
      </button>
    </div>
  </div>
</template>
