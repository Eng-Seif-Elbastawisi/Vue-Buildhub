<script setup lang="ts">
  import { computed, ref, watch, onBeforeUnmount, nextTick } from 'vue';
  import { useRoute, onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router';
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
  } from '../../core/constants/purchase-request.constants';
  import PurchaseRequestController from '../controllers/purchase-request.controller';
  import PurchaseRequestFormDialog from './PurchaseRequestFormDialog.vue';
  import PurchaseRequestDetails from './PurchaseRequestDetails.vue';
  import SupplierPriceOffersPanel from './SupplierPriceOffersPanel.vue';
  import PurchaseOrderForm from './PurchaseOrderForm.vue';
  import PurchaseOrderController from '../controllers/purchase.order.controller';
  import '../styles/procurement.scss';
  const route = useRoute();
  const controller = PurchaseRequestController.getInstance();
  const quoteId = computed(() => Number(route.params.id));
  const state = computed(() => controller.listState.value);
  const formVisible = ref(false);
  const orderRequestId = ref<number | null>(null);
  const orderOfferId = ref<number | null>(null);
  const orderIssueMode = ref(false);
  const orders = PurchaseOrderController.getInstance();
  async function openOrder(id: number, priceId?: number, issuing = false) {
    if (orders.isIssuing.value || !(await canNavigate())) return;
    orderIssueMode.value = issuing;
    orderOfferId.value = priceId ?? null;
    orderRequestId.value = id;
  }
  async function openStoreOrder(id: number, priceId?: number) {
    await openOrder(id, priceId, true);
  }
  async function closeOrder() {
    orderRequestId.value = null;
    orderOfferId.value = null;
    orderIssueMode.value = false;
    await nextTick();
    await offersPanel.value?.refreshAfterOrder();
  }
  const offersRequestId = ref<number | null>(null);
  const offersPanel = ref<InstanceType<typeof SupplierPriceOffersPanel> | null>(null);
  async function openOffers(id: number) {
    if (offersPanel.value && !(await offersPanel.value.requestClose())) return;
    offersRequestId.value = null;
    await nextTick();
    offersRequestId.value = id;
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
    (id) => {
      formVisible.value = false;
      orderRequestId.value = null;
      orderOfferId.value = null;
      orderIssueMode.value = false;
      orders.release();
      offersRequestId.value = null;
      expandedRequestId.value = null;
      controller.activate(id);
      if (validId(id)) void controller.load();
    },
    { immediate: true },
  );
  onBeforeUnmount(() => {
    controller.release();
    orders.release();
  });
</script>
<template>
  <section class="procurement">
    <p v-if="!validId(quoteId)" role="alert">{{ $t('procurement.invalid_quote') }}</p>
    <template v-else>
      <ProjectWorkspaceNav :quote-id="quoteId" active="procurement" />
      <header class="procurement-header">
        <div>
          <h1>{{ $t('procurement.title') }}</h1>
          <p>{{ $t('procurement.subtitle') }}</p>
          <RouterLink :to="quotePath(route.path, quoteId)">{{
            $t('procurement.back_to_project')
          }}</RouterLink>
        </div>
      </header>
      <ol class="procurement-workflow" :aria-label="$t('procurement.workflow')">
        <li>
          <strong>{{ $t('procurement.create_request_step') }}</strong
          ><span>{{ $t('procurement.create_request_help') }}</span>
        </li>
        <li>
          <strong>{{ $t('procurement.add_prices_step') }}</strong
          ><span>{{ $t('procurement.add_prices_help') }}</span>
        </li>
        <li>
          <strong>{{ $t('procurement.orders.issue') }}</strong
          ><span>{{ $t('procurement.orders.workflow_help') }}</span>
        </li>
      </ol>
      <section class="procurement-panel" aria-labelledby="procurement-requirements">
        <header class="procurement-header">
          <h2 id="procurement-requirements">{{ $t('procurement.requirements') }}</h2>
          <AppButton
            type="button"
            :disabled="controller.isStoring.value"
            @click="formVisible = true"
            ><i class="pi pi-plus" aria-hidden="true" />{{
              $t('procurement.new_requirement')
            }}</AppButton
          >
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
            <div v-else class="procurement-table-scroll">
              <table class="procurement-table">
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
                <tbody v-for="request in state.data" :key="request.id">
                  <tr>
                    <th scope="row">{{ request.id }}</th>
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
                        class="procurement-status"
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
                            expandedRequestId = expandedRequestId === request.id ? null : request.id
                          "
                          >{{ $t('procurement.view_details') }}</AppButton
                        >
                        <AppButton
                          type="button"
                          theme="secondary"
                          size="sm"
                          :aria-label="$t('procurement.offers.manage_request', { id: request.id })"
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
        </DataStatusBuilder>
      </section>
      <section
        v-if="offersRequestId == null"
        id="purchase-request-prices"
        class="procurement-panel procurement-empty"
        aria-labelledby="supplier-prices-heading"
      >
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
      />
      <PurchaseOrderForm
        v-if="orderRequestId != null"
        :key="`${quoteId}:${orderRequestId}:${orderOfferId}:${orderIssueMode}`"
        :quote-id="quoteId"
        :purchase-request-id="orderRequestId"
        :purchase-request-price-id="orderOfferId ?? undefined"
        :allow-issue="orderIssueMode"
        @close="closeOrder"
      />
      <PurchaseRequestFormDialog v-if="formVisible" v-model:visible="formVisible" />
    </template>
  </section>
</template>
