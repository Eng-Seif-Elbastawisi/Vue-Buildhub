<script setup lang="ts">
  import { computed } from 'vue';

  import type OrganizationPackageModel from '../../core/models/organization.package.model';
  import type OrganizationPackageSubscriptionModel from '../../core/models/organization.package.subscription.model';

  import { blocksNewSubscription } from '../composables/useOrganizationPackages';

  import OrganizationPackageCard from './OrganizationPackageCard.vue';

  const props = defineProps<{
    packages: OrganizationPackageModel[];
    subscriptions: OrganizationPackageSubscriptionModel[];
    subscribing: boolean;
    subscriptionAccessReady: boolean;
  }>();

  const emit = defineEmits<{
    subscribe: [packageOffer: OrganizationPackageModel];
  }>();

  /**
   * The business rule depends on the latest organization
   * subscription, not the latest subscription for each package.
   */
  const latestOrganizationSubscription = computed<OrganizationPackageSubscriptionModel | null>(
    () => {
      if (props.subscriptions.length === 0) {
        return null;
      }

      return props.subscriptions.reduce((latestSubscription, currentSubscription) => {
        return Number(currentSubscription.id) > Number(latestSubscription.id)
          ? currentSubscription
          : latestSubscription;
      });
    },
  );

  /**
   * Pending or confirmed blocks subscribing to every package.
   * Rejected does not block a new subscription.
   */
  const globalSubscriptionBlocked = computed(() => {
    return blocksNewSubscription(latestOrganizationSubscription.value);
  });

  /**
   * Only show the current/latest organization subscription
   * on the related package card.
   *
   * This prevents old historical subscriptions from incorrectly
   * disabling individual cards.
   */
  const currentSubscriptionForPackage = (
    packageId: number,
  ): OrganizationPackageSubscriptionModel | null => {
    const latestSubscription = latestOrganizationSubscription.value;

    if (!latestSubscription) {
      return null;
    }

    if (Number(latestSubscription.package.id) !== Number(packageId)) {
      return null;
    }

    return latestSubscription;
  };

  const handleSubscribe = (packageOffer: OrganizationPackageModel): void => {
    if (props.subscribing || !props.subscriptionAccessReady || globalSubscriptionBlocked.value) {
      return;
    }

    emit('subscribe', packageOffer);
  };
</script>

<template>
  <div class="organization-packages-grid">
    <OrganizationPackageCard
      v-for="packageOffer in packages"
      :key="packageOffer.id"
      :package-offer="packageOffer"
      :subscription="currentSubscriptionForPackage(packageOffer.id)"
      :subscribing="subscribing"
      :global-subscription-blocked="globalSubscriptionBlocked"
      :subscription-access-ready="subscriptionAccessReady"
      @subscribe="handleSubscribe"
    />
  </div>
</template>

<style scoped lang="scss">
  .organization-packages-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.25rem;
  }

  @media (max-width: 1024px) {
    .organization-packages-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    .organization-packages-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
