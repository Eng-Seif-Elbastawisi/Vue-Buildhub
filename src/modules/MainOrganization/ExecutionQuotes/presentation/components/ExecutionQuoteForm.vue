<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import type TitleInterface from '@/base/Data/Models/titleInterface';
import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
import AppButton from '@/shared/HelpersComponents/AppButton.vue';

import ClientController from '@/modules/MainOrganization/client/presentation/controllers/client.controller';
import IndexClientParams from '@/modules/MainOrganization/client/core/params/index.client.params';

import ProjectController from '@/modules/MainOrganization/Project/presentation/controllers/project.controller';
import IndexProjectParams from '@/modules/MainOrganization/Project/core/params/index.project.params';

import EmployeeController from '@/modules/MainOrganization/employee/presentation/controllers/employee.controller';
import IndexEmployeeParams from '@/modules/MainOrganization/employee/core/params/index.employee.params';

import { QuoteSourceEnum } from '../../core/constants/quote.source.enum';
import type { ExecutionQuoteType } from '../../core/constants/execution.quote.type.enum';
import AddExecutionQuoteParams from '../../core/params/add.execution.quote.params';
import type {
  default as StoreExecutionQuoteDetailsParams,
  ExecutionQuoteStageRequest,
} from '../../core/params/store.execution.quote.details.params';
import ExecutionQuoteBuilder from './builder/ExecutionQuoteBuilder.vue';
import ExecutionQuoteTypeCards from './builder/ExecutionQuoteTypeCards.vue';

const emit = defineEmits<{
  (event: 'updateData', quoteParams: AddExecutionQuoteParams): void;
  (event: 'updateDetails', detailsParams: StoreExecutionQuoteDetailsParams[]): void;
}>();

const props = withDefaults(
  defineProps<{
    loading?: boolean;
    executionQuoteId?: number | null;
    initialQuoteType?: ExecutionQuoteType | null;
  }>(),
  {
    loading: false,
    executionQuoteId: null,
    initialQuoteType: null,
  },
);

const router = useRouter();
const route = useRoute();
const clientController = ClientController.getInstance();
const projectController = ProjectController.getInstance();
const employeeController = EmployeeController.getInstance();

const clientParams = new IndexClientParams('', 1, 100, 0);
const employeeParams = new IndexEmployeeParams('', 1, 100, 0);

const client = ref<TitleInterface<string | number> | null>(null);
const project = ref<TitleInterface<string | number> | null>(null);
const priceEmployee = ref<TitleInterface<string | number> | null>(null);

const clientId = ref<number | undefined>();
const projectId = ref<number | undefined>();
const priceEmployeeId = ref<number | undefined>();

const selectedQuoteSource = ref<QuoteSourceEnum>(QuoteSourceEnum.EXECUTION_ONLY);
const selectedExecutionQuoteType = ref<ExecutionQuoteType | null>(null);
const executionQuoteStages = ref<ExecutionQuoteStageRequest[]>([]);

const baseLocked = computed(() => Boolean(props.executionQuoteId));
const isBuilderPage = computed(() => route.name === 'Build Execution Quote');

const toOptionalId = (selection: TitleInterface<string | number> | null): number | undefined => {
  if (selection?.id === undefined || selection.id === null) return undefined;
  const id = Number(selection.id);
  return Number.isInteger(id) && id > 0 ? id : undefined;
};

const projectParams = computed(() => {
  const filteredProjectParams = new IndexProjectParams('', 1, 100, 0);
  filteredProjectParams.clientId = clientId.value;
  return filteredProjectParams;
});

const isExecutionOnly = computed(
  () => selectedQuoteSource.value === QuoteSourceEnum.EXECUTION_ONLY,
);

const isExecutionFromDesignQuote = computed(
  () => selectedQuoteSource.value === QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE,
);

const baseDataComplete = computed(() =>
  isExecutionFromDesignQuote.value
    ? Boolean(clientId.value && projectId.value && selectedExecutionQuoteType.value)
    : Boolean(
      clientId.value &&
      projectId.value &&
      selectedExecutionQuoteType.value &&
      priceEmployeeId.value,
    ),
);

