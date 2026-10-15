<script setup lang="ts">
  import { computed, onBeforeUnmount, ref, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import Dialog from 'primevue/dialog';
  import Tabs from 'primevue/tabs';
  import TabList from 'primevue/tablist';
  import Tab from 'primevue/tab';
  import TabPanels from 'primevue/tabpanels';
  import TabPanel from 'primevue/tabpanel';
  import Skeleton from 'primevue/skeleton';
  import TitleInterface from '@/base/Data/Models/titleInterface';
  import {
    DataLoading,
    DataSuccess,
  } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import EmployeeController from '@/modules/MainOrganization/employee/presentation/controllers/employee.controller';
  import IndexEmployeeParams from '@/modules/MainOrganization/employee/core/params/index.employee.params';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import ProjectWorkspaceNav from '../../../presentation/components/ProjectWorkspaceNav.vue';
  import { quotePath } from '../../../Schedule/presentation/schedule.routes';
  import { validId } from '../../../Schedule/core/constants/schedule.constants';
  import StorePurchaseRequestReceiptParams from '../../core/params/store-purchase-request-receipt.params';
  import type PurchaseRequestReceiptItemSummaryModel from '../../core/models/purchase-request-receipt-item-summary.model';
  import MaterialReceiptController from '../controllers/material-receipt.controller';

  const route = useRoute();
  const { t, te } = useI18n();
  const controller = MaterialReceiptController.getInstance();
  const quoteId = computed(() => Number(route.params.id));
  const selected = ref<TitleInterface<string | number> | null>(null);
  const receiver = ref<TitleInterface<string | number> | null>(null);
  const today = new Date();
  const date = ref(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
  );
  const quantities = ref<Record<number, string>>({});
  const formError = ref('');
  const activeTab = ref('requests');
  const receiptDialogVisible = ref(false);
  const detailReceiptId = ref<number | null>(null);
  const employeeController = EmployeeController.getInstance();
  const employeeParams = new IndexEmployeeParams('', 1, 10, 0);
  const requests = computed(() => controller.requestsState.value.data ?? []);
  const requestOptions = computed(() =>
    requests.value.map(
      (request) =>
        new TitleInterface({
          id: request.id,
          title: t('material_receipt.request_number', { id: request.id }),
        }),
    ),
  );
  const summaries = computed<PurchaseRequestReceiptItemSummaryModel[]>(() =>
    controller.listState.value instanceof DataSuccess
      ? (controller.listState.value.data ?? [])
      : [],
  );
  const allReceived = computed(
    () => summaries.value.length > 0 && summaries.value.every((item) => !item.canReceive),
  );
  const canEdit = computed(
    () =>
      !!controller.selectedRequest.value &&
      controller.listState.value instanceof DataSuccess &&
      controller.orderState.value.data?.status === 3 &&
      !controller.submissionUncertain.value &&
      !controller.refreshFailed.value &&
      !controller.isStoring.value &&
      !allReceived.value &&
      summaries.value.length > 0,
  );
  const formErrorText = computed(() =>
    formError.value && te(formError.value) ? t(formError.value) : formError.value,
  );
  function displayError(value?: string | null) {
    return value && te(value) ? t(value) : (value ?? '');
  }
  const history = computed(() => controller.historyState.value.data ?? []);
  const detailReceipt = computed(() =>
    history.value.find((receipt) => receipt.id === detailReceiptId.value),
  );
  function single(
    value: TitleInterface<string | number> | TitleInterface<string | number>[] | null,
  ) {
    return Array.isArray(value) ? null : value;
  }
  function selectRequest(
    value: TitleInterface<string | number> | TitleInterface<string | number>[] | null,
  ) {
    selected.value = single(value);
    quantities.value = {};
    formError.value = '';
    controller.selectRequest(selected.value ? Number(selected.value.id) : null);
  }
  function openReceipt(requestId?: number) {
    if (controller.isStoring.value) return;
    resetEntry();
    const request = requests.value.find((entry) => entry.id === requestId);
    selectRequest(
      request
        ? new TitleInterface({
            id: request.id,
            title: t('material_receipt.request_number', { id: request.id }),
          })
        : null,
    );
    receiptDialogVisible.value = true;
  }
  function closeReceipt() {
    if (controller.isStoring.value) return;
    receiptDialogVisible.value = false;
    resetEntry();
    selectRequest(null);
  }
  function resetEntry() {
    quantities.value = {};
    receiver.value = null;
    formError.value = '';
  }
  function itemTitle(id: number) {
    return (
      summaries.value.find((row) => row.purchaseRequestItem.id === id)?.purchaseRequestItem.itemable
        ?.title ??
      requests.value.flatMap((request) => request.items).find((item) => item.id === id)?.itemable
        ?.title ??
      t('material_receipt.item_number', { id })
    );
  }
  async function save() {
    if (!canEdit.value || !controller.purchaseRequestId.value) return;
    formError.value = '';
    const entries = summaries.value.map((row) => ({
      purchaseRequestItemId: row.purchaseRequestItem.id,
      quantity: String(quantities.value[row.purchaseRequestItem.id] ?? ''),
      remainingQuantity: row.remainingQuantity,
    }));
    const prepared = StorePurchaseRequestReceiptParams.fromEntries({
      purchaseRequestId: controller.purchaseRequestId.value,
      ...(receiver.value ? { employeeId: Number(receiver.value.id) } : {}),
      date: date.value,
      entries,
    });
    if (prepared.errors.length) {
      formError.value = prepared.errors[0] ?? 'material_receipt.invalid_form';
      return;
    }
    const validation = prepared.params.validate();
    if (!validation.isValid) {
      formError.value = validation.errors[0]?.message ?? 'material_receipt.invalid_form';
      return;
    }
    const result = await controller.create(prepared.params);
    if (result instanceof DataSuccess) resetEntry();
  }
  watch(
    quoteId,
    (id) => {
      selected.value = null;
      resetEntry();
      activeTab.value = 'requests';
      receiptDialogVisible.value = false;
      detailReceiptId.value = null;
      controller.activate(id);
      if (validId(id)) void controller.load();
    },
    { immediate: true },
  );
  onBeforeUnmount(() => controller.release());
</script>
<template>
  <section class="material-receipt" :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'">
    <p v-if="!validId(quoteId)" role="alert">{{ $t('material_receipt.invalid_quote') }}</p>
    <template v-else>
      <ProjectWorkspaceNav :quote-id="quoteId" active="warehouse" />
      <header class="material-receipt__intro">
        <div>
          <h1><i class="pi pi-box" aria-hidden="true" />{{ $t('material_receipt.title') }}</h1>
          <p>{{ $t('material_receipt.subtitle') }}</p>
          <RouterLink :to="quotePath(route.path, quoteId)" class="material-receipt__back">
            <i class="pi pi-arrow-left" aria-hidden="true" />{{ $t('material_receipt.back') }}
          </RouterLink>
        </div>
        <AppButton
          type="button"
          :disabled="controller.isStoring.value || !requests.length"
          @click="openReceipt()"
        >
          <i class="pi pi-plus" aria-hidden="true" />{{ $t('material_receipt.new_receipt') }}
        </AppButton>
      </header>

      <Tabs v-model:value="activeTab" class="material-receipt__tabs">
        <TabList>
          <Tab value="history"
            ><i class="pi pi-history" aria-hidden="true" />{{ $t('material_receipt.history') }}</Tab
          >
        </TabList>
        <TabPanels>
          <TabPanel value="requests">
            <section class="material-receipt__panel" aria-labelledby="receipt-requests-heading">
              <header class="material-receipt__panel-header">
                <div>
                  <h2 id="receipt-requests-heading">
                    {{ $t('material_receipt.purchase_requests_tab') }}
                  </h2>
                  <p>{{ $t('material_receipt.requests_hint') }}</p>
                </div>
                <span v-if="requests.length" class="material-receipt__count">{{
                  requests.length
                }}</span>
              </header>
              <div class="material-receipt__panel-body">
                <Skeleton
                  v-if="controller.requestsState.value instanceof DataLoading"
                  height="7rem"
                />
                <template v-else-if="controller.requestsState.value.hasError">
                  <p role="alert">
                    {{ displayError(controller.requestsState.value.error?.displayMessage) }}
                  </p>
                  <AppButton type="button" theme="secondary" @click="controller.loadRequests()">{{
                    $t('material_receipt.retry')
                  }}</AppButton>
                </template>
                <div v-else-if="!requests.length" class="material-receipt__empty">
                  <i class="pi pi-inbox" aria-hidden="true" />
                  <h3>{{ $t('material_receipt.no_requests') }}</h3>
                  <p>{{ $t('material_receipt.no_requests_hint') }}</p>
                </div>
                <div
                  v-else
                  class="material-receipt__scroll"
                  role="region"
                  tabindex="0"
                  :aria-label="$t('material_receipt.purchase_requests_tab')"
                >
                  <table class="material-receipt__table material-receipt__table--requests">
                    <thead>
                      <tr>
                        <th scope="col">{{ $t('material_receipt.purchase_request') }}</th>
                        <th scope="col">{{ $t('procurement.item_count') }}</th>
                        <th scope="col">{{ $t('procurement.created_at') }}</th>
                        <th scope="col">{{ $t('material_receipt.action') }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="request in requests" :key="request.id">
                        <th scope="row">
                          <span class="material-receipt__reference">#{{ request.id }}</span>
                        </th>
                        <td>{{ request.items.length }}</td>
                        <td>{{ request.createdAt ?? $t('procurement.unavailable') }}</td>
                        <td>
                          <AppButton
                            type="button"
                            theme="secondary"
                            size="sm"
                            :disabled="controller.isStoring.value"
                            @click="openReceipt(request.id)"
                            >{{ $t('material_receipt.receive_action') }}</AppButton
                          >
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </TabPanel>
          <TabPanel value="history">
            <section class="material-receipt__panel" aria-labelledby="receipt-history-heading">
              <header class="material-receipt__panel-header">
                <div>
                  <h2 id="receipt-history-heading">{{ $t('material_receipt.history') }}</h2>
                  <p>{{ $t('material_receipt.history_hint') }}</p>
                </div>
                <span v-if="history.length" class="material-receipt__count">{{
                  history.length
                }}</span>
              </header>
              <div class="material-receipt__panel-body">
                <Skeleton
                  v-if="controller.historyState.value instanceof DataLoading"
                  height="7rem"
                />
                <template v-else-if="controller.historyState.value.hasError">
                  <p role="alert">
                    {{ displayError(controller.historyState.value.error?.displayMessage) }}
                  </p>
                  <AppButton type="button" theme="secondary" @click="controller.loadHistory()">{{
                    $t('material_receipt.retry')
                  }}</AppButton>
                </template>
                <div v-else-if="!history.length" class="material-receipt__empty">
                  <i class="pi pi-history" aria-hidden="true" />
                  <h3>{{ $t('material_receipt.no_receipts') }}</h3>
                  <p>{{ $t('material_receipt.no_receipts_hint') }}</p>
                </div>
                <div
                  v-else
                  class="material-receipt__scroll"
                  role="region"
                  tabindex="0"
                  :aria-label="$t('material_receipt.history')"
                >
                  <table class="material-receipt__table material-receipt__table--history">
                    <thead>
                      <tr>
                        <th scope="col">{{ $t('material_receipt.receipt_date') }}</th>
                        <th scope="col">{{ $t('material_receipt.receiving_employee') }}</th>
                        <th scope="col">{{ $t('material_receipt.recorded_by') }}</th>
                        <th scope="col">{{ $t('material_receipt.status') }}</th>
                        <th scope="col">{{ $t('material_receipt.items_count') }}</th>
                        <th scope="col">{{ $t('material_receipt.created_at') }}</th>
                        <th scope="col">{{ $t('material_receipt.details') }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="receipt in history" :key="receipt.id">
                        <td>{{ receipt.date }}</td>
                        <td>{{ receipt.employee?.name ?? $t('procurement.unavailable') }}</td>
                        <td>{{ receipt.organizationEmployee.name }}</td>
                        <td>
                          <span
                            class="material-receipt__status"
                            :class="
                              receipt.status === 2
                                ? 'material-receipt__status--complete'
                                : 'material-receipt__status--partial'
                            "
                            >{{
                              $t(
                                receipt.status === 1
                                  ? 'material_receipt.partial'
                                  : 'material_receipt.complete',
                              )
                            }}</span
                          >
                        </td>
                        <td>{{ receipt.items.length }}</td>
                        <td>{{ receipt.createdAt }}</td>
                        <td>
                          <AppButton
                            type="button"
                            theme="secondary"
                            size="sm"
                            @click="detailReceiptId = receipt.id"
                            >{{ $t('material_receipt.details') }}</AppButton
                          >
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Dialog
        :visible="receiptDialogVisible"
        modal
        append-to="self"
        class="material-receipt__dialog"
        :header="$t('material_receipt.receiving')"
        :closable="!controller.isStoring.value"
        :close-on-escape="!controller.isStoring.value"
        :dismissable-mask="false"
        @update:visible="!$event && closeReceipt()"
      >
        <form class="material-receipt__form" novalidate @submit.prevent="save">
          <p class="material-receipt__form-intro">{{ $t('material_receipt.request_help') }}</p>
          <div class="field-group">
            <UpdatedCustomInputSelect
              id="receipt-purchase-request"
              :model-value="selected"
              label="material_receipt.purchase_request"
              :placeholder="$t('material_receipt.select_request')"
              :static-options="requestOptions"
              :disabled="controller.isStoring.value || !requests.length"
              :reload="false"
              @update:model-value="selectRequest"
              ><template #LabelHeader
                ><span class="field-help-label-row"
                  ><FieldHelpIcon
                    :label="$t('material_receipt.purchase_request')"
                    field-name="purchase_request"
                    field-id="receipt-purchase-request"
                    :help-text="$t('material_receipt.request_help')" /></span></template
            ></UpdatedCustomInputSelect>
          </div>
          <div v-if="controller.purchaseRequestId.value" class="material-receipt__selection">
            <Skeleton v-if="controller.listState.value instanceof DataLoading" height="7rem" />
            <p v-if="controller.listState.value.hasError" role="alert">
              {{ displayError(controller.listState.value.error?.displayMessage) }}
            </p>
            <AppButton
              v-if="controller.listState.value.hasError"
              type="button"
              theme="secondary"
              @click="controller.loadSummary()"
              >{{ $t('material_receipt.retry') }}</AppButton
            >
            <p v-if="controller.orderState.value instanceof DataLoading" role="status">
              {{ $t('material_receipt.checking_order') }}
            </p>
            <p v-else-if="controller.orderState.value.data?.status !== 3" role="status">
              {{ $t('material_receipt.order_required') }}
            </p>
            <AppButton
              v-if="controller.orderState.value.hasError"
              type="button"
              theme="secondary"
              @click="controller.loadOrder()"
              >{{ $t('material_receipt.retry') }}</AppButton
            >
            <template v-if="controller.listState.value instanceof DataSuccess">
              <div class="material-receipt__section-heading">
                <h2>{{ $t('material_receipt.requested_items') }}</h2>
                <span v-if="summaries.length">{{ summaries.length }}</span>
              </div>
              <p v-if="!summaries.length">{{ $t('material_receipt.no_items') }}</p>
              <p v-if="allReceived" role="status">
                {{ $t('material_receipt.fully_received_message') }}
              </p>
              <div
                v-if="summaries.length"
                class="material-receipt__scroll"
                role="region"
                tabindex="0"
                :aria-label="$t('material_receipt.requested_items')"
              >
                <table class="material-receipt__table material-receipt__table--items">
                  <thead>
                    <tr>
                      <th scope="col">{{ $t('material_receipt.item') }}</th>
                      <th scope="col">{{ $t('material_receipt.timeline_stage') }}</th>
                      <th scope="col">{{ $t('material_receipt.requested_quantity') }}</th>
                      <th scope="col">{{ $t('material_receipt.received_quantity') }}</th>
                      <th scope="col">{{ $t('material_receipt.remaining_quantity') }}</th>
                      <th scope="col">{{ $t('material_receipt.receive_now') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="row in summaries"
                      :key="row.purchaseRequestItem.id"
                      :class="{ 'material-receipt__completed-row': !row.canReceive }"
                    >
                      <th scope="row">
                        {{
                          row.purchaseRequestItem.itemable?.title ??
                          $t('material_receipt.item_number', { id: row.purchaseRequestItem.id })
                        }}<small>{{
                          $t(`procurement.${row.purchaseRequestItem.itemableType}`)
                        }}</small>
                      </th>
                      <td>
                        {{
                          [
                            row.purchaseRequestItem.projectTimelineStage?.stage?.title,
                            row.purchaseRequestItem.projectTimelineStage?.subStage?.title,
                          ]
                            .filter(Boolean)
                            .join(' / ') || $t('procurement.unavailable')
                        }}
                      </td>
                      <td>{{ row.requestedQuantity }}</td>
                      <td>{{ row.receivedQuantity }}</td>
                      <td>
                        <span
                          class="material-receipt__remaining"
                          :class="{ 'material-receipt__remaining--zero': !row.canReceive }"
                          >{{ row.remainingQuantity }}</span
                        >
                      </td>
                      <td>
                        <div class="field-group input-wrapper">
                          <label
                            class="material-receipt__sr-only"
                            :for="`receive-${row.purchaseRequestItem.id}`"
                            >{{
                              $t('material_receipt.receive_item', {
                                id: row.purchaseRequestItem.id,
                              })
                            }}</label
                          ><input
                            :id="`receive-${row.purchaseRequestItem.id}`"
                            v-model="quantities[row.purchaseRequestItem.id]"
                            class="input"
                            type="number"
                            min="0"
                            step="0.01"
                            inputmode="decimal"
                            :max="row.remainingQuantity"
                            :disabled="!canEdit || !row.canReceive"
                            :aria-label="
                              $t('material_receipt.receive_item', {
                                id: row.purchaseRequestItem.id,
                              })
                            "
                          />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="material-receipt__section-heading">
                <h2>{{ $t('material_receipt.receipt_information') }}</h2>
              </div>
              <div class="material-receipt__fields">
                <div class="field-group">
                  <UpdatedCustomInputSelect
                    id="receipt-employee"
                    :model-value="receiver"
                    label="material_receipt.receiving_employee"
                    :placeholder="$t('material_receipt.select_employee')"
                    :controller="employeeController"
                    :params="employeeParams"
                    :disabled="!canEdit"
                    paginated
                    optional
                    @update:model-value="receiver = single($event)"
                    ><template #LabelHeader
                      ><span class="field-help-label-row"
                        ><FieldHelpIcon
                          :label="$t('material_receipt.receiving_employee')"
                          field-name="receiving_employee"
                          field-id="receipt-employee"
                          :help-text="$t('material_receipt.employee_help')" /></span></template
                  ></UpdatedCustomInputSelect>
                </div>
                <div class="field-group input-wrapper">
                  <span class="field-help-label-row field-help-label-row--block"
                    ><label class="field-label label" for="receipt-date">{{
                      $t('material_receipt.receipt_date')
                    }}</label
                    ><FieldHelpIcon
                      :label="$t('material_receipt.receipt_date')"
                      field-name="receipt_date"
                      field-id="receipt-date"
                      :help-text="$t('material_receipt.date_help')" /></span
                  ><input
                    id="receipt-date"
                    v-model="date"
                    class="input"
                    type="date"
                    :disabled="!canEdit"
                    required
                  />
                </div>
              </div>
            </template>
          </div>
          <p v-if="formError" role="alert">{{ formErrorText }}</p>
          <p v-if="controller.mutationState.value.hasError" role="alert">
            {{ displayError(controller.mutationState.value.error?.displayMessage) }}
          </p>
          <p v-if="controller.submissionUncertain.value" role="alert">
            {{ $t('material_receipt.unconfirmed_store') }}
          </p>
          <p
            v-if="controller.mutationState.value instanceof DataSuccess"
            class="material-receipt__success"
            role="status"
          >
            {{ $t('material_receipt.saved') }}
          </p>
          <p v-if="controller.refreshFailed.value" role="alert">
            {{ $t('material_receipt.refresh_failed') }}
          </p>
          <div class="material-receipt__actions">
            <AppButton
              type="button"
              theme="secondary"
              :disabled="controller.isStoring.value"
              @click="resetEntry"
              >{{ $t('material_receipt.cancel') }}</AppButton
            >
            <AppButton
              type="button"
              theme="secondary"
              :disabled="controller.isStoring.value"
              @click="closeReceipt"
              >{{ $t('material_receipt.close') }}</AppButton
            >
            <AppButton
              v-if="controller.refreshFailed.value"
              type="button"
              theme="secondary"
              @click="controller.retryRefresh()"
              >{{ $t('material_receipt.retry') }}</AppButton
            >
            <AppButton
              type="button"
              :loading="controller.isStoring.value"
              :disabled="!canEdit"
              @click="save"
              >{{ $t('material_receipt.save') }}</AppButton
            >
          </div>
        </form>
      </Dialog>

      <Dialog
        :visible="detailReceiptId !== null"
        modal
        append-to="self"
        class="material-receipt__details-dialog"
        :header="$t('material_receipt.receipt_details')"
        @update:visible="detailReceiptId = null"
      >
        <div v-if="detailReceipt" class="material-receipt__details">
          <div class="material-receipt__details-meta">
            <div>
              <span>{{ $t('material_receipt.receipt_id') }}</span
              ><strong>#{{ detailReceipt.id }}</strong>
            </div>
            <div>
              <span>{{ $t('material_receipt.purchase_request') }}</span
              ><strong>#{{ detailReceipt.purchaseRequestId }}</strong>
            </div>
            <div>
              <span>{{ $t('material_receipt.receipt_date') }}</span
              ><strong>{{ detailReceipt.date }}</strong>
            </div>
            <div>
              <span>{{ $t('material_receipt.status') }}</span
              ><strong>{{
                $t(
                  detailReceipt.status === 1
                    ? 'material_receipt.partial'
                    : 'material_receipt.complete',
                )
              }}</strong>
            </div>
            <div>
              <span>{{ $t('material_receipt.receiving_employee') }}</span
              ><strong>{{ detailReceipt.employee?.name ?? $t('procurement.unavailable') }}</strong>
            </div>
            <div>
              <span>{{ $t('material_receipt.recorded_by') }}</span
              ><strong>{{ detailReceipt.organizationEmployee.name }}</strong>
            </div>
          </div>
          <h2>{{ $t('material_receipt.requested_items') }}</h2>
          <ul class="material-receipt__detail-items">
            <li v-for="item in detailReceipt.items" :key="item.id">
              <span>{{ itemTitle(item.purchaseRequestItemId) }}</span
              ><strong>{{ item.quantity }}</strong>
            </li>
          </ul>
        </div>
      </Dialog>
    </template>
  </section>
</template>
<style scoped lang="scss">
  .material-receipt {
    --receipt-ink: var(--quote-ink, var(--title-card-color));
    --receipt-muted: var(--quote-muted, var(--subtitle-color));
    --receipt-paper: var(--quote-paper, var(--bg-card));
    --receipt-canvas: var(--quote-canvas, var(--bg-section));
    --receipt-line: var(--quote-line, var(--border-weak));
    --receipt-copper: var(--quote-copper, var(--PrimaryColor));

    display: grid;
    gap: 1.5rem;
    min-width: 0;
    padding: clamp(1rem, 2vw, 2rem);
    color: var(--receipt-ink);
    accent-color: var(--receipt-copper);
  }

  .material-receipt__intro {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1.5rem;
    padding: 1.75rem 2rem;
    border-radius: 16px;
    background: var(--receipt-ink);
    color: var(--receipt-paper);
  }

  .material-receipt__intro h1 {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 0;
    font-size: 2rem;
    line-height: 1.25;
  }

  .material-receipt__intro h1 .pi {
    color: var(--quote-copper-light, var(--receipt-paper));
    font-size: 1.5rem;
  }

  .material-receipt__intro p {
    margin: 0.75rem 0 1rem;
    color: color-mix(in sRGB, var(--receipt-paper) 85%, transparent);
  }

  .material-receipt__back {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--receipt-paper);
    font-size: 0.8125rem;
    text-underline-offset: 0.3em;
  }

  .material-receipt__back:hover {
    color: var(--quote-copper-light, var(--receipt-paper));
  }

  .material-receipt[dir='rtl'] .material-receipt__back .pi {
    transform: rotate(180deg);
  }

  .material-receipt__tabs {
    min-width: 0;
  }

  .material-receipt__tabs :deep(.p-tablist-tab-list) {
    gap: 0.25rem;
    border-color: var(--receipt-line);
    background: transparent;
  }

  .material-receipt__tabs :deep(.p-tab) {
    display: inline-flex;
    gap: 0.5rem;
    padding: 0.875rem 1.25rem;
    color: var(--receipt-muted);
    font-weight: 600;
  }

  .material-receipt__tabs :deep(.p-tab[aria-selected='true']) {
    color: var(--receipt-copper);
  }

  .material-receipt__tabs :deep(.p-tabpanels) {
    padding: 1.25rem 0 0;
    background: transparent;
  }

  .material-receipt__panel {
    min-width: 0;
    overflow: hidden;
    border: 1px solid var(--receipt-line);
    border-radius: 16px;
    background: var(--receipt-paper);
  }

  .material-receipt__panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.5rem;
    border-block-end: 1px solid var(--receipt-line);
  }

  .material-receipt__panel-header h2 {
    margin: 0;
    font-size: 1.125rem;
  }

  .material-receipt__panel-header p {
    margin: 0.4rem 0 0;
    color: var(--receipt-muted);
    font-size: 0.875rem;
  }

  .material-receipt__count {
    min-width: 2rem;
    padding: 0.25rem 0.5rem;
    border-radius: 8px;
    background: var(--receipt-canvas);
    font-size: 0.875rem;
    text-align: center;
  }

  .material-receipt__panel-body {
    padding: 1.5rem;
  }

  .material-receipt__empty {
    display: grid;
    justify-items: center;
    gap: 0.5rem;
    padding: 3rem 1rem;
    text-align: center;
  }

  .material-receipt__empty .pi {
    color: var(--receipt-muted);
    font-size: 1.5rem;
  }

  .material-receipt__empty h3,
  .material-receipt__empty p {
    margin: 0;
  }

  .material-receipt__empty p {
    color: var(--receipt-muted);
  }

  .material-receipt__scroll {
    max-width: 100%;
    overflow-x: auto;
  }

  .material-receipt__scroll:focus-visible {
    outline: 2px solid var(--receipt-copper);
    outline-offset: -2px;
  }

  .material-receipt__table {
    width: 100%;
    min-width: 740px;
    border-collapse: collapse;
    font-variant-numeric: tabular-nums;
  }

  .material-receipt__table--requests {
    min-width: 520px;
  }

  .material-receipt__table--history {
    min-width: 1050px;
  }

  .material-receipt__table th,
  .material-receipt__table td {
    padding: 0.875rem;
    border-block-end: 1px solid var(--receipt-line);
    text-align: start;
    vertical-align: middle;
  }

  .material-receipt__table thead {
    background: var(--receipt-canvas);
    color: var(--receipt-muted);
    font-size: 0.8125rem;
  }

  .material-receipt__table tbody tr:last-child > * {
    border-block-end: 0;
  }

  .material-receipt__reference {
    font-weight: 700;
  }

  .material-receipt__status {
    display: inline-block;
    padding: 0.3rem 0.6rem;
    border-radius: 8px;
    background: var(--receipt-canvas);
    white-space: nowrap;
    font-size: 0.8125rem;
    font-weight: 600;
  }

  .material-receipt__status--complete {
    background: var(--quote-success-soft, var(--success-light));
    color: var(--quote-success-ink, var(--success-dark));
  }

  .material-receipt__status--partial {
    background: color-mix(in sRGB, var(--receipt-copper) 9%, var(--receipt-paper));
    color: var(--receipt-copper);
  }

  .material-receipt__dialog,
  .material-receipt__details-dialog {
    width: min(1050px, calc(100vw - 2rem));
    max-height: calc(100dvh - 2rem);
    border: 1px solid var(--receipt-line);
    border-radius: 16px;
    background: var(--receipt-paper);
    color: var(--receipt-ink);
  }

  .material-receipt__details-dialog {
    width: min(640px, calc(100vw - 2rem));
  }

  :deep(.material-receipt__dialog .p-dialog-header),
  :deep(.material-receipt__details-dialog .p-dialog-header) {
    padding: 1.25rem 1.5rem;
    border-block-end: 1px solid var(--receipt-line);
    color: var(--receipt-ink);
  }

  :deep(.material-receipt__dialog .p-dialog-content),
  :deep(.material-receipt__details-dialog .p-dialog-content) {
    padding: 1.5rem;
    background: var(--receipt-paper);
    color: var(--receipt-ink);
  }

  .material-receipt__form {
    display: grid;
    gap: 1.25rem;
  }

  .material-receipt__form [role='alert'],
  .material-receipt__panel-body [role='alert'] {
    margin: 0;
    padding: 0.75rem 1rem;
    border-radius: 10px;
    background: var(--danger-light);
    color: var(--danger-dark);
    line-height: 1.5;
  }

  .material-receipt__form .material-receipt__success {
    margin: 0;
    padding: 0.75rem 1rem;
    border-radius: 10px;
    background: var(--quote-success-soft, var(--success-light));
    color: var(--quote-success-ink, var(--success-dark));
  }

  .material-receipt__form-intro {
    margin: 0;
    color: var(--receipt-muted);
  }

  .material-receipt__selection {
    display: grid;
    gap: 1rem;
  }

  .material-receipt__section-heading {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding-block-start: 0.5rem;
    border-block-start: 1px solid var(--receipt-line);
  }

  .material-receipt__section-heading h2,
  .material-receipt__details h2 {
    margin: 0.75rem 0;
    font-size: 1rem;
  }

  .material-receipt__section-heading span {
    color: var(--receipt-muted);
    font-size: 0.8125rem;
  }

  .material-receipt__table--items th small {
    display: block;
    margin-block-start: 0.25rem;
    color: var(--receipt-muted);
    font-weight: 400;
  }

  .material-receipt__table--items input {
    width: 6.5rem;
  }

  .material-receipt__completed-row {
    background: var(--receipt-canvas);
  }

  .material-receipt__remaining {
    font-weight: 700;
  }

  .material-receipt__remaining--zero {
    color: var(--receipt-muted);
  }

  .material-receipt__fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  .material-receipt__actions {
    display: flex;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 0.75rem;
    padding-block-start: 1rem;
    border-block-start: 1px solid var(--receipt-line);
  }

  .material-receipt__details {
    display: grid;
    gap: 1rem;
  }

  .material-receipt__details-meta {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  .material-receipt__details-meta > div {
    display: grid;
    gap: 0.25rem;
  }

  .material-receipt__details-meta span {
    color: var(--receipt-muted);
    font-size: 0.8125rem;
  }

  .material-receipt__detail-items {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .material-receipt__detail-items li {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.75rem 0;
    border-block-end: 1px solid var(--receipt-line);
  }

  .material-receipt__sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
  }

  .material-receipt :is(a, button, input):focus-visible {
    outline: 2px solid var(--receipt-copper);
    outline-offset: 2px;
  }

  @media (max-width: 700px) {
    .material-receipt {
      padding: 1rem 0.75rem;
    }

    .material-receipt__intro {
      padding: 1.5rem;
    }

    .material-receipt__intro :deep(.app-btn) {
      width: 100%;
    }

    .material-receipt__panel-header,
    .material-receipt__panel-body {
      padding: 1rem;
    }

    .material-receipt__fields,
    .material-receipt__details-meta {
      grid-template-columns: 1fr;
    }

    :deep(.material-receipt__dialog .p-dialog-header),
    :deep(.material-receipt__dialog .p-dialog-content),
    :deep(.material-receipt__details-dialog .p-dialog-header),
    :deep(.material-receipt__details-dialog .p-dialog-content) {
      padding: 1rem;
    }
  }
</style>
