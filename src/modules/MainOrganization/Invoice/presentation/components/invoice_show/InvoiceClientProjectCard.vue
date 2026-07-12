<script setup lang="ts">
  defineProps<{
    clientName: string;
    clientPhone: string;
    clientEmail: string;
    projectName: string;
    organizationName: string;
    createdByName: string;
  }>();
</script>

<template>
  <section class="invoice-show-card invoice-client-project-card">
    <div class="invoice-show-card__header">
      <span class="invoice-show-icon invoice-show-icon--primary">
        <i class="pi pi-briefcase"></i>
      </span>
      <h2>{{ $t('invoice_show.client_project') }}</h2>
    </div>

    <div class="invoice-client-project-card__grid">
      <article class="invoice-client-project-card__entity">
        <span class="invoice-show-avatar">
          <i class="pi pi-user"></i>
        </span>
        <div>
          <p>{{ $t('invoice_show.client') }}</p>
          <strong>{{ clientName }}</strong>
          <small>{{ clientPhone }}</small>
          <small>{{ clientEmail }}</small>
        </div>
      </article>

      <article class="invoice-client-project-card__entity">
        <span class="invoice-show-avatar">
          <i class="pi pi-building"></i>
        </span>
        <div>
          <p>{{ $t('invoice.project') }}</p>
          <strong>{{ projectName }}</strong>
          <small>{{ organizationName }}</small>
          <small>{{ createdByName }}</small>
        </div>
      </article>
    </div>
  </section>
</template>