const quoteItemsCount = computed(() =>
  executionQuoteStages.value.reduce((count, stage) => count + stage.items.length, 0),
);

const internalCost = computed(() =>
  executionQuoteStages.value.reduce(
    (stageTotal, stage) =>
      stageTotal +
      stage.items.reduce((total, item) => total + item.quantity * item.unit_price, 0),
    0,
  ),
);

const clientTotal = computed(() =>
  executionQuoteStages.value.reduce((total, stage) => total + (stage.client_price ?? 0), 0),
);

const heroTitle = computed(() => project.value?.title);

const heroSubtitle = computed(() => client.value?.title);

const buildSteps = computed(() => [
  {
    id: 1,
    title: 'execution_quote.steps.data',
    state:
      baseLocked.value || baseDataComplete.value
        ? 'execution_quote.steps.complete'
        : 'execution_quote.steps.start_here',
    isCurrent: !baseLocked.value,
    isComplete: baseLocked.value,
  },
  {
    id: 2,
    title: 'execution_quote.steps.type',
    state: selectedExecutionQuoteType.value
      ? 'execution_quote.steps.completed'
      : 'execution_quote.steps.required',
    isCurrent: baseLocked.value && !selectedExecutionQuoteType.value,
    isComplete: Boolean(selectedExecutionQuoteType.value),
  },
  {
    id: 3,
    title: 'execution_quote.steps.stages',
    state: executionQuoteStages.value.length
      ? 'execution_quote.steps.completed'
      : 'execution_quote.steps.choose_stage',
    isCurrent:
      baseLocked.value &&
      Boolean(selectedExecutionQuoteType.value) &&
      !executionQuoteStages.value.length,
    isComplete: executionQuoteStages.value.length > 0,
  },
  {
    id: 4,
    title: 'execution_quote.steps.review',
    state: quoteItemsCount.value
      ? 'execution_quote.steps.completed'
      : 'execution_quote.steps.awaiting_items',
    isCurrent: baseLocked.value && executionQuoteStages.value.length > 0,
    isComplete: quoteItemsCount.value > 0,
  },
]);

const clearProjectData = () => {
  project.value = null;
  projectId.value = undefined;
};

const clearPriceEmployeeData = () => {
  priceEmployee.value = null;
  priceEmployeeId.value = undefined;
};

const clearBuilderData = () => {
  selectedExecutionQuoteType.value = null;
  executionQuoteStages.value = [];
  emit('updateDetails', []);
};

/**
 * Emits ONLY the first request payload.
 * No quote_type / stages / items are included here anymore.
 */
const updateBaseData = () => {
  const baseQuoteFields = {
    quoteSource: selectedQuoteSource.value,
    clientId: clientId.value,
    projectId: projectId.value,
    quoteTypeId: selectedExecutionQuoteType.value ?? undefined,
  };

  if (isExecutionFromDesignQuote.value) {
    emit('updateData', new AddExecutionQuoteParams(baseQuoteFields));
    return;
  }

  emit(
    'updateData',
    new AddExecutionQuoteParams({
      ...baseQuoteFields,
      priceEmployeeId: priceEmployeeId.value,
    }),
  );
};

watch(
  () => props.initialQuoteType,
  (quoteType) => {
    if (!quoteType) return;

    selectedExecutionQuoteType.value = quoteType;
  },
  { immediate: true },
);

const onExecutionQuoteTypeChange = (value: ExecutionQuoteType | null) => {
  selectedExecutionQuoteType.value = value;
  updateBaseData();
};

const onStagesChange = (value: ExecutionQuoteStageRequest[]) => {
  executionQuoteStages.value = value;
};

const onDetailsChange = (details: StoreExecutionQuoteDetailsParams[]) => {
  emit('updateDetails', details);
};

const selectSource = (source: QuoteSourceEnum) => {
  if (props.loading || baseLocked.value || source === selectedQuoteSource.value) return;
  selectedQuoteSource.value = source;
};

const showQuotes = () => {
  void router.push({ name: 'Execution Quotes' });
};

watch(client, (selectedClient, previousClient) => {
  clientId.value = toOptionalId(selectedClient);

  if (selectedClient?.id !== previousClient?.id && !baseLocked.value) {
    clearProjectData();
  }

  updateBaseData();
});

