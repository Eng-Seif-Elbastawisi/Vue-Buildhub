<script lang="ts" setup generic="T">
export interface TableHeader {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { dialogManager } from '@/base/Presentation/Dialogs/dialog.manager';
import DeleteDialog from '@/base/Presentation/Dialogs/MainDialogs/DeleteDialog.vue';

const { t, te } = useI18n();

const props = defineProps<{
  headers: TableHeader[];
  items: T[];
  showIndex?: boolean;
  selectable?: boolean;
  reorderable?: boolean;
  emptyMessage?: string;
  rowKey?: string;
  striped?: boolean;
  hoverable?: boolean;
  bulkDelete?: (items: T[]) => Promise<void>;
}>();

const emit = defineEmits<{
  (e: 'row-click', item: T, index: number): void;
  (e: 'sort', key: string, direction: 'asc' | 'desc'): void;
  (e: 'selection-change', selectedItems: T[]): void;
  (e: 'reorder', payload: { items: T[]; movedItem: T; fromIndex: number; toIndex: number }): void;
}>();

// --- Sorting ---
const sortKey = ref<string | null>(null);
const sortDirection = ref<'asc' | 'desc'>('asc');

function handleSort(header: TableHeader) {
  if (!header.sortable) return;

  if (sortKey.value === header.key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = header.key;
    sortDirection.value = 'asc';
  }

  emit('sort', header.key, sortDirection.value);
}

// --- Selection ---
const selectedRows = ref<Set<number>>(new Set());
const isBulkDeleting = ref(false);

const allSelected = computed(() => {
  return props.items.length > 0 && selectedRows.value.size === props.items.length;
});

const selectedItems = computed(() =>
  props.items.filter((_, index) => selectedRows.value.has(index)),
);

const bulkDeleteLabel = computed(() =>
  t('bulk_delete_selected', { count: selectedItems.value.length }),
);

const translateIfExists = (value: string) => {
  return te(value) ? t(value) : value;
};

const emptyDisplayMessage = computed(() => {
  return props.emptyMessage ? translateIfExists(props.emptyMessage) : t('no_data');
});

function toggleAll() {
  if (allSelected.value) {
    selectedRows.value.clear();
  } else {
    selectedRows.value = new Set(props.items.map((_, i) => i));
  }
  emitSelection();
}

function toggleRow(index: number) {
  if (selectedRows.value.has(index)) {
    selectedRows.value.delete(index);
  } else {
    selectedRows.value.add(index);
  }
  emitSelection();
}

function isRowSelected(index: number): boolean {
  return selectedRows.value.has(index);
}

function emitSelection() {
  emit('selection-change', selectedItems.value);
}

watch(
  () => props.items,
  () => {
    if (selectedRows.value.size === 0) return;

    selectedRows.value.clear();
    emitSelection();
  },
);

async function deleteSelectedRows() {
  if (!props.bulkDelete || selectedItems.value.length === 0) return;

  isBulkDeleting.value = true;

  try {
    await props.bulkDelete(selectedItems.value);
    selectedRows.value.clear();
    emitSelection();
  } finally {
    isBulkDeleting.value = false;
  }
}

// --- Row key ---
function getRowKey(item: T, index: number): string | number {
  const key = props.rowKey ?? 'id';
  const val = (item as any)?.[key];
  return val !== undefined ? val : index;
}

// when double click on any filed copy to clipboard
const copyToClipboard = async (value: unknown) => {
  const text = String(value ?? '').trim();

  if (!text || text === '--') return;

  try {
    await navigator.clipboard.writeText(text);

    dialogManager.toastSuccess(t('copied_to_clipboard', { value: text }), {
      duration: 2000,
    });
  } catch (err) {
    console.error('Clipboard copy failed:', err);
  }
};

// --- Drag and Drop Reordering ---
const draggedIndex = ref<number | null>(null);
const dragOverIndex = ref<number | null>(null);
const dragOverPosition = ref<'top' | 'bottom' | null>(null);

function onDragStart(event: DragEvent, index: number) {
  if (!props.reorderable) return;
  draggedIndex.value = index;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(index));
  }
}

function onDragOver(event: DragEvent, index: number) {
  if (!props.reorderable || draggedIndex.value === null) return;
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }

  dragOverIndex.value = index;
  const target = event.currentTarget as HTMLElement | null;
  if (target) {
    const rect = target.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    dragOverPosition.value = event.clientY < midY ? 'top' : 'bottom';
  }
}

function onDragLeave(_event: DragEvent, index: number) {
  if (dragOverIndex.value === index) {
    dragOverIndex.value = null;
    dragOverPosition.value = null;
  }
}

function onDrop(event: DragEvent, targetIndex: number) {
  if (!props.reorderable || draggedIndex.value === null) return;
  event.preventDefault();

  const fromIndex = draggedIndex.value;
  const toIndex = targetIndex;

  if (fromIndex !== toIndex) {
    const newItems = [...props.items];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);
    emit('reorder', {
      items: newItems,
      movedItem,
      fromIndex,
      toIndex,
    });
  }

  onDragEnd();
}

function onDragEnd() {
  draggedIndex.value = null;
  dragOverIndex.value = null;
  dragOverPosition.value = null;
}
</script>

<template>
  <div class="app-table-wrapper">
    <div
v-if="bulkDelete && selectedItems.length > 0" class="table-bulk-actions" role="toolbar"
      :aria-label="bulkDeleteLabel">
      <DeleteDialog
