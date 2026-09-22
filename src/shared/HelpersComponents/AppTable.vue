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
  initialSortKey?: string;
  initialSortDirection?: 'asc' | 'desc';
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
const sortKey = ref<string | null>(props.initialSortKey ?? null);
const sortDirection = ref<'asc' | 'desc'>(props.initialSortDirection ?? 'asc');

watch(
  () => [props.initialSortKey, props.initialSortDirection] as const,
  ([key, direction]) => {
    sortKey.value = key ?? null;
    sortDirection.value = direction ?? 'asc';
  },
);

const sortDescription = (header: TableHeader): string => {
  if (sortKey.value !== header.key) return t('table_sortable');

  return sortDirection.value === 'asc'
    ? t('table_sorted_ascending')
    : t('table_sorted_descending');
};

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
  const val = (item as Record<string, unknown> | null | undefined)?.[key];
  return typeof val === 'string' || typeof val === 'number' ? val : index;
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

let dragOverFrame: number | null = null;
let pendingDragOver: {
  clientY: number;
  index: number;
  target: HTMLElement;
} | null = null;

function updateDragOverState() {
  dragOverFrame = null;
  if (!pendingDragOver) return;

  const { clientY, index: targetIndex, target: targetRow } = pendingDragOver;
  pendingDragOver = null;

  const rect = targetRow.getBoundingClientRect();
  const nextPosition = clientY < rect.top + rect.height / 2 ? 'top' : 'bottom';

  if (dragOverIndex.value === targetIndex && dragOverPosition.value === nextPosition) return;

  dragOverIndex.value = targetIndex;
  dragOverPosition.value = nextPosition;
}

function scheduleDragOverUpdate(clientY: number, index: number, target: HTMLElement) {
  pendingDragOver = { clientY, index, target };
  if (dragOverFrame !== null) return;

  dragOverFrame = requestAnimationFrame(updateDragOverState);
}

function onDragOver(event: DragEvent, index: number) {
  if (!props.reorderable || draggedIndex.value === null) return;
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }

  const target = event.currentTarget as HTMLElement | null;
  if (!target) return;

  scheduleDragOverUpdate(event.clientY, index, target);
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
  if (dragOverFrame !== null) {
    cancelAnimationFrame(dragOverFrame);
    dragOverFrame = null;
  }
  pendingDragOver = null;
  draggedIndex.value = null;
  dragOverIndex.value = null;
  dragOverPosition.value = null;
}
</script>

