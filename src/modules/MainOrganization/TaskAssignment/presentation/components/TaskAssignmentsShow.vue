<script setup lang="ts">
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { dialogManager } from '@/base/Presentation/Dialogs/dialog.manager';
import ProjectItemController from '@/modules/MainOrganization/ProjectItem/presentation/controllers/project.Item.controller';
import type ProjectItemShowModel from '@/modules/MainOrganization/ProjectItem/core/models/project.Item.show.model';
import type { UploadedFile } from '@/shared/FormInputs/HandleFilesUpload.vue';
import { InsideStatusType, getTypeNameKey } from '../../core/constants/inside.status.enum';
import { TaskEmployeeStatusEnum } from '../../core/constants/task.employee.status.enum';
import ProjectAttachmentParams from '../../core/params/project.attachment.params';
import SetTaskEmployeeStatusParams from '../../core/params/set.task.employee.status.params';
import ShowTaskItemParams from '../../core/params/show.task.Item.params';
import TaskAssignmentController from '../controllers/task.assignment.controller';
import TaskAssignmentsShowAttachments from './task-assignments-show/TaskAssignmentsShowAttachments.vue';
import TaskAssignmentsShowDetails from './task-assignments-show/TaskAssignmentsShowDetails.vue';
import TaskAssignmentsShowHeader from './task-assignments-show/TaskAssignmentsShowHeader.vue';
import TaskAssignmentsShowHistory from './task-assignments-show/TaskAssignmentsShowHistory.vue';
import TaskAssignmentsShowStatusActions from './task-assignments-show/TaskAssignmentsShowStatusActions.vue';
import type { DialogAction, StatusMeta, TaskAssignmentStatusActionModel } from './task-assignments-show/taskAssignmentsShow.types';

interface UploadedFileWithBase64 extends UploadedFile {
  base64: string;
}

const { id, uuid } = defineProps({
  id: {
    type: String,
    required: true,
  },
  uuid: {
    type: String,
    required: true,
  },
});

const { t } = useI18n();

const projectItemController =  ProjectItemController.getInstance();
const taskAssignmentController =  TaskAssignmentController.getInstance();

const actionLoading = ref(false);
const actionNotes = ref('');
const activeDialogAction = ref<DialogAction | null>(null);
const attachmentFiles = ref<UploadedFile[]>([]);
const projectDepartmentItemId = computed(() =>  String(id ?? ''),);
const projectDepartmentItemUuid = computed(() => String(uuid ?? ''),);
const itemData = computed(() => projectItemController.itemData.value as ProjectItemShowModel | null,);

const itemLoading = computed(() => projectItemController.isItemLoading(),);
const itemError = computed(() => projectItemController.errorMessage.value,);
const insideStatus = computed(() => itemData.value?.inside_status);

const insideStatusLabel = computed(() => {
  if (insideStatus.value === null || insideStatus.value === undefined) { return '-'; }
  return t(getTypeNameKey(insideStatus.value));
});

const insideStatusMeta = computed<StatusMeta>(() => {
  switch (insideStatus.value) {
    case InsideStatusType.ASSIGN:
      return {
        className: 'task-status-chip--assigned',
        icon: 'pi pi-user-plus',
      };

    case InsideStatusType.WORKING:
      return {
        className: 'task-status-chip--working',
        icon: 'pi pi-cog',
      };

    case InsideStatusType.HOLD:
      return {
        className: 'task-status-chip--held',
        icon: 'pi pi-pause',
      };

    case InsideStatusType.REVIEW:
      return {
        className: 'task-status-chip--review',
        icon: 'pi pi-eye',
      };

    default:
      return {
        className: 'task-status-chip--default',
        icon: 'pi pi-info-circle',
      };
  }
});

const dialogTitle = computed(() => {
  switch (activeDialogAction.value) {
    case 'START':
      return t('task_assignment.modals.start_title');
    case 'HOLD':
      return t('task_assignment.modals.hold_title');
    case 'FINISH':
      return t('task_assignment.modals.finish_title');
    default:
      return '';
  }
});

