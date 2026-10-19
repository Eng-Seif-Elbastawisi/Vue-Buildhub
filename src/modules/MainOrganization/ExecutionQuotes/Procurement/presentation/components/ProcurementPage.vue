<script setup lang="ts">
  import { computed, ref, watch, onBeforeUnmount, nextTick } from 'vue';
  import { useRoute, useRouter, onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router';
  import Skeleton from 'primevue/skeleton';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import ProjectWorkspaceNav from '../../../presentation/components/ProjectWorkspaceNav.vue';
  import { validId } from '../../../Schedule/core/constants/schedule.constants';
  import { quotePath } from '../../../Schedule/presentation/schedule.routes';
  import {
    priorityKey,
    statusKey,
    SupplyResponsibility,
    PurchaseRequestStatus,
  } from '../../core/constants/purchase-request.constants';
  import PurchaseRequestController from '../controllers/purchase-request.controller';
  import PurchaseRequestDetails from './PurchaseRequestDetails.vue';
  import SupplierPriceOffersPanel from './SupplierPriceOffersPanel.vue';
  import PurchaseOrderViewDialog from './PurchaseOrderViewDialog.vue';
  import {
    purchaseOrderCreatePath,
    purchaseRequestCreatePath,
    supplierPricesPath,
  } from '../procurement.routes';
  import PurchaseOrderController from '../controllers/purchase.order.controller';
  import '../styles/procurement.scss';
  const route = useRoute();
  const router = useRouter();
  const controller = PurchaseRequestController.getInstance();
  const quoteId = computed(() => Number(route.params.id));
  const state = computed(() => controller.listState.value);
  const requestSearch = ref('');
  const requestStatus = ref<PurchaseRequestStatus | null>(null);
  const statusFilters = [
    { status: null, label: 'procurement.all_requests' },
    { status: PurchaseRequestStatus.PENDING, label: 'procurement.pending' },
    { status: PurchaseRequestStatus.CONFIRMED, label: 'procurement.confirmed' },
    { status: PurchaseRequestStatus.REJECTED, label: 'procurement.rejected' },
  ] as const;
  const visibleRequests = computed(() => {
    const query = requestSearch.value.trim().toLocaleLowerCase();
    return (state.value.data ?? []).filter(
      (request) =>
        (requestStatus.value === null || request.status === requestStatus.value) &&
        [
          String(request.id),
          request.assignedEmployee?.name ?? '',
          request.projectFloorSpace?.space?.title ?? '',
        ].some((label) => label.toLocaleLowerCase().includes(query)),
    );
  });
  function clearFilters() {
    requestSearch.value = '';
    requestStatus.value = null;
  }
  const orderRequestId = ref<number | null>(null);
  const orders = PurchaseOrderController.getInstance();
  async function openOrder(id: number) {
    if (orders.isIssuing.value || !(await canNavigate())) return;
    orderRequestId.value = id;
  }
  async function openStoreOrder(id?: number, priceId?: number) {
    if (orders.isIssuing.value || !(await canNavigate())) return;
    await router.push({
      path: purchaseOrderCreatePath(route.path, quoteId.value),
      query: id ? { requestId: String(id), ...(priceId ? { offerId: String(priceId) } : {}) } : {},
    });
  }
  async function openStoreRequest() {
    if (controller.isStoring.value || !(await canNavigate())) return;
    await router.push(purchaseRequestCreatePath(route.path, quoteId.value));
  }
  function closeOrder() {
    orderRequestId.value = null;
  }
  const offersRequestId = ref<number | null>(null);
  const offersPanel = ref<InstanceType<typeof SupplierPriceOffersPanel> | null>(null);
  async function openOffers(id: number) {
    if (offersPanel.value && !(await offersPanel.value.requestClose())) return;
    offersRequestId.value = null;
    await nextTick();
    offersRequestId.value = id;
  }
  async function openManageOffers(id: number) {
    if (!(await canNavigate())) return;
    await router.push({
      path: supplierPricesPath(route.path, quoteId.value, id),
      query: { returnTo: 'procurement' },
    });
  }
  async function canNavigate() {
    if (orders.isIssuing.value) return false;
    return offersPanel.value ? offersPanel.value.requestClose() : true;
  }
  onBeforeRouteLeave(canNavigate);
  onBeforeRouteUpdate(canNavigate);
  const expandedRequestId = ref<number | null>(null);
  watch(
    quoteId,
    async (id) => {
      clearFilters();
      orderRequestId.value = null;
      orders.release();
      offersRequestId.value = null;
      expandedRequestId.value = null;
      controller.activate(id);
      if (validId(id)) {
        await controller.load();
        const selectedId = Number(route.query.requestId);
        if (id === quoteId.value && state.value.data?.some((request) => request.id === selectedId))
          offersRequestId.value = selectedId;
      }
    },
    { immediate: true },
  );
  onBeforeUnmount(() => {
    controller.release();
    orders.release();
  });
</script>
<template>
  <section class="procurement" :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'">
    <p v-if="!validId(quoteId)" role="alert">{{ $t('procurement.invalid_quote') }}</p>
    <template v-else>
      <ProjectWorkspaceNav :quote-id="quoteId" active="procurement" />
      <header class="procurement-header procurement-intro">
        <div class="procurement-intro-copy">
          <h1><i class="pi pi-shopping-cart" aria-hidden="true" />{{ $t('procurement.title') }}</h1>
          <p>{{ $t('procurement.subtitle') }}</p>
          <RouterLink :to="quotePath(route.path, quoteId)" class="procurement-back-link"
            ><i class="pi pi-arrow-left" aria-hidden="true" />{{
              $t('procurement.back_to_project')
            }}</RouterLink
          >
        </div>
        <div class="procurement-actions">
          <AppButton type="button" :disabled="controller.isStoring.value" @click="openStoreRequest"
            ><i class="pi pi-plus" aria-hidden="true" />{{
              $t('procurement.new_requirement')
            }}</AppButton
          >
          <AppButton type="button" theme="secondary" @click="openStoreOrder()"
            ><i class="pi pi-file-edit" aria-hidden="true" />{{
              $t('procurement.orders.add')
            }}</AppButton
          >
        </div>
      </header>
      <ol class="procurement-workflow" :aria-label="$t('procurement.workflow')">
        <li>
          <span class="procurement-workflow-step" aria-hidden="true">1</span>
          <div>
            <strong>{{ $t('procurement.requirements') }}</strong
            ><span>{{ $t('procurement.create_request_help') }}</span>
          </div>
        </li>
        <li>
          <span class="procurement-workflow-step" aria-hidden="true">2</span>
          <div>
            <strong>{{ $t('procurement.supplier_prices') }}</strong
            ><span>{{ $t('procurement.add_prices_help') }}</span>
          </div>
        </li>
        <li>
          <span class="procurement-workflow-step" aria-hidden="true">3</span>
          <div>
            <strong>{{ $t('procurement.orders.issue') }}</strong
            ><span>{{ $t('procurement.orders.workflow_help') }}</span>
          </div>
        </li>
      </ol>
      <section class="procurement-panel" aria-labelledby="procurement-requirements">
        <header class="procurement-header procurement-section-header">
          <div class="procurement-section-title">
            <i class="pi pi-list" aria-hidden="true" />
            <h2 id="procurement-requirements">{{ $t('procurement.requirements') }}</h2>
          </div>
        </header>
        <DataStatusBuilder
          :controller="state"
          :on-retry="
            async () => {
              await controller.fetchList();
            }
          "
        >
          <template #loader><Skeleton height="8rem" /></template>
          <template #empty
            ><p class="procurement-empty">{{ $t('procurement.empty') }}</p></template
          >
          <template #success>
            <p v-if="!state.data?.length" class="procurement-empty">
              {{ $t('procurement.empty') }}
            </p>
            <template v-else>
              <div class="procurement-toolbar">
                <div
                  class="procurement-status-filters"
                  role="group"
                  :aria-label="$t('procurement.filter_status')"
                >
                  <button
                    v-for="filter in statusFilters"
                    :key="filter.label"
                    type="button"
                    :aria-pressed="requestStatus === filter.status"
                    @click="requestStatus = filter.status"
                  >
                    {{ $t(filter.label) }}
                  </button>
                </div>
              </div>
              <p class="procurement-results" role="status">
                {{
                  $t('procurement.request_results', {
                    count: visibleRequests.length,
                    total: state.data?.length ?? 0,
                  })
                }}
              </p>
              <div v-if="!visibleRequests.length" class="procurement-empty">
                <i class="pi pi-search" aria-hidden="true" />
                <h3>{{ $t('procurement.no_matching_requests') }}</h3>
                <AppButton type="button" theme="secondary" @click="clearFilters">{{
                  $t('procurement.clear_filters')
                }}</AppButton>
              </div>
              <div
                v-else
                class="procurement-table-scroll workspace-table-scroll"
                tabindex="0"
                role="region"
                :aria-label="$t('procurement.requirements')"
              >
                <table class="procurement-table workspace-data-table">
                  <caption class="procurement-sr-only">
                    {{
                      $t('procurement.requirements')
                    }}
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">{{ $t('procurement.request_id') }}</th>
                      <th scope="col">{{ $t('procurement.assigned_employee') }}</th>
                      <th scope="col">{{ $t('procurement.scope') }}</th>
                      <th scope="col">{{ $t('procurement.supply_responsibility') }}</th>
                      <th scope="col">{{ $t('procurement.priority') }}</th>
                      <th scope="col">{{ $t('procurement.item_count') }}</th>
                      <th scope="col">{{ $t('procurement.created_at') }}</th>
                      <th scope="col">{{ $t('procurement.status') }}</th>
                      <th scope="col">{{ $t('procurement.actions') }}</th>
                    </tr>
                  </thead>
                  <tbody v-for="request in visibleRequests" :key="request.id">
                    <tr>
                      <th scope="row">
                        <span class="procurement-request-reference">#{{ request.id }}</span>
                      </th>
                      <td>{{ request.assignedEmployee?.name ?? $t('procurement.unavailable') }}</td>
                      <td>
                        {{
                          $t(
                            request.isAllProject
                              ? 'procurement.entire_project'
                              : 'procurement.specific_space',
                            {
                              id:
                                request.projectFloorSpace?.space?.title ??
                                $t('procurement.unavailable'),
                            },
                          )
                        }}
                      </td>
                      <td>
                        {{
                          $t(
                            request.supplyResponsibility === SupplyResponsibility.CLIENT
                              ? 'procurement.client'
                              : 'procurement.company',
                          )
                        }}
                      </td>
                      <td>{{ $t(priorityKey(request.priority)) }}</td>
                      <td>{{ request.items.length }}</td>
                      <td>{{ request.createdAt ?? $t('procurement.unavailable') }}</td>
                      <td>
                        <span
                          class="procurement-status bh-status"
                          :class="`procurement-status--${request.status}`"
                          >{{ $t(statusKey(request.status)) }}</span
                        >
                      </td>
                      <td>
                        <div class="row-actions">
                          <AppButton
                            type="button"
                            theme="secondary"
                            size="sm"
                            :aria-expanded="expandedRequestId === request.id"
                            :aria-controls="`requirement-details-${request.id}`"
                            @click="
                              expandedRequestId =
                                expandedRequestId === request.id ? null : request.id
                            "
                            >{{ $t('procurement.view_details') }}</AppButton
                          >
                          <AppButton
                            type="button"
                            theme="secondary"
                            size="sm"
                            :aria-label="
                              $t('procurement.offers.manage_request', { id: request.id })
                            "
                            :aria-pressed="offersRequestId === request.id"
                            :aria-controls="'purchase-request-prices'"
                            @click="openOffers(request.id)"
                            >{{ $t('procurement.view_prices') }}</AppButton
                          >
                          <AppButton
                            type="button"
                            theme="secondary"
                            size="sm"
                            :disabled="orders.isIssuing.value"
                            @click="openOrder(request.id)"
                            >{{ $t('procurement.orders.view') }}</AppButton
                          >
                        </div>
                      </td>
                    </tr>
                    <tr v-if="expandedRequestId === request.id">
                      <td colspan="9" class="procurement-details-cell">
                        <div :id="`requirement-details-${request.id}`">
                          <PurchaseRequestDetails :request="request" />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>
          </template>
        </DataStatusBuilder>
      </section>
      <section
        v-if="offersRequestId == null"
        id="purchase-request-prices"
        class="procurement-panel procurement-empty"
        aria-labelledby="supplier-prices-heading"
      >
        <i class="pi pi-tags procurement-empty-icon" aria-hidden="true" />
        <h2 id="supplier-prices-heading">{{ $t('procurement.supplier_prices') }}</h2>
        <p>
          {{
            $t(
              state.data?.length
                ? 'procurement.select_request_prices'
                : 'procurement.create_before_prices',
            )
          }}
        </p>
      </section>
      <SupplierPriceOffersPanel
        v-else
        id="purchase-request-prices"
        :key="offersRequestId"
        ref="offersPanel"
        :quote-id="quoteId"
        :purchase-request-id="offersRequestId"
        @store-order="openStoreOrder"
        @manage-offers="openManageOffers"
      />
      <PurchaseOrderViewDialog
        v-if="orderRequestId != null"
        :key="`${quoteId}:${orderRequestId}`"
        :quote-id="quoteId"
        :purchase-request-id="orderRequestId"
        @close="closeOrder"
      />
    </template>
  </section>
</template>
