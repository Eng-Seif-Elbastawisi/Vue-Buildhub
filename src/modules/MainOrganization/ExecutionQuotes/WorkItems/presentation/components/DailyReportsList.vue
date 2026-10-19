<script setup lang="ts">
  import {
    attachmentGallery,
    toGalleryAttachment,
  } from '@/shared/AttachmentGallery/attachmentGallery';
  import { computed } from 'vue';
  import {
    DataLoading,
    type DataState,
  } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import type DailyReportModel from '../../core/models/report.model';
  import WorkItemSection from './WorkItemSection.vue';

  const props = defineProps<{
    state: DataState<DailyReportModel[]>;
    stageLabel: (id: number) => string;
  }>();
  const emit = defineEmits<{ retry: [] }>();
  const reports = computed(() => props.state.data ?? []);
  const reportsLoading = computed(() => props.state instanceof DataLoading);
</script>
<template>
  <WorkItemSection
    :title="$t('work_items.reports')"
    icon="pi pi-file-edit"
    :count="state.data?.length"
    :loading="reportsLoading"
    :error="state.error ? $t(state.error.displayMessage) : undefined"
    :empty="!reports.length"
    :empty-message="$t('work_items.reports_empty')"
    @retry="emit('retry')"
  >
    <ul class="work-items-records">
      <li v-for="report in reports" :key="report.id">
        <div class="work-items-record-heading">
          <h3>{{ report.date }}</h3>
          <span
            class="work-items-badge bh-status"
            :class="`work-items-safety-${report.siteSafetyStatus}`"
            >{{ $t(`work_items.safety_${report.siteSafetyStatus}`) }}</span
          >
        </div>
        <p class="work-items-stage-label">{{ stageLabel(report.projectTimelineStageId) }}</p>
        <p class="work-items-notes">{{ report.notes ?? $t('work_items.no_notes') }}</p>
        <p v-if="report.reportScopeType">
          {{ $t(`execution_updates.scope_${report.reportScopeType}`) }}
          <span v-if="report.projectFloorSpace">· {{ report.projectFloorSpace.space.title }}</span>
        </p>

        <dl>
          <div>
            <dt>{{ $t('work_items.created_by') }}</dt>
            <dd>{{ report.employee.name }}</dd>
          </div>
        </dl>
        <div class="work-items-record-actions">
          <button
            v-if="report.attachments.length"
            type="button"
            class="btn btn-secondary"
            @click="attachmentGallery.open(report.attachments.map(toGalleryAttachment), 0)"
          >
            {{ $t('attachments') }} ({{ report.attachments.length }})
          </button>
        </div>
      </li>
    </ul>
  </WorkItemSection>
</template>
