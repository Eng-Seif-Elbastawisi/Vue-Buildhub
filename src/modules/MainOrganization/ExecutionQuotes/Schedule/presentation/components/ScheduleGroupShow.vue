<script setup lang="ts">
  import { computed } from 'vue';
  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import { getTypeNameKey } from '../../core/constants/schedule.constants';
  import ScheduleOwnerParams from '../../core/params/schedule.owner.params';
  import ScheduleController from '../controllers/schedule.controller';
  import SchedulePage from './SchedulePage.vue';
  import ScheduleTimeline from './ScheduleTimeline.vue';

  const controller = ScheduleController.getInstance();
  const state = computed(() => controller.itemState.value);
  const group = computed(() => (state.value instanceof DataSuccess ? state.value.data : null));

  async function load(quoteId: number, groupId: number | null) {
    if (groupId !== null) await controller.fetchOne(new ScheduleOwnerParams(quoteId, groupId));
  }
</script>
<template>
  <SchedulePage mode="show" @ready="load">
    <template #default="{ reload }">
      <DataStatusBuilder :controller="state" :on-retry="reload">
        <template #success>
          <article v-if="group" class="schedule__panel schedule__detail">
            <h2>{{ group.title }}</h2>
            <p>{{ group.duration }} {{ $t(getTypeNameKey(group.durationType)) }}</p>
            <ul>
              <li v-for="stage in group.stages" :key="stage.quoteStageId">
                {{ stage.title }}
                <ul>
                  <li v-for="child in stage.children" :key="child.subStageId">{{ child.title }}</li>
                </ul>
              </li>
            </ul>
            <ScheduleTimeline :groups="[group]" />
          </article>
        </template>
      </DataStatusBuilder>
    </template>
  </SchedulePage>
</template>
