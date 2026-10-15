<script setup lang="ts">
  import { computed } from 'vue';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import {
    attachmentGallery,
    toGalleryAttachment,
  } from '@/shared/AttachmentGallery/attachmentGallery';
  import { getDurationTypeNameKey } from '@/modules/shared/Package/core/constants/duration.type.enum';
  import type PurchaseOrderModel from '../../core/models/purchase.order.model';
  const props = defineProps<{ order: PurchaseOrderModel }>();
  const attachment = computed(() =>
    props.order.file ? toGalleryAttachment({ file: props.order.file }) : null,
  );
  function preview() {
    if (attachment.value?.url) attachmentGallery.open([attachment.value], 0);
  }
</script>
<template>
  <section
    class="procurement-panel purchase-order-details"
    :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'"
  >
    <header class="procurement-header">
      <h2>{{ $t('procurement.orders.reference', { id: order.id }) }}</h2>
      <span class="procurement-status procurement-status--3">{{
        $t('procurement.confirmed')
      }}</span>
    </header>
    <dl class="purchase-order-grid">
      <div>
        <dt>{{ $t('procurement.request_id') }}</dt>
        <dd>{{ order.purchaseRequest.id }}</dd>
      </div>
      <div>
        <dt>{{ $t('procurement.offers.supplier') }}</dt>
        <dd>{{ order.supplier.title }}</dd>
      </div>
      <div>
        <dt>{{ $t('procurement.client') }}</dt>
        <dd>{{ order.client.title }}</dd>
      </div>
      <div>
        <dt>{{ $t('procurement.orders.selected_offer') }}</dt>
        <dd>{{ order.purchaseRequestPrice.price }}</dd>
      </div>
      <div>
        <dt>{{ $t('procurement.offers.duration') }}</dt>
        <dd>
          {{ order.purchaseRequestPrice.duration }}
          {{ $t(getDurationTypeNameKey(order.purchaseRequestPrice.durationType)) }}
        </dd>
      </div>
      <div>
        <dt>{{ $t('procurement.orders.date') }}</dt>
        <dd>{{ order.date }}</dd>
      </div>
      <div>
        <dt>{{ $t('procurement.orders.issued_by') }}</dt>
        <dd>{{ order.employee.name }}</dd>
      </div>
      <div>
        <dt>{{ $t('procurement.created_at') }}</dt>
        <dd>{{ order.createdAt }}</dd>
      </div>
      <div>
        <dt>{{ $t('procurement.orders.payment') }}</dt>
        <dd>
          {{ $t(order.isOrderPaid ? 'procurement.orders.paid' : 'procurement.orders.not_paid') }}
        </dd>
      </div>
      <div>
        <dt>{{ $t('procurement.orders.notes') }}</dt>
        <dd>{{ order.note || $t('procurement.unavailable') }}</dd>
      </div>
    </dl>
    <div class="procurement-actions mt-2">
      <AppButton v-if="attachment?.url" type="button" theme="secondary" @click="preview">{{
        $t('procurement.orders.view_attachment')
      }}</AppButton>
    </div>
  </section>
</template>
<style scoped lang="scss">
  .purchase-order-details {
    padding: 0;
    border: 0;
    background: transparent;
  }

  .purchase-order-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
    gap: 1.5rem;
    padding-block: 1.25rem;
    border-block: 1px solid var(--procurement-line, var(--border-weak));

    > div {
      min-width: 0;
    }

    dt {
      color: var(--procurement-muted, var(--subtitle-color));
      font-size: 0.75rem;
    }

    dd {
      margin: 0.375rem 0 0;
      color: var(--procurement-ink, var(--title-card-color));
      font-size: 0.9375rem;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      overflow-wrap: anywhere;
    }
  }
</style>
