<script setup lang="ts">
  import { computed, ref, watch, onBeforeUnmount } from 'vue';
  import Dialog from 'primevue/dialog';
  import RadioButton from 'primevue/radiobutton';
  import InputText from 'primevue/inputtext';
  import Textarea from 'primevue/textarea';
  import Skeleton from 'primevue/skeleton';
  import HandleFilesUpload, { type UploadedFile } from '@/shared/FormInputs/HandleFilesUpload.vue';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';
  import {
    DataSuccess,
    DataLoading,
  } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import { getDurationTypeNameKey } from '@/modules/shared/Package/core/constants/duration.type.enum';
  import StorePurchaseOrderParams from '../../core/params/store.purchase.order.params';
  import PurchaseOrderController from '../controllers/purchase.order.controller';
  import PurchaseOrderDetails from './PurchaseOrderDetails.vue';
  const props = withDefaults(
    defineProps<{
      quoteId: number;
      purchaseRequestId: number;
      purchaseRequestPriceId?: number;
      allowIssue?: boolean;
    }>(),
    { purchaseRequestPriceId: undefined, allowIssue: true },
  );
  const emit = defineEmits<{ close: [] }>();
  const controller = PurchaseOrderController.getInstance();
  const selectedId = ref<number | null>(null);
  const date = ref('');
  const note = ref('');
  const files = ref<UploadedFile[]>([]);
  const processing = ref(false);
  const attachmentError = ref(false);
  const invalid = ref(false);
  const attempted = ref(false);
  const fetchState = computed(() => controller.fetchState.value);
  const offersState = computed(() => controller.offersState.value);
  const storeState = computed(() => controller.itemState.value);
  const saving = computed(() => controller.isIssuing.value);
  const selected = computed(() =>
    offersState.value.data?.find((offer) => offer.id === selectedId.value),
  );
  watch(
    () => [props.quoteId, props.purchaseRequestId, props.purchaseRequestPriceId, props.allowIssue],
    async () => {
      selectedId.value = props.purchaseRequestPriceId ?? null;
      date.value = '';
      note.value = '';
      files.value = [];
      attempted.value = false;
      const quoteId = props.quoteId;
      const requestId = props.purchaseRequestId;
      if (controller.activate(quoteId, requestId)) {
        if (props.allowIssue) await controller.loadOffers();
        else await controller.fetchOne();
      }
    },
    { immediate: true },
  );
  async function submit() {
    if (
      !props.allowIssue ||
      saving.value ||
      processing.value ||
      attachmentError.value ||
      !controller.canStore.value
    )
      return;
    const params = new StorePurchaseOrderParams(
      props.purchaseRequestId,
      selectedId.value ?? 0,
      note.value || null,
      files.value[0]?.base64 || null,
      date.value,
    );
    invalid.value = !params.validate().isValid || !selected.value;
    if (invalid.value) return;
    attempted.value = true;
    await controller.create(params);
  }
  async function retryOrder() {
    if (props.allowIssue) await controller.retryLastOperation();
    else await controller.fetchOne();
  }
  function close() {
    if (!saving.value && !processing.value) emit('close');
  }
  onBeforeUnmount(() => controller.release());
