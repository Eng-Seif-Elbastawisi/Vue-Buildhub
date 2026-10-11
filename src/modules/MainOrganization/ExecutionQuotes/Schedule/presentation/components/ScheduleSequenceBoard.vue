<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import {
    DataSuccess,
    DataCancelled,
  } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import type ScheduleGroupModel from '../../core/models/schedule.group.model';
  import ScheduleController from '../controllers/schedule.controller';
  import ScheduleGroupCard from './ScheduleGroupCard.vue';
  const props = defineProps<{ groups: ScheduleGroupModel[]; basePath: string; quoteId: number }>();
  defineEmits<{ delete: [number] }>();
  const controller = ScheduleController.getInstance();
  const preview = ref<ScheduleGroupModel[] | null>(null);
  const draggedId = ref<number | null>(null);
  const insertion = ref<number | null>(null);
  const announcement = ref(false);
  const displayed = computed(() => preview.value ?? props.groups);
  watch(
    () => [props.quoteId, props.groups],
    () => {
      preview.value = null;
      draggedId.value = null;
      insertion.value = null;
      announcement.value = false;
    },
  );
  function start(id: number, event: DragEvent) {
    if (!controller.completeSequence.value || controller.busy.value) {
      event.preventDefault();
      return;
    }
    draggedId.value = id;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(id));
    }
  }
  function finish() {
    draggedId.value = null;
    insertion.value = null;
  }
  async function reorder(id: number, order: number) {
    if (controller.busy.value) return;
    const owner = props.quoteId;
    const moved = props.groups.find((group) => group.id === id);
    if (!moved) return;
    const remaining = props.groups.filter((group) => group.id !== id);
    remaining.splice(order - 1, 0, moved);
    preview.value = remaining;
    const state = await controller.changeProjectTimelineOrder(id, order);
    if (props.quoteId !== owner || state instanceof DataCancelled) {
      preview.value = null;
      return;
    }
    if (!(state instanceof DataSuccess) || !controller.refreshFailed.value) preview.value = null;
    announcement.value = state instanceof DataSuccess;
  }
  function drop(slot: number) {
    if (draggedId.value === null || controller.busy.value) return;
    const id = draggedId.value;
    const original = props.groups.findIndex((group) => group.id === id);
    const order = slot - (slot > original ? 1 : 0) + 1;
    finish();
    if (order !== original + 1) void reorder(id, order);
  }
  function step(id: number, direction: -1 | 1) {
    const position = props.groups.findIndex((group) => group.id === id);
    if (controller.canMove(id, direction)) void reorder(id, position + direction + 1);
  }
</script>
<template>
  <section class="schedule__sequence">
    <header class="schedule__section-heading">
      <h2>{{ $t('schedule.sequence') }}</h2>
      <i class="pi pi-sort-alt" aria-hidden="true"></i>
    </header>
    <p v-if="controller.busy.value" class="schedule__board-status" role="status">
      {{ $t('schedule.saving_order') }}
    </p>
    <p v-if="announcement" class="schedule__board-status" role="status">
      {{ $t('schedule.order_saved') }}
    </p>
    <div
      class="schedule__board"
      :aria-label="$t('schedule.sequence')"
      :aria-busy="controller.busy.value"
    >
      <template v-for="(entry, position) in displayed" :key="entry.id">
        <div
          class="schedule__drop-slot"
          :class="{ 'schedule__drop-slot--active': draggedId !== null && insertion === position }"
          :data-slot="position"
          @dragover.prevent="insertion = position"
          @drop.prevent="drop(position)"
        >
          <span v-if="draggedId !== null && insertion === position">{{
            $t('schedule.drop_here')
          }}</span>
        </div>
        <div
          class="schedule__board-card"
          :class="{ 'schedule__board-card--dragging': draggedId === entry.id }"
          @dragover.prevent="insertion = position + 1"
          @drop.prevent="drop(position + 1)"
        >
          <ScheduleGroupCard
            :group="entry"
            :sequence="position + 1"
            :base-path="basePath"
            :busy="controller.busy.value"
            :earlier="controller.canMove(entry.id, -1)"
            :later="controller.canMove(entry.id, 1)"
            @move="step(entry.id, $event)"
            @delete="$emit('delete', entry.id)"
          >
            <template #handle>
              <button
                type="button"
                class="schedule__drag-handle"
                :draggable="controller.completeSequence.value && !controller.busy.value"
                :disabled="!controller.completeSequence.value || controller.busy.value"
                :aria-label="$t('schedule.reorder_label', { title: entry.title })"
                @dragstart="start(entry.id, $event)"
                @dragend="finish"
              >
                <i class="pi pi-bars" aria-hidden="true"></i>
              </button>
            </template>
          </ScheduleGroupCard>
        </div>
      </template>
      <div
        class="schedule__drop-slot"
        :data-slot="displayed.length"
        :class="{
          'schedule__drop-slot--active': draggedId !== null && insertion === displayed.length,
        }"
        @dragover.prevent="insertion = displayed.length"
        @drop.prevent="drop(displayed.length)"
      >
        <span v-if="draggedId !== null && insertion === displayed.length">{{
          $t('schedule.drop_here')
        }}</span>
      </div>
    </div>
  </section>
</template>
