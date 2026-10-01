<script lang="ts" setup generic="T">
  export interface TableHeader {
    key: string;
    label: string;
    width?: string;
    align?: 'left' | 'center' | 'right';
    sortable?: boolean;
  }

  import { ref, computed, watch, provide, onBeforeUnmount } from 'vue';
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
    appearance?: 'standard' | 'custom';
    flush?: boolean;
    minWidth?: string;
    tableLabel?: string;
    actionsLabel?: string;
    rowClickable?: boolean;
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

  const confirmedRemovalKeys = ref<Set<string>>(new Set());
  let removalExpiry: ReturnType<typeof setTimeout> | undefined;

  const armDestructiveRemoval = (trigger: HTMLElement | null) => {
    const rowKey = trigger?.closest<HTMLElement>('tr[data-row-key]')?.dataset.rowKey;
    const keys = rowKey
      ? [rowKey]
      : trigger?.closest('.table-bulk-actions')
        ? Array.from(selectedRows.value).flatMap((index) => {
            const item = props.items[index];
            return item === undefined ? [] : [String(getRowKey(item, index))];
          })
        : [];

    if (!keys.length) return;
    confirmedRemovalKeys.value = new Set([...confirmedRemovalKeys.value, ...keys]);
    if (removalExpiry) clearTimeout(removalExpiry);
    removalExpiry = setTimeout(() => {
      confirmedRemovalKeys.value = new Set();
    }, 10_000);
  };

  const beforeRowLeave = (element: Element) => {
    const row = element as HTMLElement;
    const key = row.dataset.rowKey;
    if (!key || !confirmedRemovalKeys.value.has(key)) return;

    row.classList.add('is-confirmed-removal');
    row.style.setProperty('--removal-row-width', `${row.getBoundingClientRect().width}px`);
    row.querySelectorAll<HTMLElement>('td').forEach((cell) => {
      cell.style.width = `${cell.getBoundingClientRect().width}px`;
    });
  };

  const afterRowLeave = (element: Element) => {
    const key = (element as HTMLElement).dataset.rowKey;
    if (!key) return;
    const next = new Set(confirmedRemovalKeys.value);
    next.delete(key);
    confirmedRemovalKeys.value = next;
  };

  provide('dashboard-destructive-motion', armDestructiveRemoval);

  watch(
    () => props.items,
    (items) => {
      const currentKeys = new Set(items.map((item, index) => String(getRowKey(item, index))));
      if (Array.from(confirmedRemovalKeys.value).some((key) => currentKeys.has(key))) {
        confirmedRemovalKeys.value = new Set();
      }
    },
    { flush: 'post' },
  );

  onBeforeUnmount(() => {
    if (removalExpiry) clearTimeout(removalExpiry);
  });

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

  function setFullRowDragImage(event: DragEvent) {
    if (!event.dataTransfer) return;

    const sourceRow = (event.currentTarget as HTMLElement).closest('tr');
    if (!sourceRow) return;

    const rowRect = sourceRow.getBoundingClientRect();
    const offsetX = Math.max(0, event.clientX - rowRect.left);
    const offsetY = Math.max(0, event.clientY - rowRect.top);
    event.dataTransfer.setDragImage(sourceRow, offsetX, offsetY);
  }

  function onDragStart(event: DragEvent, index: number) {
    if (!props.reorderable) return;
    draggedIndex.value = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(index));
      setFullRowDragImage(event);
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

    const nextPosition = getDropPosition(clientY, targetRow);

    if (dragOverIndex.value === targetIndex && dragOverPosition.value === nextPosition) return;

    dragOverIndex.value = targetIndex;
    dragOverPosition.value = nextPosition;
  }

  function getDropPosition(clientY: number, targetRow: HTMLElement): 'top' | 'bottom' {
    const rowRect = targetRow.getBoundingClientRect();
    return clientY < rowRect.top + rowRect.height / 2 ? 'top' : 'bottom';
  }

  function getFinalDropIndex(fromIndex: number, targetIndex: number, position: 'top' | 'bottom') {
    // Upward moves keep the visual boundary; downward moves shift it after removing the source row.
    const insertionIndex = targetIndex + (position === 'bottom' ? 1 : 0);
    return fromIndex < insertionIndex ? insertionIndex - 1 : insertionIndex;
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

    if (index === draggedIndex.value) {
      dragOverIndex.value = null;
      dragOverPosition.value = null;
      return;
    }

    scheduleDragOverUpdate(event.clientY, index, target);
  }

  function onDragLeave(event: DragEvent, index: number) {
    const targetRow = event.currentTarget as HTMLElement;
    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget && targetRow.contains(nextTarget)) return;

    if (pendingDragOver?.index === index) pendingDragOver = null;

    if (dragOverIndex.value === index) {
      dragOverIndex.value = null;
      dragOverPosition.value = null;
    }
  }

  function onDrop(event: DragEvent, targetIndex: number) {
    if (!props.reorderable || draggedIndex.value === null) return;
    event.preventDefault();

    const fromIndex = draggedIndex.value;
    const targetRow = event.currentTarget as HTMLElement;
    const position =
      dragOverIndex.value === targetIndex && dragOverPosition.value
        ? dragOverPosition.value
        : getDropPosition(event.clientY, targetRow);
    const toIndex = getFinalDropIndex(fromIndex, targetIndex, position);

    if (fromIndex !== toIndex) {
      const newItems = [...props.items];
      const [movedItem] = newItems.splice(fromIndex, 1);
      if (movedItem === undefined) {
        onDragEnd();
        return;
      }
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
  <div
    class="app-table-wrapper"
    :class="{
      'app-table-wrapper--standard': appearance !== 'custom',
      'app-table-wrapper--flush': flush && appearance !== 'custom',
    }"
  >
    <div
      v-if="bulkDelete && selectedItems.length > 0"
      class="table-bulk-actions"
      role="toolbar"
      :aria-label="bulkDeleteLabel"
    >
      <DeleteDialog
        :title="$t('bulk_delete_title')"
        :message="$t('bulk_delete_message')"
        :trigger-label="bulkDeleteLabel"
        trigger-class="btn-add action--delete"
        :disabled="isBulkDeleting"
        @delete="deleteSelectedRows"
      />
    </div>

    <div class="table-responsive">
      <table
        class="app-table"
        :class="{
          striped,
          hoverable,
          'app-table--row-clickable': rowClickable,
          'is-reordering': draggedIndex !== null,
        }"
        :style="{ minWidth }"
        :aria-label="tableLabel ? $t(tableLabel) : undefined"
      >
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
              v-for="header in headers"
              :key="header.key"
              :style="{
                width: header.width,
                textAlign: header.align || (appearance === 'custom' ? 'left' : 'start'),
              }"
              :class="{
                sortable: header.sortable,
                active: sortKey === header.key,
              }"
              :aria-label="header.sortable ? sortDescription(header) : undefined"
              :aria-sort="
                header.sortable
                  ? sortKey === header.key
                    ? sortDirection === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : 'none'
                  : undefined
              "
              :tabindex="header.sortable ? 0 : undefined"
              :title="header.sortable ? sortDescription(header) : undefined"
              @click="handleSort(header)"
              @keydown.enter.prevent="handleSort(header)"
              @keydown.space.prevent="handleSort(header)"
            >
              <div class="th-content">
                <span>{{ $t(header.label) }}</span>

                <span
                  v-if="header.sortable"
                  class="sort-icon"
                  aria-hidden="true"
                  :title="sortDescription(header)"
                >
                  <template v-if="sortKey === header.key">
                    {{ sortDirection === 'asc' ? '▲' : '▼' }}
                  </template>
                  <template v-else>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M7 15l5 5 5-5M7 9l5-5 5 5" />
                    </svg>
                  </template>
                </span>
              </div>
            </th>

            <!-- Actions column (if slot provided) -->
            <th v-if="$slots.actions" class="th-actions">
              {{ actionsLabel ? $t(actionsLabel) : '' }}
            </th>
          </tr>
        </thead>

        <!-- Body -->
        <tbody :class="{ 'is-destructive-removal': confirmedRemovalKeys.size > 0 }">
          <slot name="CustomRow"></slot>
          <tr v-if="items.length === 0">
            <td
              :colspan="
                headers.length +
                (showIndex ? 1 : 0) +
                (selectable ? 1 : 0) +
                (reorderable ? 1 : 0) +
                ($slots.actions ? 1 : 0)
              "
              class="empty-row"
              @dblclick="copyToClipboard(emptyDisplayMessage)"
            >
              {{ emptyDisplayMessage }}
            </td>
          </tr>

          <TransitionGroup
            name="dashboard-row-removal"
            @before-leave="beforeRowLeave"
            @after-leave="afterRowLeave"
          >
            <tr
              v-for="(item, index) in items"
              :key="getRowKey(item, index)"
              :data-row-key="String(getRowKey(item, index))"
              :class="{
                selected: selectable && isRowSelected(index),
                'is-dragging': draggedIndex === index,
                'drag-over-top': dragOverIndex === index && dragOverPosition === 'top',
                'drag-over-bottom': dragOverIndex === index && dragOverPosition === 'bottom',
              }"
              @dragover="onDragOver($event, index)"
              @dragleave="onDragLeave($event, index)"
              @drop="onDrop($event, index)"
              @dragend="onDragEnd"
              @click="emit('row-click', item, index)"
            >
              <!-- Selection checkbox -->
              <td v-if="selectable" class="td-checkbox" @click.stop>
                <input type="checkbox" :checked="isRowSelected(index)" @change="toggleRow(index)" />
              </td>

              <!-- Row index -->
              <td v-if="showIndex" class="td-index">{{ index + 1 }}</td>

              <!-- Drag handle column -->
              <td
                v-if="reorderable"
                class="td-drag-handle"
                :draggable="reorderable"
                @click.stop
                @dragstart.stop="onDragStart($event, index)"
              >
                <slot name="drag-handle" :item="item" :index="index">
                  <span
                    class="drag-handle-icon"
                    :title="$t('drag_to_reorder') || 'Drag to reorder'"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
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
                v-for="header in headers"
                :key="header.key"
                :style="{ textAlign: header.align || 'start' }"
                class="td-data"
                @dblclick.stop="copyToClipboard((item as any)?.[header.key])"
              >
                <slot
                  :name="`cell-${header.key}`"
                  :item="item"
                  :index="index"
                  :value="(item as any)[header.key]"
                >
                  {{ (item as any)[header.key] ?? '--' }}
                </slot>
              </td>

              <!-- Actions cell -->
              <td v-if="$slots.actions" class="td-actions" @click.stop>
                <slot name="actions" :item="item" :index="index" />
              </td>
            </tr>
          </TransitionGroup>
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
    transition:
      color 0.16s ease,
      background-color 0.16s ease,
      box-shadow 0.16s ease,
      transform 0.16s ease;

    &:hover {
      color: var(--PrimaryColor);
      background: var(--PrimaryColor-light);
    }

    &:active {
      cursor: grabbing;
    }
  }

  /* ===== Drag & Drop states ===== */
  .app-table.is-reordering {
    cursor: grabbing;
    user-select: none;
  }

  .dashboard-shell .app-table {
    position: relative;
  }

  .dashboard-shell .app-table tbody.is-destructive-removal .dashboard-row-removal-move {
    transition: transform var(--motion-base, 200ms) var(--motion-ease, ease-out);
  }

  .dashboard-shell .app-table .dashboard-row-removal-leave-active.is-confirmed-removal {
    position: absolute;
    width: var(--removal-row-width);
    pointer-events: none;
    transition:
      opacity var(--motion-base, 200ms) ease-out,
      transform var(--motion-base, 200ms) var(--motion-ease, ease-out);
  }

  .dashboard-shell .app-table .dashboard-row-removal-leave-active.is-confirmed-removal > td {
    background: var(--danger-light, var(--gray-100));
  }

  .dashboard-shell .app-table .dashboard-row-removal-leave-to.is-confirmed-removal {
    opacity: 0;
    transform: translateY(3px) scaleY(0.88);
  }

  @media (prefers-reduced-motion: reduce) {
    .dashboard-shell .app-table tbody.is-destructive-removal .dashboard-row-removal-move {
      transition: none;
    }

    .dashboard-shell .app-table .dashboard-row-removal-leave-active.is-confirmed-removal {
      position: relative;
      width: auto;
      transition: opacity var(--motion-fast, 140ms) ease-out;
    }

    .dashboard-shell .app-table .dashboard-row-removal-leave-to.is-confirmed-removal {
      transform: none;
    }
  }

  .app-table tbody tr > td {
    transition:
      background-color 0.16s ease,
      box-shadow 0.16s ease,
      opacity 0.16s ease;
  }

  .app-table tbody tr.is-dragging {
    transform: none;
  }

  .app-table tbody tr.is-dragging > td {
    background: var(--gray-100);
    opacity: 0.35;
  }

  .app-table tbody tr.drag-over-top > td,
  .app-table tbody tr.drag-over-bottom > td {
    background: var(--PrimaryColor-alpha-20);
  }

  .app-table tbody tr.drag-over-top > td {
    box-shadow:
      inset 0 4px 0 var(--PrimaryColor),
      inset 0 7px 0 var(--PrimaryColor-alpha-20);
  }

  .app-table tbody tr.drag-over-bottom > td {
    box-shadow:
      inset 0 -4px 0 var(--PrimaryColor),
      inset 0 -7px 0 var(--PrimaryColor-alpha-20);
  }

  .app-table.is-reordering .drag-handle-icon {
    cursor: grabbing;
  }

  .dashboard-shell .app-table-wrapper--standard .app-table .td-actions .action-btn {
    --row-action-ink: var(--quote-ink, var(--gray-600));
    --row-action-paper: var(--quote-paper, var(--bg-card));

    display: inline-grid;
    place-items: center;
    flex: 0 0 34px;
    box-sizing: border-box;
    width: 34px;
    min-width: 34px;
    height: 34px;
    min-height: 34px;
    padding: 0;
    border: 1px solid color-mix(in sRGB, var(--row-action-ink) 18%, var(--row-action-paper));
    border-radius: 8px;
    color: var(--row-action-ink);
    background: color-mix(in sRGB, var(--row-action-ink) 9%, var(--row-action-paper));
    box-shadow: none;
    font-size: 16px;
    text-decoration: none;
    cursor: pointer;
    transition:
      color 160ms ease,
      border-color 160ms ease,
      background-color 160ms ease,
      transform 160ms ease;
  }

  .dashboard-shell
    .app-table-wrapper--standard
    .app-table
    .td-actions
    .action-btn:is(.show, .view) {
    --row-action-ink: var(--info-dark);

    color: var(--row-action-ink);
  }

  .dashboard-shell .app-table-wrapper--standard .app-table .td-actions .action-btn.edit {
    --row-action-ink: var(--quote-copper-dark);

    color: var(--row-action-ink);
  }

  .dashboard-shell
    .app-table-wrapper--standard
    .app-table
    .td-actions
    .action-btn:is(.delete, .danger) {
    --row-action-ink: var(--danger);

    color: var(--row-action-ink);
  }

  .dashboard-shell
    .app-table-wrapper--standard
    .app-table
    .td-actions
    .action-btn:is(.execution-btn, .calculator, .pricing, .financial) {
    --row-action-ink: #0f766e;

    color: var(--row-action-ink);
  }

  .dashboard-shell .app-table-wrapper--standard .app-table .td-actions .action-btn svg {
    width: 17px;
    height: 17px;
  }

  .dashboard-shell .app-table-wrapper--standard .app-table .td-actions .action-btn i {
    font-size: 16px;
  }

  .dashboard-shell
    .app-table-wrapper--standard
    .app-table
    .td-actions
    .action-btn:hover:not(:disabled, [aria-disabled='true']) {
    border-color: color-mix(in sRGB, var(--row-action-ink) 42%, var(--row-action-paper));
    color: var(--row-action-ink);
    background: color-mix(in sRGB, var(--row-action-ink) 17%, var(--row-action-paper));
    box-shadow: none;
    transform: translateY(-1px);
  }

  .dashboard-shell
    .app-table-wrapper--standard
    .app-table
    .td-actions
    .action-btn:active:not(:disabled, [aria-disabled='true']) {
    background: color-mix(in sRGB, var(--row-action-ink) 24%, var(--row-action-paper));
    transform: translateY(1px);
  }

  .dashboard-shell .app-table-wrapper--standard .app-table .td-actions .action-btn:focus-visible {
    outline: 2px solid var(--row-action-ink);
    outline-offset: 2px;
  }

  .dashboard-shell
    .app-table-wrapper--standard
    .app-table
    .td-actions
    .action-btn:is(:disabled, [aria-disabled='true']) {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .dashboard-shell .app-table-wrapper--standard .app-table .td-actions .app-btn.action--view {
    --row-action-ink: var(--info-dark);
    --row-action-paper: var(--quote-paper, var(--bg-card));

    min-height: 34px;
    border-color: color-mix(in sRGB, var(--row-action-ink) 18%, var(--row-action-paper));
    color: var(--row-action-ink);
    background: color-mix(in sRGB, var(--row-action-ink) 9%, var(--row-action-paper));
  }

  .dashboard-shell
    .app-table-wrapper--standard
    .app-table
    .td-actions
    .app-btn.action--view:hover:not(:disabled) {
    border-color: color-mix(in sRGB, var(--row-action-ink) 42%, var(--row-action-paper));
    color: var(--row-action-ink);
    background: color-mix(in sRGB, var(--row-action-ink) 17%, var(--row-action-paper));
  }

  .dashboard-shell
    .app-table-wrapper--standard
    .app-table
    .td-actions
    .app-btn.action--view:focus-visible {
    outline: 2px solid var(--row-action-ink);
    outline-offset: 2px;
  }

  .dashboard-shell .app-table-wrapper--standard .app-table .td-actions .app-btn .btn__icon i {
    font-size: 16px;
  }

  .app-table tbody tr.drag-over-top .drag-handle-icon,
  .app-table tbody tr.drag-over-bottom .drag-handle-icon {
    color: var(--PrimaryColor);
    background: var(--PrimaryColor-alpha-30);
    box-shadow: 0 0 0 3px var(--PrimaryColor-alpha-12);
    transform: scale(1.08);
  }

  @media (prefers-reduced-motion: reduce) {
    .app-table tbody tr > td,
    .drag-handle-icon,
    .app-table-wrapper--standard .app-table .td-actions .action-btn {
      transition: none;
    }
  }
</style>