</script>
<template>
  <Dialog
    :visible="true"
    class="procurement-dialog procurement-order-dialog"
    modal
    :header="$t(allowIssue ? 'procurement.orders.store' : 'procurement.orders.title')"
    :style="{ width: '52rem', maxWidth: '96vw' }"
    :closable="!saving && !processing"
    :close-on-escape="!saving && !processing"
    :dismissable-mask="false"
    @update:visible="close"
  >
    <div :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'">
      <p>{{ $t('procurement.offers.request_reference', { id: purchaseRequestId }) }}</p>
      <Skeleton v-if="!allowIssue && fetchState instanceof DataLoading" height="6rem" />
      <div v-if="controller.issued.value || controller.refreshRequired.value" role="status">
        <p>
          {{
            $t(
              controller.issued.value
                ? 'procurement.orders.created'
                : 'procurement.orders.unconfirmed_store',
            )
          }}
        </p>
      </div>
      <div v-if="!allowIssue && fetchState.hasError" role="alert">
        <p>{{ $t(fetchState.error?.title || 'procurement.orders.fetch_failed') }}</p>
      </div>
      <AppButton
        v-if="(!allowIssue && fetchState.hasError) || controller.refreshRequired.value"
        type="button"
        theme="secondary"
        :disabled="saving"
        @click="retryOrder"
        >{{ $t('procurement.offers.retry_fetch') }}</AppButton
      >
      <PurchaseOrderDetails v-if="!allowIssue && fetchState.data" :order="fetchState.data" />
      <template v-else-if="!allowIssue && fetchState instanceof DataSuccess">
        <p>{{ $t('procurement.orders.empty') }}</p>
        <p v-if="!allowIssue && controller.request.value?.status === 1">
          {{ $t('procurement.orders.issue_from_prices') }}
        </p>
        <p v-if="allowIssue && !controller.canStore.value && !saving">
          {{ $t('procurement.orders.locked') }}
        </p>
      </template>
      <p v-if="allowIssue && !controller.canStore.value && !controller.issued.value && !saving">
        {{ $t('procurement.orders.locked') }}
      </p>
      <form
        v-if="
          allowIssue &&
          !fetchState.data &&
          (controller.canStore.value || saving || attempted) &&
          !controller.issued.value
        "
        class="standard-crud-page purchase-order-form"
        novalidate
        @submit.prevent="submit"
      >
        <fieldset :disabled="saving || processing || !controller.canStore.value">
          <legend>{{ $t('procurement.supplier_prices') }}</legend>
          <Skeleton v-if="offersState instanceof DataLoading" height="5rem" />
          <div v-if="offersState.hasError" role="alert">
            <p>{{ $t(offersState.error?.title || 'procurement.offers.fetch_failed') }}</p>
            <AppButton type="button" theme="secondary" @click="controller.loadOffers()">{{
              $t('procurement.offers.retry_fetch')
            }}</AppButton>
          </div>
          <p v-if="offersState instanceof DataSuccess && !offersState.data?.length">
            {{ $t('procurement.offers.empty') }}
          </p>
          <label
            v-for="offer in offersState.data"
            :key="offer.id"
            class="purchase-order-offer"
            :class="{ 'is-selected': selectedId === offer.id }"
            :for="`order-offer-${offer.id}`"
          >
            <RadioButton
              v-model="selectedId"
              :input-id="`order-offer-${offer.id}`"
              name="purchase-order-offer"
              :value="offer.id"
              :disabled="!offer.supplier"
            />
            <span
              ><strong>{{ offer.supplier?.name || $t('procurement.unavailable') }}</strong
              ><br />{{ $t('procurement.offers.price') }}: {{ offer.price }} ·
              {{ $t('procurement.offers.duration') }}: {{ offer.duration }}
              {{
                offer.durationType == null
                  ? $t('procurement.unavailable')
                  : $t(getDurationTypeNameKey(offer.durationType))
              }}</span
            >
          </label>
          <p v-if="selected" class="purchase-order-selection" role="status">
            <strong>{{ $t('procurement.orders.selected_offer') }}</strong
            >: {{ selected.supplier?.name }} · {{ selected.price }} · {{ selected.duration }}
            {{
              selected.durationType == null ? '' : $t(getDurationTypeNameKey(selected.durationType))
            }}
          </p>
          <div class="purchase-order-fields">
            <div class="field-group input-wrapper">
              <span class="field-help-label-row field-help-label-row--block">
                <label class="field-label label" for="purchase-order-date"
                  >{{ $t('procurement.orders.date') }} *</label
                >
                <FieldHelpIcon
                  :label="$t('procurement.orders.date')"
                  field-name="date"
                  field-id="purchase-order-date"
                /> </span
              ><InputText
                id="purchase-order-date"
                v-model="date"
                class="input"
                type="date"
                required
              />
            </div>
            <div class="field-group input-wrapper">
              <span class="field-help-label-row field-help-label-row--block">
                <label class="field-label label" for="purchase-order-note">{{
                  $t('procurement.orders.notes')
                }}</label>
                <FieldHelpIcon
                  :label="$t('procurement.orders.notes')"
                  field-name="notes"
                  field-id="purchase-order-note"
                /> </span
              ><Textarea id="purchase-order-note" v-model="note" class="input" rows="3" />
            </div>
          </div>
          <HandleFilesUpload
            :label="$t('procurement.orders.attachment')"
            :max-files="1"
            :multiple="false"
            :show-help="false"
            @change="
              files = $event;
              attachmentError = false;
            "
            @processing="processing = $event"
            @error="attachmentError = true"
          />
        </fieldset>
        <p v-if="invalid || attachmentError" role="alert">
          {{ $t('procurement.orders.invalid_form') }}
        </p>
        <div v-if="storeState.error" role="alert">
          <p>{{ $t(storeState.error.title) }}</p>
          <p v-for="(messages, field) in storeState.error.validationErrors" :key="field">
            {{ messages.join(' · ') }}
          </p>
        </div>
        <p
          v-if="attempted && !saving && !storeState.error && !controller.issued.value"
          role="alert"
        >
          {{ $t('procurement.orders.check_required') }}
        </p>
        <footer class="procurement-actions">
          <AppButton
            type="button"
            theme="secondary"
            :disabled="saving || processing"
            @click="close"
            >{{ $t('procurement.cancel') }}</AppButton
          >
          <AppButton
            type="submit"
            class="btn-primary"
            :loading="saving"
            :disabled="
              saving ||
              processing ||
              attachmentError ||
              !controller.canStore.value ||
              !(offersState instanceof DataSuccess) ||
              !selected
            "
            >{{ $t('procurement.orders.store') }}</AppButton
          >
        </footer>
      </form>
    </div>
  </Dialog>
