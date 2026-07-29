<script setup lang="ts">
import {
  computed,
  onMounted,
  ref,
  watch,
} from 'vue';
import { useI18n } from 'vue-i18n';

import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import Dialog from 'primevue/dialog';
import Image from 'primevue/image';

import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { dialogManager } from '@/base/Presentation/Dialogs/dialog.manager';

import ProjectItemController from '@/modules/MainOrganization/ProjectItem/presentation/controllers/project.Item.controller';
import type ProjectItemShowModel from '@/modules/MainOrganization/ProjectItem/core/models/project.Item.show.model';

import HandleFilesUpload, {
  type UploadedFile,
} from '@/shared/FormInputs/HandleFilesUpload.vue';

import {
  InsideStatusType,
  getTypeNameKey,
} from '../../core/constants/inside.status.enum';
import { TaskEmployeeStatusEnum } from '../../core/constants/task.employee.status.enum';

import ProjectAttachmentParams from '../../core/params/project.attachment.params';
import SetTaskEmployeeStatusParams from '../../core/params/set.task.employee.status.params';
import ShowTaskItemParams from '../../core/params/show.task.Item.params';

import TaskAssignmentController from '../controllers/task.assignment.controller';

type DialogAction = 'START' | 'HOLD' | 'FINISH';

interface StatusMeta {
  className: string;
  icon: string;
}

interface UploadedFileWithBase64 extends UploadedFile {
  base64: string;
}

const props = defineProps<{
  id: string;
  uuid: string;
}>();

const { t } = useI18n();

const projectItemController =
  ProjectItemController.getInstance();

const taskAssignmentController =
  TaskAssignmentController.getInstance();

const actionLoading = ref(false);
const actionNotes = ref('');
const activeDialogAction = ref<DialogAction | null>(
  null,
);
const attachmentFiles = ref<UploadedFile[]>([]);

const projectDepartmentItemId = computed(() =>
  String(props.id ?? ''),
);

const projectDepartmentItemUuid = computed(() =>
  String(props.uuid ?? ''),
);

const itemData = computed(
  () =>
    projectItemController.itemData
      .value as ProjectItemShowModel | null,
);

const itemLoading = computed(() =>
  projectItemController.isItemLoading(),
);

const itemError = computed(
  () => projectItemController.errorMessage.value,
);

const insideStatus = computed(
  () => itemData.value?.inside_status,
);

const insideStatusLabel = computed(() => {
  if (
    insideStatus.value === null ||
    insideStatus.value === undefined
  ) {
    return '-';
  }

  return t(getTypeNameKey(insideStatus.value));
});

const insideStatusMeta = computed<StatusMeta>(() => {
  switch (insideStatus.value) {
    case InsideStatusType.ASSIGN:
      return {
        className:
          'task-status-chip--assigned',
        icon: 'pi pi-user-plus',
      };

    case InsideStatusType.WORKING:
      return {
        className:
          'task-status-chip--working',
        icon: 'pi pi-cog',
      };

    case InsideStatusType.HOLD:
      return {
        className:
          'task-status-chip--held',
        icon: 'pi pi-pause',
      };

    case InsideStatusType.REVIEW:
      return {
        className:
          'task-status-chip--review',
        icon: 'pi pi-eye',
      };

    default:
      return {
        className:
          'task-status-chip--default',
        icon: 'pi pi-info-circle',
      };
  }
});

const dialogVisible = computed({
  get: () => activeDialogAction.value !== null,

  set: (visible: boolean) => {
    if (!visible) {
      closeModal();
    }
  },
});

const dialogTitle = computed(() => {
  switch (activeDialogAction.value) {
    case 'START':
      return t(
        'task_assignment.modals.start_title',
      );

    case 'HOLD':
      return t(
        'task_assignment.modals.hold_title',
      );

    case 'FINISH':
      return t(
        'task_assignment.modals.finish_title',
      );

    default:
      return '';
  }
});

const dialogConfirmationMessage = computed(() => {
  switch (activeDialogAction.value) {
    case 'START':
      return t(
        'task_assignment.modals.start_confirm',
      );

    case 'HOLD':
      return t(
        'task_assignment.modals.hold_confirm',
      );

    case 'FINISH':
      return t(
        'task_assignment.modals.finish_confirm',
      );

    default:
      return '';
  }
});

