<script lang="ts" setup generic="T">
  export interface TableHeader {
    key: string;
    label: string;
    width?: string;
    align?: 'left' | 'center' | 'right';
    sortable?: boolean;
  }

  import { ref, computed } from 'vue';
  import { dialogManager } from '@/base/Presentation/Dialogs/dialog.manager';

  const props = defineProps<{
    headers: TableHeader[];
    items: T[];
    showIndex?: boolean;
    selectable?: boolean;
    emptyMessage?: string;
    rowKey?: string;
    striped?: boolean;
    hoverable?: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'row-click', item: T, index: number): void;
    (e: 'sort', key: string, direction: 'asc' | 'desc'): void;
    (e: 'selection-change', selectedItems: T[]): void;
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

  const allSelected = computed(() => {
    return props.items.length > 0 && selectedRows.value.size === props.items.length;
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
    const selected = props.items.filter((_, i) => selectedRows.value.has(i));
    emit('selection-change', selected);
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

      dialogManager.toastSuccess('Copied to clipboard: ' + text, {
        duration: 2000,
      });
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };
</script>

<template>
  <div class="app-table-wrapper">
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

            <!-- Data columns -->
            <th
              v-for="header in headers"
              :key="header.key"
              :style="{
                width: header.width,
                textAlign: header.align || 'left',
              }"
              :class="{
                sortable: header.sortable,
                active: sortKey === header.key,
              }"
              @click="handleSort(header)"
            >
              <div class="th-content">
                <span>{{ header.label }}</span>
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
              :colspan="
                headers.length +
                (showIndex ? 1 : 0) +
                (selectable ? 1 : 0) +
                ($slots.actions ? 1 : 0)
              "
              class="empty-row"
              @dblclick="copyToClipboard(emptyMessage || 'No data available')"
            >
              {{ emptyMessage || 'No data available' }}
            </td>
          </tr>

          <tr
            v-for="(item, index) in items"
            :key="getRowKey(item, index)"
            :class="{ selected: selectable && isRowSelected(index) }"
            @click="emit('row-click', item, index)"
          >
            <!-- Selection checkbox -->
            <td v-if="selectable" class="td-checkbox" @click.stop>
              <input type="checkbox" :checked="isRowSelected(index)" @change="toggleRow(index)" />
            </td>

            <!-- Row index -->
            <td v-if="showIndex" class="td-index">{{ index + 1 }}</td>

            <!-- Data cells -->
            <td
              v-for="header in headers"
              :key="header.key"
              :style="{ textAlign: header.align || 'left' }"
              class="td-data"
              @dblclick.stop="copyToClipboard((item as any)?.[header.key])"
            >
              <!--
                Use named slot `cell-{key}` for custom rendering,
                otherwise fall back to item[key]
              -->
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
        </tbody>
      </table>
    </div>
  </div>
</template>
