<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref, unref, watch } from 'vue';
  import { onBeforeRouteLeave, onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import TitleInterface from '@/base/Data/Models/titleInterface';
  import {
    DataLoading,
    DataSuccess,
  } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import ProjectWorkspaceNav from '../../../presentation/components/ProjectWorkspaceNav.vue';
  import { validId } from '../../../Schedule/core/constants/schedule.constants';
  import { quotePath } from '../../../Schedule/presentation/schedule.routes';
  import { statusKey } from '../../core/constants/purchase-request.constants';
  import { procurementPath, supplierPricesPath } from '../procurement.routes';
  import PurchaseRequestController from '../controllers/purchase-request.controller';
  import PurchaseOrderController from '../controllers/purchase.order.controller';
  import PurchaseOrderForm from './PurchaseOrderForm.vue';
  import ProcurementDiscardConfirmation from './ProcurementDiscardConfirmation.vue';
  import '../styles/procurement.scss';

  const route = useRoute();
  const router = useRouter();
  const { t } = useI18n();
  const requests = PurchaseRequestController.getInstance();
  const orders = PurchaseOrderController.getInstance();
  const quoteId = computed(() => Number(route.params.id));
  const requestId = computed(() => Number(route.query.requestId));
  const offerId = computed(() => Number(route.query.offerId));
  const readyRequestId = ref<number | null>(null);
  const orderForm = ref<InstanceType<typeof PurchaseOrderForm> | null>(null);
  const discardVisible = ref(false);
  const leaveApproved = ref(false);
  const hasChanges = computed(() => Boolean(unref(orderForm.value?.dirty)));
  const processing = computed(() => Boolean(unref(orderForm.value?.processing)));
  let leaveResolver: ((allowed: boolean) => void) | undefined;
  const requestOptions = computed(() =>
    (requests.listState.value.data ?? []).map(
      (request) =>
        new TitleInterface({
          id: request.id,
          title: t('procurement.offers.request_reference', { id: request.id }),
        }),
    ),
  );
  const selectedRequest = computed(
    () =>
      requestOptions.value.find((option) => option.id === requestId.value) ??
      (readyRequestId.value === requestId.value
        ? new TitleInterface({
            id: requestId.value,
            title: t('procurement.offers.request_reference', { id: requestId.value }),
          })
        : null),
  );
  const selectedRequestRecord = computed(() =>
    requests.listState.value.data?.find((request) => request.id === requestId.value),
  );
  const procurementUrl = computed(() => procurementPath(route.path, quoteId.value));
  const projectUrl = computed(() => quotePath(route.path, quoteId.value));

  watch(
    quoteId,
    (id) => {
      readyRequestId.value = null;
      requests.activate(id);
      if (validId(id)) void requests.fetchList();
    },
    { immediate: true },
  );
  watch(
    [requestId, () => requests.listState.value],
    ([id, state]) => {
      if (state instanceof DataSuccess)
        readyRequestId.value = state.data?.some((request) => request.id === id) ? id : null;
      else if (readyRequestId.value !== id) readyRequestId.value = null;
    },
    { immediate: true },
  );
  watch([quoteId, requestId], () => {
    leaveApproved.value = false;
  });
  function requestLeave(): Promise<boolean> {
    if (orders.isIssuing.value || processing.value) return Promise.resolve(false);
    if (leaveApproved.value || !hasChanges.value) return Promise.resolve(true);
    if (leaveResolver) return Promise.resolve(false);
    discardVisible.value = true;
    return new Promise((resolve) => {
      leaveResolver = resolve;
    });
  }
  function resolveLeave(allowed: boolean) {
    discardVisible.value = false;
    if (allowed) leaveApproved.value = true;
    leaveResolver?.(allowed);
    leaveResolver = undefined;
  }
  function beforeUnload(event: BeforeUnloadEvent) {
    if (!hasChanges.value || leaveApproved.value) return;
    event.preventDefault();
    event.returnValue = '';
  }
  onBeforeRouteLeave(requestLeave);
  onBeforeRouteUpdate(requestLeave);
  onMounted(() => window.addEventListener('beforeunload', beforeUnload));
  onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', beforeUnload);
    leaveResolver?.(false);
    requests.release();
  });

  function selectRequest(
    option: TitleInterface<string | number> | TitleInterface<string | number>[] | null,
  ) {
    const selected = Array.isArray(option) ? null : option;
    void router.replace({
      path: route.path,
      query: selected ? { requestId: String(selected.id) } : {},
    });
  }
  function returnToProcurement() {
    void router.push({
      path: procurementUrl.value,
      query: selectedRequest.value ? { requestId: String(requestId.value) } : {},
    });
  }
  function manageOffers() {
    void router.push({
      path: supplierPricesPath(route.path, quoteId.value, requestId.value),
      query: { returnTo: 'order' },
    });
  }
  function afterCreated() {
    leaveApproved.value = true;
    void router.replace({
      path: procurementUrl.value,
      query: { requestId: String(requestId.value) },
    });
  }
