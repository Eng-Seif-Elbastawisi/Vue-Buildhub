<script setup lang="ts">
  defineProps<{
    notes?: string | null;
  }>();
</script>

<template>
  <section class="invoice-show-card invoice-notes-card">
    <div class="invoice-show-card__header">
      <span class="invoice-show-icon invoice-show-icon--primary">
        <i class="pi pi-comment"></i>
      </span>
      <h2>{{ $t('invoice.notes') }}</h2>
    </div>

    <p class="invoice-notes-card__body">
      {{ notes || $t('invoice_show.no_notes') }}
    </p>
  </section>
</template>
