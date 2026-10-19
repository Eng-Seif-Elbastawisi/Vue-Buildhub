<script setup lang="ts">
  import { computed, ref, watch, onBeforeUnmount } from 'vue';
  import {
    DataLoading,
    type DataState,
  } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import {
    attachmentGallery,
    attachmentKind,
    toGalleryAttachment,
  } from '@/shared/AttachmentGallery/attachmentGallery';
  import type { GalleryAttachment } from '@/shared/AttachmentGallery/attachmentGallery';
  import type ShopDrawingQuoteModel from '../../core/models/shop-drawing.model';
  import WorkItemSection from './WorkItemSection.vue';
  const props = defineProps<{ state: DataState<ShopDrawingQuoteModel[]> }>();
  const emit = defineEmits<{ retry: [] }>();
  const drawings = computed(() => props.state.data ?? []);
  const loading = computed(() => props.state instanceof DataLoading);
  const failedImages = ref(new Set<string>());
  const attachments = computed(() =>
    drawings.value.map((drawing) => {
      const attachment = toGalleryAttachment({ file: drawing.file });
      return {
        ...attachment,
        name: `${drawing.title} · ${drawing.versionNumber} · ${attachment.name}`,
        type: attachmentKind(attachment),
        url: /^https?:/i.test(attachment.url) ? attachment.url : '',
      };
    }),
  );
  const galleryFiles = computed(() => attachments.value.filter((attachment) => attachment.url));
  let ownedGallery: GalleryAttachment[] | null = null;
  function openAttachment(recordIndex: number) {
    const index = galleryFiles.value.findIndex(
      (attachment) => attachment === attachments.value[recordIndex],
    );
    if (index < 0) return;
    attachmentGallery.open(galleryFiles.value, index);
    ownedGallery = galleryFiles.value;
  }
  function closeGallery() {
    if (ownedGallery && attachmentGallery.attachments.value === ownedGallery)
      attachmentGallery.close();
    ownedGallery = null;
  }
  function imageFailed(url: string) {
    failedImages.value = new Set([...failedImages.value, url]);
  }
  watch(
    () => props.state.data,
    () => {
      closeGallery();
      failedImages.value = new Set();
    },
  );
  onBeforeUnmount(closeGallery);
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
      <li v-for="(drawing, index) in drawings" :key="drawing.id">
        <div
          class="work-items-drawing-layout"
          :class="{
            'has-preview': !!attachments[index]?.url,
          }"
        >
          <button
            v-if="!!attachments[index]?.url"
            type="button"
            class="work-items-drawing-preview"
            :aria-label="$t('work_items.preview_drawing', { name: drawing.title })"
            @click="openAttachment(index)"
          >
            <span class="work-items-drawing-image">
              <span
                v-if="attachmentKind(attachments[index]!) !== 'image'"
                class="work-items-drawing-image-failed"
                ><i
                  :class="
                    attachmentKind(attachments[index]!) === 'pdf' ? 'pi pi-file-pdf' : 'pi pi-file'
                  "
                  aria-hidden="true"
                /><span>{{ $t('work_items.view_attachment') }}</span></span
              >
              <img
                v-else-if="!failedImages.has(attachments[index]!.url)"
                :src="attachments[index]!.url"
                alt=""
                loading="lazy"
                @error="imageFailed(attachments[index]!.url)"
              />
              <span v-else class="work-items-drawing-image-failed"
                ><i class="pi pi-image" aria-hidden="true" />{{
                  $t('work_items.image_unavailable')
                }}</span
              >
            </span>
            <span class="work-items-drawing-preview-label"
              ><i class="pi pi-search-plus" aria-hidden="true" />{{
                $t(
                  attachmentKind(attachments[index]!) === 'image'
                    ? 'work_items.view_image'
                    : 'work_items.view_attachment',
                )
              }}</span
            >
          </button>
          <div class="work-items-drawing-info">
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
            <p v-if="drawing.projectFloorSpace">{{ drawing.projectFloorSpace.space.title }}</p>
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
            <!-- <a
              v-if="attachments[index]?.url"
              class="btn btn-secondary work-items-file-link"
              :href="attachments[index]!.url"
              target="_blank"
              rel="noopener noreferrer"
              >{{ $t('work_items.open_drawing') }}<i class="pi pi-external-link" aria-hidden="true"
            /></a>
            <p v-else class="work-items-notes">{{ $t('work_items.no_drawing_file') }}</p> -->
          </div>
        </div>
      </li>
    </ul>
  </WorkItemSection>
</template>
