<script setup lang="ts">
  import type ScheduleGroupModel from '../../core/models/schedule.group.model';
  defineProps<{ groups: ScheduleGroupModel[] }>();
</script>
<template>
  <section class="schedule__timeline-section" :aria-label="$t('schedule.timeline')">
    <header class="schedule__section-heading">
      <h2>{{ $t('schedule.timeline') }}</h2>
      <i class="pi pi-calendar" aria-hidden="true"></i>
    </header>
    <ol class="schedule__timeline">
      <li v-for="group in groups" :key="group.id">
        <strong>{{ group.title }}</strong>
        <p>
          {{ group.startDate ?? $t('schedule.not_available') }} —
          {{ group.finishDate ?? $t('schedule.not_available') }}
        </p>
      </li>
    </ol>
    <p v-if="!groups.length">{{ $t('schedule.not_available') }}</p>
  </section>
</template>
