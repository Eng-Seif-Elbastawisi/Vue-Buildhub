<script setup lang="ts">
  import Dialog from 'primevue/dialog';
  import type PurchaseRequestDisbursementModel from '../../core/models/purchase-request-disbursement.model';

  const visible = defineModel<boolean>('visible', { required: true });
  defineProps<{ disbursement?: PurchaseRequestDisbursementModel }>();
</script>
<template>
  <Dialog
    v-model:visible="visible"
    modal
    append-to="self"
    class="material-receipt__details-dialog"
    :header="$t('material_disbursement.details')"
  >
    <div v-if="disbursement" class="material-receipt__details">
      <div class="material-receipt__details-meta">
        <div>
          <span>{{ $t('material_disbursement.disbursement_id') }}</span
          ><strong>#{{ disbursement.id }}</strong>
        </div>
        <div>
          <span>{{ $t('material_disbursement.issue_date') }}</span
          ><strong>{{ disbursement.date }}</strong>
        </div>
        <div>
          <span>{{ $t('material_disbursement.receiver') }}</span
          ><strong>{{ disbursement.receiver.name }}</strong>
        </div>
        <div>
          <span>{{ $t('material_disbursement.issued_by') }}</span
          ><strong>{{ disbursement.organizationEmployee.name }}</strong>
        </div>
        <div>
          <span>{{ $t('material_disbursement.type') }}</span
          ><strong>{{ $t('material_disbursement.type_one') }}</strong>
        </div>
        <div>
          <span>{{ $t('material_disbursement.created_at') }}</span
          ><strong>{{ disbursement.createdAt }}</strong>
        </div>
      </div>
      <div v-if="disbursement.notes">
        <span class="material-disbursement__meta-label">{{
          $t('material_disbursement.notes')
        }}</span>
        <p>{{ disbursement.notes }}</p>
      </div>
      <h2>{{ $t('material_disbursement.issued_items') }}</h2>
      <ul class="material-receipt__detail-items">
        <li v-for="item in disbursement.items" :key="item.id">
          <span>{{ item.purchaseRequestItem.title }}</span
          ><strong>{{ item.quantity }}</strong>
        </li>
      </ul>
    </div>
  </Dialog>
</template>
