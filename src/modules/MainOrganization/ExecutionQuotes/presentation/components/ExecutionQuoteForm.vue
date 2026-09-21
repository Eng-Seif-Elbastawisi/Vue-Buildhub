<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRouter } from 'vue-router';

  import type TitleInterface from '@/base/Data/Models/titleInterface';
  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';

  import ClientController from '@/modules/MainOrganization/client/presentation/controllers/client.controller';
  import IndexClientParams from '@/modules/MainOrganization/client/core/params/index.client.params';

  import ProjectController from '@/modules/MainOrganization/Project/presentation/controllers/project.controller';
  import IndexProjectParams from '@/modules/MainOrganization/Project/core/params/index.project.params';

  import ProjectPreviewController from '@/modules/MainOrganization/Project/presentation/controllers/project.preview.controller';
  import IndexProjectPreviewParams from '@/modules/MainOrganization/Project/core/params/index.project.preview.params';
  import ShowProjectPreviewParams from '@/modules/MainOrganization/Project/core/params/show.project.preview.params';
  import type ProjectPreviewShowModel from '@/modules/MainOrganization/Project/core/models/project.preview.show.model';

  import QuoteTypeController from '@/modules/MainOrganization/QuoteTypes/presentation/controllers/quote.types.controller';
  import IndexQuoteTypeParams from '@/modules/MainOrganization/QuoteTypes/core/params/index.quote.types.params';

  import EmployeeController from '@/modules/MainOrganization/employee/presentation/controllers/employee.controller';
  import IndexEmployeeParams from '@/modules/MainOrganization/employee/core/params/index.employee.params';

  import {
    Status,
    getStatusNameKey,
  } from '@/modules/MainOrganization/Project/core/constants/status.enum';

  import { QuoteSourceEnum } from '../../core/constants/quote.source.enum';
  import AddExecutionQuoteParams from '../../core/params/add.execution.quote.params';

  const emit = defineEmits<{
    (event: 'updateData', quoteParams: AddExecutionQuoteParams): void;
  }>();

  const props = withDefaults(
    defineProps<{
      loading?: boolean;
    }>(),
    {
      loading: false,
    },
  );

  const router = useRouter();
  const { t } = useI18n();

  // ======================================================
  // Controllers
  // ======================================================

  const clientController = ClientController.getInstance();
  const projectController = ProjectController.getInstance();
  const projectPreviewController = ProjectPreviewController.getInstance();
  const quoteTypeController = QuoteTypeController.getInstance();
  const employeeController = EmployeeController.getInstance();

  // ======================================================
  // Params
  // ======================================================

  const clientParams = new IndexClientParams('', 1, 100, 0);

  const quoteTypeParams = new IndexQuoteTypeParams({
    word: '',
    page: 1,
    perPage: 100,
    withPage: 0,
  });

  const employeeParams = new IndexEmployeeParams('', 1, 100, 0);

  // ======================================================
  // Select Models
  // ======================================================

  const client = ref<TitleInterface<string | number> | null>(null);

  const project = ref<TitleInterface<string | number> | null>(null);

  const quoteType = ref<TitleInterface<string | number> | null>(null);

  const priceEmployee = ref<TitleInterface<string | number> | null>(null);

  const designQuote = ref<TitleInterface<string | number> | null>(null);

  // ======================================================
  // Design Quote Details
  // ======================================================

  const designQuoteDetails = ref<ProjectPreviewShowModel | null>(null);

  const designQuoteLoading = ref(false);

  // ======================================================
  // IDs
  // ======================================================

  const clientId = ref<number | undefined>();

  const projectId = ref<number | undefined>();

  const quoteTypeId = ref<number | undefined>();

  const priceEmployeeId = ref<number | undefined>();

  // ======================================================
  // Source
  // ======================================================

  const selectedQuoteSource = ref<QuoteSourceEnum>(QuoteSourceEnum.EXECUTION_ONLY);

  // ======================================================
  // Dynamic Params
  // ======================================================

  const projectParams = computed(() => {
    void clientId.value;

    return new IndexProjectParams('', 1, 100, 0);
  });

  const designQuoteParams = computed(() => {
    void clientId.value;

    return new IndexProjectPreviewParams('', 1, 100, 0);
  });

  // ======================================================
  // Computed
  // ======================================================

  const isExecutionOnly = computed(
    () => selectedQuoteSource.value === QuoteSourceEnum.EXECUTION_ONLY,
  );

  const isExecutionFromDesignQuote = computed(
    () => selectedQuoteSource.value === QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE,
  );

  const designQuoteSelected = computed(() => designQuote.value !== null);

  const heroTitle = computed(() => {
    if (isExecutionFromDesignQuote.value) {
      return (
        project.value?.title ?? designQuoteDetails.value?.project?.title ?? designQuote.value?.title
      );
    }

    return project.value?.title;
  });

  const heroSubtitle = computed(() => client.value?.title);

  const inspectionValue = computed(() => {
    const details = designQuoteDetails.value;

    if (!details?.preview_date) {
      return '—';
    }

    return details.preview_time
      ? `${details.preview_date} - ${details.preview_time}`
      : details.preview_date;
  });

  const statusValue = computed(() => {
    const status = designQuoteDetails.value?.status;

    if (status === undefined || status === null) {
      return '—';
    }

    const knownStatus = Object.values(Status).includes(status as Status);

    return knownStatus ? t(getStatusNameKey(status as Status)) : String(status);
  });

  const designValue = computed(() => designQuoteDetails.value?.design_value ?? '—');

  const areaValue = computed(() => designQuoteDetails.value?.area ?? '—');

  const sourceTwoDataComplete = computed(() =>
    Boolean(
      clientId.value &&
      projectId.value &&
      quoteTypeId.value &&
      designQuote.value &&
      designQuoteDetails.value,
    ),
  );

  // ======================================================
  // Steps
  // ======================================================

  const buildSteps = computed(() => [
    {
      id: 1,
      title: 'execution_quote.steps.data',
      state: sourceTwoDataComplete.value
        ? 'execution_quote.steps.complete'
        : 'execution_quote.steps.start_here',
      isCurrent: isExecutionOnly.value || isExecutionFromDesignQuote.value,
      isComplete: sourceTwoDataComplete.value,
    },
    {
      id: 2,
      title: 'execution_quote.steps.type',
      state: sourceTwoDataComplete.value
        ? 'execution_quote.steps.completed'
        : 'execution_quote.steps.required',
      isComplete: sourceTwoDataComplete.value,
      isCurrent: false,
    },
    {
      id: 3,
      title: 'execution_quote.steps.stages',
      state: 'execution_quote.steps.choose_stage',
      isComplete: false,
      isCurrent: false,
    },
    {
      id: 4,
      title: 'execution_quote.steps.review',
      state: 'execution_quote.steps.awaiting_items',
      isComplete: false,
      isCurrent: false,
    },
  ]);

  // ======================================================
  // Helpers
  // ======================================================

  const toOptionalId = (selection: TitleInterface<string | number> | null): number | undefined => {
    if (selection?.id === undefined || selection.id === null) {
      return undefined;
    }

    const id = Number(selection.id);

    return Number.isInteger(id) && id > 0 ? id : undefined;
  };

  // ======================================================
  // Clear Data
  // ======================================================

  let latestDesignQuoteRequest = 0;

  const clearDesignQuoteData = () => {
    latestDesignQuoteRequest += 1;

    designQuote.value = null;
    designQuoteDetails.value = null;
  };

  const clearProjectData = () => {
    project.value = null;
    projectId.value = undefined;
  };

  const clearQuoteTypeData = () => {
    quoteType.value = null;
    quoteTypeId.value = undefined;
  };

  const clearPriceEmployeeData = () => {
    priceEmployee.value = null;
    priceEmployeeId.value = undefined;
  };

  // ======================================================
  // Emit Params
  // ======================================================

  const updateData = () => {
    if (selectedQuoteSource.value === QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE) {
      emit(
        'updateData',
        new AddExecutionQuoteParams({
          quoteSource: selectedQuoteSource.value,
          clientId: clientId.value,
          projectId: projectId.value,
          quoteTypeId: quoteTypeId.value,
        }),
      );

      return;
    }

    emit(
      'updateData',
      new AddExecutionQuoteParams({
        quoteSource: selectedQuoteSource.value,
        clientId: clientId.value,
        projectId: projectId.value,
        quoteTypeId: quoteTypeId.value,
        priceEmployeeId: priceEmployeeId.value,
      }),
    );
  };

  // ======================================================
  // Source Selection
  // ======================================================

  const selectSource = (source: QuoteSourceEnum) => {
    if (props.loading || source === selectedQuoteSource.value) {
      return;
    }

    selectedQuoteSource.value = source;
  };

  // ======================================================
  // Navigation
  // ======================================================

  const showQuotes = () => {
    void router.push({
      name: 'Execution Quotes',
    });
  };

  // ======================================================
  // Client Watch
  // ======================================================

  watch(client, (selectedClient, previousClient) => {
    clientId.value = toOptionalId(selectedClient);

    if (selectedClient?.id !== previousClient?.id) {
      clearProjectData();

      if (isExecutionFromDesignQuote.value) {
        clearDesignQuoteData();
      }
    }

    updateData();
  });

  // ======================================================
  // Project Watch
  // ======================================================

  watch(project, (selectedProject) => {
    projectId.value = toOptionalId(selectedProject);

    updateData();
  });

  // ======================================================
  // Quote Type Watch
  // ======================================================

  watch(quoteType, (selectedQuoteType) => {
    quoteTypeId.value = toOptionalId(selectedQuoteType);

    updateData();
  });

  // ======================================================
  // Price Employee Watch
  // ======================================================

  watch(priceEmployee, (selectedPriceEmployee) => {
    priceEmployeeId.value = toOptionalId(selectedPriceEmployee);

    updateData();
  });

  // ======================================================
  // Source Watch
  // ======================================================

  watch(selectedQuoteSource, () => {
    clearProjectData();
    clearQuoteTypeData();
    clearPriceEmployeeData();
    clearDesignQuoteData();

    updateData();
  });

  // ======================================================
  // Design Quote Watch
  // ======================================================

  watch(designQuote, async (selectedDesignQuote) => {
    const requestId = ++latestDesignQuoteRequest;

    designQuoteDetails.value = null;

    const selectedDesignQuoteId = toOptionalId(selectedDesignQuote);

    if (!selectedDesignQuoteId) {
      updateData();

      return;
    }

    designQuoteLoading.value = true;

    try {
      const previewResponse = await projectPreviewController.fetchOne(
        new ShowProjectPreviewParams({
          previewId: selectedDesignQuoteId,
        }),
      );

      if (
        requestId !== latestDesignQuoteRequest ||
        selectedQuoteSource.value !== QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE ||
        !(previewResponse instanceof DataSuccess) ||
        !previewResponse.data
      ) {
        return;
      }

      designQuoteDetails.value = previewResponse.data;
    } finally {
      if (requestId === latestDesignQuoteRequest) {
        designQuoteLoading.value = false;

        updateData();
      }
    }
  });

  updateData();
