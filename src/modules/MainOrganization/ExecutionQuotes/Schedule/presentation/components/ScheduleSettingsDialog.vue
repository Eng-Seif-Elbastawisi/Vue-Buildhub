<script setup lang="ts">
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
  import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';
  import { ref } from 'vue';
  import Dialog from 'primevue/dialog';
  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import type ScheduleSettingsModel from '../../core/models/schedule.settings.model';
  import ScheduleSettingsParams from '../../core/params/schedule.settings.params';
  import { dayOptionDisabled, weekdays } from '../../core/constants/schedule.constants';
  import ScheduleController from '../controllers/schedule.controller';
  const props = defineProps<{
    quoteId: number;
    settings?: ScheduleSettingsModel | null;
    readable: boolean;
  }>();
  const emit = defineEmits<{ close: [] }>();
  const controller = ScheduleController.getInstance();
  const startDate = ref(props.settings?.startDate ?? '');
  const holidays = ref([...(props.settings?.holidays ?? [])]);
  const errors = ref<string[]>([]);
  const failed = ref(false);
  async function save() {
    if (controller.busy.value || !props.readable) return;
    const params = new ScheduleSettingsParams(props.quoteId, startDate.value, [...holidays.value]);
    errors.value = params.validate().errors.map((error) => error.message);
    if (errors.value.length) return;
    const saveState = await controller.saveSettings(params);
    if (saveState instanceof DataSuccess) emit('close');
    else failed.value = Boolean(saveState.error);
  }
</script>
<template>
  <Dialog
    class="schedule-settings workspace-dialog"
    :visible="true"
    modal
    @update:visible="emit('close')"
  >
    <template #header>
      <div class="schedule__dialog-heading">
        <span class="schedule__heading-icon"><i class="pi pi-cog" aria-hidden="true"></i></span>
        <div>
          <h2>{{ $t('schedule.settings') }}</h2>
        </div>
      </div>
    </template>
    <StandardFormLayout as="form" embedded class="schedule__form" @submit.prevent="save">
      <section class="schedule__settings-section">
        <div class="field-group input-wrapper">
          <span class="field-help-label-row field-help-label-row--block"
            ><label class="field-label label" for="schedule-start">{{
              $t('schedule.planned_start')
            }}</label>
            <FieldHelpIcon
              :label="$t('schedule.planned_start')"
              field-name="planned_start"
              field-id="schedule-start"
              :help-text="$t('field_help.execution_fields.planned_start')"
            />
          </span>
          <input
            id="schedule-start"
            v-model="startDate"
            class="input workspace-control"
            type="date"
            :disabled="controller.busy.value"
          />
        </div>
      </section>
      <section class="schedule__settings-section">
        <fieldset class="field-group schedule__holidays" aria-describedby="schedule-holidays-hint">
          <legend>
            <span class="field-help-label-row"
              >{{ $t('schedule.holidays')
              }}<FieldHelpIcon
                :label="$t('schedule.holidays')"
                field-name="holidays"
                field-id="schedule-holidays"
                :help-text="$t('field_help.execution_fields.holidays')"
              />
            </span>
          </legend>
          <p id="schedule-holidays-hint">{{ $t('schedule.holidays_hint') }}</p>
          <label v-for="day in weekdays" :key="day" class="schedule__row">
            <input
              v-model="holidays"
              type="checkbox"
              :value="day"
              :disabled="controller.busy.value || dayOptionDisabled(holidays, day)"
            />{{ $t(`schedule.weekday_${day}`) }}
          </label>
        </fieldset>
      </section>
      <p v-if="!readable" role="alert">{{ $t('schedule.integration_pending') }}</p>
      <div v-if="errors.length" role="alert" aria-live="assertive">
        <ul class="form-errors">
          <li v-for="error in errors" :key="error">{{ error }}</li>
        </ul>
      </div>
      <p v-if="failed" role="alert">
        {{ $t(controller.mutationState.value.error?.displayMessage ?? 'schedule.save_error') }}
      </p>
      <div class="schedule__actions schedule__dialog-actions">
        <AppButton type="submit" :disabled="!readable" :loading="controller.busy.value">{{
          $t('schedule.save')
        }}</AppButton>
        <AppButton theme="secondary" :disabled="controller.busy.value" @click="emit('close')">{{
          $t('schedule.cancel')
        }}</AppButton>
      </div>
    </StandardFormLayout>
  </Dialog>
</template>
