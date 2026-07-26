<script setup lang="ts">
  import { useRouter } from 'vue-router';
  import TaskAssignmentForm from './TaskAssignmentForm.vue';
  import { useTaskAssignmentForm } from '../composables/useTaskAssignmentForm';

  const router = useRouter();

  const {
    assignmentForm,
    assignmentSubmitting,
    attachmentsProcessing,
    attachmentsUploadKey,
    assignmentGeneralError,
    assignmentValidationErrors,
    selectedProjectDepartmentItem,
    selectedEmployees,
    selectedEmployeeReviewer,
    selectedDurationType,
    projectDepartmentItemOptions,
    employeeOptions,
    durationTypeOptions,
    employeesLoading,
    projectDepartmentItemsLoading,
    submitTaskAssignment,
    updateSelectedProjectDepartmentItem,
    updateSelectedEmployees,
    updateSelectedEmployeeReviewer,
    updateDurationType,
    updateDuration,
    addAttachmentsFromUpload,
    removeAttachment,
    updateAttachmentAlt,
    updateAttachmentLink,
  } = useTaskAssignmentForm();

  const submitAndReturnToList = async (): Promise<void> => {
    const created = await submitTaskAssignment();

    if (!created) return;

    await router.push({
      name: 'mainorganization-task-assignment-index',
    });
  };
</script>

<template>
  <section class="task-assignment-create">
    <article class="task-assignment-card task-assignment-card--create">
      <header class="task-assignment-create-header">
        <div class="task-assignment-create-header__content">
          <span class="task-assignment-page-header__icon" aria-hidden="true">
            <i class="pi pi-user-plus"></i>
          </span>

          <div class="task-assignment-create-header__copy">
            <h1>{{ $t('task_assignment.create_title') }}</h1>
            <p>{{ $t('task_assignment.create_description') }}</p>
          </div>
        </div>

        <RouterLink
          class="task-assignment-create-header__back"
          :to="{ name: 'mainorganization-task-assignment-index' }"
        >
          <i class="pi pi-arrow-left" aria-hidden="true"></i>
          <span>{{ $t('task_assignment.back_to_tasks') }}</span>
        </RouterLink>
      </header>

      <TaskAssignmentForm
        :selected-project-department-item="selectedProjectDepartmentItem"
        :selected-employees="selectedEmployees"
        :selected-employee-reviewer="selectedEmployeeReviewer"
        :selected-duration-type="selectedDurationType"
        :project-department-item-options="projectDepartmentItemOptions"
        :employee-options="employeeOptions"
        :duration-type-options="durationTypeOptions"
        :project-department-items-loading="projectDepartmentItemsLoading"
        :employees-loading="employeesLoading"
        :assignment-submitting="assignmentSubmitting"
        :attachments-processing="attachmentsProcessing"
        :attachments-upload-key="attachmentsUploadKey"
        :assignment-validation-errors="assignmentValidationErrors"
        :assignment-general-error="assignmentGeneralError"
        :notes="assignmentForm.notes"
        :duration="assignmentForm.duration"
        :attachments="assignmentForm.attachments"
        @update-project-department-item="updateSelectedProjectDepartmentItem"
        @update-employees="updateSelectedEmployees"
        @update-employee-reviewer="updateSelectedEmployeeReviewer"
        @update-duration-type="updateDurationType"
        @update-duration="updateDuration"
        @update-notes="assignmentForm.notes = $event"
        @add-attachments="addAttachmentsFromUpload"
        @remove-attachment="removeAttachment"
        @update-attachment-alt="updateAttachmentAlt"
        @update-attachment-link="updateAttachmentLink"
        @submit="submitAndReturnToList"
      />
    </article>
  </section>
</template>

<style lang="scss">
  @use '../styles/task_assignment';
</style>
