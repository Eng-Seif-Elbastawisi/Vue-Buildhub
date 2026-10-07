<script setup lang="ts">
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import { getTypeNameKey } from '../../core/constants/schedule.constants';
  import type ScheduleGroupModel from '../../core/models/schedule.group.model';
  defineProps<{
    group: ScheduleGroupModel;
    sequence: number;
    basePath: string;
    busy: boolean;
    earlier: boolean;
    later: boolean;
  }>();
  defineEmits<{ move: [-1 | 1]; delete: [] }>();
</script>
<template>
  <article class="schedule__panel schedule__timeline-card">
    <div class="schedule__card-heading">
      <slot name="handle" /><span class="schedule__sequence-number">{{
        String(sequence).padStart(2, '0')
      }}</span>
    </div>
    <h3>{{ group.title }}</h3>
    <p class="schedule__duration">
      <span>{{ $t('schedule.duration') }}</span
      ><strong>{{ group.duration }} {{ $t(getTypeNameKey(group.durationType)) }}</strong>
    </p>
    <ul>
      <li v-for="stage in group.stages" :key="stage.quoteStageId">
        {{ stage.title }}
        <ul>
          <li v-for="child in stage.children" :key="child.subStageId">{{ child.title }}</li>
        </ul>
      </li>
    </ul>
    <p class="schedule__scope-count">
      {{ $t('schedule.stage_count', { count: group.stages.length }) }}
    </p>
    <p>
      {{ $t('schedule.start') }}: {{ group.startDate ?? $t('schedule.not_available') }} ·
      {{ $t('schedule.finish') }}: {{ group.finishDate ?? $t('schedule.not_available') }}
    </p>
    <div class="schedule__actions">
      <AppButton :to="`${basePath}/${group.id}`" :disabled="busy">{{
        $t('schedule.show')
      }}</AppButton>
      <AppButton :to="`${basePath}/${group.id}/edit`" :disabled="busy">{{
        $t('schedule.edit')
      }}</AppButton>
      <AppButton theme="danger" :disabled="busy" @click="$emit('delete')">{{
        $t('schedule.delete')
      }}</AppButton>
      <AppButton :disabled="busy || !earlier" @click="$emit('move', -1)">{{
        $t('schedule.earlier')
      }}</AppButton>
      <AppButton :disabled="busy || !later" @click="$emit('move', 1)">{{
        $t('schedule.later')
      }}</AppButton>
    </div>
  </article>
</template>