const isStartVisible = computed(
  () =>
    insideStatus.value ===
      InsideStatusType.ASSIGN ||
    insideStatus.value === InsideStatusType.HOLD,
);

const isHoldVisible = computed(
  () =>
    insideStatus.value ===
    InsideStatusType.WORKING,
);

const isFinishVisible = computed(
  () =>
    insideStatus.value ===
    InsideStatusType.WORKING,
);

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

const hasBase64 = (
  file: UploadedFile,
): file is UploadedFileWithBase64 => {
  const base64 = (
    file as UploadedFileWithBase64
  ).base64;

  return (
    typeof base64 === 'string' &&
    base64.trim().length > 0
  );
};

const createAttachmentParams =
  (): ProjectAttachmentParams[] => {
    return attachmentFiles.value
      .filter(hasBase64)
      .map(
        (file) =>
          new ProjectAttachmentParams({
            file: file.base64,
            alt:
              typeof file.name === 'string'
                ? file.name
                : '',
          }),
      );
  };

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
    if (!activeDialogAction.value) {
      return;
    }

    const itemId = Number(
      projectDepartmentItemId.value,
    );

    if (
      !Number.isInteger(itemId) ||
      itemId <= 0
    ) {
      dialogManager.toastError(
        t(
          'task_assignment.unexpected_error',
        ),
      );

      return;
    }

    actionLoading.value = true;

    try {
      const params =
        new SetTaskEmployeeStatusParams({
          project_department_item_id:
            itemId,

          status: getTargetStatus(),

          notes:
            actionNotes.value.trim() ||
            undefined,

          attachments:
            activeDialogAction.value ===
            'FINISH'
              ? createAttachmentParams()
              : [],
        });

      const result =
        await taskAssignmentController
          .setTaskEmployeeStatus(params);

      if (result instanceof DataSuccess) {
        dialogManager.toastSuccess(
          result.message ||
            t(
              'task_assignment.status_updated',
            ),
        );

        closeModal();

        await fetchTaskDetails();

        return;
      }

      dialogManager.toastError(
        getResultErrorMessage(result),
      );
    } catch (error) {
      console.error(
        'Failed to update task status:',
        error,
      );

      dialogManager.toastError(
        t(
          'task_assignment.unexpected_error',
        ),
      );
    } finally {
      actionLoading.value = false;
    }
  };

const fetchTaskDetails =
  async (): Promise<void> => {
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
        uuid:
          projectDepartmentItemUuid.value,

        allLocales: true,
      }),
    );
  };

onMounted(() => {
  void fetchTaskDetails();
});

watch(
  () => [props.id, props.uuid],
  () => {
    void fetchTaskDetails();
  },
);
</script>

