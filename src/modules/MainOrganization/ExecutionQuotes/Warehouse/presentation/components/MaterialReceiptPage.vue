<script setup lang="ts">
  import { computed, onBeforeUnmount, ref, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import ProjectWorkspaceNav from '../../../presentation/components/ProjectWorkspaceNav.vue';
  import { quotePath } from '../../../Schedule/presentation/schedule.routes';
  import { validId } from '../../../Schedule/core/constants/schedule.constants';
  import MaterialReceiptController from '../controllers/material-receipt.controller';
  import MaterialReceiptHistory from './MaterialReceiptHistory.vue';
  import MaterialReceiptFormDialog from './MaterialReceiptFormDialog.vue';
  import MaterialReceiptDetailsDialog from './MaterialReceiptDetailsDialog.vue';

  const route = useRoute();
  const controller = MaterialReceiptController.getInstance();
  const quoteId = computed(() => Number(route.params.id));
  const receiptDialogVisible = ref(false);
  const detailReceiptId = ref<number | null>(null);
  const detailVisible = computed({
    get: () => detailReceiptId.value !== null,
    set: (visible: boolean) => {
      if (!visible) detailReceiptId.value = null;
    },
  });
  const detailReceipt = computed(() =>
    controller.historyState.value.data?.find((receipt) => receipt.id === detailReceiptId.value),
  );
  async function retryHistory() {
    await controller.loadHistory();
  }
  watch(
    quoteId,
    (id) => {
      receiptDialogVisible.value = false;
      detailReceiptId.value = null;
      controller.activate(id);
      if (validId(id)) void controller.load();
    },
    { immediate: true },
  );
  onBeforeUnmount(() => controller.release());
</script>
<template>
  <section class="material-receipt" :dir="$i18n.locale === 'ar' ? 'rtl' : 'ltr'">
    <p v-if="!validId(quoteId)" role="alert">{{ $t('material_receipt.invalid_quote') }}</p>
    <template v-else>
      <ProjectWorkspaceNav :quote-id="quoteId" active="warehouse" />
      <header class="material-receipt__intro">
        <div>
          <h1><i class="pi pi-box" aria-hidden="true" />{{ $t('material_receipt.title') }}</h1>
          <p>{{ $t('material_receipt.subtitle') }}</p>
          <RouterLink :to="quotePath(route.path, quoteId)" class="material-receipt__back">
            <i class="pi pi-arrow-left" aria-hidden="true" />{{ $t('material_receipt.back') }}
          </RouterLink>
        </div>
        <AppButton
          type="button"
          :disabled="controller.isStoring.value"
          @click="receiptDialogVisible = true"
        >
          <i class="pi pi-plus" aria-hidden="true" />{{ $t('material_receipt.new_receipt') }}
        </AppButton>
      </header>

      <MaterialReceiptHistory
        :state="controller.historyState.value"
        :retry="retryHistory"
        @details="detailReceiptId = $event"
      />
      <MaterialReceiptFormDialog :key="quoteId" v-model:visible="receiptDialogVisible" />
      <MaterialReceiptDetailsDialog v-model:visible="detailVisible" :receipt="detailReceipt" />
    </template>
  </section>
</template>
<style lang="scss" src="../styles/material-receipt.scss"></style>
