<script setup lang="ts">
  import { computed, onBeforeUnmount, ref, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import { useI18n } from 'vue-i18n';
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
  const expandedReceiptId = ref<number | null>(null);
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
  const history = computed(() => controller.visibleHistory.value);
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
    expandedReceiptId.value = null;
    controller.selectRequest(selected.value ? Number(selected.value.id) : null);
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
      expandedReceiptId.value = null;
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
      <header class="material-receipt__header feature-header-container">
        <div>
          <p>{{ $t('material_receipt.warehouse') }}</p>
          <h1>{{ $t('material_receipt.title') }}</h1>
          <p>{{ $t('material_receipt.subtitle') }}</p>
        </div>
        <RouterLink :to="quotePath(route.path, quoteId)">{{
          $t('material_receipt.back')
        }}</RouterLink>
      </header>
      <section class="document-form-card" aria-labelledby="receiving-heading">
        <div class="document-form-header">
          <h2 id="receiving-heading">{{ $t('material_receipt.receiving') }}</h2>
        </div>
        <div class="material-receipt__body">
          <p v-if="controller.requestsState.value instanceof DataLoading" role="status">
            {{ $t('material_receipt.loading_requests') }}
          </p>
          <p v-if="controller.requestsState.value.hasError" role="alert">
            {{ displayError(controller.requestsState.value.error?.displayMessage) }}
          </p>
          <AppButton
            v-if="controller.requestsState.value.hasError"
            type="button"
            theme="secondary"
            @click="controller.loadRequests()"
            >{{ $t('material_receipt.retry') }}</AppButton
          >
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
            >
              <template #LabelHeader
                ><span class="field-help-label-row"
                  ><FieldHelpIcon
                    :label="$t('material_receipt.purchase_request')"
                    field-name="purchase_request"
                    field-id="receipt-purchase-request"
                    :help-text="$t('material_receipt.request_help')" /></span
              ></template>
            </UpdatedCustomInputSelect>
          </div>
          <p
            v-if="
              controller.purchaseRequestId.value &&
              controller.listState.value instanceof DataLoading
            "
            role="status"
          >
            {{ $t('material_receipt.loading_summary') }}
          </p>
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
          <p
            v-else-if="
              controller.purchaseRequestId.value && controller.orderState.value.data?.status !== 3
            "
            role="status"
          >
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
            <h3>{{ $t('material_receipt.requested_items') }}</h3>
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
              <table>
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
                  <tr v-for="row in summaries" :key="row.purchaseRequestItem.id">
                    <th scope="row">
                      {{
                        row.purchaseRequestItem.itemable?.title ??
                        $t('material_receipt.item_number', { id: row.purchaseRequestItem.id })
                      }}
                      <small>{{ $t(`procurement.${row.purchaseRequestItem.itemableType}`) }}</small>
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
                    <td>{{ row.remainingQuantity }}</td>
                    <td>
                      <div class="field-group input-wrapper">
                        <span class="field-help-label-row field-help-label-row--block">
                          <label
                            class="material-receipt__sr-only"
                            :for="`receive-${row.purchaseRequestItem.id}`"
                            >{{
                              $t('material_receipt.receive_item', {
                                id: row.purchaseRequestItem.id,
                              })
                            }}</label
                          >
                          <FieldHelpIcon
                            :label="
                              $t('material_receipt.receive_item', {
                                id: row.purchaseRequestItem.id,
                              })
                            "
                            field-name="receive_quantity"
                            :field-id="`receive-${row.purchaseRequestItem.id}`"
                            :help-text="$t('material_receipt.quantity_help')"
                          />
                        </span>
                        <input
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
                            $t('material_receipt.receive_item', { id: row.purchaseRequestItem.id })
                          "
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
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
            <p v-if="formError" role="alert">{{ formErrorText }}</p>
            <p v-if="controller.mutationState.value.hasError" role="alert">
              {{ displayError(controller.mutationState.value.error?.displayMessage) }}
            </p>
            <p v-if="controller.submissionUncertain.value" role="alert">
              {{ $t('material_receipt.unconfirmed_store') }}
            </p>
            <p v-if="controller.mutationState.value instanceof DataSuccess" role="status">
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
              ><AppButton
                v-if="controller.refreshFailed.value"
                type="button"
                theme="secondary"
                @click="controller.retryRefresh()"
                >{{ $t('material_receipt.retry') }}</AppButton
              ><AppButton
                type="button"
                :loading="controller.isStoring.value"
                :disabled="!canEdit"
                @click="save"
                >{{ $t('material_receipt.save') }}</AppButton
              >
            </div>
          </template>
          <div
            v-if="
              controller.refreshFailed.value && !(controller.listState.value instanceof DataSuccess)
            "
            role="alert"
          >
            <p>{{ $t('material_receipt.refresh_failed') }}</p>
            <AppButton type="button" theme="secondary" @click="controller.retryRefresh()">{{
              $t('material_receipt.retry')
            }}</AppButton>
          </div>
        </div>
      </section>
      <section class="document-form-card" aria-labelledby="receipt-history-heading">
        <div class="document-form-header">
          <h2 id="receipt-history-heading">{{ $t('material_receipt.history') }}</h2>
        </div>
        <div class="material-receipt__body">
          <p v-if="controller.historyState.value instanceof DataLoading" role="status">
            {{ $t('material_receipt.loading_history') }}
          </p>
          <p v-if="controller.historyState.value.hasError" role="alert">
            {{ displayError(controller.historyState.value.error?.displayMessage) }}
          </p>
          <AppButton
            v-if="controller.historyState.value.hasError"
            type="button"
            theme="secondary"
            @click="controller.loadHistory()"
            >{{ $t('material_receipt.retry') }}</AppButton
          >
          <p v-if="controller.historyState.value instanceof DataSuccess && !history.length">
            {{ $t('material_receipt.no_receipts') }}
          </p>
          <div
            v-if="history.length"
            class="material-receipt__scroll"
            role="region"
            tabindex="0"
            :aria-label="$t('material_receipt.history')"
          >
            <table>
              <thead>
                <tr>
                  <th scope="col">{{ $t('material_receipt.receipt_id') }}</th>
                  <th scope="col">{{ $t('material_receipt.purchase_request') }}</th>
                  <th scope="col">{{ $t('material_receipt.receipt_date') }}</th>
                  <th scope="col">{{ $t('material_receipt.receiving_employee') }}</th>
                  <th scope="col">{{ $t('material_receipt.recorded_by') }}</th>
                  <th scope="col">{{ $t('material_receipt.status') }}</th>
                  <th scope="col">{{ $t('material_receipt.items_count') }}</th>
                  <th scope="col">{{ $t('material_receipt.created_at') }}</th>
                  <th scope="col">{{ $t('material_receipt.details') }}</th>
                </tr>
              </thead>
              <tbody v-for="receipt in history" :key="receipt.id">
                <tr>
                  <th scope="row">#{{ receipt.id }}</th>
                  <td>#{{ receipt.purchaseRequestId }}</td>
                  <td>{{ receipt.date }}</td>
                  <td>{{ receipt.employee?.name ?? $t('procurement.unavailable') }}</td>
                  <td>{{ receipt.organizationEmployee.name }}</td>
                  <td>
                    {{
                      $t(
                        receipt.status === 1
                          ? 'material_receipt.partial'
                          : 'material_receipt.complete',
                      )
                    }}
                  </td>
                  <td>{{ receipt.items.length }}</td>
                  <td>{{ receipt.createdAt }}</td>
                  <td>
                    <AppButton
                      type="button"
                      theme="secondary"
                      size="sm"
                      :aria-expanded="expandedReceiptId === receipt.id"
                      @click="
                        expandedReceiptId = expandedReceiptId === receipt.id ? null : receipt.id
                      "
                      >{{ $t('material_receipt.details') }}</AppButton
                    >
                  </td>
                </tr>
                <tr v-if="expandedReceiptId === receipt.id">
                  <td colspan="9">
                    <div class="material-receipt__details">
                      <h3>{{ $t('material_receipt.receipt_id') }} #{{ receipt.id }}</h3>
                      <ul>
                        <li v-for="item in receipt.items" :key="item.id">
                          {{ itemTitle(item.purchaseRequestItemId) }} · {{ item.quantity }}
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </template>
  </section>
</template>
<style scoped lang="scss">
  .material-receipt {
    display: grid;
    gap: 1.25rem;
    padding: 1rem;
  }

  .material-receipt__header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    gap: 1rem;
  }

  .material-receipt__header h1 {
    margin: 0;
  }

  .material-receipt__body {
    padding: 1.25rem;
  }

  .material-receipt__scroll {
    overflow-x: auto;
    max-width: 100%;
  }

  .material-receipt table {
    width: 100%;
    border-collapse: collapse;
    min-width: 780px;
  }

  .material-receipt th,
  .material-receipt td {
    padding: 0.75rem;
    border-bottom: 1px solid var(--border-weak);
    text-align: start;
    vertical-align: middle;
  }

  .material-receipt thead {
    background: var(--bg-section);
  }

  .material-receipt__fields {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
    gap: 1rem;
    margin-block: 1.25rem;
  }

  .material-receipt__actions {
    display: flex;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .material-receipt__details {
    padding: 0.5rem 1rem;
  }

  .material-receipt__sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
  }

  @media (max-width: 600px) {
    .material-receipt {
      padding: 0.5rem;
    }

    .material-receipt__header {
      flex-direction: column;
    }

    .material-receipt__body {
      padding: 0.75rem;
    }
  }
</style>