watch(project, (selectedProject) => {
  projectId.value = toOptionalId(selectedProject);
  updateBaseData();
});

watch(priceEmployee, (selectedPriceEmployee) => {
  priceEmployeeId.value = toOptionalId(selectedPriceEmployee);
  updateBaseData();
});

watch(selectedQuoteSource, () => {
  if (baseLocked.value) return;

  clearProjectData();
  clearPriceEmployeeData();
  updateBaseData();
});

watch(
  () => props.executionQuoteId,
  (executionQuoteId) => {
    if (!executionQuoteId) clearBuilderData();
  },
);

updateBaseData();
</script>

<template>
  <section class="execution-quote" :class="{
    'execution-quote--loading': loading,
    'execution-quote--stage-page': isBuilderPage,
  }">
    <template v-if="!isBuilderPage">
      <header class="execution-quote__header">
        <div class="execution-quote__heading">
          <span class="execution-quote__brand">
            <i class="pi pi-briefcase" aria-hidden="true"></i>
            {{ $t('execution_quote.badge') }}
          </span>
          <h1>{{ $t('execution_quote.title') }}</h1>
          <p>{{ $t('execution_quote.subtitle') }}</p>
        </div>

        <div class="execution-quote__actions">
          <AppButton class="execution-quote__new-button" icon="right" disabled>
            <template #icon>
              <i class="pi pi-plus" aria-hidden="true"></i>
            </template>
            {{ $t('execution_quote.new_quote') }}
          </AppButton>
          <AppButton class="execution-quote__list-button" theme="secondary" icon="right" outline @click="showQuotes">
            <template #icon>
              <i class="pi pi-list" aria-hidden="true"></i>
            </template>
            {{ $t('execution_quote.view_quotes') }}
          </AppButton>
        </div>
      </header>

      <div class="execution-quote__top-grid">
        <section class="build-path" :aria-label="$t('execution_quote.build_path')">
          <div class="build-path__heading">
            <h2>{{ $t('execution_quote.build_path') }}</h2>
            <span>{{ $t('execution_quote.four_steps') }}</span>
          </div>

          <ol class="build-path__steps">
            <li v-for="step in buildSteps" :key="step.id" class="build-path__step" :class="{
              'build-path__step--current': step.isCurrent,
              'build-path__step--complete': step.isComplete,
            }">
              <span class="build-path__number">{{ step.isComplete ? '✓' : step.id }}</span>
              <span>
                <strong>{{ $t(step.title) }}</strong>
                <small>{{ $t(step.state) }}</small>
              </span>
            </li>
          </ol>
        </section>

        <section class="quote-hero">
          <span class="quote-hero__badge">
            <i class="pi pi-file-edit" aria-hidden="true"></i>
            {{ $t('execution_quote.new_draft') }}
          </span>

          <div class="quote-hero__copy">
            <h2>{{ heroTitle || $t('execution_quote.new_execution_quote') }}</h2>
            <p>{{ heroSubtitle || $t('execution_quote.choose_client_and_project') }}</p>
          </div>

          <dl class="quote-hero__totals">
            <div>
              <dt>{{ $t('execution_quote.client_total') }}</dt>
              <dd>{{ clientTotal || '—' }}</dd>
            </div>
            <div>
              <dt>{{ $t('execution_quote.internal_cost') }}</dt>
              <dd>{{ quoteItemsCount ? internalCost : '—' }}</dd>
            </div>
            <div>
              <dt>{{ $t('execution_quote.items') }}</dt>
              <dd>{{ quoteItemsCount }}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section class="execution-quote__card source-section">
        <div class="section-title">
          <div class="section-title__copy">
            <span class="section-title__icon" aria-hidden="true">
              <i class="pi pi-sitemap"></i>
            </span>
            <div>
              <span v-if="selectedQuoteSource === QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE"
                class="section-title__badge">
                {{ $t('execution_quote.from_approved_design') }}
              </span>
              <h2>{{ $t('execution_quote.source_title') }}</h2>
            </div>
          </div>
        </div>

        <div class="source-options" role="radiogroup" :aria-label="$t('execution_quote.source_title')">
          <button class="source-option" :class="{
            'source-option--selected': selectedQuoteSource === QuoteSourceEnum.EXECUTION_ONLY,
          }" type="button" role="radio" :aria-checked="selectedQuoteSource === QuoteSourceEnum.EXECUTION_ONLY"
            :disabled="loading || baseLocked" @click="selectSource(QuoteSourceEnum.EXECUTION_ONLY)">
            <span class="source-option__icon" aria-hidden="true">
              <i class="pi pi-briefcase"></i>
            </span>
            <span class="source-option__content">
              <strong>{{ $t('execution_quote.sources.execution_only.title') }}</strong>
              <small>{{ $t('execution_quote.sources.execution_only.description') }}</small>
            </span>
            <span class="source-option__code">EXEC</span>
          </button>

          <button class="source-option" :class="{
            'source-option--selected':
              selectedQuoteSource === QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE,
          }" type="button" role="radio"
            :aria-checked="selectedQuoteSource === QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE"
            :disabled="loading || baseLocked" @click="selectSource(QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE)">
            <span class="source-option__icon" aria-hidden="true">
              <i class="pi pi-file-check"></i>
            </span>
            <span class="source-option__content">
              <strong>{{ $t('execution_quote.sources.design_quote.title') }}</strong>
              <small>{{ $t('execution_quote.sources.design_quote.description') }}</small>
            </span>
            <span class="source-option__code">DS</span>
          </button>
        </div>

        <div class="quote-data">
          <div class="section-title section-title--subsection">
            <div class="section-title__copy">
              <span class="section-title__number" aria-hidden="true">01</span>
              <h2>{{ $t('execution_quote.quote_data') }}</h2>
            </div>
          </div>

          <div class="quote-data__grid">
            <div class="quote-data__field">
              <UpdatedCustomInputSelect id="execution-quote-client" v-model="client" :controller="clientController"
                :params="clientParams" :placeholder="$t('execution_quote.placeholders.client')"
                :disabled="loading || baseLocked" :label="$t('execution_quote.fields.client')" required />
            </div>

            <div class="quote-data__field">
              <UpdatedCustomInputSelect id="execution-quote-project" v-model="project" :controller="projectController"
                :params="projectParams" :placeholder="$t('execution_quote.placeholders.project')"
                :disabled="loading || baseLocked || !clientId" :label="$t('execution_quote.fields.project')" required />
            </div>

            <div v-if="isExecutionOnly" class="quote-data__field">
              <UpdatedCustomInputSelect id="execution-quote-price-employee" v-model="priceEmployee"
                :controller="employeeController" :params="employeeParams"
                :placeholder="$t('execution_quote.placeholders.price_employee')" :disabled="loading || baseLocked"
                :label="$t('execution_quote.fields.price_employee')" required />
            </div>
          </div>

          <ExecutionQuoteTypeCards v-if="!baseLocked" class="quote-data__type-options"
            :model-value="selectedExecutionQuoteType" :loading="loading"
            @update:model-value="onExecutionQuoteTypeChange" />
        </div>
      </section>
    </template>

    <ExecutionQuoteBuilder v-if="isBuilderPage" :model-value="selectedExecutionQuoteType"
      :enabled="Boolean(executionQuoteId)" :execution-quote-id="executionQuoteId" :loading="loading"
      @update:model-value="onExecutionQuoteTypeChange" @update:stages="onStagesChange"
      @update:details="onDetailsChange" />
  </section>
