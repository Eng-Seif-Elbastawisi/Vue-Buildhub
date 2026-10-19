<script setup lang="ts">
  import { ref } from 'vue';
  import Dialog from 'primevue/dialog';
  import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import { TimelineApprovalStatus } from '../../core/constants/timeline.status';
  import { ChangeTimelineApprovalParams } from '../../core/params/schedule.status.params';
  import ScheduleController from '../controllers/schedule.controller';

  const props = defineProps<{
    quoteId: number;
    targetStatus: typeof TimelineApprovalStatus.APPROVED | typeof TimelineApprovalStatus.CANCEL;
  }>();
  const emit = defineEmits<{ close: [] }>();
  const controller = ScheduleController.getInstance();
  const note = ref('');
  async function save() {
    if (
      controller.busy.value ||
      controller.ownerState.value.data?.timelineStatus !== TimelineApprovalStatus.PENDING
    )
      return;
    const state = await controller.changeApproval(
      new ChangeTimelineApprovalParams(
        props.quoteId,
        props.targetStatus,
        note.value.trim() || null,
      ),
    );
    if (state instanceof DataSuccess && state.data) emit('close');
  }
</script>
<template>
  <Dialog
    class="workspace-dialog schedule-status-dialog"
    :visible="true"
    modal
    :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'"
    :header="
      $t(
        targetStatus === TimelineApprovalStatus.APPROVED
          ? 'schedule.confirm_accept_approval'
          : 'schedule.confirm_reject_approval',
      )
    "
    :closable="!controller.busy.value"
    @update:visible="!controller.busy.value && emit('close')"
  >
    <form class="schedule__status-form" @submit.prevent="save">
      <p class="schedule__approval-current">
        {{ $t('schedule.current_approval') }}:
        <strong class="schedule__approval-status">{{
          controller.ownerState.value.data?.timelineStatus == null
            ? $t('schedule.not_available')
            : $t(`schedule.approval_${controller.ownerState.value.data.timelineStatus}`)
        }}</strong>
      </p>
      <p>
        {{
          $t(
            targetStatus === TimelineApprovalStatus.APPROVED
              ? 'schedule.accept_approval_confirmation'
              : 'schedule.reject_approval_confirmation',
          )
        }}
      </p>
      <div class="field-group input-wrapper">
        <span class="field-help-label-row field-help-label-row--block">
          <label class="field-label label" for="schedule-approval-note">{{
            $t('schedule.note')
          }}</label>
          <FieldHelpIcon
            :label="$t('schedule.note')"
            field-name="timeline_note"
            field-id="schedule-approval-note"
            :help-text="$t('schedule.note_help')"
          />
        </span>
        <textarea
          id="schedule-approval-note"
          v-model="note"
          class="input workspace-control"
          rows="3"
          :disabled="controller.busy.value"
        />
      </div>
      <p v-if="controller.approvalState.value.error" role="alert">
        {{ $t(controller.approvalState.value.error.displayMessage) }}
      </p>
      <div class="schedule__actions schedule__dialog-actions">
        <AppButton
          type="button"
          theme="secondary"
          :disabled="controller.busy.value"
          @click="emit('close')"
          >{{ $t('schedule.cancel') }}</AppButton
        >
        <AppButton
          type="submit"
          :theme="targetStatus === TimelineApprovalStatus.APPROVED ? 'secondary' : 'danger'"
          :action-tone="targetStatus === TimelineApprovalStatus.APPROVED ? 'approve' : undefined"
          :loading="controller.busy.value"
          :disabled="
            controller.ownerState.value.data?.timelineStatus !== TimelineApprovalStatus.PENDING
          "
          >{{
            $t(
              targetStatus === TimelineApprovalStatus.APPROVED
                ? 'schedule.accept'
                : 'schedule.reject',
            )
          }}</AppButton
        >
      </div>
    </form>
  </Dialog>
</template>
