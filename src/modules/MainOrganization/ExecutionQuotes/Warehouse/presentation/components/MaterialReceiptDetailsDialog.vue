<script setup lang="ts">
  import Dialog from 'primevue/dialog';
  import type PurchaseRequestReceiptModel from '../../core/models/purchase-request-receipt.model';

  defineProps<{
    receipt: PurchaseRequestReceiptModel | undefined;
  }>();
  const visible = defineModel<boolean>('visible', { required: true });
</script>
<template>
  <Dialog
    v-model:visible="visible"
    modal
    append-to="self"
    class="material-receipt__details-dialog workspace-dialog"
    :header="$t('material_receipt.receipt_details')"
  >
    <div v-if="receipt" class="material-receipt__details">
      <div class="material-receipt__details-meta">
        <div>
          <span>{{ $t('material_receipt.receipt_date') }}</span
          ><strong>{{ receipt.date }}</strong>
        </div>
        <div>
          <span>{{ $t('material_receipt.status') }}</span
          ><strong>{{
            $t(receipt.status === 1 ? 'material_receipt.partial' : 'material_receipt.complete')
          }}</strong>
        </div>
        <div>
          <span>{{ $t('material_receipt.receiving_employee') }}</span
          ><strong>{{ receipt.employee?.name ?? $t('procurement.unavailable') }}</strong>
        </div>
        <div>
          <span>{{ $t('material_receipt.recorded_by') }}</span
          ><strong>{{ receipt.organizationEmployee.name }}</strong>
        </div>
      </div>
      <h2>{{ $t('material_receipt.requested_items') }}</h2>
      <ul class="material-receipt__detail-items">
        <li v-for="item in receipt.items" :key="item.id">
          <span>{{
            item.purchaseRequestItem?.title ??
            $t('material_receipt.item_number', { id: item.purchaseRequestItem.title })
          }}</span
          ><strong>{{ item.quantity }}</strong>
        </li>
      </ul>
    </div>
  </Dialog>
</template>
