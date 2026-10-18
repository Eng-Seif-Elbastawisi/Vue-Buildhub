<script setup lang="ts">
  import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
  import RadioButton from 'primevue/radiobutton';
  import InputText from 'primevue/inputtext';
  import Textarea from 'primevue/textarea';
  import Skeleton from 'primevue/skeleton';
  import HandleFilesUpload, { type UploadedFile } from '@/shared/FormInputs/HandleFilesUpload.vue';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';
  import StandardFormLayout from '@/shared/components/form/StandardFormLayout.vue';
  import {
    DataSuccess,
    DataLoading,
  } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import { getDurationTypeNameKey } from '@/modules/shared/Package/core/constants/duration.type.enum';
  import StorePurchaseOrderParams from '../../core/params/store.purchase.order.params';
  import PurchaseOrderController from '../controllers/purchase.order.controller';

  const props = defineProps<{
    quoteId: number;
    purchaseRequestId: number;
    purchaseRequestPriceId?: number;
  }>();
  const emit = defineEmits<{ cancel: []; created: []; manageOffers: [] }>();
  const controller = PurchaseOrderController.getInstance();
  const selectedId = ref<number | null>(null);
  const date = ref('');
  const note = ref('');
  const files = ref<UploadedFile[]>([]);
  const processing = ref(false);
  const attachmentError = ref(false);
  const validationFields = ref<string[]>([]);
  const attempted = ref(false);
  const formRef = ref<InstanceType<typeof StandardFormLayout> | null>(null);
  const offersState = computed(() => controller.offersState.value);
  const storeState = computed(() => controller.itemState.value);
  const saving = computed(() => controller.isIssuing.value);
  const selected = computed(() =>
    offersState.value.data?.find((offer) => offer.id === selectedId.value),
  );
  const dirty = computed(
    () =>
      selectedId.value !== (props.purchaseRequestPriceId ?? null) ||
      !!date.value ||
      !!note.value ||
      files.value.length > 0,
  );
  const backendValidation = computed(() => storeState.value.error?.validationErrors ?? {});
  function fieldMessages(...fields: string[]) {
    return fields.flatMap((field) => backendValidation.value[field] ?? []);
  }
  const offerMessages = computed(() =>
    fieldMessages('purchase_request_price_id', 'purchaseRequestPriceId'),
  );
  const dateMessages = computed(() => fieldMessages('date'));
  const fileMessages = computed(() => fieldMessages('file'));
  const offerInvalid = computed(
    () =>
      (validationFields.value.includes('purchaseRequestPriceId') && !selected.value) ||
      !!offerMessages.value.length,
  );
  const dateInvalid = computed(
    () => validationFields.value.includes('date') || !!dateMessages.value.length,
  );
  const otherMessages = computed(() =>
    Object.entries(backendValidation.value)
      .filter(
        ([field]) =>
          !['purchase_request_price_id', 'purchaseRequestPriceId', 'date', 'file'].includes(field),
      )
      .flatMap(([, messages]) => messages),
  );
  watch(selectedId, () => {
    validationFields.value = validationFields.value.filter(
      (field) => field !== 'purchaseRequestPriceId',
    );
  });
  watch(date, () => {
    validationFields.value = validationFields.value.filter((field) => field !== 'date');
  });

  watch(
    () => [props.quoteId, props.purchaseRequestId, props.purchaseRequestPriceId],
    () => {
      selectedId.value = props.purchaseRequestPriceId ?? null;
      date.value = '';
      note.value = '';
      files.value = [];
      validationFields.value = [];
      attempted.value = false;
      if (controller.activate(props.quoteId, props.purchaseRequestId)) void controller.loadOffers();
    },
    { immediate: true },
  );

  function finishIfConfirmed() {
    if (
      controller.issued.value &&
      !controller.refreshRequired.value &&
      controller.fetchState.value.data
    )
      emit('created');
  }
  async function focusFirstInvalid() {
    await nextTick();
    const form = formRef.value?.$el as HTMLElement | undefined;
    const control =
      validationFields.value.includes('purchaseRequestPriceId') ||
      offerMessages.value.length ||
      !selected.value
        ? form?.querySelector<HTMLElement>('[name="purchase-order-offer"]')
        : validationFields.value.includes('date') || dateMessages.value.length
          ? form?.querySelector<HTMLElement>('#purchase-order-date')
          : fileMessages.value.length
            ? form?.querySelector<HTMLElement>('input[type="file"]')
            : null;
    control?.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
    control?.focus();
  }
  async function submit() {
    if (saving.value || processing.value || attachmentError.value || !controller.canStore.value)
      return;
    const params = new StorePurchaseOrderParams(
      props.purchaseRequestId,
      selectedId.value ?? 0,
      note.value || null,
      files.value[0]?.base64 || null,
      date.value,
    );
    validationFields.value = params.validate().errors.map((error) => error.field);
    if (!selected.value && !validationFields.value.includes('purchaseRequestPriceId'))
      validationFields.value.unshift('purchaseRequestPriceId');
    if (validationFields.value.length) {
      await focusFirstInvalid();
      return;
    }
    attempted.value = true;
    await controller.create(params);
    finishIfConfirmed();
    if (Object.keys(backendValidation.value).length) await focusFirstInvalid();
  }
  async function retryOrder() {
    await controller.retryLastOperation();
    finishIfConfirmed();
  }
  onBeforeUnmount(() => controller.release());
  defineExpose({ processing, saving, dirty });
