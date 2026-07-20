<script setup lang="ts">
  import type InvoiceShowModel from '../../../core/models/invoice.show.model';
  import InvoiceDocumentIcon from './InvoiceDocumentIcon.vue';
  import InvoiceHeroIllustration from './InvoiceHeroIllustration.vue';

  defineProps<{
    invoice: InvoiceShowModel;
    statusLabel: string;
    statusClass: string;
    createdAtLabel: string;
    createdByLabel: string;
    indexPath: string;
    editPath: string;
    exportingPdf?: boolean;
    exportingInvoice?: boolean;
  }>();

  defineEmits<{
    download: [];
    exportInvoice: [];
    share: [];
  }>();
</script>

<template>
  <header class="invoice-show-header">
    <div class="invoice-show-header__toolbar">
      <nav class="invoice-show-breadcrumb" aria-label="breadcrumb">
        <RouterLink :to="indexPath">{{ $t('invoice.index.title') }}</RouterLink>
        <i class="pi pi-angle-right" aria-hidden="true"></i>
        <span>{{ $t('invoice_show.details') }}</span>
      </nav>

      <div class="invoice-show-header__actions">
        <button
          class="invoice-show-btn invoice-show-btn--light"
          type="button"
          @click="$emit('download')"
        >
          <i class="pi pi-download" aria-hidden="true"></i>
          {{ exportingPdf ? $t('invoice_show.downloading') : $t('invoice_show.download_pdf') }}
        </button>
        <button
          v-if="invoice.export_status === 0"
          class="invoice-show-btn invoice-show-btn--outline"
          type="button"
          :disabled="exportingInvoice"
          @click="$emit('exportInvoice')"
        >
          <i class="pi pi-upload" aria-hidden="true"></i>
          {{ exportingInvoice ? $t('invoice_show.exporting') : $t('invoice_show.export_invoice') }}
        </button>
        <!-- <button
          class="invoice-show-btn invoice-show-btn--light"
          type="button"
          @click="$emit('share')"
        >
          <i class="pi pi-share-alt"></i>
          {{ $t('invoice_show.share') }}
        </button> -->
        <!-- <RouterLink class="invoice-show-btn invoice-show-btn--primary" :to="editPath">
          <i class="pi pi-pencil"></i>
          {{ $t('invoice.edit') }}
        </RouterLink> -->
      </div>
    </div>

    <div class="invoice-show-header__hero">
      <div class="invoice-show-header__hero-top">
        <div class="invoice-show-header__identity">
          <span class="invoice-show-header__document-icon">
            <InvoiceDocumentIcon :size="64" />
          </span>

          <div class="invoice-show-header__copy">
            <div class="invoice-show-header__title-row">
              <h1>
                {{
                  $t('invoice_show.invoice_number', {
                    number: invoice.invoice_number || invoice.id,
                  })
                }}
              </h1>
              <span class="invoice-show-status-pill" :class="statusClass">
                <i class="pi pi-check-circle" aria-hidden="true"></i>
                {{ statusLabel }}
              </span>
            </div>

            <p>
              {{
                $t('invoice_show.created_on', {
                  date: createdAtLabel,
                  employee: createdByLabel,
                })
              }}
            </p>
          </div>
        </div>

        <figure class="invoice-show-header__illustration">
          <InvoiceHeroIllustration :size="250" />
        </figure>
      </div>

      <slot />
    </div>
  </header>
</template>
