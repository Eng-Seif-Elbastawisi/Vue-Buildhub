<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
  import { onBeforeRouteLeave, onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router';
  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import ProjectWorkspaceNav from '../../../presentation/components/ProjectWorkspaceNav.vue';
  import { validId } from '../../../Schedule/core/constants/schedule.constants';
  import { quotePath } from '../../../Schedule/presentation/schedule.routes';
  import { priorityKey, statusKey } from '../../core/constants/purchase-request.constants';
  import PurchaseRequestController from '../controllers/purchase-request.controller';
  import PurchaseRequestPricesController from '../controllers/purchase-request-prices.controller';
  import { procurementPath, purchaseOrderCreatePath } from '../procurement.routes';
  import ProcurementDiscardConfirmation from './ProcurementDiscardConfirmation.vue';
  import SupplierPriceOffersForm from './SupplierPriceOffersForm.vue';
  import '../styles/procurement.scss';

  const route = useRoute();
  const router = useRouter();
  const requests = PurchaseRequestController.getInstance();
  const prices = PurchaseRequestPricesController.getInstance();
  const quoteId = computed(() => Number(route.params.id));
  const requestId = computed(() => Number(route.params.purchaseRequestId));
  const request = computed(() =>
    requests.listState.value.data?.find(
      (item) => item.id === requestId.value && item.quoteId === quoteId.value,
    ),
  );
  const projectUrl = computed(() => quotePath(route.path, quoteId.value));
  const procurementUrl = computed(() => procurementPath(route.path, quoteId.value));
  const returnUrl = computed(() =>
    route.query.returnTo === 'order'
      ? {
          path: purchaseOrderCreatePath(route.path, quoteId.value),
          query: { requestId: String(requestId.value) },
        }
      : { path: procurementUrl.value, query: { requestId: String(requestId.value) } },
  );
  const discardVisible = ref(false);
  const leaveApproved = ref(false);
  let leaveResolver: ((allowed: boolean) => void) | undefined;
  let loadSequence = 0;

  async function load() {
    const sequence = ++loadSequence;
    const id = quoteId.value;
    const selectedId = requestId.value;
    prices.release();
    if (!validId(id) || !validId(selectedId)) return;
    requests.activate(id);
    const result = await requests.fetchList();
    if (sequence !== loadSequence || !(result instanceof DataSuccess) || !request.value) return;
    if (prices.activate(id, selectedId)) await prices.fetchList();
  }
  watch(
    [quoteId, requestId],
    () => {
      leaveApproved.value = false;
      void load();
    },
    { immediate: true },
  );
  function requestLeave(): Promise<boolean> {
    if (prices.isSyncing.value) return Promise.resolve(false);
    if (
      leaveApproved.value ||
      !prices.dirty.value ||
      (prices.confirmedSync.value && prices.refreshRequired.value)
    )
      return Promise.resolve(true);
    if (leaveResolver) return Promise.resolve(false);
    discardVisible.value = true;
    return new Promise((resolve) => {
      leaveResolver = resolve;
    });
  }
  function resolveLeave(allowed: boolean) {
    discardVisible.value = false;
    if (allowed) {
      leaveApproved.value = true;
      prices.discardDraft();
    }
    leaveResolver?.(allowed);
    leaveResolver = undefined;
  }
  function beforeUnload(event: BeforeUnloadEvent) {
    if (
      !prices.dirty.value ||
      leaveApproved.value ||
      (prices.confirmedSync.value && prices.refreshRequired.value)
    )
      return;
    event.preventDefault();
    event.returnValue = '';
  }
  onBeforeRouteLeave(requestLeave);
  onBeforeRouteUpdate(requestLeave);
  onMounted(() => window.addEventListener('beforeunload', beforeUnload));
  onBeforeUnmount(() => {
    loadSequence++;
    window.removeEventListener('beforeunload', beforeUnload);
    leaveResolver?.(false);
    prices.release();
    requests.release();
  });
  function goBack() {
    void router.push(returnUrl.value);
  }
  function afterSaved() {
    leaveApproved.value = true;
    void router.replace(returnUrl.value);
  }
</script>
<template>
  <section
    class="procurement procurement-create supplier-prices-manage standard-crud-page"
    :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'"
  >
    <p v-if="!validId(quoteId) || !validId(requestId)" role="alert">
      {{ $t('procurement.invalid_quote') }}
    </p>
    <template v-else>
      <ProjectWorkspaceNav :quote-id="quoteId" active="procurement" />
      <nav
        class="procurement-create__breadcrumbs"
        :aria-label="$t('procurement.offers.page_title')"
      >
        <RouterLink :to="projectUrl">{{ $t('procurement.back_to_project') }}</RouterLink>
        <span aria-hidden="true">/</span>
        <RouterLink :to="procurementUrl">{{ $t('procurement.title') }}</RouterLink>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{{ $t('procurement.offers.page_title') }}</span>
      </nav>
      <header class="procurement-header procurement-intro">
        <div class="procurement-intro-copy">
          <h1>{{ $t('procurement.offers.page_title') }}</h1>
          <p>{{ $t('procurement.offers.page_description', { id: requestId }) }}</p>
        </div>
        <AppButton
          type="button"
          theme="secondary"
          :disabled="prices.isSyncing.value"
          @click="goBack"
          >{{
            $t(
              route.query.returnTo === 'order'
                ? 'procurement.offers.back_to_order'
                : 'procurement.back_to_procurement',
            )
          }}</AppButton
        >
      </header>
      <section class="procurement-panel" aria-labelledby="supplier-request-heading">
        <header class="procurement-header procurement-section-header">
          <h2 id="supplier-request-heading">{{ $t('procurement.orders.request_section') }}</h2>
        </header>
        <p v-if="requests.listState.value.isLoading" role="status">{{ $t('loading') }}</p>
        <div v-else-if="requests.listState.value.hasError" role="alert">
          <p>
            {{ $t(requests.listState.value.error?.title ?? 'procurement.offers.fetch_failed') }}
          </p>
          <AppButton type="button" theme="secondary" @click="load">{{
            $t('procurement.offers.retry_fetch')
          }}</AppButton>
        </div>
        <p v-else-if="!request" role="alert">{{ $t('procurement.offers.request_unavailable') }}</p>
        <dl v-else class="procurement-create__summary supplier-prices-summary">
          <div>
            <dt>{{ $t('procurement.request_id') }}</dt>
            <dd>
              <bdi>#{{ request.id }}</bdi>
            </dd>
          </div>
          <div>
            <dt>{{ $t('procurement.assigned_employee') }}</dt>
            <dd>{{ request.assignedEmployee?.name ?? $t('procurement.unavailable') }}</dd>
          </div>
          <div>
            <dt>{{ $t('procurement.priority') }}</dt>
            <dd>{{ $t(priorityKey(request.priority)) }}</dd>
          </div>
          <div>
            <dt>{{ $t('procurement.status') }}</dt>
            <dd>{{ $t(statusKey(request.status)) }}</dd>
          </div>
        </dl>
      </section>
      <SupplierPriceOffersForm
        v-if="request && prices.purchaseRequestId.value === requestId"
        @cancel="goBack"
        @saved="afterSaved"
      />
      <div v-else class="procurement-actions procurement-create__actions">
        <AppButton type="button" theme="secondary" @click="goBack">{{
          $t('procurement.cancel')
        }}</AppButton>
      </div>
      <ProcurementDiscardConfirmation
        :visible="discardVisible"
        @keep="resolveLeave(false)"
        @discard="resolveLeave(true)"
      />
    </template>
  </section>
</template>
