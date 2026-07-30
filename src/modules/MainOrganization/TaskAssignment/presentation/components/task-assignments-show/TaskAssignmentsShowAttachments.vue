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
</script>

<template>
  <div v-if="model?.attachments?.length" class="task-details-section">
    <h3>{{ $t('attachments') }}</h3>

    <ul class="attachments-list">
      <li
        v-for="attachment in model.attachments"
        :key="attachment.id"
        class="attachments-list__item"
      >
        <Image
          :src="attachment.file"
          :alt="attachment.alt || 'Attachment'"
          width="250"
          preview
        />
      </li>
    </ul>
  </div>
</template>
