<script setup lang="ts">
  import type PurchaseRequestModel from '../../core/models/purchase-request.model';
  import {
    priorityKey,
    statusKey,
    SupplyResponsibility,
  } from '../../core/constants/purchase-request.constants';
  defineProps<{ request: PurchaseRequestModel }>();
</script>
<template>
  <section
    class="procurement-details"
    :aria-label="$t('procurement.requirement_number', { id: request.id })"
  >
    <h3>{{ $t('procurement.requirement_number', { id: request.id }) }}</h3>
    <dl class="procurement-metadata">
      <div>
        <dt>{{ $t('procurement.creator') }}</dt>
        <dd>{{ request.employee?.name ?? $t('procurement.unavailable') }}</dd>
      </div>
      <div>
        <dt>{{ $t('procurement.assigned_employee') }}</dt>
        <dd>{{ request.assignedEmployee?.name ?? $t('procurement.unavailable') }}</dd>
      </div>
      <div>
        <dt>{{ $t('procurement.scope') }}</dt>
        <dd>
          {{
            $t(
              request.isAllProject ? 'procurement.entire_project' : 'procurement.specific_space_id',
              { id: request.projectFloorSpaceId ?? $t('procurement.unavailable') },
            )
          }}
        </dd>
      </div>
      <div>
        <dt>{{ $t('procurement.supply_responsibility') }}</dt>
        <dd>
          {{
            $t(
              request.supplyResponsibility === SupplyResponsibility.CLIENT
                ? 'procurement.client'
                : 'procurement.company',
            )
          }}
        </dd>
      </div>
      <div>
        <dt>{{ $t('procurement.priority') }}</dt>
        <dd>{{ $t(priorityKey(request.priority)) }}</dd>
      </div>
      <div>
        <dt>{{ $t('procurement.status') }}</dt>
        <dd>{{ $t(statusKey(request.status)) }}</dd>
      </div>
      <div>
        <dt>{{ $t('procurement.created_at') }}</dt>
        <dd>{{ request.createdAt ?? $t('procurement.unavailable') }}</dd>
      </div>
    </dl>
    <h4>{{ $t('procurement.requested_items') }}</h4>
    <p v-if="!request.items.length">{{ $t('procurement.no_requested_items') }}</p>
    <div v-else class="procurement-table-scroll workspace-table-scroll">
      <table class="procurement-table workspace-data-table">
        <thead>
          <tr>
            <th scope="col">{{ $t('procurement.timeline_stage') }}</th>
            <th scope="col">{{ $t('procurement.item_type') }}</th>
            <th scope="col">{{ $t('procurement.item') }}</th>
            <th scope="col">{{ $t('procurement.quantity') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in request.items" :key="item.id">
            <td>{{ item.projectTimelineStage?.stage?.title ?? $t('procurement.unavailable') }}</td>
            <td>{{ $t(`procurement.${item.itemableType}`) }}</td>
            <td>{{ item.itemable?.title ?? $t('procurement.unavailable') }}</td>
            <td>{{ item.quantity ?? $t('procurement.unavailable') }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
