<script setup lang="ts">
import { computed, type PropType } from 'vue';

import Dialog from 'primevue/dialog';

import HandleFilesUpload, { type UploadedFile } from '@/shared/FormInputs/HandleFilesUpload.vue';

import type {
  DialogAction,
  TaskAssignmentStatusActionModel,
} from './taskAssignmentsShow.types';

const { model } = defineProps({
  model: {
    type: Object as PropType<TaskAssignmentStatusActionModel>,
    required: true,
  },
});

const emit = defineEmits<{
  close: [];
  confirm: [];
  open: [action: DialogAction];
  'update:attachments': [files: UploadedFile[]];
  'update:notes': [notes: string];
}>();

const notes = computed({
  get: () => model.notes,
  set: (updatedNotes: string) => emit('update:notes', updatedNotes),
});

const actionIcon = computed(() => {
  if (model.activeAction === 'START') {
    return 'pi pi-play';
  }

  return model.activeAction === 'HOLD' ? 'pi pi-pause' : 'pi pi-check';
});

const updateDialogVisibility = (visible: boolean): void => {
  if (!visible) {
    emit('close');
  }
};
</script>

<template>
  <div class="task-status-actions-bar task-assignment-show__actions">
    <h3>{{ $t('general.actions') }}</h3>

    <div class="action-buttons-group">
      <button
        v-if="model.showStart"
        type="button"
        class="task-action-btn task-action-btn--start"
        :disabled="model.loading"
        @click="emit('open', 'START')"
      >
        <i class="pi pi-play" aria-hidden="true" />
        <span>{{ $t('task_assignment.actions.start') }}</span>
      </button>

      <button
        v-if="model.showHold"
        type="button"
        class="task-action-btn task-action-btn--hold"
        :disabled="model.loading"
        @click="emit('open', 'HOLD')"
      >
        <i class="pi pi-pause" aria-hidden="true" />
        <span>{{ $t('task_assignment.actions.hold') }}</span>
      </button>

      <button
        v-if="model.showFinish"
        type="button"
        class="task-action-btn task-action-btn--finish"
        :disabled="model.loading"
        @click="emit('open', 'FINISH')"
      >
        <i class="pi pi-check" aria-hidden="true" />
        <span>{{ $t('task_assignment.actions.finish') }}</span>
      </button>
    </div>
  </div>

  <Dialog
    :visible="model.visible"
    modal
    :header="model.title"
    :style="{ width: '32rem', maxWidth: '90vw' }"
    class="task-status-dialog workspace-dialog"
    @update:visible="updateDialogVisibility"
    @hide="emit('close')"
  >
    <div class="status-modal-content">
      <div class="status-modal-icon">
        <i :class="actionIcon" aria-hidden="true" />
      </div>

      <p class="confirm-message">{{ model.confirmationMessage }}</p>

      <div
        v-if="model.activeAction === 'HOLD' || model.activeAction === 'FINISH'"
        class="form-group"
      >
        <label for="task_action_notes">{{ $t('task_assignment.modals.notes_label') }}</label>
        <textarea
          id="task_action_notes"
          v-model="notes"
          class="form-control workspace-control"
          rows="3"
          :placeholder="$t('task_assignment.modals.notes_placeholder')"
        />
      </div>

      <div v-if="model.activeAction === 'FINISH'" class="form-group">
        <label>{{ $t('task_assignment.modals.attachments_label') }}</label>
        <HandleFilesUpload
          id="attachments"
          :label="$t('attachments')"
          :multiple="true"
          @change="emit('update:attachments', $event)"
        />
      </div>
    </div>

    <template #footer>
      <div class="modal-buttons-footer">
        <button
          type="button"
          class="btn btn-secondary"
          :disabled="model.loading"
          @click="emit('close')"
        >
          {{ $t('task_assignment.modals.no') }}
        </button>

        <button
          type="button"
          class="btn btn-primary"
          :disabled="model.loading"
          @click="emit('confirm')"
        >
          <span v-if="model.loading" class="button-loader" />
          <span v-else>{{ $t('task_assignment.modals.yes') }}</span>
        </button>
      </div>
    </template>
  </Dialog>
</template>
