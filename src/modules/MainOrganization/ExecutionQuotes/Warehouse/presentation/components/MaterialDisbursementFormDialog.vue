<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import Dialog from 'primevue/dialog';
  import Textarea from 'primevue/textarea';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import type TitleInterface from '@/base/Data/Models/titleInterface';
  import EmployeeController from '@/modules/MainOrganization/employee/presentation/controllers/employee.controller';
  import IndexEmployeeParams from '@/modules/MainOrganization/employee/core/params/index.employee.params';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import StorePurchaseRequestDisbursementParams from '../../core/params/store-purchase-request-disbursement.params';
  import MaterialDisbursementController from '../controllers/material-disbursement.controller';

  const errorStateSlots = ['failed', 'timeout', 'no-network', 'rate-limited'] as const;
  const visible = defineModel<boolean>('visible', { required: true });
  const { t, te } = useI18n();
  const controller = MaterialDisbursementController.getInstance();
  const employeeController = EmployeeController.getInstance();
  const employeeParams = new IndexEmployeeParams('', 1, 10, 0);
  const receiver = ref<TitleInterface<string | number> | null>(null);
  const today = new Date();
  const date = ref(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
  );
  const notes = ref('');
  const selected = ref<Record<number, boolean>>({});
  const quantities = ref<Record<number, string>>({});
  const formError = ref('');
  const stock = computed(() => controller.listState.value.data ?? []);
  const canEdit = computed(
    () =>
      controller.listState.value instanceof DataSuccess &&
      !controller.isStoring.value &&
      !controller.refreshFailed.value &&
      !controller.submissionUncertain.value,
  );
  const hasAvailable = computed(() => stock.value.some((row) => row.canIssue));
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
  function resetEntry() {
    receiver.value = null;
    notes.value = '';
    selected.value = {};
    quantities.value = {};
    formError.value = '';
  }
  function close() {
    if (!controller.isStoring.value) visible.value = false;
  }
  async function save() {
    if (!canEdit.value || !controller.quoteId.value) return;
    formError.value = '';
    const prepared = StorePurchaseRequestDisbursementParams.fromEntries({
      quoteId: controller.quoteId.value,
      receiverId: Number(receiver.value?.id ?? 0),
      date: date.value,
      ...(notes.value.trim() ? { notes: notes.value.trim() } : {}),
      entries: stock.value.map((row) => ({
        purchaseRequestItemId: row.purchaseRequestItem.id,
        selected: selected.value[row.purchaseRequestItem.id] ?? false,
        quantity: String(quantities.value[row.purchaseRequestItem.id] ?? ''),
        availableQuantity: row.availableQuantity,
      })),
    });
    if (prepared.errors.length) {
      formError.value = prepared.errors[0] ?? 'material_disbursement.invalid_form';
      return;
    }
    const validation = prepared.params.validate();
    if (!validation.isValid) {
      const error = validation.errors[0];
      if (error?.field === 'receiverId') formError.value = 'material_disbursement.invalid_receiver';
      else if (error?.field === 'date') formError.value = 'material_disbursement.invalid_date';
      else if (error?.field.startsWith('items.'))
        formError.value = error.message.startsWith('material_disbursement.')
          ? error.message
          : 'material_disbursement.invalid_quantity';
      else formError.value = 'material_disbursement.invalid_form';
      return;
    }
    const saved = await controller.create(prepared.params);
    if (saved instanceof DataSuccess) resetEntry();
  }
  watch(visible, (isVisible) => {
    if (isVisible) {
      resetEntry();
      controller.clearMutation();
    }
  });