</template>
<style scoped lang="scss">
  .purchase-order-form fieldset {
    min-width: 0;
    padding: 0;
    border: 0;

    legend {
      margin-block-end: 1rem;
      color: var(--procurement-ink);
      font-size: 0.875rem;
      font-weight: 600;
    }
  }

  .purchase-order-offer {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    padding: 1rem 1.25rem;
    margin-block: 0.625rem;
    border: 1px solid var(--procurement-line, var(--border-weak));
    border-radius: 12px;
    background: var(--procurement-paper, var(--bg-card));
    color: var(--procurement-muted, var(--subtitle-color));
    font-size: 0.8125rem;
    line-height: 1.75;
    cursor: pointer;
    overflow-wrap: anywhere;
    transition:
      border-color 180ms ease,
      background-color 180ms ease;

    > span {
      min-width: 0;
    }

    strong {
      color: var(--procurement-ink, var(--title-card-color));
      font-size: 0.9375rem;
    }

    &:hover,
    &:focus-within {
      border-color: var(--procurement-copper, var(--PrimaryColor));
    }

    &.is-selected {
      border-color: var(--procurement-copper, var(--PrimaryColor));
      background: var(--procurement-soft, var(--bg-section));
    }
  }

  .purchase-order-selection {
    overflow-wrap: anywhere;
    line-height: 1.65;
    padding-block: 0.75rem;
    margin-block: 0.5rem 1rem;
    color: var(--procurement-ink, var(--title-card-color));
    font-size: 0.8125rem;
    border-block-end: 1px solid var(--procurement-line, var(--border-weak));
  }

  .purchase-order-fields {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    margin-block-end: 1rem;
  }

  .procurement-actions {
    padding-block-start: 1rem;
    margin-block-start: 1rem;
    border-block-start: 1px solid var(--procurement-line, var(--border-weak));
  }

  @media (max-width: 600px) {
    .purchase-order-fields {
      grid-template-columns: 1fr;
      gap: 0.75rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .purchase-order-offer {
      transition: none;
    }
  }
</style>
