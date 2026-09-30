<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import type AddQuoteTypeParams from '../../core/params/add.quote.types.params.ts';
import QuoteTypeController from '../controllers/quote.types.controller.ts';
import QuoteTypeForm from './QuoteTypeForm.vue';
import ConfirmCancelDialog from '@/base/Presentation/Dialogs/ConfirmCancelDialog.vue';

const controller = QuoteTypeController.getInstance();

const route = useRoute();
const router = useRouter();

const routePrefix = route.path.startsWith('/admin') ? '/admin' : '/organization';

const params = ref<AddQuoteTypeParams | null>(null);
const loading = ref(false);

const saveQuoteType = async () => {
  if (!params.value) return;

  loading.value = true;

  try {
    await controller.create(params.value, undefined, route.fullPath);
  } finally {
    loading.value = false;
  }
};

const cancelQuoteTypeAdd = () => {
  void router.push(`${routePrefix}/quote-types`);
};
</script>

<template>
  <div class="QuoteType-crud-page">
    <QuoteTypeForm :loading="loading" @update-data="params = $event" :disabled="true" />

    <div class="form-footer form-action-pair">
      <button
class="btn btn-primary" :class="{ 'btn--loading': loading }" type="button" :disabled="loading"
        @click="saveQuoteType">
        {{ $t('common.save') }}
      </button>

      <ConfirmCancelDialog
ref="confirmCancelRef" :title="$t('cancel_changes')"
        :message="$t('are_you_sure_you_want_to_leave')" @confirm="cancelQuoteTypeAdd" />
    </div>

    <div v-if="controller.errorMessage.value" class="error">
      {{ controller.errorMessage.value }}
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/mixins/form_action_pair' as form-actions;

.QuoteType-crud-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.error {
  margin-top: 20px;
  padding: 10px;
  background-color: var(--danger-light);
  color: var(--danger-dark);
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}

.form-action-pair {
  @include form-actions.layout;
}
</style>
