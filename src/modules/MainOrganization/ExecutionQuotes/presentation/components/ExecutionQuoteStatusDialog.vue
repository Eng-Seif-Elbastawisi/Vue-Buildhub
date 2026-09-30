<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import Dialog from 'primevue/dialog';

  import AppButton from '@/shared/HelpersComponents/AppButton.vue';

  import {
    type QuoteStatusEnum,
    canChangeQuoteStatus,
    getAllowedQuoteStatusTransitions,
  } from '../../core/constants/quote.status.enum';
  import QuoteStatusBadge from './QuoteStatusBadge.vue';

  const props = withDefaults(
    defineProps<{
      modelValue: boolean;
      currentStatus?: QuoteStatusEnum | null;
      loading?: boolean;
    }>(),
    {
      currentStatus: null,
      loading: false,
    },
  );

  const emit = defineEmits<{
    (event: 'update:modelValue', visible: boolean): void;
    (event: 'submit', status: QuoteStatusEnum, note: string | null): void;
  }>();

  const selectedStatus = ref<QuoteStatusEnum>();
  const note = ref('');
  const availableStatuses = computed(() => getAllowedQuoteStatusTransitions(props.currentStatus));
  const visible = computed({
    get: () => props.modelValue,
    set: (nextVisible: boolean) => {
      if (!nextVisible && props.loading) return;
      emit('update:modelValue', nextVisible);
    },
  });

  watch(
    [() => props.modelValue, () => props.currentStatus],
    ([isOpen]) => {
      if (!isOpen) return;

      selectedStatus.value =
        availableStatuses.value.length === 1 ? availableStatuses.value[0] : undefined;
      note.value = '';
    },
    { immediate: true },
  );

  const close = () => {
    if (props.loading) return;
    visible.value = false;
  };

  const submit = () => {
    const nextStatus = selectedStatus.value;
    if (nextStatus === undefined || !canChangeQuoteStatus(props.currentStatus, nextStatus)) return;

    emit('submit', nextStatus, note.value.trim() || null);
  };
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    append-to="self"
    class="execution-quote-status-dialog"
    :header="$t('execution_quote.status.dialog_title')"
    :closable="!loading"
    :dismissable-mask="!loading"
    :draggable="false"
  >
    <div class="execution-quote-status-dialog__content">
      <div class="execution-quote-status-dialog__current">
        <span>{{ $t('execution_quote.status.current') }}</span>
        <QuoteStatusBadge :status="currentStatus" />
      </div>

      <fieldset
        class="execution-quote-status-dialog__fieldset"
        role="radiogroup"
        :disabled="loading"
      >
        <legend>{{ $t('execution_quote.status.choose_next') }}</legend>

        <button
          v-for="status in availableStatuses"
          :key="status"
          type="button"
          class="execution-quote-status-dialog__option"
          :class="{ 'is-selected': selectedStatus === status }"
          role="radio"
          :aria-checked="selectedStatus === status"
          @click="selectedStatus = status"
        >
          <QuoteStatusBadge :status="status" />
          <i v-if="selectedStatus === status" class="pi pi-check" aria-hidden="true"></i>
        </button>
      </fieldset>

      <label class="execution-quote-status-dialog__note" for="execution-quote-status-note">
        <span>{{ $t('execution_quote.status.note') }}</span>
        <textarea
          id="execution-quote-status-note"
          v-model="note"
          rows="3"
          :disabled="loading"
          :placeholder="$t('execution_quote.status.note_placeholder')"
        ></textarea>
      </label>

      <div class="execution-quote-status-dialog__actions">
        <AppButton theme="secondary" outline :disabled="loading" @click="close">
          {{ $t('cancel') }}
        </AppButton>
        <AppButton
          class="execution-quote-status-dialog__submit"
          :loading="loading"
          :disabled="selectedStatus === undefined"
          @click="submit"
        >
          {{ $t('execution_quote.status.update') }}
        </AppButton>
      </div>
    </div>
  </Dialog>
</template>

<style scoped lang="scss">
  :global(.execution-quote-status-dialog) {
    width: min(30rem, calc(100vw - 2rem));
  }

  .execution-quote-status-dialog__content {
    display: grid;
    gap: 1rem;
  }

  .execution-quote-status-dialog__current {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.75rem;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-md);
    background: var(--gray-50);
    color: var(--subtitle-color);
    font-weight: 700;
  }

  .execution-quote-status-dialog__fieldset {
    display: grid;
    gap: 0.625rem;
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
  }

  .execution-quote-status-dialog__fieldset legend {
    margin-block-end: 0.625rem;
    color: var(--gray-800);
    font-weight: 800;
  }

  .execution-quote-status-dialog__option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    width: 100%;
    min-height: 3rem;
    padding: 0.625rem 0.75rem;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-md);
    background: var(--bg-card);
    color: var(--gray-700);
    cursor: pointer;
    transition:
      border-color var(--transition-fast),
      background var(--transition-fast);
  }

  .execution-quote-status-dialog__option:hover,
  .execution-quote-status-dialog__option.is-selected {
    border-color: var(--PrimaryColor);
    background: var(--PrimaryColor-light);
  }

  .execution-quote-status-dialog__note {
    display: grid;
    gap: 0.5rem;
    color: var(--gray-800);
    font-weight: 800;
  }

  .execution-quote-status-dialog__note textarea {
    width: 100%;
    min-height: 6rem;
    padding: 0.75rem;
    resize: vertical;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-md);
    background: var(--bg-card);
    color: var(--title-card-color);
    font: inherit;
    font-weight: 400;
    line-height: 1.6;
  }

  .execution-quote-status-dialog__note textarea:focus-visible {
    border-color: var(--PrimaryColor);
    outline: 2px solid var(--PrimaryColor-alpha-30);
    outline-offset: 1px;
  }

  .execution-quote-status-dialog__note textarea:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }

  .execution-quote-status-dialog__actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding-block-start: 0.25rem;
  }

  @media (max-width: 480px) {
    .execution-quote-status-dialog__actions {
      flex-direction: column-reverse;
    }

    .execution-quote-status-dialog__actions :deep(.app-btn) {
      width: 100%;
    }
  }
</style>