</script>
<template>
  <StandardFormLayout
    ref="formRef"
    as="form"
    embedded
    class="purchase-order-form"
    novalidate
    :aria-busy="saving"
    :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'"
    @submit.prevent="submit"
  >
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
      <AppButton
        v-if="controller.refreshRequired.value"
        type="button"
        theme="secondary"
        :disabled="saving"
        @click="retryOrder"
        >{{ $t('procurement.offers.retry_fetch') }}</AppButton
      >
    </div>
    <p v-if="!controller.canStore.value && !controller.issued.value && !saving" role="alert">
      {{ $t('procurement.orders.locked') }}
    </p>
    <fieldset :disabled="saving || processing || !controller.canStore.value">
      <section
        class="procurement-panel purchase-order-section"
        aria-labelledby="order-offers-heading"
      >
        <header class="procurement-header procurement-section-header">
          <div>
            <h2 id="order-offers-heading">{{ $t('procurement.supplier_prices') }}</h2>
            <p>{{ $t('procurement.orders.offer_help') }}</p>
          </div>
          <AppButton
            v-if="controller.request.value?.status === 1"
            type="button"
            theme="secondary"
            :disabled="saving || processing"
            @click="emit('manageOffers')"
            >{{ $t('procurement.offers.page_title') }}</AppButton
          >
        </header>
        <Skeleton v-if="offersState instanceof DataLoading" height="5rem" />
        <div v-if="offersState.hasError" role="alert">
          <p>{{ $t(offersState.error?.title || 'procurement.offers.fetch_failed') }}</p>
          <AppButton type="button" theme="secondary" @click="controller.loadOffers()">{{
            $t('procurement.offers.retry_fetch')
          }}</AppButton>
        </div>
        <div
          v-if="offersState instanceof DataSuccess && !offersState.data?.length"
          class="purchase-order-offers-empty"
          role="status"
        >
          <strong>{{ $t('procurement.offers.empty') }}</strong>
          <p>{{ $t('procurement.orders.no_offers_help') }}</p>
        </div>
        <div
          class="purchase-order-offers"
          :class="{ 'is-invalid': offerInvalid }"
          role="radiogroup"
          :aria-label="$t('procurement.supplier_prices')"
          :aria-invalid="offerInvalid"
          :aria-describedby="offerInvalid ? 'purchase-order-offer-error' : undefined"
        >
          <label
            v-for="offer in offersState.data"
            :key="offer.id"
            class="purchase-order-offer"
            :class="{ 'is-selected': selectedId === offer.id, 'is-disabled': !offer.supplier }"
            :for="`order-offer-${offer.id}`"
          >
            <RadioButton
              v-model="selectedId"
              :input-id="`order-offer-${offer.id}`"
              name="purchase-order-offer"
              :value="offer.id"
              :disabled="!offer.supplier"
            />
            <span class="purchase-order-offer__content">
              <strong
                ><bdi>{{ offer.supplier?.name || $t('procurement.unavailable') }}</bdi></strong
              >
              <span class="purchase-order-offer__facts">
                <span
                  ><small>{{ $t('procurement.offers.price') }}</small
                  ><bdi>{{ offer.price ?? $t('procurement.unavailable') }}</bdi></span
                >
                <span
                  ><small>{{ $t('procurement.offers.duration') }}</small
                  >{{ offer.duration ?? $t('procurement.unavailable') }}
                  {{
                    offer.durationType == null
                      ? $t('procurement.unavailable')
                      : $t(getDurationTypeNameKey(offer.durationType))
                  }}</span
                >
              </span>
            </span>
          </label>
        </div>
        <small
          v-if="validationFields.includes('purchaseRequestPriceId') && !selected"
          id="purchase-order-offer-error"
          class="procurement-error"
          role="alert"
          >{{ $t('procurement.orders.select_offer_error') }}</small
        >
        <small
          v-for="(message, index) in offerMessages"
          :id="
            index === 0 && !validationFields.includes('purchaseRequestPriceId')
              ? 'purchase-order-offer-error'
              : undefined
          "
          :key="index"
          class="procurement-error"
          role="alert"
          >{{ message }}</small
        >
        <p v-if="selected" class="purchase-order-selection" role="status">
          <strong>{{ $t('procurement.orders.selected_offer') }}</strong
          >: {{ selected.supplier?.name || $t('procurement.unavailable') }} ·
          {{ selected.price ?? $t('procurement.unavailable') }} ·
          {{ selected.duration ?? $t('procurement.unavailable') }}
          {{
            selected.durationType == null ? '' : $t(getDurationTypeNameKey(selected.durationType))
          }}
        </p>
      </section>
      <section
        class="procurement-panel purchase-order-section"
        aria-labelledby="order-details-heading"
      >
        <header class="procurement-header procurement-section-header">
          <div>
            <h2 id="order-details-heading">{{ $t('procurement.orders.details_section') }}</h2>
          </div>
        </header>
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
              />
            </span>
            <InputText
              id="purchase-order-date"
              v-model="date"
              class="input"
              type="date"
              required
              :aria-invalid="dateInvalid"
              :aria-describedby="dateInvalid ? 'purchase-order-date-error' : undefined"
            />
            <small
              v-if="validationFields.includes('date')"
              id="purchase-order-date-error"
              class="procurement-error"
              role="alert"
              >{{ $t('procurement.orders.date_error') }}</small
            >
            <small
              v-for="(message, index) in dateMessages"
              :id="
                index === 0 && !validationFields.includes('date')
                  ? 'purchase-order-date-error'
                  : undefined
              "
              :key="index"
              class="procurement-error"
              role="alert"
              >{{ message }}</small
            >
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
              />
            </span>
            <Textarea id="purchase-order-note" v-model="note" class="input" rows="3" />
          </div>
        </div>
        <div class="purchase-order-attachment field-group">
          <HandleFilesUpload
            label="procurement.orders.attachment"
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
          <small v-if="attachmentError" class="procurement-error" role="alert">{{
            $t('attachment_conversion_failed')
          }}</small>
          <small
            v-for="(message, index) in fileMessages"
            :key="index"
            class="procurement-error"
            role="alert"
            >{{ message }}</small
          >
        </div>
      </section>
    </fieldset>
    <div v-if="storeState.error && !Object.keys(backendValidation).length" role="alert">
      <p>{{ $t(storeState.error.title) }}</p>
    </div>
    <p
      v-for="(message, index) in otherMessages"
      :key="index"
      class="procurement-error"
      role="alert"
    >
      {{ message }}
    </p>
    <p v-if="attempted && !saving && !storeState.error && !controller.issued.value" role="alert">
      {{ $t('procurement.orders.check_required') }}
    </p>
    <footer class="procurement-actions procurement-create__actions purchase-order-actions">
      <AppButton
        type="button"
        theme="secondary"
        :disabled="saving || processing"
        @click="emit('cancel')"
        >{{ $t('procurement.cancel') }}</AppButton
      >
      <AppButton
        type="submit"
        :loading="saving"
        :disabled="
          saving ||
          processing ||
          attachmentError ||
          !controller.canStore.value ||
          !(offersState instanceof DataSuccess) ||
          !offersState.data?.length
        "
        >{{ $t('procurement.orders.issue') }}</AppButton
      >
    </footer>
  </StandardFormLayout>
