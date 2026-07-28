<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Dialog from 'primevue/dialog';
import Image from 'primevue/image';

import ProjectItemController from '@/modules/MainOrganization/ProjectItem/presentation/controllers/project.Item.controller';
import TaskAssignmentController from '../controllers/task.assignment.controller';

import SetTaskEmployeeStatusParams from '../../core/params/set.task.employee.status.params';
import ShowTaskItemParams from '../../core/params/show.task.Item.params';

import { TaskEmployeeStatusEnum } from '../../core/constants/task.employee.status.enum';

import {
  InsideStatusType,
  getTypeNameKey,
} from '../../core/constants/inside.status.enum';

import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { dialogManager } from '@/base/Presentation/Dialogs/dialog.manager';

import type ProjectItemShowModel from '@/modules/MainOrganization/ProjectItem/core/models/project.Item.show.model';

import { ProjectItemPriceEnum } from '@/modules/MainOrganization/ProjectItem/core/constant/project.item.Price.enum';
import HandleFilesUpload from '@/shared/FormInputs/HandleFilesUpload.vue';


/**
 * Props
 */
const props = defineProps<{
  /**
   * project_department_item.id
   *
   * Example: 44
   */
  id: string;

  /**
   * project_department_item.uuid
   *
   * Example:
   * 46e10f7b-8dda-4df5-b036-143e2f51e98e
   */
  uuid: string;
}>();


/**
 * I18n
 */
const { t } = useI18n();


/**
 * Controllers
 */
const projectItemController =
  ProjectItemController.getInstance();

const taskAssignmentController =
  TaskAssignmentController.getInstance();


/**
 * Project department item ID
 */
const projectDepartmentItemId = computed(() => {
  return String(props.id ?? '');
});


/**
 * Project department item UUID
 */
const projectDepartmentItemUuid = computed(() => {
  return String(props.uuid ?? '');
});


/**
 * Item data
 */
const itemData = computed(() => {
  return projectItemController.itemData.value as ProjectItemShowModel | null;
});


/**
 * ============================================
 * Inside Status
 * ============================================
 *
 * IMPORTANT:
 *
 * inside_status comes from backend.
 *
 * Frontend DOES NOT change this value manually.
 *
 * ASSIGN  = 1
 * WORKING = 2
 * HOLD    = 3
 * REVIEW  = 4
 */
const insideStatus = computed(() => {
  return itemData.value?.inside_status;
});


/**
 * ============================================
 * Action Buttons Visibility
 * ============================================
 */

/**
 * Start button
 *
 * Show when:
 * ASSIGN
 * HOLD
 */
const isStartVisible = computed(() => {
  return (
    insideStatus.value === InsideStatusType.ASSIGN ||
    insideStatus.value === InsideStatusType.HOLD
  );
});


/**
 * Hold button
 *
 * Show only when:
 * WORKING
 */
const isHoldVisible = computed(() => {
  return (
    insideStatus.value === InsideStatusType.WORKING
  );
});


/**
 * Finish button
 *
 * Show only when:
 * WORKING
 */
const isFinishVisible = computed(() => {
  return (
    insideStatus.value === InsideStatusType.WORKING
  );
});


/**
 * ============================================
 * Pricing Method
 * ============================================
 */
const pricingMethodLabel = computed(() => {
  switch (itemData.value?.pricing_method) {
    case ProjectItemPriceEnum.GENERAL_ITEM:
      return t(
        'project_item.pricing_methods.GENERAL_ITEM',
      );

    case ProjectItemPriceEnum.SPACE_RELATED:
      return t(
        'project_item.pricing_methods.SPACE_RELATED',
      );

    case ProjectItemPriceEnum.FULL_FLOOR_RELATED:
      return t(
        'project_item.pricing_methods.FULL_FLOOR_RELATED',
      );

    default:
      return '-';
  }
});


/**
 * ============================================
 * Loading / Error
 * ============================================
 */
const itemLoading = computed(() => {
  return projectItemController.isItemLoading();
});


const itemError = computed(() => {
  return projectItemController.errorMessage.value;
});


/**
 * ============================================
 * Action State
 * ============================================
 */
const actionLoading = ref(false);

const activeDialogAction = ref<
  'START' | 'HOLD' | 'FINISH' | null