</script>

<template>
  <section
    class="execution-quote"
    :class="{
      'execution-quote--loading': loading,
    }"
  >
    <!-- Header -->
    <header class="execution-quote__header">
      <div class="execution-quote__heading">
        <span class="execution-quote__brand">
          {{ $t('execution_quote.badge') }}
        </span>

        <h1>
          {{ $t('execution_quote.title') }}
        </h1>

        <p>
          {{ $t('execution_quote.subtitle') }}
        </p>
      </div>

      <div class="execution-quote__actions">
        <button class="execution-quote__new-button" type="button" disabled>
          <span aria-hidden="true">+</span>

          {{ $t('execution_quote.new_quote') }}
        </button>

        <button class="execution-quote__list-button" type="button" @click="showQuotes">
          {{ $t('execution_quote.view_quotes') }}
        </button>
      </div>
    </header>

    <!-- Top -->
    <div class="execution-quote__top-grid">
      <!-- Build Path -->
      <section class="build-path" :aria-label="$t('execution_quote.build_path')">
        <div class="build-path__heading">
          <h2>
            {{ $t('execution_quote.build_path') }}
          </h2>

          <span>
            {{ $t('execution_quote.four_steps') }}
          </span>
        </div>

        <ol class="build-path__steps">
          <li
            v-for="step in buildSteps"
            :key="step.id"
            class="build-path__step"
            :class="{
              'build-path__step--current': step.isCurrent,
              'build-path__step--complete': step.isComplete,
            }"
          >
            <span class="build-path__number">
              {{ step.id }}
            </span>

            <span>
              <strong>
                {{ $t(step.title) }}
              </strong>

              <small>
                {{ $t(step.state) }}
              </small>
            </span>
          </li>
        </ol>
      </section>

      <!-- Hero -->
      <section class="quote-hero">
        <span class="quote-hero__badge">
          {{ $t('execution_quote.new_draft') }}
        </span>

        <div class="quote-hero__copy">
          <h2>
            {{ heroTitle || $t('execution_quote.new_execution_quote') }}
          </h2>

          <p>
            {{ heroSubtitle || $t('execution_quote.choose_client_and_project') }}
          </p>
        </div>

        <dl class="quote-hero__totals">
          <div>
            <dt>
              {{ $t('execution_quote.client_total') }}
            </dt>

            <dd>—</dd>
          </div>

          <div>
            <dt>
              {{ $t('execution_quote.internal_cost') }}
            </dt>

            <dd>—</dd>
          </div>

          <div>
            <dt>
              {{ $t('execution_quote.items') }}
            </dt>

            <dd>0</dd>
          </div>
        </dl>
      </section>
    </div>

    <!-- Source -->
    <section class="execution-quote__card source-section">
      <div class="section-title">
        <div>
          <span
            v-if="selectedQuoteSource === QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE"
            class="section-title__badge"
          >
            {{ $t('execution_quote.from_approved_design') }}
          </span>

          <h2>
            {{ $t('execution_quote.source_title') }}
          </h2>
        </div>
      </div>

      <div
        class="source-options"
        role="radiogroup"
        :aria-label="$t('execution_quote.source_title')"
      >
        <!-- Source 1 -->
        <button
          class="source-option"
          :class="{
            'source-option--selected': selectedQuoteSource === QuoteSourceEnum.EXECUTION_ONLY,
          }"
          type="button"
          role="radio"
          :aria-checked="selectedQuoteSource === QuoteSourceEnum.EXECUTION_ONLY"
          :disabled="loading"
          @click="selectSource(QuoteSourceEnum.EXECUTION_ONLY)"
        >
          <span class="source-option__icon" aria-hidden="true"> ⌂ </span>

          <span class="source-option__content">
            <strong>
              {{ $t('execution_quote.sources.execution_only.title') }}
            </strong>

            <small>
              {{ $t('execution_quote.sources.execution_only.description') }}
            </small>
          </span>

          <span class="source-option__code"> EXEC </span>
        </button>

        <!-- Source 2 -->
        <button
          class="source-option"
          :class="{
            'source-option--selected':
              selectedQuoteSource === QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE,
          }"
          type="button"
          role="radio"
          :aria-checked="selectedQuoteSource === QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE"
          :disabled="loading"
          @click="selectSource(QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE)"
        >
          <span class="source-option__icon" aria-hidden="true"> ▦ </span>

          <span class="source-option__content">
            <strong>
              {{ $t('execution_quote.sources.design_quote.title') }}
            </strong>

            <small>
              {{ $t('execution_quote.sources.design_quote.description') }}
            </small>
          </span>

          <span class="source-option__code"> DS </span>
        </button>
      </div>

      <!-- ==================================================
           TYPE 1
           ================================================== -->

      <div v-if="isExecutionOnly" class="quote-data">
        <div class="section-title section-title--subsection">
          <h2>
            {{ $t('execution_quote.quote_data') }}
          </h2>
        </div>

        <div class="quote-data__grid">
          <!-- Client -->
          <div class="quote-field">
            <!-- <label
              class="quote-field__label"
              for="execution-quote-client"
            >
              {{ $t('execution_quote.fields.client') }}

              <span class="quote-field__required">
                *
              </span>
            </label> -->

            <UpdatedCustomInputSelect
              id="execution-quote-client"
              v-model="client"
              :controller="clientController"
              :params="clientParams"
              :placeholder="$t('execution_quote.placeholders.client')"
              :disabled="loading"
              :label="$t('execution_quote.fields.client')"
              required
            />
          </div>

          <!-- Project -->
          <div class="quote-field">
            <!-- <label class="quote-field__label" for="execution-quote-project">
              {{ $t('execution_quote.fields.project') }}

              <span class="quote-field__required"> * </span>
            </label> -->

            <UpdatedCustomInputSelect
              id="execution-quote-project"
              v-model="project"
              :controller="projectController"
              :params="projectParams"
              :placeholder="$t('execution_quote.placeholders.project')"
              :disabled="loading || !clientId"
              required
              :label="$t('execution_quote.fields.project')"
            />
          </div>

          <!-- Quote Type -->
          <div class="quote-field">
            <!-- <label class="quote-field__label" for="execution-quote-type">
              {{ $t('execution_quote.fields.quote_type') }}

              <span class="quote-field__required"> * </span>
            </label> -->

            <UpdatedCustomInputSelect
              id="execution-quote-type"
              v-model="quoteType"
              :controller="quoteTypeController"
              :params="quoteTypeParams"
              :placeholder="$t('execution_quote.placeholders.quote_type')"
              :disabled="loading"
              required
              :label="$t('execution_quote.fields.quote_type')"
            />
          </div>

          <!-- Price Employee -->
          <div class="quote-field">
            <!-- <label class="quote-field__label" for="execution-quote-price-employee">
              {{ $t('execution_quote.fields.price_employee') }}

              <span class="quote-field__required"> * </span>
            </label> -->

            <UpdatedCustomInputSelect
              id="execution-quote-price-employee"
              v-model="priceEmployee"
              :controller="employeeController"
              :params="employeeParams"
              :placeholder="$t('execution_quote.placeholders.price_employee')"
              :disabled="loading"
              required
              :label="$t('execution_quote.fields.price_employee')"
            />
          </div>
        </div>
      </div>

      <!-- ==================================================
           TYPE 2
           ================================================== -->

      <div v-else class="quote-data quote-data--design">
        <div class="section-title section-title--subsection">
          <h2>
            {{ $t('execution_quote.quote_data') }}
          </h2>
        </div>

        <div class="quote-data__design-grid">
          <!-- Client -->
          <div class="quote-field">
            <!-- <label class="quote-field__label" for="execution-design-client">
              {{ $t('execution_quote.fields.client') }}

              <span class="quote-field__required"> * </span>
            </label> -->

            <UpdatedCustomInputSelect
              id="execution-design-client"
              v-model="client"
              :controller="clientController"
              :params="clientParams"
              :placeholder="$t('execution_quote.placeholders.client')"
              :disabled="loading"
              required
              price_employee
              :label="$t('execution_quote.fields.client')"
            />
          </div>

          <!-- Project -->
          <div class="quote-field">
            <!-- <label class="quote-field__label" for="execution-design-project">
              {{ $t('execution_quote.fields.project') }}

              <span class="quote-field__required"> * </span>
            </label> -->

            <UpdatedCustomInputSelect
              id="execution-design-project"
              v-model="project"
              :controller="projectController"
              :params="projectParams"
              :placeholder="$t('execution_quote.placeholders.project')"
              :disabled="loading || !clientId"
              required
              :label="$t('execution_quote.fields.project')"
            />
          </div>

          <!-- Quote Type -->
          <div class="quote-field">
            <!-- <label class="quote-field__label" for="execution-design-quote-type">
              {{ $t('execution_quote.fields.quote_type') }}

              <span class="quote-field__required"> * </span>
            </label> -->

            <UpdatedCustomInputSelect
              id="execution-design-quote-type"
              v-model="quoteType"
              :controller="quoteTypeController"
              :params="quoteTypeParams"
              :placeholder="$t('execution_quote.placeholders.quote_type')"
              :disabled="loading"
              required
              :label="$t('execution_quote.fields.quote_type')"
            />
          </div>

          <!-- Design Quote -->
          <div class="quote-field">
            <!-- <label class="quote-field__label" for="execution-design-quote">
              {{ $t('execution_quote.fields.design_quote') }}

              <span class="quote-field__required"> * </span>
            </label> -->

            <UpdatedCustomInputSelect
              id="execution-design-quote"
              v-model="designQuote"
              :controller="projectPreviewController"
              :params="designQuoteParams"
              :placeholder="$t('execution_quote.placeholders.design_quote')"
              :disabled="loading || !clientId || !projectId || !quoteTypeId"
              required
              :label="$t('execution_quote.fields.design_quote')"
            />
          </div>
        </div>

        <!-- Design Quote Summary -->
        <div v-if="designQuoteSelected" class="design-summary" :aria-busy="designQuoteLoading">
          <article class="design-summary__item">
            <span>
              {{ $t('execution_quote.fields.status') }}
            </span>

            <strong>
              {{ statusValue }}
            </strong>
          </article>

          <article class="design-summary__item">
            <span>
              {{ $t('execution_quote.fields.inspection') }}
            </span>

            <strong>
              {{ inspectionValue }}
            </strong>
          </article>

          <article class="design-summary__item">
            <span>
              {{ $t('execution_quote.fields.design_value') }}
            </span>

            <strong>
              {{ designValue }}
            </strong>
          </article>

          <article class="design-summary__item">
            <span>
              {{ $t('execution_quote.fields.area') }}
            </span>

            <strong>
              {{ areaValue }}
            </strong>
          </article>
        </div>
      </div>
    </section>
  </section>