</script>
<template>
  <Dialog
    :visible="visible"
    modal
    append-to="self"
    class="material-receipt__dialog"
    :header="$t('material_disbursement.issue_materials')"
    :closable="!controller.isStoring.value"
    :close-on-escape="!controller.isStoring.value"
    :dismissable-mask="false"
    @update:visible="!$event && close()"
  >
    <form class="material-receipt__form" novalidate @submit.prevent="save">
      <p class="material-receipt__form-intro">{{ $t('material_disbursement.immediate_notice') }}</p>
      <DataStatusBuilder
        :controller="controller.listState.value"
        :on-retry="
          async () => {
            await controller.loadStock();
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
            <AppButton type="button" theme="secondary" @click="controller.loadStock()">{{
              $t('material_receipt.retry')
            }}</AppButton>
          </div>
        </template>
        <template #empty
          ><p>{{ $t('material_disbursement.no_stock') }}</p></template
        >
        <template #success>
          <div v-if="!stock.length || !hasAvailable" class="material-receipt__empty">
            <h2>{{ $t('material_disbursement.no_available_stock') }}</h2>
            <p>{{ $t('material_disbursement.no_stock_hint') }}</p>
          </div>
          <template v-if="stock.length">
            <div class="material-receipt__section-heading">
              <h2>{{ $t('material_disbursement.select_items') }}</h2>
            </div>
            <div
              class="material-receipt__scroll"
              role="region"
              tabindex="0"
              :aria-label="$t('material_disbursement.select_items')"
            >
              <table class="material-receipt__table material-disbursement__stock-table">
                <thead>
                  <tr>
                    <th scope="col">{{ $t('material_disbursement.select') }}</th>
                    <th scope="col">{{ $t('material_receipt.item') }}</th>
                    <th scope="col">{{ $t('material_disbursement.received_quantity') }}</th>
                    <th scope="col">{{ $t('material_disbursement.disbursed_quantity') }}</th>
                    <th scope="col">{{ $t('material_disbursement.available_quantity') }}</th>
                    <th scope="col">{{ $t('material_disbursement.issue_now') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="row in stock"
                    :key="row.purchaseRequestItem.id"
                    :class="{ 'material-receipt__completed-row': !row.canIssue }"
                  >
                    <td>
                      <input
                        :id="`issue-select-${row.purchaseRequestItem.id}`"
                        v-model="selected[row.purchaseRequestItem.id]"
                        type="checkbox"
                        :disabled="!canEdit || !row.canIssue"
                        :aria-label="
                          $t('material_disbursement.select_item', {
                            id: row.purchaseRequestItem.id,
                          })
                        "
                      />
                    </td>
                    <th scope="row">
                      <label :for="`issue-select-${row.purchaseRequestItem.id}`">{{
                        row.purchaseRequestItem.title
                      }}</label
                      ><small>#{{ row.purchaseRequestItem.id }}</small>
                    </th>
                    <td>{{ row.receivedQuantity }}</td>
                    <td>{{ row.disbursedQuantity }}</td>
                    <td>
                      <strong :class="{ 'material-receipt__remaining--zero': !row.canIssue }">{{
                        row.availableQuantity
                      }}</strong>
                    </td>
                    <td>
                      <div class="field-group input-wrapper">
                        <label
                          class="material-receipt__sr-only"
                          :for="`issue-${row.purchaseRequestItem.id}`"
                          >{{
                            $t('material_disbursement.issue_item', {
                              id: row.purchaseRequestItem.id,
                            })
                          }}</label
                        ><input
                          :id="`issue-${row.purchaseRequestItem.id}`"
                          v-model="quantities[row.purchaseRequestItem.id]"
                          class="input"
                          type="number"
                          min="0"
                          step="0.01"
                          inputmode="decimal"
                          :max="row.availableQuantity"
                          :disabled="
                            !canEdit || !row.canIssue || !selected[row.purchaseRequestItem.id]
                          "
                          :aria-label="
                            $t('material_disbursement.issue_item', {
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
          </template>
        </template>
      </DataStatusBuilder>

      <div class="material-receipt__section-heading">
        <h2>{{ $t('material_disbursement.issue_information') }}</h2>
      </div>
      <div class="material-receipt__fields">
        <div class="field-group">
          <UpdatedCustomInputSelect
            id="disbursement-receiver"
            :model-value="receiver"
            label="material_disbursement.receiver"
            :placeholder="$t('material_disbursement.select_receiver')"
            :controller="employeeController"
            :params="employeeParams"
            :disabled="!canEdit || !hasAvailable"
            paginated
            required
            @update:model-value="receiver = single($event)"
            ><template #LabelHeader
              ><span class="field-help-label-row"
                ><FieldHelpIcon
                  :label="$t('material_disbursement.receiver')"
                  field-name="receiver"
                  field-id="disbursement-receiver"
                  :help-text="$t('material_disbursement.receiver_help')" /></span></template
          ></UpdatedCustomInputSelect>
        </div>
        <div class="field-group input-wrapper">
          <span class="field-help-label-row field-help-label-row--block"
            ><label class="field-label label" for="disbursement-date">{{
              $t('material_disbursement.issue_date')
            }}</label
            ><FieldHelpIcon
              :label="$t('material_disbursement.issue_date')"
              field-name="disbursement_date"
              field-id="disbursement-date"
              :help-text="$t('material_disbursement.date_help')" /></span
          ><input
            id="disbursement-date"
            v-model="date"
            class="input"
            type="date"
            :disabled="!canEdit || !hasAvailable"
            required
          />
        </div>
      </div>
      <div class="field-group input-wrapper">
        <label class="field-label label" for="disbursement-notes">{{
          $t('material_disbursement.notes')
        }}</label
        ><Textarea
          id="disbursement-notes"
          v-model="notes"
          rows="3"
          :disabled="!canEdit || !hasAvailable"
          :placeholder="$t('material_disbursement.notes_hint')"
        />
      </div>

      <p v-if="formError" role="alert">{{ formErrorText }}</p>
      <p v-if="controller.mutationState.value.hasError" role="alert">
        {{ displayError(controller.mutationState.value.error?.displayMessage) }}
      </p>
      <p v-if="controller.submissionUncertain.value" role="alert">
        {{ $t('material_disbursement.unconfirmed_store') }}
      </p>
      <p
        v-if="controller.mutationState.value instanceof DataSuccess"
        class="material-receipt__success"
        role="status"
      >
        {{ $t('material_disbursement.saved') }}
      </p>
      <p v-if="controller.refreshFailed.value" role="alert">
        {{ $t('material_disbursement.refresh_failed') }}
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
          @click="close"
          >{{ $t('material_receipt.close') }}</AppButton
        >
        <AppButton
          v-if="controller.refreshFailed.value || controller.submissionUncertain.value"
          type="button"
          theme="secondary"
          @click="controller.retryRefresh()"
          >{{ $t('material_disbursement.retry_read') }}</AppButton
        >
        <AppButton
          type="button"
          :loading="controller.isStoring.value"
          :disabled="!canEdit || !hasAvailable"
          @click="save"
          >{{ $t('material_disbursement.issue_materials') }}</AppButton
        >
      </div>
    </form>
  </Dialog>
</template>