const dialogConfirmationMessage = computed(() => {
  switch (activeDialogAction.value) {
    case 'START':
      return t('task_assignment.modals.start_confirm');
    case 'HOLD':
      return t('task_assignment.modals.hold_confirm');
    case 'FINISH':
      return t('task_assignment.modals.finish_confirm');
    default:
      return '';
  }
});

const isStartVisible = computed(()=> insideStatus.value ===  InsideStatusType.ASSIGN || insideStatus.value === InsideStatusType.HOLD,);

const isHoldVisible = computed(() => insideStatus.value ===  InsideStatusType.WORKING,);

const isFinishVisible = computed(() => insideStatus.value === InsideStatusType.WORKING);

const statusActionModel = computed<TaskAssignmentStatusActionModel>(() => ({
  activeAction: activeDialogAction.value,
  confirmationMessage: dialogConfirmationMessage.value,
  loading: actionLoading.value,
  notes: actionNotes.value,
  showFinish: isFinishVisible.value,
  showHold: isHoldVisible.value,
  showStart: isStartVisible.value,
  title: dialogTitle.value,
  visible: activeDialogAction.value !== null,
}));

const isValidUuid = computed(() => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  return uuidRegex.test(
    projectDepartmentItemUuid.value,
  );
});

const openModal = (
  action: DialogAction,
): void => {
  activeDialogAction.value = action;
  actionNotes.value = '';
  attachmentFiles.value = [];
};

const closeModal = (): void => {
  activeDialogAction.value = null;
  actionNotes.value = '';
  attachmentFiles.value = [];
};

const updateAttachments = (
  files: UploadedFile[],
): void => {
  attachmentFiles.value = files;
};

const updateActionNotes = (notes: string): void => {
  actionNotes.value = notes;
};

const hasBase64 = (file: UploadedFile): file is UploadedFileWithBase64 => {
  const base64 = (file as UploadedFileWithBase64).base64;
  return typeof base64 === 'string' && base64.trim().length > 0;
};

const createAttachmentParams =(): ProjectAttachmentParams[] => {
    return attachmentFiles.value.filter(hasBase64).map((file) =>
          new ProjectAttachmentParams({
            file: file.base64,
            alt: typeof file.name === 'string' ? file.name : '',
          }),
      );
  };

const getTargetStatus = (): TaskEmployeeStatusEnum => {
    switch (activeDialogAction.value) {
      case 'HOLD':
        return TaskEmployeeStatusEnum.HOLD_EMPLOYEE;
      case 'FINISH':
        return TaskEmployeeStatusEnum.FINISH_EMPLOYEE;
      case 'START':
      default:
        return TaskEmployeeStatusEnum.START_EMPLOYEE;
    }
  };

const getResultErrorMessage = (
  result: unknown,
): string => {
  if (
    !result ||
    typeof result !== 'object'
  ) {
    return t(
      'task_assignment.unexpected_error',
    );
  }

  const error = (
    result as {
      error?: {
        displayMessage?: string;
        title?: string;
      } | null;
    }
  ).error;

  return (
    error?.displayMessage ||
    error?.title ||
    t('task_assignment.unexpected_error')
  );
};

const confirmStatusChange =
  async (): Promise<void> => {
    if (!activeDialogAction.value) return;
    const itemId = Number(projectDepartmentItemId.value);
    if (!Number.isInteger(itemId) ||itemId <= 0) {
      dialogManager.toastError(t('task_assignment.unexpected_error'));
      return;
    }

    actionLoading.value = true;

    try {
         const params = new SetTaskEmployeeStatusParams({
          project_department_item_id:itemId,
          status: getTargetStatus(),
          notes: actionNotes.value.trim() || undefined,
          attachments: activeDialogAction.value === 'FINISH'
              ? createAttachmentParams()
              : [],
        });

      const result = await taskAssignmentController.setTaskEmployeeStatus(params);
      if (result instanceof DataSuccess) {
        dialogManager.toastSuccess(result.message || t('task_assignment.status_updated'));
        closeModal();
        await fetchTaskDetails();
        return;
      }
      dialogManager.toastError(getResultErrorMessage(result));
    } catch (error) {
      console.error('Failed to update task status:',error);
      dialogManager.toastError(t('task_assignment.unexpected_error'));
    } finally {
      actionLoading.value = false;
    }
  };

