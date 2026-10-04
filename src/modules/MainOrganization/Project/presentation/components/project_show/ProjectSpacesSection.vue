<script setup lang="ts">
  import {
    attachmentGallery,
    toGalleryAttachment,
  } from '@/shared/AttachmentGallery/attachmentGallery';
  import type { Attachment, FloorSpace, NamedEntity } from './projectShow.types';

  defineProps<{
    title: string;
    spaces: FloorSpace[];
    totalArea: number;
    emptyValue: string;
    emptyLabel: string;
    floorLabel: string;
    spaceLabel: string;
    lengthLabel: string;
    widthLabel: string;
    heightLabel: string;
    areaLabel: string;
    notesLabel: string;
    attachmentsLabel: string;
    totalAreaAllSpacesLabel: string;
    getFloorNumberLabel: (floorNumber?: number | null) => string;
    getEntityName: (entity?: NamedEntity | null) => string;
    formatNumber: (value?: number | string | null, fractionDigits?: number) => string;
    formatArea: (value?: number | string | null) => string;
    calculateArea: (space: FloorSpace) => number;
    valueOrEmpty: (value?: string | number | null) => string;
    isImageAttachment: (attachment?: Attachment | null) => boolean;
  }>();
</script>

<template>
  <details class="project-card project-spaces-card project-section-disclosure">
    <summary class="card-title">
      <i class="pi pi-objects-column"></i>
      <h2>{{ title }}</h2>
      <i class="pi pi-chevron-down project-disclosure-chevron" aria-hidden="true"></i>
    </summary>

    <div v-if="!spaces.length" class="empty-panel">
      {{ emptyLabel }}
    </div>

    <div v-else class="table-wrap project-spaces-table-wrapper">
      <table class="project-table project-table--spaces">
        <thead>
          <tr>
            <th>{{ floorLabel }}</th>
            <th>{{ spaceLabel }}</th>
            <th>{{ lengthLabel }}</th>
            <th>{{ widthLabel }}</th>
            <th>{{ heightLabel }}</th>
            <th>{{ areaLabel }}</th>
            <th>{{ notesLabel }}</th>
            <th>{{ attachmentsLabel }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="space in spaces" :key="space.id">
            <td>{{ getFloorNumberLabel(space.parentFloorNumber) }}</td>
            <td>{{ getEntityName(space.space) }}</td>
            <td>{{ formatNumber(space.length) }}</td>
            <td>{{ formatNumber(space.width) }}</td>
            <td>{{ formatNumber(space.height) }}</td>
            <td>{{ formatNumber(calculateArea(space)) }}</td>
            <td>
              <span class="project-table-clamp" :title="valueOrEmpty(space.notes)">
                {{ valueOrEmpty(space.notes) }}
              </span>
            </td>
            <td>
              <div v-if="space.attachments?.length" class="space-attachments">
                <button
                  v-for="(attachment, index) in space.attachments"
                  :key="attachment.id ?? attachment.file"
                  type="button"
                  class="space-attachment"
                  :aria-label="attachment.alt || attachment.file"
                  @click="attachmentGallery.open(space.attachments.map(toGalleryAttachment), index)"
                >
                  <img
                    v-if="isImageAttachment(attachment)"
                    :src="attachment.file"
                    :alt="attachment.alt || getEntityName(space.space)"
                    class="space-attachment__image"
                  />
                  <i v-else class="pi pi-paperclip" aria-hidden="true" />
                </button>
              </div>
              <span v-else>{{ emptyValue }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <strong class="total-line"> {{ totalAreaAllSpacesLabel }}: {{ formatArea(totalArea) }} </strong>
  </details>
</template>
