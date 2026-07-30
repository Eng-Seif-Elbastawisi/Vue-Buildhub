<script setup lang="ts">
  import { computed, onMounted } from 'vue';

  import Skeleton from 'primevue/skeleton';

  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';

  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import TableSkelaton from '@/shared/HelpersComponents/TableSkelaton.vue';

  import type OrganizationPackageModel from '../../core/models/organization.package.model';
  import type OrganizationPackageSubscriptionModel from '../../core/models/organization.package.subscription.model';

  import OrganizationPackagesGrid from './OrganizationPackagesGrid.vue';
  import OrganizationPackageSubscriptionDialog from './OrganizationPackageSubscriptionDialog.vue';
  import OrganizationPackageSubscriptionsTable from './OrganizationPackageSubscriptionsTable.vue';

  import {
    blocksNewSubscription,
    useOrganizationPackages,
  } from '../composables/useOrganizationPackages';

  const {
    packagesState,
    subscriptionsState,
    packages,
    subscriptions,
    selectedPackage,
    subscriptionDialogVisible,
    subscribing,
    fetchPackages,
    fetchPackageSubscriptions,
    initialize,
    openSubscriptionDialog,
    closeSubscriptionDialog,
    confirmSubscription,
  } = useOrganizationPackages();

  const subscriptionColumnCount = 5;

  /**
   * Packages must remain disabled until fetching the organization's
   * subscriptions succeeds.
   *
   * This prevents subscribing while the application does not yet know
   * whether an active pending/confirmed subscription already exists.
   */
  const subscriptionAccessReady = computed(() => {
    return subscriptionsState.value instanceof DataSuccess;
  });

  const latestOrganizationSubscription =
    computed<OrganizationPackageSubscriptionModel | null>(() => {
      if (subscriptions.value.length === 0) {
        return null;
      }

      return subscriptions.value.reduce(
        (
          latestSubscription,
          currentSubscription,
        ) => {
          return Number(currentSubscription.id) >
            Number(latestSubscription.id)
            ? currentSubscription
            : latestSubscription;
        },
      );
    });

  const globalSubscriptionBlocked = computed(() => {
    return blocksNewSubscription(
      latestOrganizationSubscription.value,
    );
  });

  /**
   * Extra guard in the parent.
   *
   * Even if a child component incorrectly emits the subscribe event,
   * the dialog will not open while another subscription is pending
   * or confirmed.
   */
  const handleOpenSubscriptionDialog = (
    packageOffer: OrganizationPackageModel,
  ): void => {
    if (
      subscribing.value ||
      !subscriptionAccessReady.value ||
      globalSubscriptionBlocked.value
    ) {
      return;
    }

    openSubscriptionDialog(packageOffer);
  };

  onMounted(async () => {
    await initialize();
  });
</script>

<template>
  <main class="organization-packages-page">
    <header class="organization-packages-page__header">
      <span class="organization-packages-page__eyebrow">
        {{ $t('organization_packages.packages') }}
      </span>

      <h1>
        {{ $t('organization_packages.available_packages') }}
      </h1>

      <p>
        {{ $t('organization_packages.choose_your_package') }}
      </p>
    </header>

    <section
      class="organization-packages-page__section"
      aria-labelledby="available-packages-title"
    >
      <h2
        id="available-packages-title"
        class="sr-only"
      >
        {{ $t('organization_packages.available_packages') }}
      </h2>

      <DataStatusBuilder
        :controller="packagesState"
        :on-retry="fetchPackages"
      >
        <template #success>
          <OrganizationPackagesGrid
            v-if="packages.length > 0"
            :packages="packages"
            :subscriptions="subscriptions"
            :subscribing="subscribing"
            :subscription-access-ready="
              subscriptionAccessReady
            "
            @subscribe="handleOpenSubscriptionDialog"
          />

          <div
            v-else
            class="organization-packages-empty"
          >
            <i
              class="pi pi-box"
              aria-hidden="true"
            />

            <h3>
              {{ $t('organization_packages.no_packages_found') }}
            </h3>
          </div>
        </template>

        <template #empty>
          <div class="organization-packages-empty">
            <i
              class="pi pi-box"
              aria-hidden="true"
            />

            <h3>
              {{ $t('organization_packages.no_packages_found') }}
            </h3>
          </div>
        </template>

        <template #failed="{ error }">
          <div
            class="organization-packages-error"
            role="alert"
          >
            <i
              class="pi pi-exclamation-circle"
              aria-hidden="true"
            />

            <p>
              {{
                error?.displayMessage ||
                $t(
                  'organization_packages.fetch_packages_failed',
                )
              }}
            </p>

            <button
              type="button"
              class="btn btn-secondary"
              @click="fetchPackages"
            >
              {{ $t('try_again') }}
            </button>
          </div>
        </template>

        <template #loader>
          <div
            class="organization-packages-skeleton"
            aria-hidden="true"
          >
            <article
              v-for="skeletonIndex in 3"
              :key="skeletonIndex"
            >
              <Skeleton
                width="70%"
                height="1.5rem"
              />

              <Skeleton
                width="35%"
                height="0.85rem"
              />

              <Skeleton
                width="55%"
                height="2.5rem"
              />

              <Skeleton
                v-for="featureIndex in 4"
                :key="featureIndex"
                height="1rem"
              />

              <Skeleton height="2.75rem" />
            </article>
          </div>
        </template>
      </DataStatusBuilder>
    </section>

    <section
      class="
        organization-packages-page__section
        organization-packages-page__history
      "
      aria-labelledby="package-subscriptions-title"
    >
      <div class="organization-packages-page__section-header">
        <div>
          <h2 id="package-subscriptions-title">
            {{
              $t(
                'organization_packages.my_package_subscriptions',
              )
            }}
          </h2>

          <p>
            {{
              $t(
                'organization_packages.subscriptions_description',
              )
            }}
          </p>
        </div>

        <button
          type="button"
          class="btn btn-secondary"
          :aria-label="
            $t(
              'organization_packages.refresh_subscriptions',
            )
          "
          @click="fetchPackageSubscriptions"
        >
          <i
            class="pi pi-refresh"
            aria-hidden="true"
          />

          {{ $t('organization_packages.refresh') }}
        </button>
      </div>

      <DataStatusBuilder
        :controller="subscriptionsState"
        :on-retry="fetchPackageSubscriptions"
      >
        <template #success>
          <OrganizationPackageSubscriptionsTable
            v-if="subscriptions.length > 0"
            :subscriptions="subscriptions"
          />

          <div
            v-else
            class="
              organization-packages-empty
              organization-packages-empty--compact
            "
          >
            <i
              class="pi pi-inbox"
              aria-hidden="true"
            />

            <h3>
              {{
                $t(
                  'organization_packages.no_subscriptions_found',
                )
              }}
            </h3>
          </div>
        </template>

        <template #empty>
          <div
            class="
              organization-packages-empty
              organization-packages-empty--compact
            "
          >
            <i
              class="pi pi-inbox"
              aria-hidden="true"
            />

            <h3>
              {{
                $t(
                  'organization_packages.no_subscriptions_found',
                )
              }}
            </h3>
          </div>
        </template>

        <template #failed="{ error }">
          <div
            class="organization-packages-error"
            role="alert"
          >
            <i
              class="pi pi-exclamation-circle"
              aria-hidden="true"
            />

            <p>
              {{
                error?.displayMessage ||
                $t(
                  'organization_packages.fetch_subscriptions_failed',
                )
              }}
            </p>

            <button
              type="button"
              class="btn btn-secondary"
              @click="fetchPackageSubscriptions"
            >
              {{ $t('try_again') }}
            </button>
          </div>
        </template>

        <template #loader>
          <TableSkelaton
            :rows="5"
            :columns="subscriptionColumnCount"
            :has-actions="false"
            :show-index="false"
            :selectable="false"
          />
        </template>
      </DataStatusBuilder>
    </section>

    <OrganizationPackageSubscriptionDialog
      :model-value="subscriptionDialogVisible"
      :package-offer="selectedPackage"
      :loading="subscribing"
      @update:model-value="closeSubscriptionDialog"
      @confirm="confirmSubscription"
    />
  </main>
