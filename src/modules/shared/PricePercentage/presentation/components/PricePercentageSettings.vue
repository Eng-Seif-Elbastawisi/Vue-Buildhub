<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';
  import UpdatePricePercentagesParams, {
    calculatePercentageTotal,
    MAX_PERCENTAGE,
    MIN_PERCENTAGE,
    REQUIRED_PERCENTAGE_TOTAL,
  } from '../../core/params/update.price.percentages.params';
  import PricePercentageController from '../controllers/price.percentage.controller';

  interface PercentageDraft {
    key: number;
    title: string;
    percentage: number | '';
  }

  const controller = PricePercentageController.getInstance();
  const route = useRoute();
  const rawProjectId = Array.isArray(route.params.project_id)
    ? route.params.project_id[0]
    : route.params.project_id;
  const projectId = Number(rawProjectId);
  let nextRowKey = 1;
  const newRow = (title = '', percentage: number | '' = ''): PercentageDraft => ({
    key: nextRowKey++,
    title,
    percentage,
  });
  const rows = ref<PercentageDraft[]>([newRow()]);
  const loading = ref(false);
  const statusKey = ref('');
  const totalPercentage = computed(() =>
    calculatePercentageTotal(
      rows.value.map((row) => (typeof row.percentage === 'number' ? row.percentage : 0)),
    ),
  );
  const hasRequiredTotal = computed(() => totalPercentage.value === REQUIRED_PERCENTAGE_TOTAL);
  const allowedPercentageKeys = new Set([
    'Backspace',
    'Delete',
    'Tab',
    'Enter',
    'Escape',
    'Home',
    'End',
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    '.',
  ]);

  const preventInvalidPercentageKey = (event: KeyboardEvent) => {
    const isDigit = /^\d$/.test(event.key);
    const isKeyboardShortcut = event.ctrlKey || event.metaKey;

    if (isDigit || isKeyboardShortcut || allowedPercentageKeys.has(event.key)) return;

    event.preventDefault();
  };

  const preventInvalidPercentagePaste = (event: ClipboardEvent) => {
    const pastedText = event.clipboardData?.getData('text').trim() ?? '';

    if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(pastedText)) {
      event.preventDefault();
    }
  };

  controller.resetItem();

  const addRow = () => {
    rows.value.push(newRow());
  };

  const removeRow = (rowIndex: number) => {
    rows.value.splice(rowIndex, 1);
  };

  const updateParams = () =>
    new UpdatePricePercentagesParams({
      projectId,
      percentages: rows.value.map((row) => ({
        title: row.title,
        percentage: typeof row.percentage === 'number' ? row.percentage : Number.NaN,
      })),
    });

  const savePercentages = async () => {
    const params = updateParams();

    if (!params.validate().isValid) {
      params.validateOrThrow();
      return;
    }

    loading.value = true;
    statusKey.value = '';

    try {
      const response = await controller.updatePercentages(params);

      if (response instanceof DataSuccess) {
        statusKey.value = 'price_percentage.updated';
      }
    } finally {
      loading.value = false;
    }
  };
</script>

<template>
  <main class="price-percentage-settings">
    <header class="settings-header">
      <div>
        <p class="eyebrow">{{ $t('price_percentage.page_label') }}</p>
        <h1>{{ $t('price_percentage.title') }}</h1>
        <p>{{ $t('price_percentage.description') }}</p>
      </div>
    </header>

    <p v-if="statusKey" class="settings-status" role="status">
      {{ $t(statusKey) }}
    </p>

    <section class="percentage-card" :aria-label="$t('price_percentage.form_title')">
      <div class="card-header">
        <div>
          <h2>{{ $t('price_percentage.form_title') }}</h2>
          <p>{{ $t('price_percentage.form_description') }}</p>
        </div>

        <AppButton
          class="add-row-button"
          theme="secondary"
          type="button"
          :disabled="loading"
          :title="$t('price_percentage.add_row')"
          @click="addRow"
        >
          <span aria-hidden="true">+</span>
          {{ $t('price_percentage.add_row') }}
        </AppButton>
      </div>

      <div v-if="rows.length" class="percentage-list">
        <article v-for="(row, rowIndex) in rows" :key="row.key" class="percentage-row">
          <div class="field-group">
            <label :for="`price-percentage-title-${row.key}`">
              {{ $t('price_percentage.entry_title') }}
            </label>
            <input
              :id="`price-percentage-title-${row.key}`"
              v-model="row.title"
              class="form-input title-input"
              type="text"
              :disabled="loading"
              :placeholder="$t('price_percentage.title_placeholder')"
              autocomplete="off"
            />
          </div>

          <div class="field-group">
            <label :for="`price-percentage-value-${row.key}`">
              {{ $t('price_percentage.percentage') }}
            </label>
            <div class="percentage-input-wrap">
              <input
                :id="`price-percentage-value-${row.key}`"
                v-model.number="row.percentage"
                class="form-input percentage-input"
                type="number"
                :min="MIN_PERCENTAGE"
                :max="MAX_PERCENTAGE"
                step="0.01"
                inputmode="decimal"
                :disabled="loading"
                :placeholder="$t('price_percentage.percentage_placeholder')"
                @keydown="preventInvalidPercentageKey"
                @paste="preventInvalidPercentagePaste"
              />
              <span class="percentage-symbol" aria-hidden="true">%</span>
            </div>
          </div>

          <AppButton
            class="remove-row-button"
            theme="danger"
            type="button"
            :disabled="loading"
            :title="$t('price_percentage.remove_row')"
            :aria-label="$t('price_percentage.remove_row')"
            @click="removeRow(rowIndex)"
          >
            {{ $t('price_percentage.remove_row') }}
          </AppButton>
        </article>
      </div>

      <div v-else class="empty-state">
        <span class="pi pi-percentage" aria-hidden="true"></span>
        <p>{{ $t('price_percentage.empty') }}</p>
      </div>

      <div
        class="total-summary"
        :class="hasRequiredTotal ? 'is-valid' : 'is-invalid'"
        aria-live="polite"
      >
        <span>{{ $t('price_percentage.total') }}</span>
        <strong>{{ totalPercentage }} / {{ REQUIRED_PERCENTAGE_TOTAL }}%</strong>
      </div>
    </section>

    <AppButton
      class="save-button"
      block
      type="button"
      :loading="loading"
      :disabled="loading"
      :title="$t('price_percentage.save')"
      @click="savePercentages"
    >
      {{ $t('price_percentage.save') }}
    </AppButton>

    <p v-if="controller.errorMessage.value" class="settings-error" role="alert">
      {{ controller.errorMessage.value }}
    </p>
  </main>
