<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import Dialog from 'primevue/dialog';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import TitleInterface from '@/base/Data/Models/titleInterface';
  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import EmployeeController from '@/modules/MainOrganization/employee/presentation/controllers/employee.controller';
  import IndexEmployeeParams from '@/modules/MainOrganization/employee/core/params/index.employee.params';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import StorePurchaseRequestReceiptParams from '../../core/params/store-purchase-request-receipt.params';
  import type PurchaseRequestReceiptItemSummaryModel from '../../core/models/purchase-request-receipt-item-summary.model';
  import MaterialReceiptController from '../controllers/material-receipt.controller';

  const errorStateSlots = ['failed', 'timeout', 'no-network', 'rate-limited'] as const;
  const receiptDialogVisible = defineModel<boolean>('visible', { required: true });
  const { t, te } = useI18n();
  const controller = MaterialReceiptController.getInstance();
  const selected = ref<TitleInterface<string | number> | null>(null);
  const receiver = ref<TitleInterface<string | number> | null>(null);
  const today = new Date();
  const date = ref(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
  );
  const quantities = ref<Record<number, string>>({});
  const formError = ref('');
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
  function closeReceipt() {
    if (controller.isStoring.value) return;
    receiptDialogVisible.value = false;
  }
  function resetEntry() {
    quantities.value = {};
    receiver.value = null;
    formError.value = '';
  }
  function receiptSubmission(purchaseRequestId: number) {
    return StorePurchaseRequestReceiptParams.fromEntries({
      purchaseRequestId,
      ...(receiver.value ? { employeeId: Number(receiver.value.id) } : {}),
      date: date.value,
      entries: summaries.value.map((row) => ({
        purchaseRequestItemId: row.purchaseRequestItem.id,
        quantity: String(quantities.value[row.purchaseRequestItem.id] ?? ''),
        remainingQuantity: row.remainingQuantity,
      })),
    });
  }
  async function save() {
    if (!canEdit.value || !controller.purchaseRequestId.value) return;
    formError.value = '';
    const prepared = receiptSubmission(controller.purchaseRequestId.value);
    if (prepared.errors.length) {
      formError.value = prepared.errors[0] ?? 'material_receipt.invalid_form';
      return;
    }
    const validation = prepared.params.validate();
    if (!validation.isValid) {
      formError.value = validation.errors[0]?.message ?? 'material_receipt.invalid_form';
      return;
    }
    const savedReceipt = await controller.create(prepared.params);
    if (savedReceipt instanceof DataSuccess) resetEntry();
  }
  watch(receiptDialogVisible, () => {
    resetEntry();
    selectRequest(null);
  });
</script>
<template>
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
      <DataStatusBuilder
        :controller="controller.requestsState.value"
        :on-retry="
          async () => {
            await controller.loadRequests();
          }
        "
        use-skeleton
      >
        <template
          v-for="slotName in errorStateSlots"
          :key="slotName"
          #[slotName]="{ state: resourceState }"
        >
          <div>
            <p role="alert">{{ displayError(resourceState.error?.displayMessage) }}</p>
            <AppButton type="button" theme="secondary" @click="controller.loadRequests()">{{
              $t('material_receipt.retry')
            }}</AppButton>
          </div>
        </template>
        <template #success>
          <div v-if="!requests.length" class="material-receipt__empty">
            <h2>{{ $t('material_receipt.no_requests') }}</h2>
            <p>{{ $t('material_receipt.no_requests_hint') }}</p>
          </div>
        </template>
        <template #empty>
          <div class="material-receipt__empty">
            <h2>{{ $t('material_receipt.no_requests') }}</h2>
            <p>{{ $t('material_receipt.no_requests_hint') }}</p>
          </div>
        </template>
      </DataStatusBuilder>
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
        <DataStatusBuilder
          :controller="controller.orderState.value"
          :on-retry="
            async () => {
              await controller.loadOrder();
            }
          "
        >
          <template
            v-for="slotName in errorStateSlots"
            :key="slotName"
            #[slotName]="{ state: resourceState }"
          >
            <div>
              <p role="alert">{{ displayError(resourceState.error?.displayMessage) }}</p>
              <AppButton type="button" theme="secondary" @click="controller.loadOrder()">{{
                $t('material_receipt.retry')
              }}</AppButton>
            </div>
          </template>
          <template #loader
            ><p role="status">{{ $t('material_receipt.checking_order') }}</p></template
          >
          <template #success>
            <p v-if="controller.orderState.value.data?.status !== 3" role="status">
              {{ $t('material_receipt.order_required') }}
            </p>
          </template>
          <template #empty
            ><p role="status">{{ $t('material_receipt.order_required') }}</p></template
          >
        </DataStatusBuilder>
        <DataStatusBuilder
          :controller="controller.listState.value"
          :on-retry="
            async () => {
              await controller.loadSummary();
            }
          "
          use-skeleton
        >
          <template
            v-for="slotName in errorStateSlots"
            :key="slotName"
            #[slotName]="{ state: resourceState }"
          >
            <div>
              <p role="alert">{{ displayError(resourceState.error?.displayMessage) }}</p>
              <AppButton type="button" theme="secondary" @click="controller.loadSummary()">{{
                $t('material_receipt.retry')
              }}</AppButton>
            </div>
          </template>
          <template #empty
            ><p>{{ $t('material_receipt.no_items') }}</p></template
          >
          <template #success>
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
        </DataStatusBuilder>
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
</template>
