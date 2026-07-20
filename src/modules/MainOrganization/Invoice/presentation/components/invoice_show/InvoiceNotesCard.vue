<script setup lang="ts">
  import NotesPencilIllustration from './NotesPencilIllustration.vue';

  defineProps<{
    notes?: string | null;
  }>();
</script>

<template>
  <section class="invoice-show-card invoice-notes-card">
    <div class="invoice-show-card__header">
      <span class="invoice-notes-card__icon">
        <i class="pi pi-file-edit" aria-hidden="true"></i>
      </span>
      <h2>{{ $t('invoice.notes') }}</h2>
    </div>

    <div class="invoice-notes-card__content">
      <p class="invoice-notes-card__body">
        {{ notes || $t('invoice_show.no_notes') }}
      </p>
      <NotesPencilIllustration :size="150" />
    </div>
  </section>
</template>