>(null);

const actionNotes = ref('');

const attachmentFiles = ref<File[]>([]);
const updateAttachments = (files: File[]): void => {
  attachmentFiles.value = files;
};

/**
 * ============================================
 * UUID Validation
 * ============================================
 */
const isValidUuid = computed(() => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  return uuidRegex.test(
    projectDepartmentItemUuid.value,
  );
});


/**
 * ============================================
 * Modal
 * ============================================
 */
const openModal = (
  action: 'START' | 'HOLD' | 'FINISH',
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


/**
 * ============================================
 * Attachment
 * ============================================
 */
// const handleFileChange = (
//   event: Event,
// ): void => {
//   const target =
//     event.target as HTMLInputElement;

//   attachmentFile.value =
//     target.files?.[0] ?? null;
// };


/**
 * ============================================
 * Get Status Sent To Endpoint
 * ============================================
 *
 * IMPORTANT:
 *
 * This uses TaskEmployeeStatusEnum.
 *
 * This is NOT inside_status.
 *
 * TaskEmployeeStatusEnum is only sent
 * to the endpoint.
 */
const getTargetStatus =
  (): TaskEmployeeStatusEnum => {
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


/**
 * ============================================
 * Confirm Status Change
 * ============================================
 */
const confirmStatusChange =
  async (): Promise<void> => {
    if (!activeDialogAction.value) {
      return;
    }

    if (!projectDepartmentItemId.value) {
      dialogManager.toastError(
        t('task_assignment.unexpected_error'),
      );

      return;
    }

    actionLoading.value = true;


    /**
     * This is the status sent to endpoint.
     *
     * START_EMPLOYEE
     * HOLD_EMPLOYEE
     * FINISH_EMPLOYEE
     */
    const targetStatus = getTargetStatus();


    /**
     * Attachment
     */
    const attachments =
      attachmentFiles.value.length > 0
        ? attachmentFiles.value.map((file) => ({
            file,
          }))
        : undefined;


    /**
     * Endpoint params
     */
    const params =
      new SetTaskEmployeeStatusParams({
        /**
         * project_department_item.id
         *
         * Example:
         * 44
         */
        project_department_item_id:
          Number(
            projectDepartmentItemId.value,
          ),

        /**
         * TaskEmployeeStatusEnum
         *
         * NOT InsideStatusType
         */
        status: targetStatus,

        notes:
          actionNotes.value || undefined,

        attachments,
      });


    try {
      const result =
        await taskAssignmentController
          .setTaskEmployeeStatus(params);


      /**
       * Success
       */
      if (result instanceof DataSuccess) {
        dialogManager.toastSuccess(
          result.message ||
            t(
              'task_assignment.status_updated',
            ),
        );


        /**
         * Close modal first
         */
        closeModal();


        /**
         * IMPORTANT:
         *
         * Don't change inside_status manually.
         *
         * Fetch the task again.
         *
         * Backend returns the real inside_status.
         *
         * Buttons will automatically update
         * depending on inside_status.
         */
        await fetchTaskDetails();

        return;
      }


      /**
       * API error
       */
      dialogManager.toastError(
        result.error?.displayMessage ||
          result.error?.title ||
          t(
            'task_assignment.unexpected_error',
          ),
      );
    } catch (error) {
      console.error(
        'Failed to update task status:',
        error,
      );

      dialogManager.toastError(
        t('task_assignment.unexpected_error'),
      );
    } finally {
      actionLoading.value = false;
    }
  };


/**
 * ============================================
 * Fetch Task Details
 * ============================================
 */
const fetchTaskDetails =
  async (): Promise<void> => {
    /**
     * UUID missing
     */
    if (!projectDepartmentItemUuid.value) {
      dialogManager.toastError(
        'Task UUID is missing.',
      );

      return;
    }


    /**
     * Invalid UUID
     */
    if (!isValidUuid.value) {
      dialogManager.toastError(
        'Task UUID is invalid.',
      );

      return;
    }


    /**
     * Fetch task.
     *
     * Backend returns:
     *
     * inside_status
     *
     * and that status controls
     * Start / Hold / Finish buttons.
     */
    await projectItemController.fetchOne(
      new ShowTaskItemParams({
        uuid:
          projectDepartmentItemUuid.value,

        allLocales: true,
      }),
    );
  };


/**
 * ============================================
 * Mounted
 * ============================================
 */
onMounted(() => {
  void fetchTaskDetails();
});


/**
 * ============================================
 * Watch Props
 * ============================================
 */
watch(
  () => [
    props.id,
    props.uuid,
  ],

  () => {
    void fetchTaskDetails();
  },
);
</script>

<template>
  <section class="task-assignment-show-page">
    <header class="task-assignment-page-header">
      <div class="task-assignment-page-header__content">
        <span class="task-assignment-page-header__icon" aria-hidden="true">
          <i class="pi pi-check-square"></i>
        </span>

        <div class="task-assignment-page-header__copy">
          <h1>{{ $t('task_assignment.title') }} #{{ projectDepartmentItemId }}</h1>
          <p>{{ $t('task_assignment.description') }}</p>
        </div>
      </div>

      <!-- <div class="task-assignment-page-header__actions">
        <router-link
          class="task-assignment-page-header__refresh"
          :to="{ name: 'mainorganization-task-assignment-index' }"
        >
          <i class="pi pi-arrow-left" aria-hidden="true"></i>
          <span>{{ $t('task_assignment.back_to_tasks') }}</span>
        </router-link>
      </div> -->
    </header>

    <div v-if="itemLoading" class="task-assignment-card task-assignment-card--loading">
      <p>{{ $t('loading_data') }}</p>
    </div>

    <div v-else-if="itemError" class="task-assignment-card task-assignment-card--error">
      <p>{{ itemError }}</p>
    </div>

    <article v-else class="task-assignment-card">

      <!-- ── Basic information ─────────────────────────────── -->
      <div class="task-details-section">
        <h3>{{ $t('project_item.basic_information') }}</h3>

        <div class="task-details-grid">
          <!-- Item name (from item_id.title OR item.translations) -->
          <div class="detail-item">
            <span class="detail-label">{{ $t('project_item.item') }}</span>
            <span class="detail-value">
              {{
                itemData?.item?.translations?.title?.en
                  || itemData?.item_id?.title
                  || '-'
              }}
            </span>
          </div>

          <!-- Price -->
          <div class="detail-item">
            <span class="detail-label">{{ $t('project_item.price') }}</span>
            <span class="detail-value">{{ itemData?.price ?? '-' }}</span>
          </div>

          <!-- Final price -->
          <div class="detail-item">
            <span class="detail-label">{{ $t('project_item.total_price_label') }}</span>
            <span class="detail-value">{{ itemData?.final_price ?? '-' }}</span>
          </div>

          <!-- Quantity -->
          <div class="detail-item">
            <span class="detail-label">{{ $t('project_item.quantity') }}</span>
            <span class="detail-value">{{ itemData?.quantity ?? '-' }}</span>
          </div>

          <!-- Pricing method -->
          <div class="detail-item">
            <span class="detail-label">{{ $t('project_item.pricing_method') }}</span>
            <span class="detail-value">{{ pricingMethodLabel }}</span>
          </div>

          <!-- Has attachment flag -->
          <div class="detail-item">
            <span class="detail-label">{{ $t('attachments') }}</span>
            <span class="detail-value">
              <span
                class="status-badge"
                :class="itemData?.has_attached ? 'status-badge--started' : 'status-badge--pending'"
              >
                {{ itemData?.has_attached ? $t('yes') : $t('no') }}
              </span>
            </span>
          </div>

          <!-- Is assign employee -->
          <div class="detail-item">
            <span class="detail-label">{{ $t('task_assignment.title') }}</span>
            <span class="detail-value">
              <span
                class="status-badge"
                :class="itemData?.is_assign_employee ? 'status-badge--started' : 'status-badge--pending'"
              >
                {{ itemData?.is_assign_employee ? $t('yes') : $t('no') }}
              </span>
            </span>
          </div>

          <!-- Task status -->
          <!-- <div class="detail-item">
            <span class="detail-label">{{ $t('status') }}</span>
            <span class="detail-value">
              <span v-if="isFinished" class="status-badge status-badge--finished">
                {{ $t('task_assignment.actions.finish') }}
              </span>
              <span v-else-if="currentStatus === TaskEmployeeStatusEnum.START_EMPLOYEE" class="status-badge status-badge--started">
                {{ $t('task_assignment.actions.start') }}
              </span>
              <span v-else-if="currentStatus === TaskEmployeeStatusEnum.HOLD_EMPLOYEE" class="status-badge status-badge--held">
                {{ $t('task_assignment.actions.hold') }}
              </span>
              <span v-else class="status-badge status-badge--pending">
                -
              </span>
            </span>
          </div> -->
        </div>
      </div>

      <!-- history -->
      <div class="task-details-section" >
        <h3>{{ $t('histories') }}</h3>
        <div class="task-details-grid" v-for="history in itemData?.histories" :key="history.id">
          <!-- <div class="detail-item">
            <span class="detail-label">{{ $t('id') }}</span>
            <span class="detail-value">
              {{ history.id }}
            </span>
          </div> -->
           <div class="detail-item">
            <span class="detail-label">{{ $t('status') }}</span>
            <span class="detail-value">
              {{$t(getTypeNameKey(history.status ?? 1)) }}
            </span>
          </div>
          <div class="detail-item" v-for="employee in history?.history_employees" :key="employee.id">
            <span class="detail-label">{{ $t('emp.name') }}</span>
            <span class="detail-value">
              {{ employee.employee?.name }}
            </span>
          </div>
        </div>
      </div>
       <!-- department -->
      <div class="task-details-section" >
        <h3>{{ $t('department') }}</h3>
        <div class="task-details-grid" >
          <div class="detail-item">
            <span class="detail-value">
              {{ itemData?.department ?? '-' }}
            </span>
          </div>
        </div>
      </div>
      <!-- project -->
      <div class="task-details-section" >
        <h3>{{ $t('project') }}</h3>
        <div class="task-details-grid" >
          <div class="detail-item">
            <span class="detail-value">
              <span class="detail-label">{{ $t('client.title') }}</span> 
              {{ itemData?.project?.client?.title ?? '-' }}
            </span>
          </div> 
          <div class="detail-item">
            <span class="detail-value">
              <span class="detail-label">{{ $t('project.title') }} </span>
              {{  itemData?.project?.title?.find( (item) => item.locale === 'en' )?.title ?? '-' }}
            </span>
          </div>
          <div class="detail-item">
            <span class="detail-value">
              <span class="detail-label">{{ $t('project.description') }} </span>
              {{  itemData?.project?.description?.find( (item) => item.locale === 'en' )?.description ?? '-' }}
            </span>
          </div>
            <div class="detail-item">
            <span class="detail-value">
              <span class="detail-label">{{ $t('project.created_at') }} </span>         
              {{  itemData?.project?.created_at ?? '-' }}
             </span>
          </div>
        </div>
      </div>

      <!-- ── Floor & space ──────────────────────────────────── -->
      <!-- <div class="task-details-section">
        <h3>{{ $t('project_item.project_floor') }}</h3>

        <div class="task-details-grid">
          <div class="detail-item">
            <span class="detail-label">{{ $t('project_item.project_floor') }}</span>
            <span class="detail-value">
              {{ itemData?.project_floor?.title || itemData?.project_floor_id || '-' }}
            </span>
          </div>

          <div v-if="itemData?.project_floor_space" class="detail-item">
            <span class="detail-label">{{ $t('project_item.related_label') }}</span>
            <span class="detail-value">{{ itemData.project_floor_space.title || '-' }}</span>
          </div>
        </div>
      </div> -->

      <!-- ── Organisation & employees ──────────────────────── -->
      <div class="task-details-section">
        <h3>{{ $t('general.information') }}</h3>

        <div class="task-details-grid">
          <!-- Organisation -->
          <div v-if="itemData?.organization" class="detail-item">
            <span class="detail-label">{{ $t('organization.title') }}</span>
            <span class="detail-value">{{ itemData.organization.name || '-' }}</span>
          </div>

          <!-- Project -->
          <div v-if="itemData?.project" class="detail-item">
            <span class="detail-label">{{ $t('project.title') }}</span>
            <span class="detail-value">{{ itemData.project.name || '-' }}</span>
          </div>

          <!-- Default employee -->
          <div v-if="itemData?.default_employee" class="detail-item">
            <span class="detail-label">{{ $t('employee.default') }}</span>
            <span class="detail-value">{{ itemData.default_employee.name || '-' }}</span>
          </div>
        </div>

        <!-- Assigned employees -->
        <div v-if="itemData?.assigned_employees?.length" class="task-details-sub-section">
          <h4>{{ $t('task_assignment.assigned_employees') }}</h4>
          <ul class="employee-list">
            <li
              v-for="emp in itemData.assigned_employees"
              :key="emp.id"
              class="employee-list__item"
            >
              <i class="pi pi-user" aria-hidden="true" />
              <span>{{ emp.name || emp.employee_name || '-' }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- ── Attachments ─────────────────────────────────────── -->
      <div v-if="itemData?.attachments?.length" class="task-details-section">
        <h3>{{ $t('attachments') }}</h3>

        <ul class="attachments-list">
          <li
            v-for="att in itemData.attachments"
            :key="att.id"
            class="attachments-list__item"
          >
            <!-- <a
              :href="att.file"
              target="_blank"
              rel="noopener noreferrer"
              class="attachment-link"
            >
              <i class="pi pi-paperclip" aria-hidden="true" />
              <span>{{ att.alt || att.file }}</span>
            </a> -->
            <Image :src="att.file" alt="Image" width="250" preview />
          </li>
        </ul>
      </div>

      <div class="task-status-actions-bar">
        <h3>{{ $t('general.actions') }}</h3>

        <div class="action-buttons-group">
          <!-- Start Button -->
          <button
            v-if="isStartVisible"
            type="button"
            class="task-action-btn task-action-btn--start"
            :disabled="actionLoading"
            @click="openModal('START')"
          >
            <i class="pi pi-play" aria-hidden="true"></i>
            <span>{{ $t('task_assignment.actions.start') }}</span>
          </button>

          <!-- Hold Button -->
          <button
            v-if="isHoldVisible"
            type="button"
            class="task-action-btn task-action-btn--hold"
            :disabled="actionLoading"
            @click="openModal('HOLD')"
          >
            <i class="pi pi-pause" aria-hidden="true"></i>
            <span>{{ $t('task_assignment.actions.hold') }}</span>
          </button>

          <!-- Finish Button -->
          <button
            v-if="isFinishVisible"
            type="button"
            class="task-action-btn task-action-btn--finish"
            :disabled="actionLoading"
            @click="openModal('FINISH')"
          >
            <i class="pi pi-check" aria-hidden="true"></i>
            <span>{{ $t('task_assignment.actions.finish') }}</span>
          </button>
        </div>
      </div>
    </article>

    <!-- Status Action Modal -->
    <Dialog
      v-model:visible="activeDialogAction"
      modal
      :header="
        activeDialogAction === 'START'
          ? $t('task_assignment.modals.start_title')
          : activeDialogAction === 'HOLD'
            ? $t('task_assignment.modals.hold_title')
            : $t('task_assignment.modals.finish_title')
      "
      :style="{ width: '32rem', maxWidth: '90vw' }"
      @hide="closeModal"
    >
      <div class="status-modal-content">
        <p class="confirm-message">
          {{
            activeDialogAction === 'START'
              ? $t('task_assignment.modals.start_confirm')
              : activeDialogAction === 'HOLD'
                ? $t('task_assignment.modals.hold_confirm')
                : $t('task_assignment.modals.finish_confirm')
          }}
        </p>

        <!-- Notes input for Hold and Finish -->
        <div v-if="activeDialogAction === 'HOLD' || activeDialogAction === 'FINISH'" class="form-group">
          <label for="task_action_notes">{{ $t('task_assignment.modals.notes_label') }}</label>
          <textarea
            id="task_action_notes"
            v-model="actionNotes"
            class="form-control"
            rows="3"
            :placeholder="$t('task_assignment.modals.notes_placeholder')"
          ></textarea>
        </div>

        <!-- Attachment upload for Finish -->
        <div v-if="activeDialogAction === 'FINISH'" class="form-group">
          <label for="task_action_attachment">{{ $t('task_assignment.modals.attachments_label') }}</label>
                <div class="field-group col-span-2">
        <HandleFilesUpload
          id="attachments"
          :label="$t('attachments')"
          :file="attachmentFiles"
          :multiple="true"
          @change="updateAttachments"
        />
      </div>
        </div>
      </div>

      <template #footer>
        <div class="modal-buttons-footer">
          <button
            type="button"
            class="btn btn-secondary"
            :disabled="actionLoading"
            @click="closeModal"
          >
            {{ $t('task_assignment.modals.no') }}
          </button>
          <button
            type="button"
            class="btn btn-primary"
            :disabled="actionLoading"
            @click="confirmStatusChange"
          >
            <span v-if="actionLoading" class="loader"></span>
            <span v-else>{{ $t('task_assignment.modals.yes') }}</span>
          </button>
        </div>
      </template>
    </Dialog>
  </section>
</template>

<style lang="scss">
@use '../styles/task_assignment';

.task-assignment-show-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  .task-details-section {
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-color, #e5e7eb);

    h3 {
      margin-bottom: 1rem;
      font-size: 1.1rem;
      font-weight: 600;
    }
  }

  .task-details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.25rem;

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      .detail-label {
        font-size: 0.85rem;
        color: var(--text-secondary, #6b7280);
      }

      .detail-value {
        font-weight: 500;

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.6rem;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 600;

          &--started {
            background-color: var(--primary-light, #e0f2fe);
            color: var(--primary-dark, #0369a1);
          }

          &--held {
            background-color: var(--warning-light, #fef3c7);
            color: var(--warning-dark, #b45309);
          }

          &--finished {
            background-color: var(--success-light, #d1fae5);
            color: var(--success-dark, #047857);
          }

          &--pending {
            background-color: var(--gray-light, #f3f4f6);
            color: var(--gray-dark, #4b5563);
          }
        }
      }
    }
  }

  .task-status-actions-bar {
    padding: 1.5rem;

    h3 {
      margin-bottom: 1rem;
      font-size: 1.1rem;
      font-weight: 600;
    }
  }

  .action-buttons-group {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .task-action-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1.25rem;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    border: none;
    transition: all 0.2s ease;

    &--start {
      background-color: var(--primary-color, #2563eb);
      color: var(--vt-c-white);

      &:hover:not(:disabled) {
        opacity: 0.9;
      }
    }

    &--hold {
      background-color: var(--warning-color, #d97706);
      color: var(--vt-c-white);

      &:hover:not(:disabled) {
        opacity: 0.9;
      }
    }

    &--finish {
      background-color: var(--success-color, #16a34a);
      color: var(--vt-c-white);

      &:hover:not(:disabled) {
        opacity: 0.9;
      }
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .status-modal-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-top: 0.5rem;

    .confirm-message {
      font-size: 1rem;
      color: var(--text-color, #1f2937);
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      label {
        font-weight: 500;
        font-size: 0.9rem;
      }

      .form-control {
        padding: 0.6rem;
        border: 1px solid var(--border-color, #d1d5db);
        border-radius: 6px;
        font-family: inherit;
        resize: vertical;
      }

      .form-control-file {
        padding: 0.4rem 0;
      }
    }
  }

  .modal-buttons-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;

    .btn {
      padding: 0.5rem 1.25rem;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid transparent;

      &--secondary {
        background-color: var(--gray-light, #f3f4f6);
        color: var(--text-color, #374151);
        border-color: var(--border-color, #d1d5db);
      }

      &--primary {
        background-color: var(--primary-color, #2563eb);
        color: var(--vt-c-white);
      }
    }
  }

  .task-details-sub-section {
    margin-top: 1.25rem;
    padding-top: 1rem;
    border-top: 1px dashed var(--border-color, #e5e7eb);

    h4 {
      margin-bottom: 0.75rem;
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-secondary, #6b7280);
    }
  }

  .employee-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    list-style: none;
    padding: 0;
    margin: 0;

    &__item {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.3rem 0.75rem;
      border-radius: 999px;
      background-color: var(--primary-light, #e0f2fe);
      color: var(--primary-dark, #0369a1);
      font-size: 0.85rem;
      font-weight: 500;
    }
  }

  .attachments-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    list-style: none;
    padding: 0;
    margin: 0;

    &__item {
      .attachment-link {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        color: var(--primary-color, #2563eb);
        text-decoration: none;
        font-size: 0.9rem;
        word-break: break-all;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}
</style>