const fetchTaskDetails =async (): Promise<void> => {
    if (!projectDepartmentItemUuid.value) {
      dialogManager.toastError(
        'Task UUID is missing.',
      );
      return;
    }

    if (!isValidUuid.value) {
      dialogManager.toastError(
        'Task UUID is invalid.',
      );
      return;
    }

    await projectItemController.fetchOne(
      new ShowTaskItemParams({
        uuid: projectDepartmentItemUuid.value,
        allLocales: true,
      }),
    );
  };

onMounted(() => {
  void fetchTaskDetails();
});

watch(
  () => [id, uuid],
  () => {
    void fetchTaskDetails();
  },
);
</script>

<template>
  <StandardFormLayout as="section" mode="show" class="task-assignment-show-page">
    <TaskAssignmentsShowHeader
      :model="itemData"
      :item-id="projectDepartmentItemId"
      :status-label="insideStatusLabel"
      :status-meta="insideStatusMeta"
    />

    <div v-if="itemLoading" class="task-assignment-card task-assignment-card--loading">
      <p>{{ $t('loading_data') }}</p>
    </div>

    <div v-else-if="itemError" class="task-assignment-card task-assignment-card--error">
      <p>{{ itemError }}</p>
    </div>

    <article v-else class="task-assignment-card">
      <TaskAssignmentsShowDetails :model="itemData" />

      <TaskAssignmentsShowHistory :model="itemData" />
      <TaskAssignmentsShowAttachments :model="itemData" />
      <TaskAssignmentsShowStatusActions
        :model="statusActionModel"
        @open="openModal"
        @close="closeModal"
        @confirm="confirmStatusChange"
        @update:notes="updateActionNotes"
        @update:attachments="updateAttachments"
      />
    </article>
  </StandardFormLayout>
</template>

<!-- <style lang="scss">
@use '../styles/task_assignment';

