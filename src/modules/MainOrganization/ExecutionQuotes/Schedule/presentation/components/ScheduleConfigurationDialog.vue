<script setup lang="ts">
  import Dialog from 'primevue/dialog';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import type ScheduleSettingsModel from '../../core/models/schedule.settings.model';

  defineProps<{ settings: ScheduleSettingsModel }>();
  const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <Dialog
    :visible="true"
    modal
    class="schedule-configuration-dialog"
    @update:visible="emit('close')"
  >
    <template #header>
      <div class="schedule__dialog-heading">
        <span class="schedule__heading-icon"
          ><i class="pi pi-sliders-h" aria-hidden="true"></i
        ></span>
        <h2>{{ $t('schedule.configuration') }}</h2>
      </div>
    </template>
    <dl class="schedule__summary">
      <div>
        <dt>{{ $t('schedule.planned_start') }}</dt>
        <dd>{{ settings.startDate ?? $t('schedule.not_available') }}</dd>
      </div>
      <div>
        <dt>{{ $t('schedule.holidays') }}</dt>
        <dd>
          <ul v-if="settings.holidays.length">
            <li v-for="(day, index) in settings.holidays" :key="index">
              {{ $t(`schedule.weekday_${day}`) }}
            </li>
          </ul>
          <span v-else>{{ $t('schedule.no_holidays') }}</span>
        </dd>
      </div>
    </dl>
    <template #footer>
      <AppButton theme="secondary" @click="emit('close')">{{ $t('close') }}</AppButton>
    </template>
  </Dialog>
</template>
