<script setup lang="ts">
  import { computed, ref } from 'vue';
  import Dialog from 'primevue/dialog';
  import { useI18n } from 'vue-i18n';
  import TitleInterface from '@/base/Data/Models/titleInterface';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import type ScheduleGroupModel from '../../core/models/schedule.group.model';
  import {
    TimelineWorkStatus,
    TimelineWorkReason,
    type TimelineWorkStatus as Work,
    type TimelineWorkReason as Reason,
  } from '../../core/constants/timeline.status';
  import { ChangeTimelineWorkStatusParams } from '../../core/params/schedule.status.params';
  import ScheduleController from '../controllers/schedule.controller';

  const props = defineProps<{ group: ScheduleGroupModel }>();
  const emit = defineEmits<{ close: [] }>();
  const controller = ScheduleController.getInstance();
  const { t } = useI18n();
  const statuses = computed(() =>
    Object.values(TimelineWorkStatus).map(
      (id) => new TitleInterface({ id, title: t(`schedule.work_${id}`) }),
    ),
  );
  const reasons = computed(() =>
    Object.values(TimelineWorkReason).map(
      (id) => new TitleInterface({ id, title: t(`schedule.reason_${id}`) }),
    ),
  );
  const selected = ref<TitleInterface<number> | null>(null);
  const reason = ref<TitleInterface<number> | null>(null);
  const note = ref('');
  const invalid = ref(false);
  async function save() {
    if (controller.busy.value) return;
    invalid.value = !selected.value || selected.value.id === props.group.workStatus;
    if (invalid.value || !selected.value) return;
    const state = await controller.changeWorkStatus(
      new ChangeTimelineWorkStatusParams(
        props.group.id,
        selected.value.id as Work,
        (reason.value?.id as Reason | undefined) ?? null,
        note.value.trim() || null,
      ),
    );
    if (state instanceof DataSuccess) emit('close');
  }
</script>
<template>
  <Dialog
    class="workspace-dialog schedule-status-dialog"
    :visible="true"
    modal
    :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'"
    :header="$t('schedule.manage_work')"
    :closable="!controller.busy.value"
    @update:visible="!controller.busy.value && emit('close')"
  >
    <form class="schedule__status-form" @submit.prevent="save">
      <p>
        {{ group.title }} · {{ $t('schedule.current_work') }}:
        {{
          group.workStatus === undefined
            ? $t('schedule.not_available')
            : $t(
                group.workStatus === null
                  ? 'schedule.work_unstarted'
                  : `schedule.work_${group.workStatus}`,
              )
        }}
      </p>
      <div class="field-group" :class="{ schedule__invalid: invalid }">
        <UpdatedCustomInputSelect
          id="schedule-work-target"
          v-model="selected"
          label="schedule.target_work"
          :placeholder="$t('schedule.choose_status')"
          :static-options="statuses"
          :disabled="controller.busy.value"
          required
        >
          <template #LabelHeader>
            <FieldHelpIcon
              :label="$t('schedule.target_work')"
              field-name="work_status"
              field-id="schedule-work-target"
              :help-text="$t('schedule.work_help')"
            />
          </template>
        </UpdatedCustomInputSelect>
        <small v-if="invalid" role="alert">{{ $t('schedule.choose_different_status') }}</small>
      </div>
      <div class="field-group">
        <UpdatedCustomInputSelect
          id="schedule-work-reason"
          v-model="reason"
          label="schedule.reason"
          :placeholder="$t('schedule.choose_reason')"
          :static-options="reasons"
          :disabled="controller.busy.value"
          optional
        >
          <template #LabelHeader>
            <FieldHelpIcon
              :label="$t('schedule.reason')"
              field-name="reason"
              field-id="schedule-work-reason"
              :help-text="$t('schedule.reason_help')"
            />
          </template>
        </UpdatedCustomInputSelect>
        <AppButton
          v-if="reason"
          type="button"
          theme="secondary"
          size="sm"
          :disabled="controller.busy.value"
          @click="reason = null"
          >{{ $t('schedule.clear_reason') }}</AppButton
        >
      </div>
      <div class="field-group input-wrapper">
        <span class="field-help-label-row field-help-label-row--block">
          <label class="field-label label" for="schedule-work-note">{{
            $t('schedule.note')
          }}</label>
          <FieldHelpIcon
            :label="$t('schedule.note')"
            field-name="work_note"
            field-id="schedule-work-note"
            :help-text="$t('schedule.note_help')"
          />
        </span>
        <textarea
          id="schedule-work-note"
          v-model="note"
          class="input workspace-control"
          rows="3"
          :disabled="controller.busy.value"
        />
      </div>
      <p v-if="controller.workStatusState.value.error" role="alert">
        {{ $t(controller.workStatusState.value.error.displayMessage) }}
      </p>
      <div class="schedule__actions schedule__dialog-actions">
        <AppButton
          type="button"
          theme="secondary"
          :disabled="controller.busy.value"
          @click="emit('close')"
          >{{ $t('schedule.cancel') }}</AppButton
        >
        <AppButton type="submit" :loading="controller.busy.value">{{
          $t('schedule.confirm')
        }}</AppButton>
      </div>
    </form>
  </Dialog>
</template>