.task-assignment-show-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  .task-assignment-page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    flex-wrap: wrap;
    padding: 1.25rem 1.5rem;
  }

  .task-status-summary {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.45rem;

    &__label {
      color: var(--bh-muted);
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
  }

  .task-status-chip {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.65rem;
    min-height: 2.75rem;
    padding: 0.5rem 1rem 0.5rem 0.65rem;
    overflow: hidden;
    border: 1px solid transparent;
    border-radius: 999px;
    font-size: 0.9rem;
    font-weight: 700;
    white-space: nowrap;
    box-shadow: 0 8px 24px rgb(15 23 42 / 8%);
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 12px 30px rgb(15 23 42 / 12%);
    }

    &__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.8rem;
      height: 1.8rem;
      border-radius: 50%;
      background: rgb(255 255 255 / 70%);
      box-shadow: 0 2px 8px rgb(15 23 42 / 8%);
    }

    &__text {
      position: relative;
      z-index: 1;
    }

    &__indicator {
      width: 0.5rem;
      height: 0.5rem;
      margin-inline-start: 0.15rem;
      border: 2px solid rgb(255 255 255 / 90%);
      border-radius: 50%;
      background: currentColor;
      box-shadow: 0 0 0 3px rgb(255 255 255 / 30%);
    }

    &--assigned {
      color: var(--bh-blue-ink);
      border-color: var(--bh-blue-soft);
      background:
        linear-gradient(
          135deg,
          var(--bh-blue-soft),
          #dbeafe
        );
    }

    &--working {
      color: var(--bh-green-ink);
      border-color: var(--bh-green-soft);
      background:
        linear-gradient(
          135deg,
          var(--bh-green-soft),
          #d1fae5
        );

      .task-status-chip__icon i {
        animation: status-rotate 3s linear infinite;
      }
    }

    &--held {
      color: var(--bh-amber-ink);
      border-color: var(--bh-amber-soft);
      background:
        linear-gradient(
          135deg,
          var(--bh-amber-soft),
          var(--bh-amber-soft)
        );
    }

    &--review {
      color: #7c3aed;
      border-color: #ddd6fe;
      background:
        linear-gradient(
          135deg,
          #f5f3ff,
          #ede9fe
        );
    }

    &--default {
      color: var(--bh-muted);
      border-color: var(--bh-line);
      background:
        linear-gradient(
          135deg,
          var(--bh-surface),
          var(--bh-canvas)
        );
    }
  }

  .task-details-section {
    padding: 1.5rem;
    border-bottom: 1px solid
      var(--border-color, var(--bh-line));

    h3 {
      margin: 0 0 1rem;
      color: var(--bh-text);
      font-size: 1.1rem;
      font-weight: 700;
    }
  }

  .task-details-grid {
    display: grid;
    grid-template-columns:
      repeat(
        auto-fill,
        minmax(210px, 1fr)
      );
    gap: 1rem;

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-height: 5rem;
      padding: 1rem;
      border: 1px solid var(--bh-canvas);
      border-radius: 0.875rem;
      background: var(--bh-surface);
      transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease,
        transform 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        border-color: #dbe3ef;
        box-shadow: 0 8px 24px
          rgb(15 23 42 / 6%);
      }

      .detail-label {
        color: var(--bh-muted);
        font-size: 0.8rem;
        font-weight: 600;
      }

      .detail-value {
        color: var(--bh-text);
        font-size: 0.95rem;
        font-weight: 600;
        line-height: 1.6;
        word-break: break-word;
      }
    }
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    width: fit-content;
    padding: 0.35rem 0.75rem;
    border: 1px solid transparent;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 700;

    &.task-status-chip--assigned {
      color: var(--bh-blue-ink);
      border-color: var(--bh-blue-soft);
      background: var(--bh-blue-soft);
    }

    &.task-status-chip--working {
      color: var(--bh-green-ink);
      border-color: var(--bh-green-soft);
      background: var(--bh-green-soft);
    }

    &.task-status-chip--held {
      color: var(--bh-amber-ink);
      border-color: var(--bh-amber-soft);
      background: var(--bh-amber-soft);
    }

    &.task-status-chip--review {
      color: #7c3aed;
      border-color: #ddd6fe;
      background: #f5f3ff;
    }

    &.task-status-chip--default {
      color: var(--bh-muted);
      border-color: var(--bh-line);
      background: var(--bh-surface);
    }

    &--success {
      color: var(--bh-green-ink);
      border-color: var(--bh-green-soft);
      background: var(--bh-green-soft);
    }

    &--muted {
      color: var(--bh-muted);
      border-color: var(--bh-line);
      background: var(--bh-surface);
    }

    &--history {
      color: var(--bh-blue-ink);
      border-color: #c7d2fe;
      background: var(--bh-blue-soft);
    }
  }

  .task-history-accordion {
    border: none;
  }

  .task-history-item {
    padding: 1rem 0;

    &:not(:last-child) {
      border-bottom: 1px dashed #dce1e8;
    }
  }

  .task-history-empty {
    padding: 2rem;
    color: var(--bh-muted);
    text-align: center;
  }

  .task-status-actions-bar {
    padding: 1.5rem;

    h3 {
      margin: 0 0 1rem;
      font-size: 1.1rem;
      font-weight: 700;
    }
  }

  .action-buttons-group {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .task-action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-width: 9rem;
    padding: 0.75rem 1.25rem;
    border: none;
    border-radius: 0.75rem;
    color: #fff;
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 6px 18px
      rgb(15 23 42 / 10%);
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease,
      opacity 0.2s ease;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 24px
        rgb(15 23 42 / 16%);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.55;
    }

    &--start {
      background:
        linear-gradient(
          135deg,
          var(--bh-blue-ink),
          var(--bh-blue-ink)
        );
    }

    &--hold {
      background:
        linear-gradient(
          135deg,
          #f59e0b,
          var(--bh-amber-ink)
        );
    }

    &--finish {
      background:
        linear-gradient(
          135deg,
          var(--bh-green-ink),
          var(--bh-green-ink)
        );
    }
  }

  .attachments-list {
    display: grid;
    grid-template-columns:
      repeat(
        auto-fill,
        minmax(220px, 1fr)
      );
    gap: 1rem;
    padding: 0;
    margin: 0;
    list-style: none;

    &__item {
      overflow: hidden;
      padding: 0.5rem;
      border: 1px solid var(--bh-line);
      border-radius: 0.875rem;
      background: var(--bh-surface);

      img {
        display: block;
        width: 100%;
        height: 11rem;
        border-radius: 0.625rem;
        object-fit: cover;
      }
    }
  }
}

