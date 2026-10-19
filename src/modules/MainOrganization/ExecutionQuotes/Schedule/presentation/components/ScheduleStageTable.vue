<script setup lang="ts">
  import type ProjectTimelineStageModel from '../../core/models/project.timeline.stage.model';

  defineProps<{ stages: ProjectTimelineStageModel[] }>();
</script>

<template>
  <ul class="schedule__stage-list" :aria-label="$t('schedule.main_stage')">
    <li v-for="stage in stages" :key="stage.quoteStageId" class="schedule__stage-item">
      <strong class="schedule__stage-title">{{ stage.title }}</strong>
      <ul
        v-if="stage.children.length"
        class="schedule__substage-list"
        :aria-label="$t('schedule.sub_stage')"
      >
        <li v-for="child in stage.children" :key="child.subStageId">{{ child.title }}</li>
      </ul>
      <p v-else class="schedule__stage-fallback schedule__muted">
        {{ $t('schedule.not_available') }}
      </p>
    </li>
  </ul>
</template>