</template>

<style scoped lang="scss">
.execution-quote {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
  max-width: 96rem;
  margin-inline: auto;
  padding: 1.25rem;
  color: var(--title-card-color);

  &--loading {
    pointer-events: none;
    opacity: 0.7;
  }
}

.execution-quote__top-grid,
.source-options,
.quote-data__grid,
.quote-hero__totals {
  display: grid;
  gap: 0.75rem;
}

.execution-quote__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding-block: 0.25rem;
}

.execution-quote__heading {
  flex: 1;
  text-align: start;
}

.execution-quote__heading h1,
.execution-quote__heading p,
.build-path__heading h2,
.section-title h2,
.quote-hero__copy h2,
.quote-hero__copy p {
  margin: 0;
}

.execution-quote__heading h1 {
  margin-top: 0.35rem;
  color: var(--title-card-color);
  font-size: clamp(1.6rem, 3vw, 2.25rem);
  line-height: 1.25;
}

.execution-quote__heading p {
  margin-top: 0.25rem;
  color: var(--subtitle-color);
  font-weight: 700;
}

.execution-quote__brand,
.section-title__badge,
.quote-hero__badge,
.build-path__heading span {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 0.3rem 0.65rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 700;
}

.execution-quote__brand,
.quote-hero__badge {
  gap: 0.4rem;
}

