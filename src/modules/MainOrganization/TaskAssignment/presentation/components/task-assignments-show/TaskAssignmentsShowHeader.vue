<script setup lang="ts">
import { computed, type PropType } from 'vue';

import type ProjectItemShowModel from '@/modules/MainOrganization/ProjectItem/core/models/project.Item.show.model';

import type { StatusMeta } from './taskAssignmentsShow.types';

const { itemId, model, statusLabel, statusMeta } = defineProps({
  model: {
    type: Object as PropType<ProjectItemShowModel | null>,
    default: null,
  },
  itemId: {
    type: String,
    required: true,
  },
  statusLabel: {
    type: String,
    required: true,
  },
  statusMeta: {
    type: Object as PropType<StatusMeta>,
    required: true,
  },
});

// No histories: timestamps are omitted. One history: creation and update share its timestamp.
const createdAt = computed(() => {
  const histories = model?.histories;

  return histories?.[histories.length - 1]?.created_at;
});

const lastUpdatedAt = computed(() => model?.histories?.[0]?.created_at);
</script>

<template>
  <header class="task-assignment-page-header">
    <div class="task-assignment-page-header__content">
      <span class="task-assignment-page-header__icon task-assignment-show__asset-icon" aria-hidden="true">
        <span class="task-assignment-show__asset-icon-mask task-assignment-show__asset-icon-mask--task" />
      </span>

      <div class="task-assignment-page-header__copy">
        <h1>{{ $t('task_assignment.title') }} #{{ itemId }}</h1>
        <p>{{ $t('task_assignment.description') }}</p>

        <div v-if="model" class="task-assignment-show__hero-meta">
          <div v-if="createdAt" class="task-assignment-show__hero-meta-item">
            <span class="task-assignment-show__meta-icon task-assignment-show__meta-icon--calendar" aria-hidden="true" />
            <span><small>{{ $t('date') }}</small><strong>{{ createdAt }}</strong></span>
          </div>

          <div v-if="model.employee?.name" class="task-assignment-show__hero-meta-item">
            <span class="task-assignment-show__meta-icon task-assignment-show__meta-icon--employee" aria-hidden="true" />
            <span><small>{{ $t('employee.name') }}</small><strong>{{ model.employee.name }}</strong></span>
          </div>

          <div v-if="lastUpdatedAt" class="task-assignment-show__hero-meta-item">
            <span class="task-assignment-show__meta-icon task-assignment-show__meta-icon--duration" aria-hidden="true" />
            <span><small>{{ $t('histories') }}</small><strong>{{ lastUpdatedAt }}</strong></span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="model" class="task-status-summary">
      <span class="task-status-summary__label">{{ $t('status') }}</span>

      <span class="task-status-chip" :class="statusMeta.className">
        <span class="task-status-chip__icon" aria-hidden="true">
          <i :class="statusMeta.icon" />
        </span>
        <span class="task-status-chip__text">{{ statusLabel }}</span>
        <span class="task-status-chip__indicator" aria-hidden="true" />
      </span>
    </div>
  </header>
</template>