</template>

<style scoped lang="scss">
  .price-percentage-settings {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding: 1.5rem;
  }

  .settings-header,
  .percentage-card {
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-sm);
    background: var(--BgWhite);
    box-shadow: var(--shadow-sm);
  }

  .settings-header {
    padding: 1.25rem;

    h1,
    p {
      margin: 0;
    }

    h1 {
      margin-block: 0.25rem;
      color: var(--gray-900);
      font-size: 1.75rem;
      font-weight: 800;
    }

    p:not(.eyebrow) {
      color: var(--gray-500);
    }
  }

  .eyebrow {
    color: var(--PrimaryColor);
    font-size: 0.78rem;
    font-weight: 800;
    text-transform: uppercase;
  }

  .percentage-card {
    padding: 1.25rem;
  }

  .card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-block-end: 1.25rem;

    h2,
    p {
      margin: 0;
    }

    h2 {
      color: var(--gray-900);
      font-size: 1.15rem;
      font-weight: 800;
    }

    p {
      margin-block-start: 0.25rem;
      color: var(--gray-500);
    }
  }

  .percentage-list {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  .percentage-row {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(10rem, 1fr) auto;
    align-items: end;
    gap: 0.85rem;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-sm);
    padding: 1rem;
    background: var(--gray-50, var(--BgWhite));
  }

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    min-width: 0;

    label {
      color: var(--gray-700);
      font-size: 0.88rem;
      font-weight: 700;
    }
  }

  .form-input {
    width: 100%;
    min-height: 44px;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-sm);
    padding: 0.7rem 0.8rem;
    background: var(--BgWhite);
    color: var(--gray-900);
    outline: none;

    &:focus {
      border-color: var(--PrimaryColor);
      box-shadow: 0 0 0 3px var(--PrimaryColor-alpha-20);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.65;
    }
  }

  .percentage-input-wrap {
    position: relative;
  }

  .percentage-input {
    padding-inline-end: 2.25rem;
  }

  .percentage-symbol {
    position: absolute;
    inset-inline-end: 0.8rem;
    top: 50%;
    color: var(--gray-500);
    font-weight: 800;
    transform: translateY(-50%);
    pointer-events: none;
  }

  .remove-row-button {
    min-height: 44px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.65rem;
    border: 1px dashed var(--border-weak);
    border-radius: var(--radius-sm);
    padding: 2rem;
    color: var(--gray-500);
    text-align: center;

    p {
      margin: 0;
    }

    .pi {
      color: var(--PrimaryColor);
      font-size: 1.5rem;
    }
  }

  .total-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-block-start: 1rem;
    border-block-start: 1px solid var(--border-weak);
    padding-block-start: 1rem;
    color: var(--gray-700);
    font-weight: 700;

    &.is-valid strong {
      color: var(--success);
    }

    &.is-invalid strong {
      color: var(--danger);
    }
  }

  .settings-status,
  .settings-error {
    margin: 0;
    border-radius: var(--radius-sm);
    padding: 0.85rem 1rem;
    font-weight: 700;
  }

  .settings-status {
    border: 1px solid var(--PrimaryColor-alpha-20);
    background: var(--PrimaryColor-light);
    color: var(--PrimaryColor);
  }

  .settings-error {
    border: 1px solid var(--danger);
    background: var(--danger-light);
    color: var(--danger-dark);
  }

  @media (max-width: 768px) {
    .price-percentage-settings {
      padding: 1rem;
    }

    .card-header {
      flex-direction: column;
    }

    .add-row-button {
      width: 100%;
    }

    .percentage-row {
      grid-template-columns: 1fr;
    }
  }
</style>
