<script setup lang="ts">
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
    class="schedule-settings"
    :visible="true"
    modal
    :header="$t('schedule.settings')"
    @update:visible="emit('close')"
  >
    <form class="schedule__form" @submit.prevent="save">
      <!-- dsaasd -->
      <div class="field-group input-wrapper">
        <label class="label" for="schedule-start">{{ $t('schedule.planned_start') }}</label>
        <input
          id="schedule-start"
          v-model="startDate"
          class="input"
          type="date"
          :disabled="controller.busy.value"
        />
      </div>
      <fieldset class="schedule__holidays" aria-describedby="schedule-holidays-hint">
        <legend>{{ $t('schedule.holidays') }}</legend>
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
      <p v-if="!readable" role="alert">{{ $t('schedule.integration_pending') }}</p>
      <ul v-if="errors.length" role="alert">
        <li v-for="error in errors" :key="error">{{ error }}</li>
      </ul>
      <p v-if="failed" role="alert">
        {{ $t(controller.mutationState.value.error?.displayMessage ?? 'schedule.save_error') }}
      </p>
      <!-- {{ readable }} -->
      <!-- asd -->
      <div class="schedule__actions">
        <AppButton type="submit" :disabled="!readable" :loading="controller.busy.value">{{
          $t('schedule.save')
        }}</AppButton>
        <AppButton theme="secondary" :disabled="controller.busy.value" @click="emit('close')">{{
          $t('schedule.cancel')
        }}</AppButton>
      </div>
    </form>
  </Dialog>
</template>
