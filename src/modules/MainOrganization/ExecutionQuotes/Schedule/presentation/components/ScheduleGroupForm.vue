<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import TitleInterface from '@/base/Data/Models/titleInterface';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import type { FieldError } from '@/base/Presentation/Utils/classValidation';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import type ScheduleGroupModel from '../../core/models/schedule.group.model';
  import {
    durationTypes,
    isDurationType,
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
  const { t } = useI18n();
  const title = ref(props.group?.title ?? '');
  const duration = ref<number | null>(props.group?.duration ?? null);
  const durationType = ref<TaskDurationType | undefined>(props.group?.durationType);
  const durationOptions = computed(() =>
    durationTypes.map(
      (unit) => new TitleInterface<string | number>({ id: unit, title: t(getTypeNameKey(unit)) }),
    ),
  );
  const selectedDuration = computed<TitleInterface<string | number> | null>({
    get: () => durationOptions.value.find((option) => option.id === durationType.value) ?? null,
    set: (option) => {
      durationType.value = isDurationType(option?.id) ? option.id : undefined;
    },
  });
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
    // if (controller.busy.value || saved.value) return;

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
    // console.log('stages.value', params);

    errors.value = params.validate().errors;

    // console.log('params.validate().errors', errors.value);
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
    <div class="document-form-card">
      <header class="document-form-header">
        <i class="pi pi-calendar" aria-hidden="true"></i>
        <div>
          <h2>{{ $t(group ? 'schedule.edit' : 'schedule.create') }}</h2>
          <p>{{ $t('schedule.form_description') }}</p>
        </div>
      </header>
      <div class="form-fields">
        <div class="field-group input-wrapper standard-form-field--full">
          <label class="label" for="schedule-title">{{ $t('schedule.group_title') }}</label>
          <input
            id="schedule-title"
            v-model="title"
            class="input"
            type="text"
            :disabled="controller.busy.value || saved"
          />
        </div>
        <div class="field-group input-wrapper">
          <label class="label" for="schedule-duration">{{ $t('schedule.duration') }}</label>
          <input
            id="schedule-duration"
            v-model.number="duration"
            class="input"
            type="number"
            step="any"
            :disabled="controller.busy.value || saved"
          />
        </div>
        <div class="field-group">
          <UpdatedCustomInputSelect
            id="schedule-unit"
            v-model="selectedDuration"
            label="schedule.unit"
            :static-options="durationOptions"
            :placeholder="$t('schedule.choose_unit')"
            :reload="false"
            :disabled="controller.busy.value || saved"
          />
        </div>
      </div>
      <!-- asd -->
      <ScheduleStageSelector v-model="stages" :disabled="controller.busy.value || saved" />
      <ul v-if="errors.length" role="alert">
        <li v-for="error in errors" :key="`${error.field}:${error.message}`">
          {{ error.message }}
        </li>
      </ul>
      <p v-if="saveError" role="alert">
        {{ $t(controller.mutationState.value.error?.displayMessage ?? 'schedule.save_error') }}
      </p>
    </div>
    <div class="schedule__actions schedule__form-actions">
      <AppButton type="submit" :loading="controller.busy.value" :disabled="saved">{{
        $t('schedule.save')
      }}</AppButton>
      <AppButton theme="secondary" :disabled="controller.busy.value" @click="emit('cancel')">{{
        $t('schedule.cancel')
      }}</AppButton>
    </div>
  </form>
</template>