<template>
  <div class="app-table-wrapper">
    <div v-if="bulkDelete && selectedItems.length > 0" class="table-bulk-actions" role="toolbar"
      :aria-label="bulkDeleteLabel">
      <DeleteDialog :title="$t('bulk_delete_title')" :message="$t('bulk_delete_message')"
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
            <th v-for="header in headers" :key="header.key" :style="{
              width: header.width,
              textAlign: header.align || 'left',
            }" :class="{
                sortable: header.sortable,
                active: sortKey === header.key,
              }" :aria-label="header.sortable ? sortDescription(header) : undefined" :aria-sort="header.sortable
                  ? sortKey === header.key
                    ? sortDirection === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : 'none'
                  : undefined
                " :tabindex="header.sortable ? 0 : undefined"
              :title="header.sortable ? sortDescription(header) : undefined" @click="handleSort(header)"
              @keydown.enter.prevent="handleSort(header)" @keydown.space.prevent="handleSort(header)">
              <div class="th-content">
                <span>{{ $t(header.label) }}</span>

                <span v-if="header.sortable" class="sort-icon" aria-hidden="true" :title="sortDescription(header)">
                  <template v-if="sortKey === header.key">
                    {{ sortDirection === 'asc' ? '▲' : '▼' }}
                  </template>
                  <template v-else>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                      stroke-linecap="round" stroke-linejoin="round">
                      <path d="M7 15l5 5 5-5M7 9l5-5 5 5" />
                    </svg>
                  </template>
                </span>
              </div>
            </th>

            <!-- Actions column (if slot provided) -->
            <th v-if="$slots.actions" class="th-actions"></th>
          </tr>
        </thead>

        <!-- Body -->
        <tbody>
          <slot name="CustomRow"></slot>
          <tr v-if="items.length === 0">
            <td :colspan="headers.length +
              (showIndex ? 1 : 0) +
              (selectable ? 1 : 0) +
              (reorderable ? 1 : 0) +
              ($slots.actions ? 1 : 0)
              " class="empty-row" @dblclick="copyToClipboard(emptyDisplayMessage)">
              {{ emptyDisplayMessage }}
            </td>
          </tr>

          <tr v-for="(item, index) in items" :key="getRowKey(item, index)" :class="{
            selected: selectable && isRowSelected(index),
            'is-dragging': draggedIndex === index,
            'drag-over-top': dragOverIndex === index && dragOverPosition === 'top',
            'drag-over-bottom': dragOverIndex === index && dragOverPosition === 'bottom',
          }" @dragover="onDragOver($event, index)" @dragleave="onDragLeave($event, index)"
            @drop="onDrop($event, index)" @dragend="onDragEnd" @click="emit('row-click', item, index)">
            <!-- Selection checkbox -->
            <td v-if="selectable" class="td-checkbox" @click.stop>
              <input type="checkbox" :checked="isRowSelected(index)" @change="toggleRow(index)" />
            </td>

            <!-- Row index -->
            <td v-if="showIndex" class="td-index">{{ index + 1 }}</td>

            <!-- Drag handle column -->
            <td v-if="reorderable" class="td-drag-handle" :draggable="reorderable" @click.stop
              @dragstart.stop="onDragStart($event, index)">
              <slot name="drag-handle" :item="item" :index="index">
                <span class="drag-handle-icon" :title="$t('drag_to_reorder') || 'Drag to reorder'">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
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
            <td v-for="header in headers" :key="header.key" :style="{ textAlign: header.align || 'start' }"
              class="td-data" @dblclick.stop="copyToClipboard((item as any)?.[header.key])">
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

<style lang="scss">
th.sortable {
  cursor: pointer;
  user-select: none;

  &:focus-visible {
    outline: 2px solid var(--PrimaryColor);
    outline-offset: -2px;
  }
}

.sort-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1rem;
  margin-inline-start: 0.35rem;
  opacity: 0.7;
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

th.sortable:hover .sort-icon,
th.sortable:focus-visible .sort-icon,
th.sortable.active .sort-icon {
  opacity: 1;
}

/* ===== Drag handle ===== */
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

/* ===== Drag & Drop states ===== */
tr.is-dragging {
  opacity: 0.4;
  background: var(--gray-100);
}

tr.drag-over-top {
  border-top: 2px solid var(--PrimaryColor);
}

tr.drag-over-bottom {
  border-bottom: 2px solid var(--PrimaryColor);
}

/* ===== Drag & Drop states ===== */
.app-table tbody tr {
  position: relative; // needed for the indicator pseudo-elements below
}

tr.is-dragging {
  opacity: 0.4;
  background: var(--gray-100);
}

/* Row currently being hovered as a drop target gets a soft tint */
tr.drag-over-top,
tr.drag-over-bottom {
  background: var(--PrimaryColor-light, #eef2ff) !important;
}

/* The actual insertion line — rendered as a pseudo-element instead of
   a tr border, since tr borders don't paint in most browsers */
tr.drag-over-top::before,
tr.drag-over-bottom::after {
  content: '';
  position: absolute;
  left: 4px;
  right: 4px;
  height: 3px;
  background: var(--PrimaryColor);
  border-radius: 3px;
  z-index: 5;
  box-shadow: 0 0 6px 1px var(--PrimaryColor);
}

tr.drag-over-top::before {
  top: -2px;
}

tr.drag-over-bottom::after {
  bottom: -2px;
}

/* small round "handle" markers at the line ends, like Trello/Notion */
tr.drag-over-top::before,
tr.drag-over-bottom::after {
  background-image: radial-gradient(circle 4px, var(--PrimaryColor) 100%, transparent 100%);
  background-repeat: no-repeat, no-repeat;
  background-position:
    left center,
    right center;
}

tr.is-dragging {
  opacity: 0.4;
  background: var(--gray-100);
  transform: scale(0.995);
}
</style>
