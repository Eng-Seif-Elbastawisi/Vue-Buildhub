<script setup lang="ts">
  import { useRouter } from 'vue-router';

  import TaskAssignmentForm from './TaskAssignmentForm.vue';
  import { useTaskAssignmentForm } from '../composables/useTaskAssignmentForm';

  import type { TaskAssignmentForm as TaskAssignmentPayload } from '../../core/params/assign.project.department.item.task.params';

  const router = useRouter();

  const {
    assignmentSubmitting,
    assignmentGeneralError,
    assignmentValidationErrors,
    projectDepartmentItemOptions,
    durationTypeOptions,
    projectDepartmentItemsLoading,
    employeesLoading,
    submitTaskAssignment,
  } = useTaskAssignmentForm();

  const submitAndReturnToList = async (form: TaskAssignmentPayload): Promise<void> => {
    const created = await submitTaskAssignment(form);

    if (!created) {
      return;
    }

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
            <i class="pi pi-user-plus" />
          </span>

          <div class="task-assignment-create-header__copy">
            <h1>
              {{ $t('task_assignment.create_title') }}
            </h1>

            <p>
              {{ $t('task_assignment.create_description') }}
            </p>
          </div>
        </div>

        <RouterLink
          class="task-assignment-create-header__back"
          :to="{
            name: 'mainorganization-task-assignment-index',
          }"
        >
          <i class="pi pi-arrow-left" aria-hidden="true" />

          <span>
            {{ $t('task_assignment.back_to_tasks') }}
          </span>
        </RouterLink>
      </header>

      <TaskAssignmentForm
        :project-department-item-options="projectDepartmentItemOptions"
        :duration-type-options="durationTypeOptions"
        :project-department-items-loading="projectDepartmentItemsLoading"
        :employees-loading="employeesLoading"
        :assignment-submitting="assignmentSubmitting"
        :assignment-validation-errors="assignmentValidationErrors"
        :assignment-general-error="assignmentGeneralError"
        @submit="submitAndReturnToList"
      />
    </article>
  </section>
</template>

<style lang="scss">
  @use '../styles/task_assignment';
</style>
