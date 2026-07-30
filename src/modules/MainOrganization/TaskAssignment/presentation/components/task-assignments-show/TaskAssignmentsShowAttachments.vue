<script setup lang="ts">
import type { PropType } from 'vue';

import Image from 'primevue/image';

import type ProjectItemShowModel from '@/modules/MainOrganization/ProjectItem/core/models/project.Item.show.model';

const { model } = defineProps({
  model: {
    type: Object as PropType<ProjectItemShowModel | null>,
    default: null,
  },
});

const attachmentType = (file?: string): string => {
  const extension = file?.split('.').pop();

  return extension && extension.length <= 5 ? extension.toUpperCase() : '-';
};
</script>

<template>
  <div class="task-details-section task-assignment-show__attachments">
    <h3 class="task-assignment-show__section-title">
      <span class="task-assignment-show__section-icon task-assignment-show__section-icon--attachment" aria-hidden="true" />
      {{ $t('attachments') }}
    </h3>

    <ul v-if="model?.attachments?.length" class="attachments-list task-assignment-show__attachments-list">
      <li
        v-for="attachment in model.attachments"
        :key="attachment.id"
        class="attachments-list__item task-assignment-show__attachment-card"
      >
        <div class="task-assignment-show__attachment-preview">
          <Image :src="attachment.file" :alt="attachment.alt || $t('attachments')" width="250" preview />
        </div>

        <div class="task-assignment-show__attachment-meta">
          <span class="task-assignment-show__attachment-type">{{ attachmentType(attachment.file) }}</span>
          <strong>{{ attachment.alt || attachment.file || '-' }}</strong>
          <small v-if="attachment.file_size">{{ attachment.file_size }}</small>
        </div>

        <a
          v-if="attachment.file"
          class="task-assignment-show__attachment-action"
          :href="attachment.file"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="$t('attachments')"
        >
          <i class="pi pi-external-link" aria-hidden="true" />
        </a>
      </li>
    </ul>

    <div v-else class="task-assignment-show__empty-state">
      <span class="task-assignment-show__empty-icon task-assignment-show__empty-icon--attachment" aria-hidden="true" />
      <span>{{ $t('no_data') }}</span>
    </div>
  </div>
</template>
