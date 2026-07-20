<script setup lang="ts">
  import notesPencilIcon from '@/assets/images/notes-pencil-icon.png';

  defineProps<{
    notes?: string | null;
  }>();
</script>

<template>
  <section class="invoice-show-card invoice-notes-card">
    <div class="invoice-show-card__header">
      <span class="invoice-notes-card__icon invoice-show-asset-icon">
        <img :src="notesPencilIcon" alt="" aria-hidden="true" />
      </span>
      <h2>{{ $t('invoice.notes') }}</h2>
    </div>

    <p class="invoice-notes-card__body">
      {{ notes || $t('invoice_show.no_notes') }}
    </p>
  </section>
</template>