<template>
  <section class="task-assignment-show-page">
    <header class="task-assignment-page-header">
      <div
        class="task-assignment-page-header__content"
      >
        <span
          class="task-assignment-page-header__icon"
          aria-hidden="true"
        >
          <i class="pi pi-check-square" />
        </span>

        <div
          class="task-assignment-page-header__copy"
        >
          <h1>
            {{ $t('task_assignment.title') }}
            #{{ projectDepartmentItemId }}
          </h1>

          <p>
            {{
              $t(
                'task_assignment.description',
              )
            }}
          </p>
        </div>
      </div>

      <div
        v-if="itemData"
        class="task-status-summary"
      >
        <span class="task-status-summary__label">
          {{ $t('status') }}
        </span>

        <span
          class="task-status-chip"
          :class="
            insideStatusMeta.className
          "
        >
          <span
            class="task-status-chip__icon"
            aria-hidden="true"
          >
            <i
              :class="insideStatusMeta.icon"
            />
          </span>

          <span
            class="task-status-chip__text"
          >
            {{ insideStatusLabel }}
          </span>

          <span
            class="task-status-chip__indicator"
            aria-hidden="true"
          />
        </span>
      </div>
    </header>

    <div
      v-if="itemLoading"
      class="
        task-assignment-card
        task-assignment-card--loading
      "
    >
      <p>{{ $t('loading_data') }}</p>
    </div>

    <div
      v-else-if="itemError"
      class="
        task-assignment-card
        task-assignment-card--error
      "
    >
      <p>{{ itemError }}</p>
    </div>

    <article
      v-else
      class="task-assignment-card"
    >
      <!-- Basic information -->
      <div class="task-details-section">
        <h3>
          {{
            $t(
              'project_item.basic_information',
            )
          }}
        </h3>

        <div class="task-details-grid">
          <div class="detail-item">
            <span class="detail-label">
              {{ $t('project_item.item') }}
            </span>

            <span class="detail-value">
              {{
                itemData?.item?.translations
                  ?.title?.en ||
                itemData?.item_id?.title ||
                '-'
              }}
            </span>
          </div>

          <div class="detail-item">
            <span class="detail-label">
              {{ $t('employee.name') }}
            </span>

            <span class="detail-value">
              {{
                itemData?.employee?.name ??
                '-'
              }}
            </span>
          </div>

          <div class="detail-item">
            <span class="detail-label">
              {{ $t('department') }}
            </span>

            <span class="detail-value">
              {{ itemData?.department ?? '-' }}
            </span>
          </div>

          <div class="detail-item">
            <span class="detail-label">
              {{ $t('status') }}
            </span>

            <span class="detail-value">
              <span
                class="status-badge"
                :class="
                  insideStatusMeta.className
                "
              >
                <i
                  :class="
                    insideStatusMeta.icon
                  "
                  aria-hidden="true"
                />

                {{ insideStatusLabel }}
              </span>
            </span>
          </div>

          <div class="detail-item">
            <span class="detail-label">
              {{ $t('attachments') }}
            </span>

            <span class="detail-value">
              <span
                class="status-badge"
                :class="
                  itemData?.has_attached
                    ? 'status-badge--success'
                    : 'status-badge--muted'
                "
              >
                <i
                  :class="
                    itemData?.has_attached
                      ? 'pi pi-check-circle'
                      : 'pi pi-times-circle'
                  "
                  aria-hidden="true"
                />

                {{
                  itemData?.has_attached
                    ? $t('yes')
                    : $t('no')
                }}
              </span>
            </span>
          </div>

          <div class="detail-item">
            <span class="detail-label">
              {{
                $t(
                  'task_assignment.title',
                )
              }}
            </span>

            <span class="detail-value">
              <span
                class="status-badge"
                :class="
                  itemData?.is_assign_employee
                    ? 'status-badge--success'
                    : 'status-badge--muted'
                "
              >
                <i
                  :class="
                    itemData?.is_assign_employee
                      ? 'pi pi-check-circle'
                      : 'pi pi-times-circle'
                  "
                  aria-hidden="true"
                />

                {{
                  itemData?.is_assign_employee
                    ? $t('yes')
                    : $t('no')
                }}
              </span>
            </span>
          </div>
        </div>
      </div>

      <!-- Project -->
      <div class="task-details-section">
        <h3>{{ $t('project') }}</h3>

        <div class="task-details-grid">
          <div class="detail-item">
            <span class="detail-label">
              {{ $t('client.title') }}
            </span>

            <span class="detail-value">
              {{
                itemData?.project?.client
                  ?.title ?? '-'
              }}
            </span>
          </div>

          <div class="detail-item">
            <span class="detail-label">
              {{ $t('project_name') }}
            </span>

            <span class="detail-value">
              {{
                itemData?.project?.title?.find(
                  (item) =>
                    item.locale === 'en',
                )?.title ?? '-'
              }}
            </span>
          </div>

          <div class="detail-item">
            <span class="detail-label">
              {{ $t('description') }}
            </span>

            <span class="detail-value">
              {{
                itemData?.project?.description?.find(
                  (item) =>
                    item.locale === 'en',
                )?.description ?? '-'
              }}
            </span>
          </div>
        </div>
      </div>

      <!-- History -->
      <div class="task-details-section">
        <Accordion
          :active-index="0"
          class="task-history-accordion"
        >
          <AccordionTab
            :header="$t('histories')"
          >
            <div
              v-if="
                !itemData?.histories?.length
              "
              class="task-history-empty"
            >
              {{ $t('no_data') }}
            </div>

            <div
              v-for="history in itemData?.histories"
              :key="history.id"
              class="task-history-item"
            >
              <div class="task-details-grid">
                <div class="detail-item">
                  <span class="detail-label">
                    {{ $t('status') }}
                  </span>

                  <span class="detail-value">
                    <span
                      class="
                        status-badge
                        status-badge--history
                      "
                    >
                      {{
                        $t(
                          getTypeNameKey(
                            history.status ?? 1,
                          ),
                        )
                      }}
                    </span>
                  </span>
                </div>

                <div
                  v-for="employee in history.history_employees"
                  :key="employee.id"
                  class="detail-item"
                >
                  <span class="detail-label">
                    {{ $t('emp.name') }}
                  </span>

                  <span class="detail-value">
                    {{
                      employee.employee?.name ??
                      '-'
                    }}
                  </span>
                </div>

                <div
                  v-if="history.created_at"
                  class="detail-item"
                >
                  <span class="detail-label">
                    {{ $t('date') }}
                  </span>

                  <span class="detail-value">
                    {{ history.created_at }}
                  </span>
                </div>

                <div
                  v-if="history.notes"
                  class="detail-item"
                >
                  <span class="detail-label">
                    {{ $t('notes') }}
                  </span>

                  <span class="detail-value">
                    {{ history.notes }}
                  </span>
                </div>
              </div>
            </div>
          </AccordionTab>
        </Accordion>
      </div>

      <!-- Attachments -->
      <div
        v-if="itemData?.attachments?.length"
        class="task-details-section"
      >
        <h3>{{ $t('attachments') }}</h3>

        <ul class="attachments-list">
          <li
            v-for="attachment in itemData.attachments"
            :key="attachment.id"
            class="attachments-list__item"
          >
            <Image
              :src="attachment.file"
              :alt="attachment.alt || 'Attachment'"
              width="250"
              preview
            />
          </li>
        </ul>
      </div>

      <!-- Actions -->
      <div class="task-status-actions-bar">
        <h3>
          {{ $t('general.actions') }}
        </h3>

        <div class="action-buttons-group">
          <button
            v-if="isStartVisible"
            type="button"
            class="
              task-action-btn
              task-action-btn--start
            "
            :disabled="actionLoading"
            @click="openModal('START')"
          >
            <i
              class="pi pi-play"
              aria-hidden="true"
            />

            <span>
              {{
                $t(
                  'task_assignment.actions.start',
                )
              }}
            </span>
          </button>

          <button
            v-if="isHoldVisible"
            type="button"
            class="
              task-action-btn
              task-action-btn--hold
            "
            :disabled="actionLoading"
            @click="openModal('HOLD')"
          >
            <i
              class="pi pi-pause"
              aria-hidden="true"
            />

            <span>
              {{
                $t(
                  'task_assignment.actions.hold',
                )
              }}
            </span>
          </button>

          <button
            v-if="isFinishVisible"
            type="button"
            class="
              task-action-btn
              task-action-btn--finish
            "
            :disabled="actionLoading"
            @click="openModal('FINISH')"
          >
            <i
              class="pi pi-check"
              aria-hidden="true"
            />

            <span>
              {{
                $t(
                  'task_assignment.actions.finish',
                )
              }}
            </span>
          </button>
        </div>
      </div>
    </article>

    <Dialog
      v-model:visible="dialogVisible"
      modal
      :header="dialogTitle"
      :style="{
        width: '32rem',
        maxWidth: '90vw',
      }"
      class="task-status-dialog"
      @hide="closeModal"
    >
      <div class="status-modal-content">
        <div class="status-modal-icon">
          <i
            :class="
              activeDialogAction === 'START'
                ? 'pi pi-play'
                : activeDialogAction === 'HOLD'
                  ? 'pi pi-pause'
                  : 'pi pi-check'
            "
            aria-hidden="true"
          />
        </div>

        <p class="confirm-message">
          {{ dialogConfirmationMessage }}
        </p>

        <div
          v-if="
            activeDialogAction === 'HOLD' ||
            activeDialogAction === 'FINISH'
          "
          class="form-group"
        >
          <label for="task_action_notes">
            {{
              $t(
                'task_assignment.modals.notes_label',
              )
            }}
          </label>

          <textarea
            id="task_action_notes"
            v-model="actionNotes"
            class="form-control"
            rows="3"
            :placeholder="
              $t(
                'task_assignment.modals.notes_placeholder',
              )
            "
          />
        </div>

        <div
          v-if="
            activeDialogAction === 'FINISH'
          "
          class="form-group"
        >
          <label>
            {{
              $t(
                'task_assignment.modals.attachments_label',
              )
            }}
          </label>

          <HandleFilesUpload
            id="attachments"
            :label="$t('attachments')"
            :multiple="true"
            @change="updateAttachments"
          />
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
            {{
              $t(
                'task_assignment.modals.no',
              )
            }}
          </button>

          <button
            type="button"
            class="btn btn-primary"
            :disabled="actionLoading"
            @click="confirmStatusChange"
          >
            <span
              v-if="actionLoading"
              class="button-loader"
            />

            <span v-else>
              {{
                $t(
                  'task_assignment.modals.yes',
                )
              }}
            </span>
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
      color: #6b7280;
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
      color: #1d4ed8;
      border-color: #bfdbfe;
      background:
        linear-gradient(
          135deg,
          #eff6ff,
          #dbeafe
        );
    }

    &--working {
      color: #047857;
      border-color: #a7f3d0;
      background:
        linear-gradient(
          135deg,
          #ecfdf5,
          #d1fae5
        );

      .task-status-chip__icon i {
        animation: status-rotate 3s linear infinite;
      }
    }

    &--held {
      color: #b45309;
      border-color: #fde68a;
      background:
        linear-gradient(
          135deg,
          #fffbeb,
          #fef3c7
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
      color: #475569;
      border-color: #e2e8f0;
      background:
        linear-gradient(
          135deg,
          #f8fafc,
          #f1f5f9
        );
    }
  }

  .task-details-section {
    padding: 1.5rem;
    border-bottom: 1px solid
      var(--border-color, #e5e7eb);

    h3 {
      margin: 0 0 1rem;
      color: #111827;
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
      border: 1px solid #eef0f4;
      border-radius: 0.875rem;
      background: #fff;
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
        color: #6b7280;
        font-size: 0.8rem;
        font-weight: 600;
      }

      .detail-value {
        color: #1f2937;
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
      color: #1d4ed8;
      border-color: #bfdbfe;
      background: #eff6ff;
    }

    &.task-status-chip--working {
      color: #047857;
      border-color: #a7f3d0;
      background: #ecfdf5;
    }

    &.task-status-chip--held {
      color: #b45309;
      border-color: #fde68a;
      background: #fffbeb;
    }

    &.task-status-chip--review {
      color: #7c3aed;
      border-color: #ddd6fe;
      background: #f5f3ff;
    }

    &.task-status-chip--default {
      color: #475569;
      border-color: #e2e8f0;
      background: #f8fafc;
    }

    &--success {
      color: #047857;
      border-color: #a7f3d0;
      background: #ecfdf5;
    }

    &--muted {
      color: #64748b;
      border-color: #e2e8f0;
      background: #f8fafc;
    }

    &--history {
      color: #4338ca;
      border-color: #c7d2fe;
      background: #eef2ff;
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
    color: #64748b;
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
          #2563eb,
          #1d4ed8
        );
    }

    &--hold {
      background:
        linear-gradient(
          135deg,
          #f59e0b,
          #d97706
        );
    }

    &--finish {
      background:
        linear-gradient(
          135deg,
          #16a34a,
          #047857
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
      border: 1px solid #e5e7eb;
      border-radius: 0.875rem;
      background: #fff;

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
  background: #fff;
  color: #111827;
  box-shadow: 0 24px 70px
    rgb(15 23 42 / 22%);

  .p-dialog-header {
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid #eef0f4;
  }

  .p-dialog-content {
    padding: 1.5rem;
  }

  .p-dialog-footer {
    padding: 1rem 1.5rem 1.5rem;
    border-top: 1px solid #eef0f4;
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
    color: #2563eb;
    background: #eff6ff;
    font-size: 1.35rem;
  }

  .confirm-message {
    margin: 0;
    color: #374151;
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
      color: #374151;
      font-size: 0.875rem;
      font-weight: 700;
    }

    .form-control {
      width: 100%;
      min-height: 6.5rem;
      padding: 0.75rem 1rem;
      border: 1px solid #d1d5db;
      border-radius: 0.75rem;
      outline: none;
      background: #fff;
      color: #111827;
      font-family: inherit;
      resize: vertical;
      transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease;

      &:focus {
        border-color: #2563eb;
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
    color: #374151;
    border-color: #d1d5db;
    background: #f9fafb;
  }

  .btn-primary {
    color: #fff;
    border-color: #2563eb;
    background:
      linear-gradient(
        135deg,
        #2563eb,
        #1d4ed8
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
</style>