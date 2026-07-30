<script setup lang="ts">
import type { PropType } from 'vue';

import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';

import type ProjectItemShowModel from '@/modules/MainOrganization/ProjectItem/core/models/project.Item.show.model';

import { getTypeNameKey, InsideStatusType } from '../../../core/constants/inside.status.enum';

const { model } = defineProps({
  model: {
    type: Object as PropType<ProjectItemShowModel | null>,
    default: null,
  },
});

const historyStatusClass = (status?: InsideStatusType): string => {
  switch (status) {
    case InsideStatusType.WORKING:
      return 'task-assignment-show__history-status--working';
    case InsideStatusType.HOLD:
      return 'task-assignment-show__history-status--hold';
    case InsideStatusType.REVIEW:
      return 'task-assignment-show__history-status--review';
    case InsideStatusType.ASSIGN:
    default:
      return 'task-assignment-show__history-status--assigned';
  }
};
</script>

<template>
  <div class="task-details-section task-assignment-show__history">
    <Accordion :active-index="0" class="task-history-accordion">
      <AccordionTab :header="$t('histories')">
        <div v-if="!model?.histories?.length" class="task-history-empty">
          {{ $t('no_data') }}
        </div>

        <div
          v-for="history in model?.histories"
          :key="history.id"
          class="task-history-item task-assignment-show__history-item"
        >
          <span class="task-assignment-show__history-dot" aria-hidden="true" />
          <div class="task-details-grid task-assignment-show__history-content">
            <div class="detail-item">
              <span class="detail-label">{{ $t('status') }}</span>
              <span class="detail-value">
                <span
                  class="status-badge status-badge--history task-assignment-show__history-status"
                  :class="historyStatusClass(history.status)"
                >
                  {{ $t(getTypeNameKey(history.status ?? 1)) }}
                </span>
              </span>
            </div>

            <div
              v-for="historyEmployee in history.history_employees"
              :key="historyEmployee.id"
              class="detail-item"
            >
              <span class="detail-label">{{ $t('employee.name') }}</span>
              <span class="detail-value">{{ historyEmployee.employee?.name ?? '-' }}</span>
            </div>

            <div v-if="history.created_at" class="detail-item">
              <span class="detail-label">{{ $t('date') }}</span>
              <span class="detail-value">{{ history.created_at }}</span>
            </div>

            <div v-if="history.notes" class="detail-item">
              <span class="detail-label">{{ $t('notes') }}</span>
              <span class="detail-value">{{ history.notes }}</span>
            </div>
          </div>
        </div>
      </AccordionTab>
    </Accordion>
  </div>
</template>
