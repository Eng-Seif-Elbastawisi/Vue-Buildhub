<script setup lang="ts">
import type { PropType } from 'vue';

import type ProjectItemShowModel from '@/modules/MainOrganization/ProjectItem/core/models/project.Item.show.model';
import projectIllustration from '@/assets/images/task-assignment/project-illustration.svg';

import { TaskDurationType } from '../../../core/constants/taskDurationType.enum';
import { getFloorNumberNameKey } from '@/modules/MainOrganization/ProjectFloor/core/constants/floor.number.enum';

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
  <div class="task-details-section task-assignment-show__overview">
    <h3 class="task-assignment-show__section-title">
      <span class="task-assignment-show__section-icon task-assignment-show__section-icon--task" aria-hidden="true" />
      {{ $t('project_item.basic_information') }}
    </h3>

    <div class="task-details-grid">
      <div class="detail-item task-assignment-show__metric task-assignment-show__metric--item">
        <span class="task-assignment-show__metric-icon task-assignment-show__metric-icon--item" aria-hidden="true" />
        <span class="detail-label">{{ $t('project_item.item') }}</span>
        <span class="detail-value">
          {{ model?.item?.translations?.title?.en || model?.item_id?.title || '-' }}
        </span>
      </div>

      <div class="detail-item task-assignment-show__metric task-assignment-show__metric--employee">
          <span class="task-assignment-show__metric-icon task-assignment-show__metric-icon--employee" aria-hidden="true" />
          <span class="detail-label">{{ $t('employee.name') }}</span>
          <span class="detail-value">{{ model?.employee?.name ?? '-' }}</span>
        </div>

          <div class="detail-item task-assignment-show__metric task-assignment-show__metric--employee">
          <span class="task-assignment-show__metric-icon task-assignment-show__metric-icon--employee" aria-hidden="true" />
          <span class="detail-label">{{ $t('reviewer.name') }}</span>
          <span class="detail-value">{{ model?.reviewer?.title ?? '-' }}</span>
        </div>




      <div class="detail-item task-assignment-show__metric task-assignment-show__metric--department">
        <span class="task-assignment-show__metric-icon task-assignment-show__metric-icon--department" aria-hidden="true" />
        <span class="detail-label">{{ $t('department') }}</span>
        <span class="detail-value">{{ model?.department?.title ?? '-' }}</span>
      </div>

       <div class="detail-item task-assignment-show__metric task-assignment-show__metric--floor">
        <span class="task-assignment-show__metric-icon task-assignment-show__metric-icon--floor" aria-hidden="true" />
        <span class="detail-label">{{ $t('floor') }}</span>
        <span class="detail-value">{{  $t(getFloorNumberNameKey(model?.project_floor?.floor_number)) }}</span>
      </div>

      <div class="detail-item task-assignment-show__metric task-assignment-show__metric--duration-type">
        <span class="task-assignment-show__metric-icon task-assignment-show__metric-icon--duration-type" aria-hidden="true" />
        <span class="detail-label">{{ $t('duration') }}</span>
        <span class="detail-value">
            <span class="detail-value">{{ model?.duration ?? '-' }}</span> {{ durationTypeName(model?.duration_type ?? TaskDurationType.DAY) }}
        </span>
      </div>

      <div class="detail-item task-assignment-show__metric task-assignment-show__metric--attachments">
        <span class="task-assignment-show__metric-icon task-assignment-show__metric-icon--attachment" aria-hidden="true" />
        <span class="detail-label">{{ $t('attachments') }}</span>
        <span class="detail-value">
          <span
            class="status-badge bh-status"
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

      <div class="detail-item task-assignment-show__metric task-assignment-show__metric--assignment">
        <span class="task-assignment-show__metric-icon task-assignment-show__metric-icon--assignment" aria-hidden="true" />
        <span class="detail-label">{{ $t('task_assignment.title') }}</span>
        <span class="detail-value">
          <span
            class="status-badge bh-status"
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

  <div class="task-details-section task-assignment-show__project">
    <h3 class="task-assignment-show__section-title">
      <span class="task-assignment-show__section-icon task-assignment-show__section-icon--project" aria-hidden="true" />
      {{ $t('project') }}
    </h3>

    <div class="task-details-grid task-assignment-show__project-details">
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

    <img class="task-assignment-show__project-illustration" :src="projectIllustration" alt="" aria-hidden="true" />
  </div>
</template>
