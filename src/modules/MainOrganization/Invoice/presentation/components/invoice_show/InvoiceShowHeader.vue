<script setup lang="ts">
  import type InvoiceShowModel from '../../../core/models/invoice.show.model';

  defineProps<{
    invoice: InvoiceShowModel;
    statusLabel: string;
    statusClass: string;
    createdAtLabel: string;
    createdByLabel: string;
    indexPath: string;
    editPath: string;
    exportingPdf?: boolean;
  }>();

  defineEmits<{
    download: [];
    share: [];
  }>();
</script>

<template>
  <header class="invoice-show-header">
    <div class="invoice-show-header__copy">
      <nav class="invoice-show-breadcrumb" aria-label="breadcrumb">
        <RouterLink :to="indexPath">{{ $t('invoice.index.title') }}</RouterLink>
        <i class="pi pi-angle-right"></i>
        <span>{{ $t('invoice_show.details') }}</span>
      </nav>

      <div class="invoice-show-header__title-row">
        <h1>
          {{ $t('invoice_show.invoice_number', { number: invoice.invoice_number || invoice.id }) }}
        </h1>
        <span class="invoice-show-status-pill" :class="statusClass">
          <i class="pi pi-check-circle"></i>
          {{ statusLabel }}
        </span>
      </div>

      <p>
        {{ $t('invoice_show.created_on', { date: createdAtLabel, employee: createdByLabel }) }}
      </p>
    </div>

    <div class="invoice-show-header__actions">
      <button
        class="invoice-show-btn invoice-show-btn--light"
        type="button"
        @click="$emit('download')"
      >
        <i class="pi pi-download"></i>
        {{ exportingPdf ? $t('invoice_show.downloading') : $t('invoice_show.download_pdf') }}
      </button>
      <button
        class="invoice-show-btn invoice-show-btn--light"
        type="button"
        @click="$emit('share')"
      >
        <i class="pi pi-share-alt"></i>
        {{ $t('invoice_show.share') }}
      </button>
      <RouterLink class="invoice-show-btn invoice-show-btn--primary" :to="editPath">
        <i class="pi pi-pencil"></i>
        {{ $t('invoice.edit') }}
      </RouterLink>
    </div>
  </header>
</template>
