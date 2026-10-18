<script setup lang="ts">
  import { ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import ExportIcon from '@/shared/icons/ExportIcon.vue';

  const exporting = ref(false);
  const { t } = useI18n();

  const exportPDF = async (): Promise<void> => {
    const tableElement = document.querySelector<HTMLElement>('.table-responsive');

    if (!tableElement || exporting.value) {
      console.error('Table element not found.');
      return;
    }

    exporting.value = true;

    try {
      if (document.fonts) {
        await document.fonts.ready;
      }

      const printWindow = window.open('', '_blank', 'width=1200,height=800');

      if (!printWindow) {
        console.error('Print window was blocked by the browser.');

        return;
      }

      const documentStyles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map((styleElement) => {
          return styleElement.outerHTML;
        })
        .join('\n');

      const clonedTable = tableElement.cloneNode(true) as HTMLElement;

      clonedTable.style.width = '100%';
      clonedTable.style.maxWidth = 'none';
      clonedTable.style.overflow = 'visible';
      clonedTable.style.direction = 'rtl';

      printWindow.document.open();

      printWindow.document.write(`
        <!DOCTYPE html>

        <html lang="ar" dir="rtl">
          <head>
            <meta charset="UTF-8" />

            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />

            <title>${t('export_pdf')}</title>

            ${documentStyles}

            <style>
              @page {
                size: A4 landscape;
                margin: 10mm;
              }

              html,
              body {
                margin: 0;
                padding: 0;
                background: var(--bh-surface);
                color: var(--bh-text);
                direction: rtl;
                font-family:
                  "Cairo",
                  "Tajawal",
                  "Noto Sans Arabic",
                  Arial,
                  sans-serif;
              }

              body {
                padding: 10px;
              }

              .print-table-wrapper {
                width: 100%;
                max-width: none;
                overflow: visible;
                direction: rtl;
              }

              .table-responsive {
                width: 100% !important;
                max-width: none !important;
                overflow: visible !important;
                direction: rtl !important;
              }

              table {
                width: 100% !important;
                border-collapse: collapse;
                direction: rtl !important;
                table-layout: auto;
              }

              thead {
                display: table-header-group;
              }

              tfoot {
                display: table-footer-group;
              }

              tr {
                page-break-inside: avoid;
                break-inside: avoid;
              }

              th,
              td {
                padding: 8px;
                border: 1px solid var(--bh-field-line);
                direction: rtl;
                text-align: right;
                unicode-bidi: plaintext;
                white-space: normal;
                word-break: break-word;
              }

              th {
                background: var(--bh-canvas);
                color: var(--bh-text);
                font-weight: 700;
              }

              button,
              .actions,
              [data-label="actions"] {
                display: none !important;
              }

              img {
                max-width: 100%;
              }

              * {
                box-sizing: border-box;
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
            </style>
          </head>

          <body>
            <main class="print-table-wrapper">
              ${clonedTable.outerHTML}
            </main>
          </body>
        </html>
      `);

      printWindow.document.close();

      await new Promise<void>((resolve) => {
        if (printWindow.document.readyState === 'complete') {
          resolve();
          return;
        }

        printWindow.addEventListener('load', () => resolve(), {
          once: true,
        });
      });

      if (printWindow.document.fonts) {
        await printWindow.document.fonts.ready;
      }

      const images = Array.from(printWindow.document.images);

      await Promise.all(
        images.map((image) => {
          if (image.complete) {
            return Promise.resolve();
          }

          return new Promise<void>((resolve) => {
            image.onload = () => resolve();
            image.onerror = () => resolve();
          });
        }),
      );

      printWindow.focus();
      printWindow.print();

      printWindow.addEventListener(
        'afterprint',
        () => {
          printWindow.close();
        },
        {
          once: true,
        },
      );
    } catch (error: unknown) {
      console.error('Error printing table:', error);
    } finally {
      exporting.value = false;
    }
  };
</script>

<template>
  <button
    class="btn btn-secondary ms-2 action--download"
    type="button"
    :disabled="exporting"
    @click="exportPDF"
  >
    {{ exporting ? $t('exporting') : $t('export_pdf') }}

    <ExportIcon v-if="!exporting" />
  </button>
</template>

<style scoped>
  button:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
</style>
