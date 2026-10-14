<script setup lang="ts">
  import { computed, ref, watch, onBeforeUnmount } from 'vue';
  import Dialog from 'primevue/dialog';
  import RadioButton from 'primevue/radiobutton';
  import InputText from 'primevue/inputtext';
  import Textarea from 'primevue/textarea';
  import Skeleton from 'primevue/skeleton';
  import HandleFilesUpload, { type UploadedFile } from '@/shared/FormInputs/HandleFilesUpload.vue';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import {
    DataSuccess,
    DataLoading,
  } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import { getDurationTypeNameKey } from '@/modules/shared/Package/core/constants/duration.type.enum';
  import StorePurchaseOrderParams from '../../core/params/store.purchase.order.params';
  import PurchaseOrderController from '../controllers/purchase.order.controller';
  import PurchaseOrderDetails from './PurchaseOrderDetails.vue';
  const props = defineProps<{ quoteId: number; purchaseRequestId: number }>();
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
    () => [props.quoteId, props.purchaseRequestId],
    async () => {
      selectedId.value = null;
      date.value = '';
      note.value = '';
      files.value = [];
      attempted.value = false;
      if (controller.activate(props.quoteId, props.purchaseRequestId)) {
        await controller.fetchOne();
        if (controller.canIssue.value) await controller.loadOffers();
      }
    },
    { immediate: true },
  );
  async function submit() {
    if (saving.value || processing.value || attachmentError.value || !controller.canIssue.value)
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
  function close() {
    if (!saving.value && !processing.value) emit('close');
  }
  onBeforeUnmount(() => controller.release());
</script>
<template>
  <Dialog
    :visible="true"
    modal
    :header="$t('procurement.orders.title')"
    :style="{ width: '52rem', maxWidth: '96vw' }"
    :closable="!saving && !processing"
    :close-on-escape="!saving && !processing"
    :dismissable-mask="false"
    @update:visible="close"
  >
    <div :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'">
      <p>{{ $t('procurement.offers.request_reference', { id: purchaseRequestId }) }}</p>
      <Skeleton v-if="fetchState instanceof DataLoading" height="6rem" />
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
      <div v-if="fetchState.hasError" role="alert">
        <p>{{ $t(fetchState.error?.title || 'procurement.orders.fetch_failed') }}</p>
      </div>
      <AppButton
        v-if="fetchState.hasError || controller.refreshRequired.value"
        type="button"
        theme="secondary"
        :disabled="saving"
        @click="controller.refresh()"
        >{{ $t('procurement.offers.retry_fetch') }}</AppButton
      >
      <PurchaseOrderDetails v-if="fetchState.data" :order="fetchState.data" />
      <template v-else-if="fetchState instanceof DataSuccess">
        <p>{{ $t('procurement.orders.empty') }}</p>
        <p v-if="!controller.canIssue.value && !saving">{{ $t('procurement.orders.locked') }}</p>
      </template>
      <form
        v-if="
          !fetchState.data &&
          (controller.canIssue.value || saving || attempted) &&
          !controller.issued.value
        "
        class="standard-crud-page purchase-order-form"
        novalidate
        @submit.prevent="submit"
      >
        <h2>{{ $t('procurement.orders.issue') }}</h2>
        <fieldset :disabled="saving || processing || !controller.canIssue.value">
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
          <p v-if="selected">
            <strong>{{ $t('procurement.orders.selected_offer') }}</strong
            >: {{ selected.supplier?.name }} · {{ selected.price }} · {{ selected.duration }}
            {{
              selected.durationType == null ? '' : $t(getDurationTypeNameKey(selected.durationType))
            }}
          </p>
          <div class="field-group input-wrapper">
            <label class="field-label label" for="purchase-order-date"
              >{{ $t('procurement.orders.date') }} *</label
            ><InputText
              id="purchase-order-date"
              v-model="date"
              class="input"
              type="date"
              required
            />
          </div>
          <div class="field-group input-wrapper">
            <label class="field-label label" for="purchase-order-note">{{
              $t('procurement.orders.notes')
            }}</label
            ><Textarea id="purchase-order-note" v-model="note" class="input" rows="3" />
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
              !controller.canIssue.value ||
              !(offersState instanceof DataSuccess) ||
              !selected
            "
            >{{ $t('procurement.orders.issue') }}</AppButton
          >
        </footer>
      </form>
    </div>
  </Dialog>
</template>
<style scoped lang="scss">
  .purchase-order-form fieldset {
    min-width: 0;
    border: 0;
    padding: 0;
  }

  .purchase-order-offer {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    margin-block: 0.5rem;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-sm);
    background: var(--bg-card);
    cursor: pointer;
    overflow-wrap: anywhere;
  }
</style>
