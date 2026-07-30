<script setup lang="ts">
import type { PropType } from 'vue';

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
</script>

<template>
  <header class="task-assignment-page-header">
    <div class="task-assignment-page-header__content">
      <span class="task-assignment-page-header__icon" aria-hidden="true">
        <i class="pi pi-check-square" />
      </span>

      <div class="task-assignment-page-header__copy">
        <h1>{{ $t('task_assignment.title') }} #{{ itemId }}</h1>
        <p>{{ $t('task_assignment.description') }}</p>
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