.execution-quote__brand,
.quote-hero__badge {
  background: var(--btn-easy);
  color: var(--PrimaryColor);
}

.execution-quote__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.execution-quote__actions button {
  min-height: 2.6rem;
}

.execution-quote__actions button:focus-visible,
.source-option:focus-visible {
  outline: 3px solid var(--PrimaryColor-alpha-20);
  outline-offset: 2px;
}

.execution-quote__new-button:disabled {
  cursor: default;
}

.execution-quote__top-grid {
  grid-template-areas: 'path hero';
  grid-template-columns: minmax(19rem, 0.8fr) minmax(0, 1.35fr);
  align-items: stretch;
}

.build-path,
.execution-quote__card {
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-md);
  background: var(--bg-card);
  box-shadow: var(--shadow-sm);
}

.quote-hero {
  grid-area: hero;
}

.build-path {
  grid-area: path;
  padding: 1.15rem;
  background: linear-gradient(145deg, var(--bg-card), var(--PrimaryColor-alpha-4));
}

.build-path__heading,
.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.section-title__copy {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.section-title__icon,
.section-title__number {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-sm);
  background: var(--PrimaryColor-light);
  color: var(--PrimaryColor);
  font-weight: 800;
}

.section-title__number {
  width: auto;
  min-width: 2.5rem;
  padding-inline: 0.45rem;
  font-size: 0.75rem;
}

.build-path__heading h2,
.section-title h2 {
  font-size: 1.15rem;
}

.build-path__heading span,
.section-title__badge {
  background: var(--PrimaryColor-light);
  color: var(--PrimaryColor);
}

.build-path__steps {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
  margin: 1rem 0 0;
  padding: 0;
  list-style: none;
}

.build-path__step {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.35rem;
  min-height: 4.9rem;
  padding: 0.7rem;
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  color: var(--subtitle-color);
}

.build-path__step strong,
.build-path__step small {
  display: block;
}

.build-path__step strong {
  color: var(--title-card-color);
  font-size: 0.8rem;
}

.build-path__step small {
  font-size: 0.7rem;
}

.build-path__number {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 1.8rem;
  height: 1.8rem;
  border-radius: var(--radius-full);
  background: var(--gray-900);
  color: var(--white);
  font-weight: 700;
}

.build-path__step--current {
  border-color: var(--PrimaryColor);
  background: var(--btn-easy);
}

.build-path__step--current .build-path__number {
  background: var(--PrimaryColor);
}

.build-path__step--complete {
  border-color: var(--PrimaryColor-alpha-30);
  background: var(--PrimaryColor-alpha-4);
}

.build-path__step--complete .build-path__number {
  background: var(--PrimaryColor);
}

.quote-hero {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 13.5rem;
  padding: 1.35rem;
  overflow: hidden;
  border-radius: var(--radius-md);
  background: linear-gradient(125deg, var(--SecondaryColor), var(--gray-950));
  box-shadow: var(--shadow-md);
  color: var(--white);
}

.quote-hero::before {
  position: absolute;
  inset-block-start: -4rem;
  inset-inline-start: -3rem;
  width: 12rem;
  height: 12rem;
  border: 1.5rem solid var(--PrimaryColor-alpha-20);
  border-radius: var(--radius-full);
  content: '';
}

.quote-hero__badge,
.quote-hero__copy,
.quote-hero__totals {
  position: relative;
  z-index: 1;
}

.quote-hero__badge {
  align-self: flex-start;
}

.quote-hero__copy {
  text-align: end;
}

