<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';

  import { DiscountType } from '@/modules/shared/Package/core/constants/discount.type.enum';
  import {
    PackageSubscriptionStatus,
    getPackageSubscriptionStatusClass,
    getPackageSubscriptionStatusLabelKey,
  } from '@/modules/shared/Package/core/constants/package.subscription.status.enum';

  import type OrganizationPackageModel from '../../core/models/organization.package.model';
  import type OrganizationPackageSubscriptionModel from '../../core/models/organization.package.subscription.model';

  import {
    getDurationLabelKey,
    getEmployeesCount,
    getProjectsCount,
    getSubscriptionActionLabelKey,
    hasMobile,
    hasDifferentPackagePrice,
    hasPackageDiscount,
    hasPortal,
  } from '../composables/useOrganizationPackages';

  const props = defineProps<{
    packageOffer: OrganizationPackageModel;
    subscription: OrganizationPackageSubscriptionModel | null;
    subscribing: boolean;

    /**
     * True when the latest organization subscription is
     * pending or confirmed.
     */
    globalSubscriptionBlocked: boolean;

    /**
     * Prevent subscribing before fetch_package_subscriptions
     * finishes successfully.
     */
    subscriptionAccessReady: boolean;
  }>();

  const emit = defineEmits<{
    subscribe: [packageOffer: OrganizationPackageModel];
  }>();

  const { t } = useI18n();

  const employeesCount = computed(() => getEmployeesCount(props.packageOffer));

  const projectsCount = computed(() => getProjectsCount(props.packageOffer));

  const mobileAvailable = computed(() => hasMobile(props.packageOffer));

  const portalAvailable = computed(() => hasPortal(props.packageOffer));

  const showOriginalPrice = computed(() => hasDifferentPackagePrice(props.packageOffer));

  const discounted = computed(() => hasPackageDiscount(props.packageOffer));

  const subscribeDisabled = computed(() => {
    return props.subscribing || !props.subscriptionAccessReady || props.globalSubscriptionBlocked;
  });

  const isCurrentPackage = computed(
    () => props.subscription?.status === PackageSubscriptionStatus.CONFIRMED,
  );

  const actionLabelKey = computed(() => {
    if (!props.subscriptionAccessReady) {
      return 'organization_packages.checking_subscription_status';
    }

    /*
     * There is an active subscription for another package,
     * so this package cannot be selected.
     */
    if (props.globalSubscriptionBlocked && !props.subscription) {
      return 'organization_packages.another_subscription_exists';
    }

    /*
     * Current package subscription:
     * pending   => subscription_pending
     * confirmed => current_package
     * rejected  => subscribe_again
     * null      => subscribe_now
     */
    return getSubscriptionActionLabelKey(props.subscription);
  });

  const durationLabel = computed(() => {
    return t(getDurationLabelKey(props.packageOffer.duration_type, props.packageOffer.duration), {
      count: props.packageOffer.duration,
    });
  });

  const statusLabelKey = computed(() => {
    if (!props.subscription) {
      return null;
    }

    return getPackageSubscriptionStatusLabelKey(props.subscription.status);
  });

  const statusClass = computed(() => {
    if (!props.subscription) {
      return '';
    }

    return getPackageSubscriptionStatusClass(props.subscription.status);
  });

  const discountLabel = computed(() => {
    if (!discounted.value) {
      return '';
    }

    const translationKey =
      props.packageOffer.discount_type === DiscountType.PERCENTAGE
        ? 'organization_packages.percentage_off'
        : 'organization_packages.fixed_amount_off';

    return t(translationKey, {
      value: props.packageOffer.discount_value,
      currency: t('organization_packages.currency'),
    });
  });

  const availabilityLabel = (available: boolean): string => {
    return t(available ? 'organization_packages.available' : 'organization_packages.not_available');
  };

  const handleSubscribe = (): void => {
    if (subscribeDisabled.value) {
      return;
    }

    emit('subscribe', props.packageOffer);
  };
</script>

