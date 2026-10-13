<script setup lang="ts">
  import { computed, ref, watch, onBeforeUnmount } from 'vue';
  import { useRoute } from 'vue-router';
  import Skeleton from 'primevue/skeleton';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import ProjectWorkspaceNav from '../../../presentation/components/ProjectWorkspaceNav.vue';
  import { validId } from '../../../Schedule/core/constants/schedule.constants';
  import { quotePath } from '../../../Schedule/presentation/schedule.routes';
  import {
    priorityKey,
    statusKey,
    SupplyResponsibility,
  } from '../../core/constants/purchase-request.constants';
  import PurchaseRequestController from '../controllers/purchase-request.controller';
  import PurchaseRequestFormDialog from './PurchaseRequestFormDialog.vue';
  import PurchaseRequestDetails from './PurchaseRequestDetails.vue';
  import '../styles/procurement.scss';
  const route = useRoute();
  const controller = PurchaseRequestController.getInstance();
  const quoteId = computed(() => Number(route.params.id));
  const state = computed(() => controller.listState.value);
  const formVisible = ref(false);
  const expandedRequestId = ref<number | null>(null);
  watch(
    quoteId,
    (id) => {
      formVisible.value = false;
      expandedRequestId.value = null;
      controller.activate(id);
      if (validId(id)) void controller.load();
    },
    { immediate: true },
  );
  onBeforeUnmount(() => controller.release());
</script>
<template>
  <section class="procurement">
    <p v-if="!validId(quoteId)" role="alert">{{ $t('procurement.invalid_quote') }}</p>
    <template v-else>
      <ProjectWorkspaceNav :quote-id="quoteId" active="procurement" />
      <header class="procurement-header">
        <div>
          <h1>{{ $t('procurement.title') }}</h1>
          <p>{{ $t('procurement.subtitle') }}</p>
          <RouterLink :to="quotePath(route.path, quoteId)">{{
            $t('procurement.back_to_project')
          }}</RouterLink>
        </div>
        <AppButton type="button" :disabled="controller.isStoring.value" @click="formVisible = true"
          ><i class="pi pi-plus" aria-hidden="true" />{{
            $t('procurement.new_requirement')
          }}</AppButton
        >
      </header>
      <section class="procurement-panel" aria-labelledby="procurement-requirements">
        <h2 id="procurement-requirements">{{ $t('procurement.requirements') }}</h2>
        <DataStatusBuilder
          :controller="state"
          :on-retry="
            async () => {
              await controller.fetchList();
            }
          "
        >
          <template #loader><Skeleton height="8rem" /></template>
          <template #empty
            ><p class="procurement-empty">{{ $t('procurement.empty') }}</p></template
          >
          <template #success>
            <p v-if="!state.data?.length" class="procurement-empty">
              {{ $t('procurement.empty') }}
            </p>
            <div v-else class="procurement-table-scroll">
              <table class="procurement-table">
                <caption class="procurement-sr-only">
                  {{
                    $t('procurement.requirements')
                  }}
                </caption>
                <thead>
                  <tr>
                    <th scope="col">{{ $t('procurement.request_id') }}</th>
                    <th scope="col">{{ $t('procurement.assigned_employee') }}</th>
                    <th scope="col">{{ $t('procurement.scope') }}</th>
                    <th scope="col">{{ $t('procurement.supply_responsibility') }}</th>
                    <th scope="col">{{ $t('procurement.priority') }}</th>
                    <th scope="col">{{ $t('procurement.item_count') }}</th>
                    <th scope="col">{{ $t('procurement.created_at') }}</th>
                    <th scope="col">{{ $t('procurement.status') }}</th>
                    <th scope="col">{{ $t('procurement.details') }}</th>
                  </tr>
                </thead>
                <tbody v-for="request in state.data" :key="request.id">
                  <tr>
                    <th scope="row">{{ request.id }}</th>
                    <td>{{ request.assignedEmployee?.name ?? $t('procurement.unavailable') }}</td>
                    <td>
                      {{
                        $t(
                          request.isAllProject
                            ? 'procurement.entire_project'
                            : 'procurement.specific_space_id',
                          { id: request.projectFloorSpaceId ?? $t('procurement.unavailable') },
                        )
                      }}
                    </td>
                    <td>
                      {{
                        $t(
                          request.supplyResponsibility === SupplyResponsibility.CLIENT
                            ? 'procurement.client'
                            : 'procurement.company',
                        )
                      }}
                    </td>
                    <td>{{ $t(priorityKey(request.priority)) }}</td>
                    <td>{{ request.items.length }}</td>
                    <td>{{ request.createdAt ?? $t('procurement.unavailable') }}</td>
                    <td>
                      <span
                        class="procurement-status"
                        :class="`procurement-status--${request.status}`"
                        >{{ $t(statusKey(request.status)) }}</span
                      >
                    </td>
                    <td>
                      <AppButton
                        type="button"
                        theme="secondary"
                        size="sm"
                        :aria-expanded="expandedRequestId === request.id"
                        :aria-controls="`requirement-details-${request.id}`"
                        @click="
                          expandedRequestId = expandedRequestId === request.id ? null : request.id
                        "
                        >{{ $t('procurement.view_details') }}</AppButton
                      >
                    </td>
                  </tr>
                  <tr v-if="expandedRequestId === request.id">
                    <td colspan="9" class="procurement-details-cell">
                      <div :id="`requirement-details-${request.id}`">
                        <PurchaseRequestDetails :request="request" />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </DataStatusBuilder>
      </section>
      <PurchaseRequestFormDialog v-if="formVisible" v-model:visible="formVisible" />
    </template>
  </section>
</template>