</template>
<style scoped lang="scss">
  .purchase-order-form fieldset {
    display: grid;
    gap: 1.25rem;
    min-width: 0;
    padding: 0;
    border: 0;
  }

  .purchase-order-section {
    min-width: 0;
  }

  .purchase-order-offers-empty {
    padding: 1.25rem;
    border: 1px dashed var(--procurement-line, var(--border-weak));
    border-radius: 12px;
    background: var(--procurement-canvas, var(--bg-section));

    p {
      margin-block: 0.5rem 0;
    }
  }

  .purchase-order-offers {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
    gap: 1rem;
  }

  .purchase-order-offers.is-invalid {
    padding: 0.5rem;
    border: 1px solid var(--danger-dark);
    border-radius: 12px;
  }

  .purchase-order-offer {
    display: flex;
    align-items: flex-start;
    gap: 0.875rem;
    padding: 1.125rem 1.25rem;
    border: 1px solid var(--procurement-line, var(--border-weak));
    border-radius: 12px;
    background: var(--procurement-canvas, var(--bg-section));
    color: var(--procurement-muted, var(--subtitle-color));
    font-size: 0.8125rem;
    line-height: 1.75;
    cursor: pointer;
    overflow-wrap: anywhere;
    transition:
      border-color 180ms ease,
      background-color 180ms ease;
  }

  .purchase-order-offer.is-disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .purchase-order-offer__content {
    display: grid;
    gap: 0.875rem;
    min-width: 0;
    width: 100%;
  }

  .purchase-order-offer strong {
    color: var(--procurement-ink, var(--title-card-color));
    font-size: 0.9375rem;
  }

  .purchase-order-offer__facts {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;

    > span {
      display: grid;
      gap: 0.25rem;
      min-width: 0;
      color: var(--procurement-ink, var(--title-card-color));
      overflow-wrap: anywhere;
    }

    small {
      color: var(--procurement-muted, var(--subtitle-color));
      font-size: 0.75rem;
    }
  }

  .purchase-order-offer:hover,
  .purchase-order-offer:focus-within,
  .purchase-order-offer.is-selected {
    border-color: var(--procurement-copper, var(--PrimaryColor));
  }

  .purchase-order-offer.is-selected {
    background: var(--procurement-soft, var(--bg-section));
  }

  .purchase-order-selection {
    padding-block: 0.75rem;
    margin-block: 0.5rem 0;
    color: var(--procurement-ink, var(--title-card-color));
    font-size: 0.8125rem;
    overflow-wrap: anywhere;
  }

  .purchase-order-fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.25rem;
  }

  .purchase-order-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
  }

  .purchase-order-attachment {
    margin-block-start: 1.5rem;
    padding-block-start: 1.5rem;
    border-block-start: 1px solid var(--procurement-line, var(--border-weak));
  }

  @media (max-width: 700px) {
    .purchase-order-fields {
      grid-template-columns: 1fr;
    }

    .purchase-order-actions {
      flex-wrap: wrap;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .purchase-order-offer {
      transition: none;
    }
  }
</style>
