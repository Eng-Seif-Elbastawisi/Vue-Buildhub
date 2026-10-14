<script setup lang="ts">
  import type ProjectTimelineStageModel from '../../core/models/project.timeline.stage.model';

  defineProps<{ stages: ProjectTimelineStageModel[] }>();
</script>

<template>
  <div class="schedule__table-wrap">
    <table class="schedule__stage-table">
      <thead>
        <tr>
          <th scope="col">{{ $t('schedule.main_stage') }}</th>
          <th scope="col">{{ $t('schedule.sub_stage') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="stage in stages" :key="stage.quoteStageId">
          <th scope="row">{{ stage.title }}</th>
          <td>
            <ul v-if="stage.children.length" class="schedule__substage-list">
              <li v-for="child in stage.children" :key="child.subStageId">{{ child.title }}</li>
            </ul>
            <span v-else class="schedule__muted">{{ $t('schedule.not_available') }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
