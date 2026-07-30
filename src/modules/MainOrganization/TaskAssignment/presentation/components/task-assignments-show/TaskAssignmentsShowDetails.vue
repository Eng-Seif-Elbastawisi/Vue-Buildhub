<script setup lang="ts">
import type { PropType } from 'vue';

import type ProjectItemShowModel from '@/modules/MainOrganization/ProjectItem/core/models/project.Item.show.model';

import { TaskDurationType } from '../../../core/constants/taskDurationType.enum';

const { model } = defineProps({
  model: {
    type: Object as PropType<ProjectItemShowModel | null>,
    default: null,
  },
});

const durationTypeName = (durationType: TaskDurationType): string => {
  switch (durationType) {
    case TaskDurationType.MONTH:
      return 'month';
    case TaskDurationType.WEEK:
      return 'week';
    case TaskDurationType.YEAR:
      return 'year';
    case TaskDurationType.DAY:
    default:
      return 'day';
  }
};
</script>

<template>
  <div class="task-details-section">
    <h3>{{ $t('project_item.basic_information') }}</h3>

    <div class="task-details-grid">
      <div class="detail-item">
        <span class="detail-label">{{ $t('project_item.item') }}</span>
        <span class="detail-value">
          {{ model?.item?.translations?.title?.en || model?.item_id?.title || '-' }}
        </span>
      </div>

      <div class="detail-item">
        <span class="detail-label">{{ $t('employee.name') }}</span>
        <span class="detail-value">{{ model?.employee?.name ?? '-' }}</span>
      </div>

      <div class="detail-item">
        <span class="detail-label">{{ $t('department') }}</span>
        <span class="detail-value">{{ model?.department ?? '-' }}</span>
      </div>

      <div class="detail-item">
        <span class="detail-label">{{ $t('duration') }}</span>
        <span class="detail-value">{{ model?.duration ?? '-' }}</span>
      </div>

      <div class="detail-item">
        <span class="detail-label">{{ $t('duration_type') }}</span>
        <span class="detail-value">
          {{ durationTypeName(model?.duration_type ?? TaskDurationType.DAY) }}
        </span>
      </div>

      <div class="detail-item">
        <span class="detail-label">{{ $t('attachments') }}</span>
        <span class="detail-value">
          <span
            class="status-badge"
            :class="model?.has_attached ? 'status-badge--success' : 'status-badge--muted'"
          >
            <i
              :class="model?.has_attached ? 'pi pi-check-circle' : 'pi pi-times-circle'"
              aria-hidden="true"
            />
            {{ model?.has_attached ? $t('yes') : $t('no') }}
          </span>
        </span>
      </div>

      <div class="detail-item">
        <span class="detail-label">{{ $t('task_assignment.title') }}</span>
        <span class="detail-value">
          <span
            class="status-badge"
            :class="model?.is_assign_employee ? 'status-badge--success' : 'status-badge--muted'"
          >
            <i
              :class="model?.is_assign_employee ? 'pi pi-check-circle' : 'pi pi-times-circle'"
              aria-hidden="true"
            />
            {{ model?.is_assign_employee ? $t('yes') : $t('no') }}
          </span>
        </span>
      </div>
    </div>
  </div>

  <div class="task-details-section">
    <h3>{{ $t('project') }}</h3>

    <div class="task-details-grid">
      <div class="detail-item">
        <span class="detail-label">{{ $t('client.title') }}</span>
        <span class="detail-value">{{ model?.project?.client?.title ?? '-' }}</span>
      </div>

      <div class="detail-item">
        <span class="detail-label">{{ $t('project_name') }}</span>
        <span class="detail-value">
          {{ model?.project?.title?.find((translation) => translation.locale === 'en')?.title ?? '-' }}
        </span>
      </div>

      <div class="detail-item">
        <span class="detail-label">{{ $t('description') }}</span>
        <span class="detail-value">
          {{
            model?.project?.description?.find((translation) => translation.locale === 'en')
              ?.description ?? '-'
          }}
        </span>
      </div>
    </div>
  </div>
</template>
