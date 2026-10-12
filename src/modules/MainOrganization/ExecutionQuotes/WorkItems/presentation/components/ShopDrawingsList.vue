<script setup lang="ts">
  import { computed } from 'vue';
  import {
    DataLoading,
    type DataState,
  } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import { toGalleryAttachment } from '@/shared/AttachmentGallery/attachmentGallery';
  import type ShopDrawingQuoteModel from '../../core/models/shop-drawing.model';
  import WorkItemSection from './WorkItemSection.vue';
  const props = defineProps<{ state: DataState<ShopDrawingQuoteModel[]> }>();
  const emit = defineEmits<{ retry: [] }>();
  const drawings = computed(() => props.state.data ?? []);
  const loading = computed(() => props.state instanceof DataLoading);
  function fileUrl(drawing: ShopDrawingQuoteModel) {
    const url = toGalleryAttachment({ file: drawing.file }).url;
    return /^https?:/i.test(url) ? url : null;
  }
</script>
<template>
  <WorkItemSection
    :title="$t('work_items.drawings')"
    icon="pi pi-file"
    :count="state.data?.length"
    :loading="loading"
    :error="state.error ? $t(state.error.displayMessage) : undefined"
    :empty="!drawings.length"
    :empty-message="$t('work_items.drawings_empty')"
    @retry="emit('retry')"
  >
    <ul class="work-items-records">
      <li v-for="drawing in drawings" :key="drawing.id">
        <div class="work-items-record-heading">
          <h3>{{ drawing.title }}</h3>
          <span class="work-items-badge"
            >{{ $t('work_items.version_number') }}: {{ drawing.versionNumber }}</span
          >
        </div>
        <p class="work-items-stage-label">
          {{
            drawing.stages
              .map(
                (stage) =>
                  stage.stage?.title ??
                  $t('work_items.stage_reference', { id: stage.projectTimelineStageId }),
              )
              .join(' · ')
          }}
        </p>
        <dl>
          <div>
            <dt>{{ $t('work_items.custom_number') }}</dt>
            <dd>{{ drawing.customNumber ?? $t('work_items.not_recorded') }}</dd>
          </div>
          <div>
            <dt>{{ $t('work_items.drawing_date') }}</dt>
            <dd>{{ drawing.date ?? $t('work_items.no_date') }}</dd>
          </div>
          <div>
            <dt>{{ $t('work_items.uploaded_by') }}</dt>
            <dd>{{ drawing.employee?.name ?? $t('work_items.not_recorded') }}</dd>
          </div>
          <div>
            <dt>{{ $t('work_items.created_at') }}</dt>
            <dd>{{ drawing.createdAt ?? $t('work_items.not_recorded') }}</dd>
          </div>
        </dl>
        <a
          v-if="fileUrl(drawing)"
          class="btn btn-secondary work-items-file-link"
          :href="fileUrl(drawing)!"
          target="_blank"
          rel="noopener noreferrer"
          >{{ $t('work_items.open_drawing') }}<i class="pi pi-external-link" aria-hidden="true"
        /></a>
        <p v-else class="work-items-notes">{{ $t('work_items.no_drawing_file') }}</p>
      </li>
    </ul>
  </WorkItemSection>
</template>