<template>
  <article
    class="organization-package-card"
    :class="{
      'organization-package-card--disabled': globalSubscriptionBlocked || !subscriptionAccessReady,
    }"
  >
    <header class="organization-package-card__header">
      <div class="organization-package-card__heading">
        <h3 :title="packageOffer.title">
          {{ packageOffer.title || '-' }}
        </h3>

        <span v-if="discounted" class="organization-package-card__discount">
          {{ discountLabel }}
        </span>
      </div>

      <span
        v-if="subscription && statusLabelKey"
        class="organization-package-card__status"
        :class="statusClass"
      >
        {{ $t(statusLabelKey) }}
      </span>
    </header>

    <div class="organization-package-card__price">
      <span v-if="showOriginalPrice" class="organization-package-card__original-price">
        <span> {{ $t('organization_packages.original_price') }}: </span>

        <s>
          {{ packageOffer.price }}
          {{ $t('organization_packages.currency') }}
        </s>
      </span>

      <span class="organization-package-card__price-label">
        {{ $t('organization_packages.final_price') }}
      </span>

      <strong>
        {{ packageOffer.price_after_discount }}

        <small>
          {{ $t('organization_packages.currency') }}
        </small>
      </strong>

      <span class="organization-package-card__duration">
        <i class="pi pi-calendar" aria-hidden="true" />

        {{ durationLabel }}
      </span>
    </div>

    <ul class="organization-package-card__features">
      <li>
        <span>
          <i class="pi pi-users" aria-hidden="true" />

          {{ $t('organization_packages.number_of_employees') }}
        </span>

        <strong>
          {{ employeesCount }}
        </strong>
      </li>

      <li>
        <span>
          <i class="pi pi-briefcase" aria-hidden="true" />

          {{ $t('organization_packages.number_of_projects') }}
        </span>

        <strong>
          {{ projectsCount }}
        </strong>
      </li>

      <li>
        <span>
          <i class="pi pi-mobile" aria-hidden="true" />

          {{ $t('organization_packages.mobile_application') }}
        </span>

        <strong :class="mobileAvailable ? 'feature-available' : 'feature-unavailable'">
          <i
            :class="mobileAvailable ? 'pi pi-check-circle' : 'pi pi-times-circle'"
            aria-hidden="true"
          />

          {{ availabilityLabel(mobileAvailable) }}
        </strong>
      </li>

      <li>
        <span>
          <i class="pi pi-desktop" aria-hidden="true" />

          {{ $t('organization_packages.web_portal') }}
        </span>

        <strong :class="portalAvailable ? 'feature-available' : 'feature-unavailable'">
          <i
            :class="portalAvailable ? 'pi pi-check-circle' : 'pi pi-times-circle'"
            aria-hidden="true"
          />

          {{ availabilityLabel(portalAvailable) }}
        </strong>
      </li>
    </ul>

    <button
      type="button"
      class="btn btn-primary organization-package-card__action"
      :class="{ 'organization-package-card__action--current': isCurrentPackage }"
      :disabled="subscribeDisabled"
      @click="handleSubscribe"
    >
      <i v-if="subscribing" class="pi pi-spinner pi-spin" aria-hidden="true" />

      {{ $t(actionLabelKey) }}
    </button>
  </article>
</template>

<style scoped lang="scss">
.organization-package-card {
  display: flex;
  height: 100%;
  min-width: 0;
  flex-direction: column;
  padding: 1.5rem;
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-lg);
  background: var(--bg-card);
  box-shadow: none;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
}

.organization-package-card:hover {
  border-color: var(--PrimaryColor);
  box-shadow: none;
  transform: translateY(-0.25rem);
}

.organization-package-card--disabled {
  opacity: 0.78;
}

.organization-package-card--disabled:hover {
  border-color: var(--border-weak);
  box-shadow: none;
  transform: none;
}

.organization-package-card__header,
.organization-package-card__heading,
.organization-package-card__price {
  display: flex;
}

.organization-package-card__header {
  min-height: 4.75rem;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.organization-package-card__heading,
.organization-package-card__price {
  min-width: 0;
  flex-direction: column;
}

.organization-package-card__heading {
  align-items: flex-start;
  gap: 0.5rem;
}

.organization-package-card__heading h3 {
  display: -webkit-box;
  overflow: hidden;
  margin: 0;
  color: var(--gray-900);
  font-family: 'Bold';
  font-size: var(--xl-size-base);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow-wrap: anywhere;
}

.organization-package-card__discount,
.organization-package-card__status {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-full);
  font-family: 'Medium';
  font-size: var(--xs-size-2);
  white-space: nowrap;
}

.organization-package-card__discount {
  background: var(--PrimaryColor-light);
  color: var(--PrimaryColor);
}

.organization-package-card__status.package-subscription-status--pending {
  background: var(--warning-light);
  color: var(--warning-dark);
}

.organization-package-card__status.package-subscription-status--confirmed {
  background: var(--success-light);
  color: var(--success-dark);
}

.organization-package-card__status.package-subscription-status--rejected {
  background: var(--danger-light);
  color: var(--danger-dark);
}

.organization-package-card__price {
  gap: 0.35rem;
  padding-block: 1.25rem;
  border-block: 1px solid var(--border-weak);
}

.organization-package-card__original-price {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--gray-500);
  font-size: var(--sm-size);
}

.organization-package-card__price-label {
  color: var(--gray-600);
  font-size: var(--xs-size);
}

.organization-package-card__price > strong {
  color: var(--PrimaryColor);
  font-family: 'Bold';
  font-size: clamp(1.65rem, 3vw, 2.2rem);
  line-height: 1.2;
}

.organization-package-card__price small {
  font-family: 'Medium';
  font-size: var(--xs-size);
}

.organization-package-card__duration {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--gray-600);
  font-size: var(--sm-size);
}

.organization-package-card__features {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1.25rem 0;
  margin: 0;
  list-style: none;
}

.organization-package-card__features li,
.organization-package-card__features span,
.organization-package-card__features strong {
  display: flex;
  align-items: center;
}

.organization-package-card__features li {
  justify-content: space-between;
  gap: 1rem;
  color: var(--gray-700);
}

.organization-package-card__features span,
.organization-package-card__features strong {
  gap: 0.5rem;
}

.organization-package-card__features span {
  min-width: 0;
}

.organization-package-card__features strong {
  flex-shrink: 0;
  color: var(--gray-900);
  font-family: 'Medium';
  font-size: var(--sm-size);
}

.organization-package-card__features .feature-available {
  color: var(--success);
}

.organization-package-card__features .feature-unavailable {
  color: var(--danger);
}

.organization-package-card__action {
  width: 100%;
  min-height: 2.75rem;
}

.organization-package-card__action--current,
.organization-package-card__action--current:hover {
  border-color: var(--success);
  background: var(--success);
  color: var(--BgWhite);
}

@media (prefers-reduced-motion: reduce) {
  .organization-package-card {
    transition: none;
  }

  .organization-package-card:hover {
    transform: none;
  }
}
</style>
