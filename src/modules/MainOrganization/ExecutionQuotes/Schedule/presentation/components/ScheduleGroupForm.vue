<script setup lang="ts">
  import { ref } from 'vue';
  import InputText from 'primevue/inputtext';
  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import type { FieldError } from '@/base/Presentation/Utils/classValidation';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import type ScheduleGroupModel from '../../core/models/schedule.group.model';
  import {
    durationTypes,
    getTypeNameKey,
    type TaskDurationType,
  } from '../../core/constants/schedule.constants';
  import ScheduleGroupParams from '../../core/params/schedule.group.params';
  import ProjectTimelineStageParams from '../../core/params/project.timeline.stage.params';
  import ScheduleController from '../controllers/schedule.controller';
  import ScheduleStageSelector from './ScheduleStageSelector.vue';
  const props = defineProps<{ quoteId: number; group?: ScheduleGroupModel }>();
  const emit = defineEmits<{ saved: []; cancel: [] }>();
  const controller = ScheduleController.getInstance();
  const title = ref(props.group?.title ?? '');
  const duration = ref<number | null>(props.group?.duration ?? null);
  const durationType = ref<TaskDurationType | undefined>(props.group?.durationType);
  const stages = ref(
    (props.group?.stages ?? []).map(
      (selection) =>
        new ProjectTimelineStageParams(
          selection.quoteStageId,
          selection.children.map((child) => child.subStageId),
        ),
    ),
  );
  const errors = ref<FieldError[]>([]);
  const saveError = ref(false);
  const saved = ref(false);
  async function save() {
    if (controller.busy.value || saved.value) return;
    const params = new ScheduleGroupParams({
      quoteId: props.quoteId,
      groupId: props.group?.id,
      title: title.value,
      duration: duration.value ?? 0,
      durationType: durationType.value ?? '',
      stages: stages.value.map(
        (selection) =>
          new ProjectTimelineStageParams(selection.quoteStageId, [...selection.children]),
      ),
    });
    errors.value = params.validate().errors;
    if (errors.value.length) return;
    saveError.value = false;
    const saveState = props.group
      ? await controller.update(params)
      : await controller.create(params);
    if (saveState instanceof DataSuccess) {
      saved.value = true;
      emit('saved');
    } else if (saveState?.error) {
      saveError.value = true;
      errors.value = Object.entries(saveState.error.validationErrors ?? {}).flatMap(
        ([field, messages]) => messages.map((message) => ({ field, message })),
      );
    }
  }
</script>
<template>
  <form class="schedule__form" @submit.prevent="save">
    <label for="schedule-title">{{ $t('schedule.group_title') }}</label>
    <InputText id="schedule-title" v-model="title" :disabled="controller.busy.value || saved" />
    <label for="schedule-duration">{{ $t('schedule.duration') }}</label>
    <input
      id="schedule-duration"
      v-model.number="duration"
      type="number"
      step="any"
      :disabled="controller.busy.value || saved"
    />
    <label for="schedule-unit">{{ $t('schedule.unit') }}</label>
    <select id="schedule-unit" v-model="durationType" :disabled="controller.busy.value || saved">
      <option :value="undefined" disabled>{{ $t('schedule.choose_unit') }}</option>
      <option v-for="unit in durationTypes" :key="unit" :value="unit">
        {{ $t(getTypeNameKey(unit)) }}
      </option>
    </select>
    <ScheduleStageSelector v-model="stages" :disabled="controller.busy.value || saved" />
    <ul v-if="errors.length" role="alert">
      <li v-for="error in errors" :key="`${error.field}:${error.message}`">{{ error.message }}</li>
    </ul>
    <p v-if="saveError" role="alert">
      {{ $t(controller.mutationState.value.error?.displayMessage ?? 'schedule.save_error') }}
    </p>
    <div class="schedule__actions">
      <AppButton type="submit" :loading="controller.busy.value" :disabled="saved">{{
        $t('schedule.save')
      }}</AppButton>
      <AppButton theme="secondary" :disabled="controller.busy.value" @click="emit('cancel')">{{
        $t('schedule.cancel')
      }}</AppButton>
    </div>
  </form>
</template>
