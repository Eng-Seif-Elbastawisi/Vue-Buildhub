<!-- ExportExcel.vue -->
<script lang="ts" setup>
  import { ref, computed, watch, nextTick } from 'vue';
  import * as XLSX from 'xlsx';
  import { saveAs } from 'file-saver';
  // import ExportIcon from '@/shared/icons/ExportIcon.vue';
  import SaveIcon from '@/shared/icons/SaveIcon.vue';

  const props = defineProps({
    data: {
      type: Array,
      required: true,
      default: () => [],
    },
    columns: {
      type: Array,
      default: () => [],
    },
    filename: {
      type: String,
      default: 'export',
    },
    sheetName: {
      type: String,
      default: 'Sheet1',
    },
    buttonText: {
      type: String,
      default: 'Export Excel',
    },
    buttonClass: {
      type: String,
      default: '',
    },
    showAdvanced: {
      type: Boolean,
      default: false,
    },
    maxPreviewRows: {
      type: Number,
      default: 3,
    },
  });

  const emit = defineEmits(['export-start', 'export-success', 'export-error']);

  // State
  const loading = ref(false);
  const showModal = ref(false);
  const toast = ref({ show: false, message: '', type: 'success' });

  // Export configuration
  const exportConfig = ref({
    filename: props.filename,
    sheetName: props.sheetName,
    selectedColumns: [] as any[],
    includeHeader: true,
    autoFitColumns: true,
  });

  // Computed properties
  const hasData = computed(() => props.data && props.data.length > 0);

  const availableColumns = computed(() => {
    if (props.columns && props.columns.length > 0) {
      return props.columns;
    }

    // Auto-detect columns from data
    if (!hasData.value) return [];

    const firstItem = props.data[0] as any;
    return Object.keys(firstItem).map((key) => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/[_-]/g, ' '),
      formatter: null,
    }));
  });

  // const previewData = computed(() => {
  //   return props.data.slice(0, props.maxPreviewRows);
  // });

  // Watch for prop changes
  watch(
    () => props.filename,
    (newVal) => {
      exportConfig.value.filename = newVal;
    },
  );

  watch(
    () => props.sheetName,
    (newVal) => {
      exportConfig.value.sheetName = newVal;
    },
  );

  watch(
    () => availableColumns.value,
    (newColumns) => {
      if (exportConfig.value.selectedColumns.length === 0 && newColumns.length > 0) {
        exportConfig.value.selectedColumns = [...newColumns];
      }
    },
    { immediate: true },
  );

  // Methods
  // const openModal = () => {
  //   showModal.value = true;
  //   document.body.classList.add('modal-open');
  // };

  const closeModal = () => {
    showModal.value = false;
    document.body.classList.remove('modal-open');
  };

  // const selectAllColumns = () => {
  //   exportConfig.value.selectedColumns = [...availableColumns.value];
  // };

  // const clearAllColumns = () => {
  //   exportConfig.value.selectedColumns = [];
  // };

  const formatCellValue = (item: any, column: any) => {
    const value = item[column.key];

    if (column.formatter && typeof column.formatter === 'function') {
      return column.formatter(value);
    }

    // Default formatting
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value instanceof Date) return value.toLocaleDateString();
    if (typeof value === 'object') return JSON.stringify(value);

    return String(value);
  };

  const showToast = (message: string, type = 'success') => {
    toast.value = { show: true, message, type };
    setTimeout(() => hideToast(), 5000);
  };

  const hideToast = () => {
    toast.value.show = false;
  };

  const handleExport = async () => {
    try {
      loading.value = true;
      emit('export-start');

      if (!hasData.value) {
        throw new Error('No data available to export');
      }

      const columnsToExport = props.showAdvanced
        ? exportConfig.value.selectedColumns
        : availableColumns.value;

      if (columnsToExport.length === 0) {
        throw new Error('Please select at least one column to export');
      }

      // Prepare data for export
      const exportData = (props.data as any[]).map((item: any) => {
        const row: Record<string, any> = {};
        (columnsToExport as any[]).forEach((col: any) => {
          const value = formatCellValue(item, col);
          row[col.label || col.key] = value;
        });
        return row;
      });

      // Create workbook
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();

      // Auto-fit columns if enabled
      if (!props.showAdvanced || exportConfig.value.autoFitColumns) {
        const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
        const colWidths = [];

        for (let C = range.s.c; C <= range.e.c; ++C) {
          let maxWidth = 10;
          for (let R = range.s.r; R <= range.e.r; ++R) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            const cell = ws[cellAddress];
            if (cell && cell.v) {
              const cellLength = String(cell.v).length;
              maxWidth = Math.max(maxWidth, Math.min(cellLength + 2, 50));
            }
          }
          colWidths.push({ wch: maxWidth });
        }
        ws['!cols'] = colWidths;
      }

      // Add worksheet to workbook
      const finalSheetName = props.showAdvanced ? exportConfig.value.sheetName : props.sheetName;

      XLSX.utils.book_append_sheet(wb, ws, finalSheetName);

      // Generate filename
      const currentDate = new Date().toISOString().split('T')[0];
      const finalFilename = props.showAdvanced ? exportConfig.value.filename : props.filename;

      const filename = `${finalFilename}_${currentDate}.xlsx`;

      // Export file
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      saveAs(blob, filename);

      // Close modal if open
      if (showModal.value) {
        closeModal();
      }

      // Show success message
      const message = `Successfully exported ${props.data.length} records to ${filename}`;
      showToast(message, 'success');

      emit('export-success', {
        filename,
        recordCount: props.data.length,
        columnCount: columnsToExport.length,
      });
    } catch (error: any) {
      console.error('Export failed:', error);
      showToast(error.message || 'Failed to export data', 'error');
      emit('export-error', error);
    } finally {
      loading.value = false;
    }
  };

  // Initialize selected columns
  nextTick(() => {
    if (exportConfig.value.selectedColumns.length === 0 && availableColumns.value.length > 0) {
      exportConfig.value.selectedColumns = [...availableColumns.value];
    }
  });
</script>

<template>
  <button class="btn btn-secondary ms-2" type="button" @click="handleExport">
    Export Excel <SaveIcon />
  </button>
</template>

<style scoped>
  .export-excel-component {
    display: inline-block;
  }

  .modal {
    backdrop-filter: blur(2px);
  }

  .toast {
    min-width: 300px;
  }

  .form-check-label {
    cursor: pointer;
    user-select: none;
  }

  .table th {
    background-color: var(--gray-50);
    font-weight: 600;
  }

  .spinner-border-sm {
    width: 1rem;
    height: 1rem;
  }
</style>