</script>
<template>
  <section
    class="procurement procurement-create purchase-order-create standard-crud-page"
    :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'"
  >
    <p v-if="!validId(quoteId)" role="alert">{{ $t('procurement.invalid_quote') }}</p>
    <template v-else>
      <ProjectWorkspaceNav :quote-id="quoteId" active="procurement" />
      <nav
        class="procurement-create__breadcrumbs purchase-order-breadcrumbs"
        :aria-label="$t('procurement.orders.breadcrumbs')"
      >
        <RouterLink :to="projectUrl">{{ $t('procurement.back_to_project') }}</RouterLink>
        <span aria-hidden="true">/</span>
        <RouterLink :to="procurementUrl">{{ $t('procurement.title') }}</RouterLink>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{{ $t('procurement.orders.add') }}</span>
      </nav>
      <header class="procurement-header procurement-intro">
        <div class="procurement-intro-copy">
          <h1>{{ $t('procurement.orders.add') }}</h1>
          <p>{{ $t('procurement.orders.add_description') }}</p>
        </div>
        <AppButton
          type="button"
          theme="secondary"
          :disabled="orders.isIssuing.value || processing"
          @click="returnToProcurement"
          >{{ $t('procurement.back_to_procurement') }}</AppButton
        >
      </header>
      <section
        class="procurement-panel purchase-order-request"
        aria-labelledby="order-request-heading"
      >
        <header class="procurement-header procurement-section-header">
          <div>
            <h2 id="order-request-heading">{{ $t('procurement.orders.request_section') }}</h2>
            <p>{{ $t('procurement.orders.request_help') }}</p>
          </div>
        </header>
        <p v-if="requests.listState.value instanceof DataLoading" role="status">
          {{ $t('loading') }}
        </p>
        <div v-if="requests.listState.value.hasError" role="alert">
          <p>
            {{ $t(requests.listState.value.error?.title || 'procurement.orders.check_required') }}
          </p>
          <AppButton type="button" theme="secondary" @click="requests.fetchList()">{{
            $t('procurement.offers.retry_fetch')
          }}</AppButton>
        </div>
        <div
          v-if="requests.listState.value instanceof DataSuccess || readyRequestId === requestId"
          class="field-group purchase-order-request-selector"
        >
          <UpdatedCustomInputSelect
            id="purchase-order-request"
            :model-value="selectedRequest"
            :static-options="requestOptions"
            label="procurement.request_id"
            :placeholder="$t('procurement.orders.select_request')"
            required
            @update:model-value="selectRequest"
          >
            <template #LabelHeader>
              <span class="field-help-label-row">
                <FieldHelpIcon
                  :label="$t('procurement.request_id')"
                  field-name="purchase_request_id"
                  field-id="purchase-order-request"
                  :help-text="$t('procurement.orders.request_help')"
                />
              </span>
            </template>
          </UpdatedCustomInputSelect>
        </div>
        <dl v-if="selectedRequestRecord" class="procurement-create__summary">
          <div>
            <dt>{{ $t('procurement.request_id') }}</dt>
            <dd>
              <bdi>#{{ selectedRequestRecord.id }}</bdi>
            </dd>
          </div>
          <div>
            <dt>{{ $t('procurement.assigned_employee') }}</dt>
            <dd>
              {{ selectedRequestRecord.assignedEmployee?.name ?? $t('procurement.unavailable') }}
            </dd>
          </div>
          <div>
            <dt>{{ $t('procurement.requested_items') }}</dt>
            <dd>{{ selectedRequestRecord.items.length }}</dd>
          </div>
          <div>
            <dt>{{ $t('procurement.status') }}</dt>
            <dd>{{ $t(statusKey(selectedRequestRecord.status)) }}</dd>
          </div>
        </dl>
      </section>
      <PurchaseOrderForm
        v-if="readyRequestId === requestId && selectedRequest"
        ref="orderForm"
        :key="`${quoteId}:${requestId}:${validId(offerId) ? offerId : ''}`"
        :quote-id="quoteId"
        :purchase-request-id="requestId"
        :purchase-request-price-id="validId(offerId) ? offerId : undefined"
        @cancel="returnToProcurement"
        @created="afterCreated"
        @manage-offers="manageOffers"
      />
      <div v-else class="procurement-actions purchase-order-empty-actions">
        <AppButton type="button" theme="secondary" @click="returnToProcurement">{{
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
<style scoped lang="scss">
  .purchase-order-request {
    min-width: 0;
  }

  .purchase-order-empty-actions {
    display: flex;
    justify-content: flex-end;
  }
</style>
