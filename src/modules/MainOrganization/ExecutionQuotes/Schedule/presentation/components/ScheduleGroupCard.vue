<script setup lang="ts">
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import { getTypeNameKey } from '../../core/constants/schedule.constants';
  import type ScheduleGroupModel from '../../core/models/schedule.group.model';
  import ScheduleStageTable from './ScheduleStageTable.vue';
  defineProps<{
    group: ScheduleGroupModel;
    sequence: number;
    basePath: string;
    busy: boolean;
    earlier: boolean;
    later: boolean;
    timelineApproved?: boolean;
  }>();
  defineEmits<{ move: [-1 | 1]; delete: []; manageWork: []; viewHistory: [] }>();
</script>
<template>
  <article class="schedule__panel schedule__timeline-card">
    <div class="schedule__card-heading">
      <div class="schedule__card-identity">
        <span class="schedule__sequence-number">{{ String(sequence).padStart(2, '0') }}</span>
        <h3>{{ group.title }}</h3>
      </div>
      <span class="schedule__work-badge" :data-status="group.workStatus ?? 'unstarted'">{{
        $t(
          group.workStatus === undefined
            ? 'schedule.not_available'
            : group.workStatus === null
              ? 'schedule.work_unstarted'
              : `schedule.work_${group.workStatus}`,
        )
      }}</span>
      <slot name="handle" />
    </div>
    <details class="schedule__group-details" open>
      <summary>
        <span
          ><i class="pi pi-sitemap" aria-hidden="true"></i
          >{{ $t('schedule.stage_count', { count: group.stages.length }) }}</span
        >
        <i class="pi pi-chevron-down" aria-hidden="true"></i>
      </summary>
      <dl class="schedule__card-dates">
        <div>
          <dt>{{ $t('schedule.start') }}</dt>
          <dd>{{ group.startDate ?? $t('schedule.not_available') }}</dd>
        </div>
        <i class="pi pi-arrow-right" aria-hidden="true"></i>
        <div>
          <dt>{{ $t('schedule.finish') }}</dt>
          <dd>{{ group.finishDate ?? $t('schedule.not_available') }}</dd>
        </div>
      </dl>
      <p class="schedule__duration">
        <span>{{ $t('schedule.duration') }}</span>
        <strong>{{ group.duration }} {{ $t(getTypeNameKey(group.durationType)) }}</strong>
      </p>
      <ScheduleStageTable :stages="group.stages" />
    </details>
    <div class="schedule__actions">
      <AppButton
        type="button"
        theme="secondary"
        :disabled="busy || !timelineApproved"
        @click="$emit('manageWork')"
        >{{ $t('schedule.manage_work') }}</AppButton
      >
      <AppButton type="button" theme="secondary" :disabled="busy" @click="$emit('viewHistory')">{{
        $t('schedule.view_work_history')
      }}</AppButton>
      <AppButton :to="`${basePath}/${group.id}`" :disabled="busy">{{
        $t('schedule.show')
      }}</AppButton>
      <AppButton :to="`${basePath}/${group.id}/edit`" theme="secondary" :disabled="busy">{{
        $t('schedule.edit')
      }}</AppButton>
      <AppButton theme="danger" :disabled="busy" @click="$emit('delete')">{{
        $t('schedule.delete')
      }}</AppButton>
      <AppButton theme="secondary" :disabled="busy || !earlier" @click="$emit('move', -1)">{{
        $t('schedule.earlier')
      }}</AppButton>
      <AppButton theme="secondary" :disabled="busy || !later" @click="$emit('move', 1)">{{
        $t('schedule.later')
      }}</AppButton>
    </div>
  </article>
</template>