.quote-hero__copy h2 {
  font-size: clamp(1.35rem, 2.4vw, 2rem);
}

.quote-hero__copy p {
  color: var(--gray-300);
  font-weight: 700;
}

.quote-hero__totals {
  grid-template-columns: repeat(3, 1fr);
}

.quote-hero__totals div {
  padding: 0.65rem;
  border: 1px solid var(--PrimaryColor-alpha-30);
  border-radius: var(--radius-sm);
  background: var(--PrimaryColor-alpha-10);
  text-align: end;
}

.quote-hero__totals dt {
  color: var(--gray-300);
  font-size: 0.75rem;
  font-weight: 700;
}

.quote-hero__totals dd {
  margin: 0.25rem 0 0;
  font-size: 1.1rem;
  font-weight: 800;
}

.execution-quote__card {
  padding: 1.35rem;
}

.source-options {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 1.1rem;
}

.source-option {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.75rem;
  min-height: 6rem;
  padding: 1rem;
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  color: var(--title-card-color);
  cursor: pointer;
  text-align: start;
  transition: var(--transition-fast);
}

.source-option:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: var(--PrimaryColor-alpha-30);
  box-shadow: var(--shadow-sm);
}

.source-option:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.source-option--selected {
  border-color: var(--PrimaryColor);
  background: var(--PrimaryColor-alpha-4);
  box-shadow: inset 0 -3px 0 var(--PrimaryColor);
}

.source-option__icon {
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: var(--radius-sm);
  background: var(--gray-100);
  color: var(--gray-600);
  font-size: 1rem;
}

.source-option--selected .source-option__icon {
  background: var(--PrimaryColor);
  color: var(--white);
}

.source-option__content strong,
.source-option__content small {
  display: block;
}

.source-option__content small {
  margin-top: 0.25rem;
  color: var(--subtitle-color);
  line-height: 1.5;
}

.source-option__code {
  padding: 0.3rem 0.5rem;
  border-radius: var(--radius-full);
  background: var(--gray-100);
  color: var(--gray-600);
  font-size: 0.7rem;
  font-weight: 800;
}

.source-option--selected .source-option__code {
  background: var(--PrimaryColor-light);
  color: var(--PrimaryColor);
}

.section-title--subsection {
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--border-weak);
}

.quote-data__grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 1.15rem;
  align-items: start;
}

.quote-data__field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.45rem;
  padding: 0.85rem;
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-md);
  background: var(--bg-card);
  transition: var(--transition-fast);
}

.quote-data__field:focus-within {
  border-color: var(--PrimaryColor);
  box-shadow: 0 0 0 3px var(--PrimaryColor-alpha-10);
}

.quote-data__type-options {
  margin-top: 1rem;
}

.quote-data__field> :deep(.input-label) {
  min-height: 1.5rem;
  color: var(--title-card-color);
  font-weight: 700;
}

.quote-data__field :deep(.reload-icon) {
  color: var(--PrimaryColor);
}

.quote-data__field :deep(.p-select),
.quote-data__field :deep(.p-multiselect) {
  min-height: 3rem;
  border-radius: var(--radius-sm);
  background: var(--bg-section);
}

.quote-data__field :deep(.p-select:not(.p-disabled):hover),
.quote-data__field :deep(.p-multiselect:not(.p-disabled):hover) {
  border-color: var(--PrimaryColor-alpha-30);
}

@media (max-width: 1100px) {
  .execution-quote__top-grid {
    grid-template-areas:
      'hero'
      'path';
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .execution-quote {
    padding: 0.75rem;
  }

  .source-options,
  .quote-data__grid,
  .quote-hero__totals {
    grid-template-columns: 1fr;
  }

  .execution-quote__header {
    align-items: stretch;
    flex-direction: column;
  }

  .execution-quote__actions {
    width: 100%;
  }

  .execution-quote__actions button {
    flex: 1;
  }

  .execution-quote__heading {
    text-align: start;
  }
}

@media (max-width: 520px) {

  .build-path__steps,
  .quote-hero__totals {
    grid-template-columns: 1fr;
  }

  .execution-quote__card,
  .quote-hero,
  .build-path {
    padding: 1rem;
  }
}
</style>
