<script setup lang="ts">
import type { PropType } from 'vue';

import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';

import type ProjectItemShowModel from '@/modules/MainOrganization/ProjectItem/core/models/project.Item.show.model';

import { getTypeNameKey } from '../../../core/constants/inside.status.enum';

const { model } = defineProps({
  model: {
    type: Object as PropType<ProjectItemShowModel | null>,
    default: null,
  },
});
</script>

<template>
  <div class="task-details-section">
    <Accordion :active-index="0" class="task-history-accordion">
      <AccordionTab :header="$t('histories')">
        <div v-if="!model?.histories?.length" class="task-history-empty">
          {{ $t('no_data') }}
        </div>

        <div
          v-for="history in model?.histories"
          :key="history.id"
          class="task-history-item"
        >
          <div class="task-details-grid">
            <div class="detail-item">
              <span class="detail-label">{{ $t('status') }}</span>
              <span class="detail-value">
                <span class="status-badge status-badge--history">
                  {{ $t(getTypeNameKey(history.status ?? 1)) }}
                </span>
              </span>
            </div>

            <div
              v-for="historyEmployee in history.history_employees"
              :key="historyEmployee.id"
              class="detail-item"
            >
              <span class="detail-label">{{ $t('emp.name') }}</span>
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
