<script setup lang="ts">
  import AgreeIcon from '@/shared/icons/Question/AgreeIcon.vue';
  import CautionIcon from '@/shared/icons/Question/CautionIcon.vue';
  import RejectIcon from '@/shared/icons/Question/RejectIcon.vue';
</script>

<template>
  <div class="question-review-procedures-wrapper">
    <div class="card-content">
      <div class="question-review-procedures-header">
        <h2>Review procedures</h2>
        <p>
          Review the question text and options, and determine if it is ready for publication or
          needs editing.
        </p>
      </div>

      <div class="question-review-procedures-body">
        <div class="caution-item">
          <CautionIcon />
          <p>AI-generated question. Please verify before posting.</p>
        </div>
      </div>
      <div class="actions">
        <button class="approve-btn btn btn-primary">
          <AgreeIcon />
          Agree to the question
        </button>
        <button class="reject-btn btn btn-cancel">
          <RejectIcon />
          reject question
        </button>
      </div>
    </div>
  </div>
</template>