</template>

<style scoped lang="scss">
  .execution-quote {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    color: var(--title-card-color);

    &--loading {
      pointer-events: none;
      opacity: 0.7;
    }
  }

  .execution-quote__header,
  .execution-quote__top-grid,
  .source-options,
  .quote-data__grid,
  .quote-data__design-grid,
  .design-summary,
  .quote-hero__totals {
    display: grid;
    gap: 0.75rem;
  }

  .execution-quote__header {
    grid-template-columns: auto 1fr;
    align-items: end;
  }

  .execution-quote__heading h1,
  .execution-quote__heading p,
  .build-path__heading h2,
  .section-title h2,
  .quote-hero__copy h2,
  .quote-hero__copy p {
    margin: 0;
  }

  .execution-quote__heading {
    text-align: end;
  }

  .execution-quote__heading h1 {
    color: var(--title-card-color);
    font-size: clamp(1.6rem, 3vw, 2.25rem);
    line-height: 1.25;
  }

  .execution-quote__heading p {
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
    border-radius: var(--radius-full);
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.3rem 0.65rem;
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
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-weight: 700;
    min-height: 2.6rem;
    padding-inline: 1rem;
  }

  .execution-quote__new-button {
    background: var(--PrimaryColor);
    border: 1px solid var(--PrimaryColor);
    color: var(--white);
  }

  .execution-quote__new-button:disabled {
    cursor: default;
  }

  .execution-quote__list-button {
    background: var(--btn-easy);
    border: 1px solid var(--PrimaryColor-alpha-30);
    color: var(--PrimaryColor);
  }

  .execution-quote__top-grid {
    grid-template-columns:
      minmax(0, 1.17fr)
      minmax(290px, 0.78fr);
  }

  .build-path,
  .execution-quote__card {
    background: var(--bg-card);
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
  }

  .quote-hero {
    grid-column: 1;
  }

  .build-path {
    grid-column: 2;
    padding: 1rem;

    background: linear-gradient(140deg, var(--bg-card), var(--info-light));
  }

  .build-path__heading,
  .section-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
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
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.5rem;
    list-style: none;
    margin: 1rem 0 0;
    padding: 0;
  }

  .build-path__step {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.35rem;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-sm);
    background: var(--bg-card);
    color: var(--subtitle-color);
    min-height: 4.75rem;
    padding: 0.5rem;
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
    border-color: var(--primary-green);
    background: var(--light-green-bg);
  }

  .build-path__step--complete .build-path__number {
    background: var(--primary-green);
  }

  .quote-hero {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 14rem;
    border-radius: var(--radius-md);

    background: linear-gradient(125deg, var(--gray-950), var(--SecondaryColor));

    box-shadow: var(--shadow-md);
    color: var(--white);
    overflow: hidden;
    padding: 1.15rem;
    position: relative;
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
    border: 1px solid var(--PrimaryColor-alpha-30);
    border-radius: var(--radius-sm);
    background: var(--PrimaryColor-alpha-10);
    padding: 0.65rem;
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
    padding: 1.1rem;
  }

  .section-title--subsection {
    margin-top: 1.2rem;
  }

  .source-options {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin-top: 0.9rem;
  }

  .source-option {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 0.75rem;

    min-height: 5.6rem;

    border: 1px solid var(--border-weak);
    border-radius: var(--radius-sm);

    background: var(--bg-card);
    color: var(--title-card-color);

    cursor: pointer;
    padding: 0.85rem;
    text-align: start;

    transition: var(--transition-fast);
  }

  .source-option:disabled {
    cursor: not-allowed;
  }

  .source-option--selected {
    border-color: var(--primary-green);
    box-shadow: inset 0 -3px 0 var(--primary-green);
    background: var(--light-green-bg);
  }

  .source-option__icon {
    display: grid;
    place-items: center;

    width: 2.25rem;
    height: 2.25rem;

    border-radius: var(--radius-sm);

    background: var(--gray-100);
    color: var(--gray-600);
  }

  .source-option__content strong,
  .source-option__content small {
    display: block;
  }

  .source-option__content strong {
    font-size: 1rem;
  }

  .source-option__content small {
    color: var(--subtitle-color);
    margin-top: 0.25rem;
  }

  .source-option__code {
    border-radius: var(--radius-full);

    background: var(--gray-100);
    color: var(--gray-600);

    font-size: 0.7rem;
    font-weight: 800;

    padding: 0.3rem 0.5rem;
  }

  /* ==============================================
     Fields
     ============================================== */

  .quote-field {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    min-width: 0;
    width: 100%;
  }

  .quote-field__label {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 0.25rem;

    width: 100%;

    color: var(--title-card-color);

    font-size: var(--sm-size);
    font-weight: 600;
    line-height: 1.4;

    text-align: start;
  }

  .quote-field__required {
    color: var(--danger);
    font-weight: 700;
  }

  /* ==============================================
     Source 1 Grid
     ============================================== */

  .quote-data__grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));

    margin-top: 1rem;
    align-items: start;
  }

  /* ==============================================
     Source 2 Grid
     ============================================== */

  .quote-data__design-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));

    margin-top: 1.25rem;
    align-items: start;
  }

  /* ==============================================
     Design Summary
     ============================================== */

  .design-summary {
    grid-template-columns: repeat(4, minmax(0, 1fr));

    margin-top: 1rem;
  }

  .design-summary__item {
    min-height: 4.5rem;

    border: 1px solid var(--border-weak);
    border-radius: var(--radius-sm);

    background: var(--gray-50);

    padding: 0.7rem;
  }

  .design-summary__item span,
  .design-summary__item strong {
    display: block;
  }

  .design-summary__item span {
    color: var(--subtitle-color);

    font-size: 0.8rem;
    font-weight: 700;
  }

  .design-summary__item strong {
    color: var(--title-card-color);
    margin-top: 0.4rem;
  }

  @media (max-width: 1100px) {
    .execution-quote__top-grid {
      grid-template-columns: 1fr;
    }

    .quote-hero,
    .build-path {
      grid-column: auto;
    }

    .quote-data__grid,
    .quote-data__design-grid,
    .design-summary {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 700px) {
    .execution-quote {
      padding: 0.75rem;
    }

    .execution-quote__header {
      grid-template-columns: 1fr;
    }

    .execution-quote__heading {
      text-align: start;
    }

    .build-path__steps,
    .source-options,
    .quote-data__grid,
    .quote-data__design-grid,
    .design-summary,
    .quote-hero__totals {
      grid-template-columns: 1fr;
    }

    .build-path__step {
      min-height: 3.75rem;
    }
  }
</style>
