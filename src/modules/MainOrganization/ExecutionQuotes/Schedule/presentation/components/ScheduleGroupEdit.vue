<script setup lang="ts">
  import { computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import ScheduleOwnerParams from '../../core/params/schedule.owner.params';
  import ScheduleController from '../controllers/schedule.controller';
  import SchedulePage from './SchedulePage.vue';
  import ScheduleGroupForm from './ScheduleGroupForm.vue';

  const controller = ScheduleController.getInstance();
  const state = computed(() => controller.itemState.value);
  const group = computed(() => (state.value instanceof DataSuccess ? state.value.data : null));
  const router = useRouter();

  async function load(quoteId: number, groupId: number | null) {
    if (groupId !== null) await controller.fetchOne(new ScheduleOwnerParams(quoteId, groupId));
  }
</script>
<template>
  <SchedulePage mode="edit" @ready="load">
    <template #default="{ quoteId, indexRoute, formKey, saved, reload }">
      <DataStatusBuilder :controller="state" :on-retry="reload">
        <template #success>
          <ScheduleGroupForm
            v-if="group?.selectionsAvailable"
            :key="formKey"
            :quote-id="quoteId"
            :group="group"
            @cancel="router.push(indexRoute)"
            @saved="saved"
          />
          <p v-else-if="group" role="alert">{{ $t('schedule.selection_identity_pending') }}</p>
        </template>
      </DataStatusBuilder>
    </template>
  </SchedulePage>
</template>
