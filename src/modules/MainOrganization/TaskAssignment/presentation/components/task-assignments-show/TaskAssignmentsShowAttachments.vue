<script setup lang="ts">
  import type { PropType } from 'vue';

  import {
    attachmentExtension,
    attachmentGallery,
    attachmentKind,
    toGalleryAttachment,
  } from '@/shared/AttachmentGallery/attachmentGallery';

  import type ProjectItemShowModel from '@/modules/MainOrganization/ProjectItem/core/models/project.Item.show.model';

  const { model } = defineProps({
    model: {
      type: Object as PropType<ProjectItemShowModel | null>,
      default: null,
    },
  });

  const attachmentType = (file?: string): string =>
    attachmentExtension(file || '').toUpperCase() || '-';
</script>

<template>
  <div class="task-details-section task-assignment-show__attachments">
    <h3 class="task-assignment-show__section-title">
      <span
        class="task-assignment-show__section-icon task-assignment-show__section-icon--attachment"
        aria-hidden="true"
      />
      {{ $t('attachments') }}
    </h3>

    <ul
      v-if="model?.attachments?.length"
      class="attachments-list task-assignment-show__attachments-list"
    >
      <li
        v-for="(attachment, index) in model.attachments"
        :key="attachment.id"
        class="attachments-list__item task-assignment-show__attachment-card"
      >
        <div class="task-assignment-show__attachment-preview">
          <button
            type="button"
            :aria-label="attachment.alt || attachment.file"
            @click="attachmentGallery.open(model!.attachments.map(toGalleryAttachment), index)"
          >
            <img
              v-if="attachmentKind(toGalleryAttachment(attachment)) === 'image'"
              :src="attachment.file"
              :alt="attachment.alt || $t('attachments')"
              width="250"
            />
            <i v-else class="pi pi-file" aria-hidden="true" />
          </button>
        </div>

        <div class="task-assignment-show__attachment-meta">
          <span class="task-assignment-show__attachment-type">{{
            attachmentType(attachment.file)
          }}</span>
          <strong>{{ attachment.alt || attachment.file || '-' }}</strong>
          <small v-if="attachment.file_size">{{ attachment.file_size }}</small>
        </div>

        <button
          v-if="attachment.file"
          type="button"
          class="task-assignment-show__attachment-action"
          :aria-label="$t('attachments')"
          @click="attachmentGallery.open(model!.attachments.map(toGalleryAttachment), index)"
        >
          <i class="pi pi-eye" aria-hidden="true" />
        </button>
      </li>
    </ul>

    <div v-else class="task-assignment-show__empty-state">
      <span
        class="task-assignment-show__empty-icon task-assignment-show__empty-icon--attachment"
        aria-hidden="true"
      />
      <span>{{ $t('no_data') }}</span>
    </div>
  </div>
</template>