.p-dialog.task-status-dialog,
.task-status-dialog.p-dialog {
  overflow: hidden;
  border: none;
  border-radius: 1rem;
  background: var(--bh-surface);
  color: var(--bh-text);
  box-shadow: 0 24px 70px
    rgb(15 23 42 / 22%);

  .p-dialog-header {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid var(--bh-canvas);
  }

  .p-dialog-content {
    padding: 1.5rem;
  }

  .p-dialog-footer {
    padding: 1rem 1.5rem 1.5rem;
    border-top: 1px solid var(--bh-canvas);
  }
}

.status-modal-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .status-modal-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3.5rem;
    height: 3.5rem;
    margin: 0 auto;
    border-radius: 50%;
    color: var(--bh-blue-ink);
    background: var(--bh-blue-soft);
    font-size: 1.35rem;
  }

  .confirm-message {
    margin: 0;
    color: var(--bh-text);
    font-size: 1rem;
    line-height: 1.7;
    text-align: center;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
    margin-top: 0.5rem;

    label {
      color: var(--bh-text);
      font-size: 0.875rem;
      font-weight: 700;
    }

    .form-control {
      width: 100%;
      min-height: 6.5rem;
      padding: 0.75rem 1rem;
      border: 1px solid var(--bh-field-line);
      border-radius: 0.75rem;
      outline: none;
      background: var(--bh-surface);
      color: var(--bh-text);
      font-family: inherit;
      resize: vertical;
      transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease;

      &:focus {
        border-color: var(--bh-blue-ink);
        box-shadow: 0 0 0 3px
          rgb(37 99 235 / 12%);
      }
    }
  }
}

.modal-buttons-footer {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 2.75rem;
    width: 100%;
    padding: 0.65rem 1.25rem;
    border: 1px solid transparent;
    border-radius: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    transition:
      transform 0.2s ease,
      opacity 0.2s ease;

    &:hover:not(:disabled) {
      transform: translateY(-1px);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  .btn-secondary {
    color: var(--bh-text);
    border-color: var(--bh-field-line);
    background: var(--bh-surface);
  }

  .btn-primary {
    color: #fff;
    border-color: var(--bh-blue-ink);
    background:
      linear-gradient(
        135deg,
        var(--bh-blue-ink),
        var(--bh-blue-ink)
      );
  }
}

.button-loader {
  width: 1.1rem;
  height: 1.1rem;
  border: 2px solid
    rgb(255 255 255 / 40%);
  border-top-color: #fff;
  border-radius: 50%;
  animation: status-rotate 0.7s linear infinite;
}

.p-accordionpanel {
  .p-accordionheader {
    font-size: 1.1rem !important;
    font-weight: 700;
  }
}

@keyframes status-rotate {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 767px) {
  .task-assignment-show-page {
    .task-assignment-page-header {
      align-items: flex-start;
    }

    .task-status-summary {
      width: 100%;
      align-items: flex-start;
    }

    .task-details-section,
    .task-status-actions-bar {
      padding: 1rem;
    }

    .task-details-grid {
      grid-template-columns: 1fr;
    }

    .action-buttons-group {
      flex-direction: column;
      align-items: stretch;
    }

    .task-action-btn {
      width: 100%;
    }
  }

  .modal-buttons-footer {
    flex-direction: column-reverse;
  }
}
</style> -->

<style lang="scss">
@use '../styles/task_assignments_show_cards' as task-assignments-show;

@include task-assignments-show.styles;
</style>
