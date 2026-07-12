<script setup lang="ts">
  defineProps<{
    invoiceDate: string;
    dueDate: string;
    statusLabel: string;
    exportStatusLabel: string;
    currency: string;
  }>();
</script>

<template>
  <section
    class="invoice-show-card invoice-status-overview"
    :aria-label="$t('invoice_show.overview')"
  >
    <article class="invoice-status-overview__item">
      <span class="invoice-show-icon invoice-show-icon--primary">
        <i class="pi pi-calendar"></i>
      </span>
      <div>
        <p>{{ $t('invoice.invoice_date') }}</p>
        <strong>{{ invoiceDate }}</strong>
      </div>
    </article>

    <article class="invoice-status-overview__item">
      <span class="invoice-show-icon invoice-show-icon--primary">
        <i class="pi pi-calendar-clock"></i>
      </span>
      <div>
        <p>{{ $t('invoice_show.due_date') }}</p>
        <strong>{{ dueDate }}</strong>
      </div>
    </article>

    <article class="invoice-status-overview__item">
      <span class="invoice-show-icon invoice-show-icon--success">
        <i class="pi pi-check-circle"></i>
      </span>
      <div>
        <p>{{ $t('invoice_show.status') }}</p>
        <strong>{{ statusLabel }}</strong>
      </div>
    </article>

    <article class="invoice-status-overview__item">
      <span class="invoice-show-icon invoice-show-icon--info">
        <i class="pi pi-cloud-upload"></i>
      </span>
      <div>
        <p>{{ $t('invoice_show.export_status') }}</p>
        <strong>{{ `${exportStatusLabel === '1' ? 'Exported' : 'Not Exported'}` }}</strong>
      </div>
    </article>

    <article class="invoice-status-overview__item">
      <span class="invoice-show-icon invoice-show-icon--primary">
        <i class="pi pi-wallet"></i>
      </span>
      <div>
        <p>{{ $t('invoice_show.currency') }}</p>
        <strong>{{ currency }}</strong>
      </div>
    </article>
  </section>
</template>
