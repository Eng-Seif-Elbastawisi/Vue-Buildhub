<script setup lang="ts">
  import Image from 'primevue/image';
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
  <article class="project-card project-spaces-card">
    <div class="card-title">
      <i class="pi pi-file"></i>
      <h2>{{ title }}</h2>
    </div>

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
                <template
                  v-for="attachment in space.attachments"
                  :key="attachment.id ?? attachment.file"
                >
                  <Image
                    v-if="isImageAttachment(attachment)"
                    class="space-attachment space-attachment--image"
                    :src="attachment.file"
                    :alt="attachment.alt || getEntityName(space.space)"
                    preview
                    image-class="space-attachment__image"
                  />
                  <a
                    v-else
                    class="space-attachment"
                    :href="attachment.file"
                    target="_blank"
                    rel="noopener"
                  >
                    <span>
                      <i class="pi pi-paperclip"></i>
                    </span>
                  </a>
                </template>
              </div>
              <span v-else>{{ emptyValue }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <strong class="total-line"> {{ totalAreaAllSpacesLabel }}: {{ formatArea(totalArea) }} </strong>
  </article>
</template>