:title="$t('bulk_delete_title')" :message="$t('bulk_delete_message')"
        :trigger-label="bulkDeleteLabel" trigger-class="btn-add" :disabled="isBulkDeleting"
        @delete="deleteSelectedRows" />
    </div>

    <div class="table-responsive">
      <table class="app-table" :class="{ striped, hoverable }">
        <!-- Header -->
        <thead>
          <tr>
            <!-- Selection checkbox column -->
            <th v-if="selectable" class="th-checkbox">
              <input type="checkbox" :checked="allSelected" @change="toggleAll" />
            </th>

            <!-- Index column -->
            <th v-if="showIndex" class="th-index">#</th>

            <!-- Drag handle column -->
            <th v-if="reorderable" class="th-drag-handle"></th>

            <!-- Data columns -->
            <th
v-for="header in headers" :key="header.key" :style="{
              width: header.width,
              textAlign: header.align || 'left',
            }" :class="{
              sortable: header.sortable,
              active: sortKey === header.key,
            }" @click="handleSort(header)">
              <div class="th-content">
                <span>{{ $t(header.label) }}</span>
                <span v-if="header.sortable" class="sort-icon">
                  <template v-if="sortKey === header.key">
                    {{ sortDirection === 'asc' ? '▲' : '▼' }}
                  </template>
                  <template v-else>⇅</template>
                </span>
              </div>
            </th>

            <!-- Actions column (if slot provided) -->
            <th v-if="$slots.actions" class="th-actions">
              <!-- <slot name="actions-header">Actions</slot> -->
            </th>
          </tr>
        </thead>

        <!-- Body -->
        <tbody>
          <slot name="CustomRow"></slot>
          <tr v-if="items.length === 0">
            <td
:colspan="headers.length +
              (showIndex ? 1 : 0) +
              (selectable ? 1 : 0) +
              (reorderable ? 1 : 0) +
              ($slots.actions ? 1 : 0)
              " class="empty-row" @dblclick="copyToClipboard(emptyDisplayMessage)">
              {{ emptyDisplayMessage }}
            </td>
          </tr>

          <tr
v-for="(item, index) in items" :key="getRowKey(item, index)"
            :class="{
              selected: selectable && isRowSelected(index),
              'is-dragging': draggedIndex === index,
              'drag-over-top': dragOverIndex === index && dragOverPosition === 'top',
              'drag-over-bottom': dragOverIndex === index && dragOverPosition === 'bottom',
            }"
            :draggable="reorderable"
            @dragstart="onDragStart($event, index)"
            @dragover="onDragOver($event, index)"
            @dragleave="onDragLeave($event, index)"
            @drop="onDrop($event, index)"
            @dragend="onDragEnd"
            @click="emit('row-click', item, index)">
            <!-- Selection checkbox -->
            <td v-if="selectable" class="td-checkbox" @click.stop>
              <input type="checkbox" :checked="isRowSelected(index)" @change="toggleRow(index)" />
            </td>

            <!-- Row index -->
            <td v-if="showIndex" class="td-index">{{ index + 1 }}</td>

            <!-- Drag handle column -->
            <td v-if="reorderable" class="td-drag-handle" @click.stop>
              <slot name="drag-handle" :item="item" :index="index">
                <span class="drag-handle-icon" :title="$t('drag_to_reorder') || 'Drag to reorder'">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="9" cy="5" r="1" fill="currentColor" />
                    <circle cx="9" cy="12" r="1" fill="currentColor" />
                    <circle cx="9" cy="19" r="1" fill="currentColor" />
                    <circle cx="15" cy="5" r="1" fill="currentColor" />
                    <circle cx="15" cy="12" r="1" fill="currentColor" />
                    <circle cx="15" cy="19" r="1" fill="currentColor" />
                  </svg>
                </span>
              </slot>
            </td>

            <!-- Data cells -->
            <td
v-for="header in headers" :key="header.key" :style="{ textAlign: header.align || 'start' }"
              class="td-data" @dblclick.stop="copyToClipboard((item as any)?.[header.key])">
              <!--
                Use named slot `cell-{key}` for custom rendering,
                otherwise fall back to item[key]
              -->
              <slot :name="`cell-${header.key}`" :item="item" :index="index" :value="(item as any)[header.key]">
                {{ (item as any)[header.key] ?? '--' }}
              </slot>
            </td>

            <!-- Actions cell -->
            <td v-if="$slots.actions" class="td-actions" @click.stop>
              <slot name="actions" :item="item" :index="index" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped lang="scss">
.th-drag-handle,
.td-drag-handle {
  width: 40px;
  text-align: center;
}

.drag-handle-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-400);
  cursor: grab;
  padding: 4px;
  border-radius: var(--radius-xs);
  transition: all 0.2s ease;

  &:hover {
    color: var(--PrimaryColor);
    background: var(--PrimaryColor-light);
  }

  &:active {
    cursor: grabbing;
  }
}

:deep(tr.is-dragging),
tr.is-dragging {
  opacity: 0.4;
  background: var(--gray-100);
}

:deep(tr.drag-over-top),
tr.drag-over-top {
  border-top: 2px solid var(--PrimaryColor);
}

:deep(tr.drag-over-bottom),
tr.drag-over-bottom {
  border-bottom: 2px solid var(--PrimaryColor);
}
</style>
