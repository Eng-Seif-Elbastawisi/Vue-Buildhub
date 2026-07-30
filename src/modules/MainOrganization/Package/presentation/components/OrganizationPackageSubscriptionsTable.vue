<script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import {
    getPackageSubscriptionStatusClass,
    getPackageSubscriptionStatusLabelKey,
  } from '@/modules/shared/Package/core/constants/package.subscription.status.enum';
  import AppTable, { type TableHeader } from '@/shared/HelpersComponents/AppTable.vue';
  import type OrganizationPackageSubscriptionModel from '../../core/models/organization.package.subscription.model';

  defineProps<{
    subscriptions: OrganizationPackageSubscriptionModel[];
  }>();

  const { locale } = useI18n();

  const subscriptionHeaders: TableHeader[] = [
    {
      key: 'id',
      label: 'id',
      width: '5rem',
    },
    {
      key: 'packageTitle',
      label: 'organization_packages.package',
    },
    {
      key: 'status',
      label: 'organization_packages.status',
      width: '9rem',
    },
    {
      key: 'notes',
      label: 'organization_packages.notes',
    },
    {
      key: 'created_at',
      label: 'organization_packages.subscription_date',
      width: '13rem',
    },
  ];

  const formatDateTime = (rawDateTime: string): string => {
    const normalizedDateTime = rawDateTime.trim();

    if (!normalizedDateTime) {
      return '-';
    }

    const subscriptionDate = new Date(normalizedDateTime.replace(' ', 'T'));

    if (Number.isNaN(subscriptionDate.getTime())) {
      return normalizedDateTime;
    }

    return new Intl.DateTimeFormat(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(subscriptionDate);
  };
</script>

<template>
  <AppTable :headers="subscriptionHeaders" :items="subscriptions" row-key="id" hoverable striped>
    <template #cell-status="{ item }">
      <span
        class="package-subscription-status"
        :class="getPackageSubscriptionStatusClass(item.status)"
      >
        {{ $t(getPackageSubscriptionStatusLabelKey(item.status)) }}
      </span>
    </template>

    <template #cell-notes="{ item }">
      {{ item.notes || '-' }}
    </template>

    <template #cell-created_at="{ item }">
      {{ formatDateTime(item.created_at) }}
    </template>
  </AppTable>
</template>

<style scoped lang="scss">
  .package-subscription-status {
    display: inline-flex;
    align-items: center;
    padding: 0.3rem 0.7rem;
    border-radius: var(--radius-full);
    font-family: 'Medium';
    font-size: var(--xs-size);
  }

  .package-subscription-status--pending {
    background: var(--warning-light);
    color: var(--warning-dark);
  }

  .package-subscription-status--confirmed {
    background: var(--success-light);
    color: var(--success-dark);
  }

  .package-subscription-status--rejected {
    background: var(--danger-light);
    color: var(--danger-dark);
  }
</style>