</template>

<style scoped lang="scss">
  .organization-packages-page {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .organization-packages-page__header {
    padding: clamp(1.25rem, 3vw, 2rem);
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-lg);
    background: var(--bg-card);
    box-shadow: var(--shadow-sm);
  }

  .organization-packages-page__header h1,
  .organization-packages-page__header p,
  .organization-packages-page__section-header h2,
  .organization-packages-page__section-header p,
  .organization-packages-empty h3,
  .organization-packages-error p {
    margin: 0;
  }

  .organization-packages-page__eyebrow {
    display: inline-flex;
    padding: 0.25rem 0.65rem;
    margin-block-end: 0.75rem;
    border-radius: var(--radius-full);
    background: var(--PrimaryColor-light);
    color: var(--PrimaryColor);
    font-family: 'Medium';
    font-size: var(--xs-size);
  }

  .organization-packages-page__header h1 {
    color: var(--gray-900);
    font-family: 'Bold';
    font-size: clamp(1.5rem, 4vw, 2.25rem);
  }

  .organization-packages-page__header p,
  .organization-packages-page__section-header p {
    margin-block-start: 0.35rem;
    color: var(--gray-600);
  }

  .organization-packages-page__section {
    min-width: 0;
  }

  .organization-packages-skeleton {
    display: grid;
    grid-template-columns: repeat(
      3,
      minmax(0, 1fr)
    );
    gap: 1.25rem;
  }

  .organization-packages-skeleton article {
    display: flex;
    min-height: 25rem;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-lg);
    background: var(--bg-card);
  }

  .organization-packages-skeleton article > :last-child {
    margin-block-start: auto;
  }

  .organization-packages-page__history {
    padding: clamp(1rem, 2.5vw, 1.5rem);
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-lg);
    background: var(--bg-card);
    box-shadow: var(--shadow-sm);
  }

  .organization-packages-page__section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-block-end: 1.25rem;
  }

  .organization-packages-page__section-header h2 {
    color: var(--gray-900);
    font-family: 'Bold';
    font-size: var(--xl-size-1);
  }

  .organization-packages-empty,
  .organization-packages-error {
    display: flex;
    min-height: 14rem;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 0.75rem;
    padding: 2rem;
    border: 1px dashed var(--border-strong);
    border-radius: var(--radius-lg);
    background: var(--gray-50);
    color: var(--gray-600);
    text-align: center;
  }

  .organization-packages-empty--compact {
    min-height: 10rem;
  }

  .organization-packages-empty > i,
  .organization-packages-error > i {
    color: var(--PrimaryColor);
    font-size: 2rem;
  }

  .organization-packages-empty h3 {
    color: var(--gray-800);
    font-family: 'Bold';
  }

  .organization-packages-error > i,
  .organization-packages-error p {
    color: var(--danger);
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    padding: 0;
    border: 0;
    margin: -1px;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
  }

  @media (max-width: 640px) {
    .organization-packages-page__section-header {
      align-items: stretch;
      flex-direction: column;
    }

    .organization-packages-page__section-header .btn {
      width: 100%;
    }

    .organization-packages-skeleton {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @media (min-width: 641px) and (max-width: 1024px) {
    .organization-packages-skeleton {
      grid-template-columns: repeat(
        2,
        minmax(0, 1fr)
      );
    }
  }
</style>