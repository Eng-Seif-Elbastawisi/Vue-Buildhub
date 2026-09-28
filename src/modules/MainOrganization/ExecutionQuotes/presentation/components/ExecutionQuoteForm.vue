<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRoute, useRouter } from 'vue-router';

  import type TitleInterface from '@/base/Data/Models/titleInterface';
  import FieldHelpIcon from '@/shared/components/form/FieldHelpIcon.vue';
  import HandleFilesUpload, { type UploadedFile } from '@/shared/FormInputs/HandleFilesUpload.vue';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';

  import ClientController from '@/modules/MainOrganization/client/presentation/controllers/client.controller';
  import IndexClientParams from '@/modules/MainOrganization/client/core/params/index.client.params';

  import ClientSourceController from '@/modules/shared/ClientSource/presentation/controllers/client.source.controller';
  import IndexClientSourceParams from '@/modules/shared/ClientSource/core/params/index.client.source.params';

  import ProjectController from '@/modules/MainOrganization/Project/presentation/controllers/project.controller';
  import IndexProjectParams from '@/modules/MainOrganization/Project/core/params/index.project.params';

  import EmployeeController from '@/modules/MainOrganization/employee/presentation/controllers/employee.controller';
  import IndexEmployeeParams from '@/modules/MainOrganization/employee/core/params/index.employee.params';

  import { QuoteSourceEnum } from '../../core/constants/quote.source.enum';
  import {
    ExecutionQuoteTypeEnum,
    type ExecutionQuoteType,
  } from '../../core/constants/execution.quote.type.enum';
  import type { ExecutionQuoteStageSummary } from '../../core/models/execution.quote.show.model';
  import AddExecutionQuoteParams, {
    type ExecutionQuoteAttachmentParams,
  } from '../../core/params/add.execution.quote.params';
  import type { ExecutionQuoteStagePricingDraft } from '../../core/params/set.execution.quote.stage.pricing.params';
  import SetExecutionQuoteSupervisionPricingParams from '../../core/params/set.execution.quote.supervision.pricing.params';
  import type {
    default as StoreExecutionQuoteDetailsParams,
    ExecutionQuoteStageRequest,
  } from '../../core/params/store.execution.quote.details.params';
  import ExecutionQuoteBuilder from './builder/ExecutionQuoteBuilder.vue';
  import ExecutionQuoteSupervisionPricing from './builder/ExecutionQuoteSupervisionPricing.vue';
  import ExecutionQuoteTypeCards from './builder/ExecutionQuoteTypeCards.vue';

  const emit = defineEmits<{
    (event: 'updateData', quoteParams: AddExecutionQuoteParams): void;
    (event: 'updateDetails', detailsParams: StoreExecutionQuoteDetailsParams[]): void;
    (event: 'updatePricing', pricingDrafts: ExecutionQuoteStagePricingDraft[]): void;
    (
      event: 'updateSupervisionPricing',
      pricing: SetExecutionQuoteSupervisionPricingParams | null,
    ): void;
  }>();

  const props = withDefaults(
    defineProps<{
      loading?: boolean;
      executionQuoteId?: number | null;
      initialQuoteType?: ExecutionQuoteType | null;
      initialQuoteStages?: ExecutionQuoteStageSummary[];
      initialSupervisionPercentage?: number | null;
      initialTotalQuotePrice?: number;
      initialSupervisionFee?: number;
      initialClientQuotePrice?: number;
    }>(),
    {
      loading: false,
      executionQuoteId: null,
      initialQuoteType: null,
      initialQuoteStages: () => [],
      initialSupervisionPercentage: null,
      initialTotalQuotePrice: undefined,
      initialSupervisionFee: undefined,
      initialClientQuotePrice: undefined,
    },
  );

  const { t } = useI18n();
  const router = useRouter();
  const route = useRoute();

  const clientController = ClientController.getInstance();
  const clientParams = new IndexClientParams('', 1, 100, 0);

  const clientSourceController = ClientSourceController.getInstance();
  const indexClientSourceParams = new IndexClientSourceParams('', 1, 100, 0);

  const projectController = ProjectController.getInstance();

  const employeeController = EmployeeController.getInstance();
  const employeeParams = new IndexEmployeeParams('', 1, 100, 0);

  const clientExistOptions = computed<TitleInterface<number>[]>(() => [
    { id: 0, title: t('Project.client_new') },
    { id: 1, title: t('Project.client_existing') },
  ]);

  const selectedClientExist = ref<TitleInterface<number> | null>(null);
  const client_exist = ref<boolean | null>(null);

  const client = ref<TitleInterface<string | number> | null>(null);
  const clientId = ref<number | undefined>();

  const client_name = ref<string>('');
  const client_phone = ref<string>('');
  const client_email = ref<string>('');
  const client_address = ref<string>('');
  const selectedClientSource = ref<TitleInterface<number> | null>(null);
  const client_source_id = ref<number | undefined>();

  const project = ref<TitleInterface<string | number> | null>(null);
  const projectId = ref<number | undefined>();

  const priceEmployee = ref<TitleInterface<string | number> | null>(null);
  const priceEmployeeId = ref<number | undefined>();

  const attachments = ref<ExecutionQuoteAttachmentParams[]>([]);
  const existingAttachmentFiles = ref<string[]>([]);
  const attachmentFiles = computed(() => existingAttachmentFiles.value);

  const selectedQuoteSource = ref<QuoteSourceEnum>(QuoteSourceEnum.EXECUTION_ONLY);
  const selectedExecutionQuoteType = ref<ExecutionQuoteType | null>(null);
  const executionQuoteStages = ref<ExecutionQuoteStageRequest[]>([]);
  const supervisionPercentage = ref<number | null>(props.initialSupervisionPercentage);

  const baseLocked = computed(() => Boolean(props.executionQuoteId));
  const isBuilderPage = computed(() => route.name === 'Build Execution Quote');

  const toOptionalId = (selection: TitleInterface<string | number> | null): number | undefined => {
    if (selection?.id === undefined || selection.id === null) return undefined;
    const id = Number(selection.id);
    return Number.isInteger(id) && id > 0 ? id : undefined;
  };

  const projectParams = computed(() => {
    const filteredProjectParams = new IndexProjectParams('', 1, 100, 0);
    if (clientId.value) {
      filteredProjectParams.clientId = clientId.value;
    }
    return filteredProjectParams;
  });

  const isExecutionOnly = computed(
    () => selectedQuoteSource.value === QuoteSourceEnum.EXECUTION_ONLY,
  );

  const isExecutionFromDesignQuote = computed(
    () => selectedQuoteSource.value === QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE,
  );

  const isClientDataValid = computed(() => {
    if (client_exist.value === true) {
      return Boolean(clientId.value);
    }
    if (client_exist.value === false) {
      return Boolean(
        client_name.value.trim() && client_phone.value.trim() && client_source_id.value,
      );
    }
    return false;
  });

  const baseDataComplete = computed(() => {
    const baseReady = Boolean(
      isClientDataValid.value &&
      projectId.value &&
      selectedExecutionQuoteType.value &&
      attachments.value.length,
    );

    return isExecutionFromDesignQuote.value
      ? baseReady
      : Boolean(baseReady && priceEmployeeId.value);
  });

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

  const heroSubtitle = computed(() => {
    if (client_exist.value === true) {
      return (client.value?.title as string) || undefined;
    }
    if (client_exist.value === false) {
      return client_name.value || undefined;
    }
    return undefined;
  });

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
    supervisionPercentage.value = null;
    emit('updateDetails', []);
    emit('updateSupervisionPricing', null);
  };

  /**
   * Emits ONLY the first request payload.
   * Stages / items are handled in the builder step.
   */
  const updateBaseData = () => {
    const baseQuoteFields = {
      quoteSource: selectedQuoteSource.value,
      projectId: projectId.value,
      quoteType: selectedExecutionQuoteType.value ?? undefined,
      clientExist: client_exist.value !== null ? client_exist.value : undefined,
      clientId: client_exist.value === true ? clientId.value : undefined,
      clientName: client_exist.value === false ? client_name.value : undefined,
      clientPhone: client_exist.value === false ? client_phone.value : undefined,
      clientEmail: client_exist.value === false ? client_email.value : undefined,
      clientAddress: client_exist.value === false ? client_address.value : undefined,
      clientSourceId: client_exist.value === false ? client_source_id.value : undefined,
      attachments: attachments.value.length ? attachments.value : undefined,
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

  const updateClientExist = (value: TitleInterface<number> | null) => {
    selectedClientExist.value = value;

    if (!value) {
      client_exist.value = null;
      client.value = null;
      clientId.value = undefined;
      client_name.value = '';
      client_phone.value = '';
      client_email.value = '';
      client_address.value = '';
      selectedClientSource.value = null;
      client_source_id.value = undefined;
      updateBaseData();
      return;
    }

    client_exist.value = value.id === 1;

    if (client_exist.value) {
      client_name.value = '';
      client_phone.value = '';
      client_email.value = '';
      client_address.value = '';
      selectedClientSource.value = null;
      client_source_id.value = undefined;
    } else {
      client.value = null;
      clientId.value = undefined;
    }

    updateBaseData();
  };

  const updateClient = (value: TitleInterface<string | number> | null) => {
    client.value = value;
    clientId.value = toOptionalId(value);

    if (!baseLocked.value) {
      clearProjectData();
    }

    updateBaseData();
  };

  const updateClientSource = (value: TitleInterface<number> | null) => {
    selectedClientSource.value = value;
    client_source_id.value = toOptionalId(value);
    updateBaseData();
  };

  const updateProject = (value: TitleInterface<string | number> | null) => {
    project.value = value;
    projectId.value = toOptionalId(value);
    updateBaseData();
  };

  const updatePriceEmployee = (value: TitleInterface<string | number> | null) => {
    priceEmployee.value = value;
    priceEmployeeId.value = toOptionalId(value);
    updateBaseData();
  };

  const updateAttachments = (files: UploadedFile[]) => {
    attachments.value = files
      .filter((file) => file.base64 && file.base64.startsWith('data:'))
      .map((file) => ({
        file: file.base64,
        alt: file.name || null,
        link: null,
      }));

    updateBaseData();
  };

  watch(
    () => props.initialQuoteType,
    (quoteType) => {
      if (!quoteType) return;

      selectedExecutionQuoteType.value = quoteType;
    },
    { immediate: true },
  );

  watch(
    () => props.initialSupervisionPercentage,
    (percentage) => {
      supervisionPercentage.value = percentage;
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

  const onPricingChange = (pricingDrafts: ExecutionQuoteStagePricingDraft[]) => {
    emit('updatePricing', pricingDrafts);
  };

  const updateSupervisionPricing = (percentage: number | null) => {
    supervisionPercentage.value = percentage;

    if (
      selectedExecutionQuoteType.value !== ExecutionQuoteTypeEnum.SUPERVISION ||
      !props.executionQuoteId ||
      percentage === null
    ) {
      emit('updateSupervisionPricing', null);
      return;
    }

    emit(
      'updateSupervisionPricing',
      new SetExecutionQuoteSupervisionPricingParams({
        quoteId: props.executionQuoteId,
        percentage,
      }),
    );
  };

  const selectSource = (source: QuoteSourceEnum) => {
    if (props.loading || baseLocked.value || source === selectedQuoteSource.value) return;
    selectedQuoteSource.value = source;
  };

  const showQuotes = () => {
    void router.push({ name: 'Execution Quotes' });
  };

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
  <section
    class="execution-quote"
    :class="{
      'execution-quote--loading': loading,
      'execution-quote--stage-page': isBuilderPage,
    }"
  >
    <template v-if="!isBuilderPage">
      <header class="execution-quote__header">
        <div class="execution-quote__heading">
          <span class="execution-quote__brand">
            <span class="execution-quote__brand-mark" aria-hidden="true">
              <i class="pi pi-building"></i>
            </span>
            {{ $t('execution_quote.workspace') }}
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
          <AppButton
            class="execution-quote__list-button"
            theme="secondary"
            icon="right"
            outline
            @click="showQuotes"
          >
            <template #icon>
              <i class="pi pi-list" aria-hidden="true"></i>
            </template>
            {{ $t('execution_quote.view_quotes') }}
          </AppButton>
        </div>
      </header>

      <div class="execution-quote__top-grid">
        <section class="quote-hero">
          <span class="quote-hero__badge">
            <i class="pi pi-file-edit" aria-hidden="true"></i>
            {{ $t('execution_quote.new_draft') }}
          </span>

          <span class="quote-hero__watermark" aria-hidden="true">
            <i class="pi pi-building"></i>
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

        <section class="build-path" :aria-label="$t('execution_quote.build_path')">
          <div class="build-path__heading">
            <div>
              <span>{{ $t('execution_quote.four_steps') }}</span>
              <h2>{{ $t('execution_quote.build_path') }}</h2>
            </div>
            <i class="pi pi-directions" aria-hidden="true"></i>
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
              <span class="build-path__number">{{ step.isComplete ? '✓' : step.id }}</span>
              <span>
                <strong>{{ $t(step.title) }}</strong>
                <small>{{ $t(step.state) }}</small>
              </span>
            </li>
          </ol>
        </section>
      </div>

      <section class="execution-quote__card source-section">
        <div class="section-title">
          <div class="section-title__copy">
            <span class="section-title__number" aria-hidden="true">01</span>
            <div>
              <span
                v-if="selectedQuoteSource === QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE"
                class="section-title__badge"
              >
                {{ $t('execution_quote.from_approved_design') }}
              </span>
              <h2>{{ $t('execution_quote.source_title') }}</h2>
              <p>{{ $t('execution_quote.source_hint') }}</p>
            </div>
          </div>
          <i class="section-title__decor pi pi-sitemap" aria-hidden="true"></i>
        </div>

        <div
          class="source-options"
          role="radiogroup"
          :aria-label="$t('execution_quote.source_title')"
        >
          <button
            class="source-option"
            :class="{
              'source-option--selected': selectedQuoteSource === QuoteSourceEnum.EXECUTION_ONLY,
            }"
            type="button"
            role="radio"
            :aria-checked="selectedQuoteSource === QuoteSourceEnum.EXECUTION_ONLY"
            :disabled="loading || baseLocked"
            @click="selectSource(QuoteSourceEnum.EXECUTION_ONLY)"
          >
            <span class="source-option__icon" aria-hidden="true">
              <i class="pi pi-briefcase"></i>
            </span>
            <span class="source-option__content">
              <strong>{{ $t('execution_quote.sources.execution_only.title') }}</strong>
              <small>{{ $t('execution_quote.sources.execution_only.description') }}</small>
            </span>
            <span class="source-option__code">EXEC</span>
            <span class="source-option__selected-mark" aria-hidden="true">
              <i class="pi pi-check"></i>
            </span>
          </button>

          <button
            class="source-option"
            :class="{
              'source-option--selected':
                selectedQuoteSource === QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE,
            }"
            type="button"
            role="radio"
            :aria-checked="selectedQuoteSource === QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE"
            :disabled="loading || baseLocked"
            @click="selectSource(QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE)"
          >
            <span class="source-option__icon" aria-hidden="true">
              <i class="pi pi-file-check"></i>
            </span>
            <span class="source-option__content">
              <strong>{{ $t('execution_quote.sources.design_quote.title') }}</strong>
              <small>{{ $t('execution_quote.sources.design_quote.description') }}</small>
            </span>
            <span class="source-option__code">DS</span>
            <span class="source-option__selected-mark" aria-hidden="true">
              <i class="pi pi-check"></i>
            </span>
          </button>
        </div>
      </section>

      <section class="execution-quote__card quote-data">
        <div class="section-title">
          <div class="section-title__copy">
            <span class="section-title__number" aria-hidden="true">02</span>
            <div>
              <h2>{{ $t('execution_quote.quote_data') }}</h2>
              <p>{{ $t('execution_quote.quote_data_hint') }}</p>
            </div>
          </div>
          <i class="section-title__decor pi pi-sliders-h" aria-hidden="true"></i>
        </div>

        <div class="quote-data__grid">
          <div id="client-type-field" class="field-group quote-data__field">
            <UpdatedCustomInputSelect
              id="client_exist"
              :model-value="selectedClientExist"
              :label="$t('client_type')"
              :static-options="clientExistOptions"
              :placeholder="$t('Project.client_exist_placeholder')"
              :disabled="loading || baseLocked"
              required
              @update:model-value="updateClientExist"
            />
          </div>

          <div
            v-if="selectedClientExist && client_exist"
            id="client-field"
            class="field-group quote-data__field"
          >
            <UpdatedCustomInputSelect
              id="execution-quote-client"
              :model-value="client"
              :label="$t('client_id')"
              :controller="clientController"
              :placeholder="$t('client_id_placeholder')"
              :params="clientParams"
              :disabled="loading || baseLocked"
              required
              @update:model-value="updateClient"
            />
          </div>

          <template v-if="selectedClientExist && client_exist === false">
            <div id="client-name-field" class="field-group quote-data__field">
              <span class="field-help-label-row field-help-label-row--block">
                <label class="field-label" for="client_name">
                  <span class="required-indicator" aria-hidden="true">*</span>
                  {{ $t('client_name') }}
                </label>
                <FieldHelpIcon
                  :label="$t('client_name')"
                  field-name="name"
                  field-id="client_name"
                />
              </span>

              <input
                id="client_name"
                v-model="client_name"
                class="field-input"
                :placeholder="$t('client_name_placeholder')"
                :disabled="loading || baseLocked"
                @input="updateBaseData"
              />
            </div>

            <div id="client-phone-field" class="field-group quote-data__field">
              <span class="field-help-label-row field-help-label-row--block">
                <label class="field-label" for="client_phone">
                  <span class="required-indicator" aria-hidden="true">*</span>
                  {{ $t('client_phone') }}
                </label>
                <FieldHelpIcon
                  :label="$t('client_phone')"
                  field-name="phone"
                  field-id="client_phone"
                />
              </span>

              <input
                id="client_phone"
                v-model="client_phone"
                class="field-input"
                :placeholder="$t('client_phone_placeholder')"
                :disabled="loading || baseLocked"
                @input="updateBaseData"
              />
            </div>

            <div id="client-email-field" class="field-group quote-data__field">
              <span class="field-help-label-row field-help-label-row--block">
                <label class="field-label" for="client_email">{{ $t('client.email') }}</label>
                <FieldHelpIcon
                  :label="$t('client.email')"
                  field-name="email"
                  field-id="client_email"
                />
              </span>

              <input
                id="client_email"
                v-model="client_email"
                type="email"
                class="field-input"
                :placeholder="$t('client.email_placeholder')"
                :disabled="loading || baseLocked"
                @input="updateBaseData"
              />
            </div>

            <div id="client-address-field" class="field-group quote-data__field">
              <span class="field-help-label-row field-help-label-row--block">
                <label class="field-label" for="client_address">{{ $t('client.address') }}</label>
                <FieldHelpIcon
                  :label="$t('client.address')"
                  field-name="address"
                  field-id="client_address"
                />
              </span>

              <input
                id="client_address"
                v-model="client_address"
                class="field-input"
                :placeholder="$t('client.address_placeholder')"
                :disabled="loading || baseLocked"
                @input="updateBaseData"
              />
            </div>

            <div id="client-source-field" class="field-group quote-data__field">
              <UpdatedCustomInputSelect
                id="client_source"
                :model-value="selectedClientSource"
                :label="$t('client_source')"
                :controller="clientSourceController"
                :placeholder="$t('client_source_placeholder')"
                :params="indexClientSourceParams"
                :disabled="loading || baseLocked"
                required
                @update:model-value="updateClientSource"
              />
            </div>
          </template>

          <div class="field-group quote-data__field">
            <UpdatedCustomInputSelect
              id="execution-quote-project"
              :model-value="project"
              :controller="projectController"
              :params="projectParams"
              :placeholder="$t('execution_quote.placeholders.project')"
              :disabled="loading || baseLocked || (client_exist === true && !clientId)"
              :label="$t('execution_quote.fields.project')"
              required
              @update:model-value="updateProject"
            />
          </div>

          <div v-if="isExecutionOnly" class="field-group quote-data__field">
            <UpdatedCustomInputSelect
              id="execution-quote-price-employee"
              :model-value="priceEmployee"
              :controller="employeeController"
              :params="employeeParams"
              :placeholder="$t('execution_quote.placeholders.price_employee')"
              :disabled="loading || baseLocked"
              :label="$t('execution_quote.fields.price_employee')"
              required
              @update:model-value="updatePriceEmployee"
            />
          </div>

          <div class="field-group quote-data__field quote-data__attachments col-span-2">
            <HandleFilesUpload
              id="attachments"
              :label="$t('attachments')"
              :file="attachmentFiles"
              :multiple="true"
              required
              @change="updateAttachments"
            />
          </div>
        </div>
      </section>

      <ExecutionQuoteTypeCards
        v-if="!baseLocked"
        class="quote-data__type-options"
        :model-value="selectedExecutionQuoteType"
        :loading="loading"
        @update:model-value="onExecutionQuoteTypeChange"
      />
    </template>

    <ExecutionQuoteBuilder
      v-if="isBuilderPage"
      :model-value="selectedExecutionQuoteType"
      :enabled="Boolean(executionQuoteId)"
      :execution-quote-id="executionQuoteId"
      :initial-stages="props.initialQuoteStages"
      :loading="loading"
      @update:model-value="onExecutionQuoteTypeChange"
      @update:stages="onStagesChange"
      @update:details="onDetailsChange"
      @update:pricing="onPricingChange"
    />

    <ExecutionQuoteSupervisionPricing
      v-if="isBuilderPage && selectedExecutionQuoteType === ExecutionQuoteTypeEnum.SUPERVISION"
      class="execution-quote__supervision-pricing"
      :model-value="supervisionPercentage"
      :internal-cost="props.initialTotalQuotePrice"
      :supervision-fee="props.initialSupervisionFee"
      :client-total="props.initialClientQuotePrice"
      :disabled="loading || quoteItemsCount === 0"
      @update:model-value="updateSupervisionPricing"
    />
  </section>
</template>

<style scoped lang="scss">
  .execution-quote {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    max-width: 96rem;
    margin-inline: auto;
    padding: clamp(0.75rem, 2vw, 1.5rem);
    color: var(--title-card-color);

    &--loading {
      pointer-events: none;
      opacity: 0.7;
    }

    &--stage-page {
      max-width: none;
      padding: 0;
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
    align-items: flex-end;
    justify-content: space-between;
    gap: 1.5rem;
    padding: 0.25rem 0.25rem 0.6rem;
    border-bottom: 1px solid var(--border-weak);
    animation: execution-quote-form-enter 340ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
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
    margin-top: 0.5rem;
    color: var(--title-card-color);
    font-size: clamp(1.65rem, 3vw, 2.35rem);
    line-height: 1.1;
    letter-spacing: -0.03em;
  }

  .execution-quote__heading p {
    margin-top: 0.35rem;
    color: var(--subtitle-color);
    font-size: 0.88rem;
    font-weight: 700;
  }

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

  .execution-quote__brand {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    color: var(--PrimaryColor);
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .execution-quote__brand-mark {
    display: grid;
    place-items: center;
    width: 1.8rem;
    height: 1.8rem;
    border-radius: 0.55rem 0.55rem 0.2rem;
    background: var(--PrimaryColor);
    color: var(--white);
    font-size: 0.62rem;
    letter-spacing: 0;
  }

  .quote-hero__badge {
    gap: 0.4rem;
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
    grid-template-columns: minmax(0, 1.45fr) minmax(20rem, 0.8fr);
    gap: 1rem;
    align-items: stretch;
    animation: execution-quote-form-enter 400ms 60ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }

  .build-path,
  .execution-quote__card {
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-lg);
    background: var(--bg-card);
    box-shadow: var(--shadow-sm);
    transition:
      border-color var(--transition-fast),
      box-shadow var(--transition-fast);
  }

  .build-path:hover,
  .build-path:focus-within,
  .execution-quote__card:hover,
  .execution-quote__card:focus-within {
    border-color: var(--PrimaryColor-alpha-30);
    box-shadow: var(--shadow-md);
  }

  .quote-hero {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 16rem;
    padding: clamp(1.25rem, 2.4vw, 2rem);
    overflow: hidden;
    border: 1px solid var(--gray-800);
    border-radius: var(--radius-lg);
    background: linear-gradient(135deg, var(--SecondaryColor), var(--gray-950));
    box-shadow: var(--shadow-lg);
    color: var(--white);
    isolation: isolate;
    transition: box-shadow var(--transition-fast);
  }

  .quote-hero:hover {
    box-shadow: var(--shadow-xl);
  }

  .quote-hero::before,
  .quote-hero::after {
    position: absolute;
    border-radius: var(--radius-full);
    content: '';
    pointer-events: none;
  }

  .quote-hero::before {
    inset-block-start: -7rem;
    inset-inline-end: -4rem;
    width: 17rem;
    height: 17rem;
    border: 2rem solid var(--PrimaryColor-alpha-20);
  }

  .quote-hero::after {
    inset-block-end: -8rem;
    inset-inline-start: 25%;
    width: 13rem;
    height: 13rem;
    border: 1px solid var(--white-alpha-15);
  }

  .quote-hero__badge,
  .quote-hero__copy,
  .quote-hero__totals {
    position: relative;
    z-index: 1;
  }

  .quote-hero__badge {
    z-index: 1;
    align-self: flex-start;
  }

  .quote-hero__watermark {
    position: absolute;
    z-index: -1;
    inset-block-start: 1.3rem;
    inset-inline-end: 1.6rem;
    color: var(--white-alpha-15);
    font-size: 6rem;
    line-height: 1;
    transition:
      opacity 420ms ease,
      transform 420ms cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .quote-hero:hover .quote-hero__watermark {
    opacity: 0.85;
    transform: translateY(-0.2rem) scale(1.035);
  }

  .quote-hero__copy {
    max-width: 38rem;
    margin-block: 1.25rem;
    text-align: start;
  }

  .quote-hero__copy h2 {
    max-width: 32rem;
    font-size: clamp(1.55rem, 3vw, 2.55rem);
    line-height: 1.15;
  }

  .quote-hero__copy p {
    margin-top: 0.4rem;
    color: var(--gray-300);
    font-weight: 700;
  }

  .quote-hero__totals {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.65rem;
    margin: 0;
  }

  .quote-hero__totals div {
    min-width: 0;
    padding: 0.7rem 0.8rem;
    border: 1px solid var(--white-alpha-15);
    border-radius: var(--radius-sm);
    background: var(--white-alpha-15);
    backdrop-filter: blur(6px);
    text-align: start;
  }

  .quote-hero__totals dt {
    overflow: hidden;
    color: var(--gray-300);
    font-size: 0.7rem;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .quote-hero__totals dd {
    margin: 0.25rem 0 0;
    font-size: 1.15rem;
    font-weight: 800;
  }

  .build-path {
    position: relative;
    padding: 1.25rem;
    overflow: hidden;
  }

  .build-path::after {
    position: absolute;
    inset-block-start: 0;
    inset-inline-end: 0;
    width: 4.5rem;
    height: 0.3rem;
    border-end-start-radius: var(--radius-full);
    background: var(--PrimaryColor);
    content: '';
  }

  .build-path__heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .build-path__heading h2,
  .section-title h2 {
    font-size: 1.12rem;
  }

  .build-path__heading h2 {
    margin-top: 0.45rem;
  }

  .build-path__heading span {
    padding: 0.2rem 0.55rem;
    background: var(--btn-easy);
    color: var(--PrimaryColor);
  }

  .build-path__heading > i {
    display: grid;
    place-items: center;
    width: 2.4rem;
    height: 2.4rem;
    border-radius: var(--radius-sm);
    background: var(--gray-100);
    color: var(--gray-600);
    font-size: 1.1rem;
  }

  .build-path__steps {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.65rem;
    margin: 1.25rem 0 0;
    padding: 0;
    list-style: none;
  }

  .build-path__step {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 0.65rem;
    padding: 0.75rem;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-sm);
    background: var(--bg-section);
    transition: var(--transition-fast);
  }

  .build-path__step > span:last-child {
    display: flex;
    min-width: 0;
    flex-direction: column;
  }

  .build-path__step strong {
    overflow: hidden;
    font-size: 0.82rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .build-path__step small {
    color: var(--subtitle-color);
    font-size: 0.7rem;
    font-weight: 700;
  }

  .build-path__number {
    display: grid;
    width: 1.8rem;
    height: 1.8rem;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 0.55rem 0.55rem 0.2rem;
    background: var(--gray-300);
    color: var(--gray-700);
    font-size: 0.78rem;
    font-weight: 800;
  }

  .build-path__step--current {
    border-color: var(--PrimaryColor);
    background: var(--btn-easy);
    box-shadow: inset 0 -2px 0 var(--PrimaryColor);
  }

  .build-path__step--complete {
    border-color: var(--PrimaryColor-alpha-30);
    background: var(--PrimaryColor-alpha-4);
  }

  .build-path__step--current .build-path__number,
  .build-path__step--complete .build-path__number {
    background: var(--PrimaryColor);
    color: var(--white);
  }

  .execution-quote__card {
    position: relative;
    padding: clamp(1rem, 2vw, 1.5rem);
    overflow: hidden;
  }

  .source-section {
    animation: execution-quote-form-enter 420ms 120ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }

  .quote-data {
    animation: execution-quote-form-enter 420ms 180ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }

  .quote-data__type-options {
    animation: execution-quote-form-enter 420ms 240ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }

  .execution-quote__card::before {
    position: absolute;
    inset-block: 1.25rem;
    inset-inline-start: 0;
    width: 0.25rem;
    border-start-end-radius: var(--radius-full);
    border-end-end-radius: var(--radius-full);
    background: var(--PrimaryColor-alpha-30);
    content: '';
  }

  .source-options {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.8rem;
    margin-top: 1.25rem;
  }

  .source-option {
    position: relative;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    min-height: 6rem;
    align-items: center;
    gap: 0.9rem;
    padding: 1rem 1.1rem;
    overflow: hidden;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-md);
    background: var(--bg-section);
    color: var(--title-card-color);
    cursor: pointer;
    text-align: start;
    transition: var(--transition-fast);
  }

  .source-option:hover:not(:disabled) {
    border-color: var(--PrimaryColor-alpha-50);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  .source-option:hover:not(:disabled) .source-option__icon {
    transform: translateY(-1px) scale(1.04);
  }

  .source-option:disabled {
    cursor: not-allowed;
  }

  .source-option--selected {
    border-color: var(--PrimaryColor);
    background: var(--btn-easy);
    box-shadow: inset 0 -3px 0 var(--PrimaryColor);
  }

  .source-option__icon {
    display: grid;
    width: 2.8rem;
    height: 2.8rem;
    place-items: center;
    border: 1px solid var(--border-weak);
    border-radius: 0.85rem 0.85rem 0.3rem;
    background: var(--bg-card);
    color: var(--PrimaryColor);
    font-size: 1.15rem;
    transition: transform var(--transition-fast);
  }

  .source-option__content {
    display: flex;
    min-width: 0;
    flex-direction: column;
  }

  .source-option__content strong {
    font-size: 0.95rem;
  }

  .source-option__content small {
    margin-top: 0.25rem;
    color: var(--subtitle-color);
    font-size: 0.8rem;
    font-weight: 600;
    line-height: 1.5;
  }

  .source-option__code {
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius-xs);
    background: var(--gray-200);
    color: var(--gray-600);
    font-size: 0.68rem;
    font-weight: 900;
  }

  .source-option__selected-mark {
    position: absolute;
    inset-block-start: 0;
    inset-inline-end: 0;
    display: grid;
    width: 1.65rem;
    height: 1.65rem;
    place-items: center;
    border-end-start-radius: 0.7rem;
    background: var(--PrimaryColor);
    color: var(--white);
    font-size: 0.65rem;
    opacity: 0;
    transform: scale(0.75);
    transition: var(--transition-fast);
  }

  .source-option--selected .source-option__selected-mark {
    opacity: 1;
    transform: scale(1);
  }

  .section-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .section-title__copy {
    display: flex;
    align-items: center;
    min-width: 0;
    gap: 0.8rem;
  }

  .section-title__number {
    display: grid;
    width: 2.55rem;
    height: 2.55rem;
    flex: 0 0 auto;
    place-items: center;
    border: 1px solid var(--PrimaryColor-alpha-30);
    border-radius: 0.8rem 0.8rem 0.25rem;
    background: var(--btn-easy);
    color: var(--PrimaryColor);
    font-size: 0.78rem;
    font-weight: 900;
  }

  .section-title p {
    margin-top: 0.2rem;
    color: var(--subtitle-color);
    font-size: 0.78rem;
    font-weight: 600;
  }

  .section-title__badge {
    margin-bottom: 0.3rem;
    padding: 0.2rem 0.5rem;
    background: var(--PrimaryColor-alpha-10);
    color: var(--PrimaryColor);
  }

  .section-title__decor {
    color: var(--gray-300);
    font-size: 1.65rem;
  }

  .quote-data__grid {
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: 0.8rem;
    margin-top: 1.25rem;
    align-items: start;
  }

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .field-label {
    font-family: 'Medium';
    font-size: var(--sm-size);
    color: var(--gray-600);
  }

  .required-indicator {
    color: var(--danger);
  }

  .field-input {
    width: 100%;
    min-height: 3rem;
    padding: 0.75rem 1rem;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-sm);
    background: var(--bg-card);
    color: var(--title-card-color);
    outline: none;
    transition: var(--transition-fast);
    font-family: 'Medium';
    font-weight: 400;
    font-size: var(--sm-size);

    &:focus {
      border-color: var(--PrimaryColor);
      box-shadow: 0 0 0 3px var(--PrimaryColor-alpha-10);
    }
  }

  .quote-data__field {
    display: flex;
    grid-column: span 4;
    min-width: 0;
    flex-direction: column;
    gap: 0.45rem;
    padding: 0.85rem;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-md);
    background: var(--bg-section);
    transition: var(--transition-fast);

    &:hover {
      border-color: var(--PrimaryColor-alpha-30);
    }

    &:focus-within {
      border-color: var(--PrimaryColor-alpha-50);
      background: var(--bg-card);
      box-shadow: 0 0 0 3px var(--PrimaryColor-alpha-10);
    }
  }

  .quote-data__attachments,
  .col-span-2 {
    grid-column: 1 / -1;
  }

  .quote-data__type-options {
    margin-top: 0;
  }

  .quote-data__field > :deep(.input-label) {
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
    background: var(--bg-card);
  }

  .quote-data__field :deep(.p-select:not(.p-disabled):hover),
  .quote-data__field :deep(.p-multiselect:not(.p-disabled):hover) {
    border-color: var(--PrimaryColor-alpha-50);
  }

  @keyframes execution-quote-form-enter {
    from {
      opacity: 0;
      transform: translateY(0.75rem);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 1100px) {
    .execution-quote__top-grid {
      grid-template-columns: 1fr;
    }

    .build-path__steps {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .quote-data__field {
      grid-column: span 6;
    }

    .quote-data__attachments,
    .col-span-2 {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: 760px) {
    .execution-quote__header {
      align-items: stretch;
      flex-direction: column;
    }

    .execution-quote__actions,
    .execution-quote__actions button {
      width: 100%;
    }

    .source-options,
    .build-path__steps {
      grid-template-columns: 1fr 1fr;
    }

    .quote-data__field,
    .quote-data__attachments,
    .col-span-2 {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: 560px) {
    .execution-quote {
      padding: 0.65rem;
    }

    .quote-hero,
    .build-path,
    .execution-quote__card {
      padding: 1rem;
      border-radius: var(--radius-md);
    }

    .quote-hero {
      min-height: 18rem;
    }

    .source-options,
    .build-path__steps,
    .quote-hero__totals {
      grid-template-columns: 1fr;
    }

    .section-title__decor,
    .quote-hero__watermark {
      display: none;
    }

    .source-option {
      grid-template-columns: auto minmax(0, 1fr);
    }

    .source-option__code {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .execution-quote__header,
    .execution-quote__top-grid,
    .source-section,
    .quote-data,
    .quote-data__type-options {
      animation: none;
    }

    .quote-hero,
    .quote-hero__watermark,
    .build-path,
    .execution-quote__card,
    .source-option,
    .source-option__icon,
    .quote-data__field {
      transition: none;
    }

    .quote-hero:hover .quote-hero__watermark,
    .source-option:hover:not(:disabled),
    .source-option:hover:not(:disabled) .source-option__icon {
      transform: none;
    }
  }
</style>
