<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import type TitleInterface from '@/base/Data/Models/titleInterface';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import { dialogManager } from '@/base/Presentation/Dialogs/dialog.manager';
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

import StageController from '@/modules/shared/Stages/presentation/controllers/stage.controller';
import IndexStageParams from '@/modules/shared/Stages/core/params/index.stage.params';
import type StageModel from '@/modules/shared/Stages/core/models/stage.model';

import ProductsController from '@/modules/MainOrganization/Products/presentation/controllers/products.controller';
import IndexProductsParams from '@/modules/MainOrganization/Products/core/params/index.products.params';
import type ProductsModel from '@/modules/MainOrganization/Products/core/models/products.model';

import MaterialController from '@/modules/shared/Materials/presentation/controllers/materials.controller';
import IndexMaterialParams from '@/modules/shared/Materials/core/params/index.materials.params';
import type MaterialsModel from '@/modules/shared/Materials/core/models/materials.model';

import LaborController from '@/modules/MainOrganization/Labors/presentation/controllers/labor.controller';
import IndexLaborParams from '@/modules/MainOrganization/Labors/core/params/index.labor.params';
import type LaborModel from '@/modules/MainOrganization/Labors/core/models/labor.model';

import {
  Status,
  getStatusNameKey,
} from '@/modules/MainOrganization/Project/core/constants/status.enum';

import { QuoteSourceEnum } from '../../core/constants/quote.source.enum';
import {
  ExecutionQuoteTypeEnum,
  getExecutionQuoteTypeTitleKey,
  type ExecutionQuoteType,
} from '../../core/constants/execution.quote.type.enum';
import {
  ExecutionQuoteItemSourceEnum,
  getExecutionQuoteItemSourceTitleKey,
  type ExecutionQuoteItemSource,
} from '../../core/constants/execution.quote.item.source.enum';
import AddExecutionQuoteParams, {
  type ExecutionQuoteItemRequest,
  type ExecutionQuoteStageRequest,
} from '../../core/params/add.execution.quote.params';

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
const route = useRoute();
const { t } = useI18n();

// ======================================================
// Controllers
// ======================================================

const clientController = ClientController.getInstance();
const projectController = ProjectController.getInstance();
const projectPreviewController = ProjectPreviewController.getInstance();
const quoteTypeController = QuoteTypeController.getInstance();
const employeeController = EmployeeController.getInstance();
const stageController = StageController.getInstance();
const productsController = ProductsController.getInstance();
const materialController = MaterialController.getInstance();
const laborController = LaborController.getInstance();

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

const stageParams = new IndexStageParams({
  perPage: 100,
  withPage: 0,
  parentId: null,
});

const productsParams = new IndexProductsParams({ perPage: 100, withPage: 0, status: true });
const materialParams = new IndexMaterialParams('', 1, 100, 0);
const laborParams = new IndexLaborParams({ perPage: 100, withPage: 0, active: 1 });

// ======================================================
// Select Models
// ======================================================

const client = ref<TitleInterface<string | number> | null>(null);

const project = ref<TitleInterface<string | number> | null>(null);

const quoteType = ref<TitleInterface<string | number> | null>(null);

const priceEmployee = ref<TitleInterface<string | number> | null>(null);

const designQuote = ref<TitleInterface<string | number> | null>(null);

const selectedExecutionQuoteType = ref<ExecutionQuoteType | null>(null);

const selectedItemSource = ref<ExecutionQuoteItemSource | null>(null);
const selectedProduct = ref<TitleInterface<string | number> | null>(null);
const selectedMaterial = ref<TitleInterface<string | number> | null>(null);
const selectedLabor = ref<TitleInterface<string | number> | null>(null);
const itemQuantity = ref(1);
const itemUnitPrice = ref(0);

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

interface ExecutionQuoteItemState extends ExecutionQuoteItemRequest {
  id: string;
  stage_id: number | string;
  stage_name?: string;
  sub_stage_name?: string;
  source_title?: string;
  unit_name?: string;
}

interface ExecutionQuoteStageState extends ExecutionQuoteStageRequest {
  stage_name?: string;
  selected_sub_stage_id?: number;
  items: ExecutionQuoteItemState[];
}

const stageStates = ref<Record<string, ExecutionQuoteStageState>>({});
const selectedMainStageId = ref<number | undefined>();
const selectedSubStageId = ref<number | undefined>();
const stagesLoading = ref(false);
const subStagesLoading = ref(false);
const itemSourcesLoading = ref(false);

const mainStages = ref<StageModel[]>([]);

const selectedMainStage = computed<StageModel | undefined>(() =>
  mainStages.value.find((stage) => stage.id === selectedMainStageId.value),
);
const subStages = ref<StageModel[]>([]);

const currentStageState = computed<ExecutionQuoteStageState | undefined>(() => {
  if (!selectedMainStageId.value) return undefined;

  return stageStates.value[String(selectedMainStageId.value)];
});

const quoteItems = computed(() =>
  Object.values(stageStates.value).flatMap((stage) =>
    stage.items.map((item) => ({ ...item, stage_name: stage.stage_name })),
  ),
);

const internalCost = computed(() =>
  quoteItems.value.reduce((total, item) => total + item.quantity * item.unit_price, 0),
);

const clientTotal = computed(() =>
  Object.values(stageStates.value).reduce((total, stage) => total + (stage.client_price ?? 0), 0),
);

const expectedMargin = computed(() => clientTotal.value - internalCost.value);

const itemSourceCards = computed(() => [
  {
    value: ExecutionQuoteItemSourceEnum.PRODUCT,
    titleKey: getExecutionQuoteItemSourceTitleKey(ExecutionQuoteItemSourceEnum.PRODUCT),
    descriptionKey: 'execution_quote.item_sources.product.description',
    code: 'PRODUCT',
  },
  {
    value: ExecutionQuoteItemSourceEnum.BUILDING_MATERIAL,
    titleKey: getExecutionQuoteItemSourceTitleKey(ExecutionQuoteItemSourceEnum.BUILDING_MATERIAL),
    descriptionKey: 'execution_quote.item_sources.building_material.description',
    code: 'MAT',
  },
  {
    value: ExecutionQuoteItemSourceEnum.LABOR,
    titleKey: getExecutionQuoteItemSourceTitleKey(ExecutionQuoteItemSourceEnum.LABOR),
    descriptionKey: 'execution_quote.item_sources.labor.description',
    code: 'LABOR',
  },
]);

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

const subStageParams = computed(() => {
  if (!selectedMainStageId.value) return undefined;

  return new IndexStageParams({
    perPage: 100,
    withPage: 0,
    parentId: selectedMainStageId.value,
  });
});

const selectedSourceItem = computed(() => {
  if (selectedItemSource.value === ExecutionQuoteItemSourceEnum.PRODUCT)
    return selectedProduct.value;
  if (selectedItemSource.value === ExecutionQuoteItemSourceEnum.BUILDING_MATERIAL)
    return selectedMaterial.value;
  if (selectedItemSource.value === ExecutionQuoteItemSourceEnum.LABOR) return selectedLabor.value;
  return null;
});

const selectedSourceRecord = computed<ProductsModel | MaterialsModel | LaborModel | undefined>(
  () => {
    const sourceId = toOptionalId(selectedSourceItem.value);
    if (!sourceId) return undefined;

    const records =
      selectedItemSource.value === ExecutionQuoteItemSourceEnum.PRODUCT
        ? productsController.listData.value
        : selectedItemSource.value === ExecutionQuoteItemSourceEnum.BUILDING_MATERIAL
          ? materialController.listData.value
          : laborController.listData.value;

    return (records ?? []).find((record) => record.id === sourceId) as
      ProductsModel | MaterialsModel | LaborModel | undefined;
  },
);

const sourceRecordUnit = computed(() => {
  const record = selectedSourceRecord.value;
  if (!record) return '';

  if ('measurementUnitTitle' in record) return record.measurementUnitTitle ?? '';
  if ('measurementUnit' in record) return record.measurementUnit?.title ?? '';
  if ('unit' in record) return String(record.unit ?? '');
  return '';
});

const sourceRecordPrice = computed(() => {
  const record = selectedSourceRecord.value;
  if (!record) return 0;

  if ('expectedPrice' in record) return Number(record.expectedPrice ?? 0);
  if ('price' in record) return Number(record.price ?? 0);
  return 0;
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
  isExecutionFromDesignQuote.value
    ? Boolean(
      clientId.value &&
      projectId.value &&
      quoteTypeId.value &&
      designQuote.value &&
      designQuoteDetails.value,
    )
    : Boolean(clientId.value && projectId.value && quoteTypeId.value && priceEmployeeId.value),
);

const quoteTypeSelected = computed(() => selectedExecutionQuoteType.value !== null);
const hasQuoteItems = computed(() => quoteItems.value.length > 0);
const isStageDetails = computed(() => selectedMainStageId.value !== undefined);
const currentStageItems = computed(() => currentStageState.value?.items ?? []);
const currentStageInternalCost = computed(() =>
  currentStageItems.value.reduce((total, item) => total + item.quantity * item.unit_price, 0),
);
const currentStageClientPrice = computed(() => currentStageState.value?.client_price ?? null);
const currentStageExpectedMargin = computed(
  () => (currentStageClientPrice.value ?? 0) - currentStageInternalCost.value,
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
    state: quoteTypeSelected.value
      ? 'execution_quote.steps.completed'
      : 'execution_quote.steps.required',
    isComplete: quoteTypeSelected.value,
    isCurrent: quoteTypeSelected.value && !hasQuoteItems.value,
  },
  {
    id: 3,
    title: 'execution_quote.steps.stages',
    state: hasQuoteItems.value
      ? 'execution_quote.steps.completed'
      : 'execution_quote.steps.choose_stage',
    isComplete: hasQuoteItems.value,
    isCurrent: quoteTypeSelected.value && !isStageDetails.value && !hasQuoteItems.value,
  },
  {
    id: 4,
    title: 'execution_quote.steps.review',
    state: hasQuoteItems.value
      ? 'execution_quote.steps.completed'
      : 'execution_quote.steps.awaiting_items',
    isComplete: hasQuoteItems.value,
    isCurrent: isStageDetails.value,
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

const clearSelectedSourceItem = () => {
  selectedProduct.value = null;
  selectedMaterial.value = null;
  selectedLabor.value = null;
  itemQuantity.value = 1;
  itemUnitPrice.value = 0;
};

const getOrCreateStageState = (stage: StageModel): ExecutionQuoteStageState => {
  const stageId = Number(stage.id);
  const key = String(stageId);
  const existing = stageStates.value[key];

  if (existing) return existing;

  const state: ExecutionQuoteStageState = {
    stage_id: stageId,
    client_price: null,
    items: [],
    stage_name: stage.title,
  };
  stageStates.value[key] = state;
  return state;
};

const fetchMainStages = async () => {
  if (!sourceTwoDataComplete.value || !quoteTypeSelected.value) return;

  stagesLoading.value = true;
  try {
    const response = await stageController.fetchList(stageParams);
    mainStages.value = response instanceof DataSuccess ? (response.data ?? []) : [];
  } finally {
    stagesLoading.value = false;
  }
};

const fetchSubStages = async () => {
  if (!subStageParams.value) {
    subStages.value = [];
    return;
  }

  subStagesLoading.value = true;
  try {
    const response = await stageController.fetchList(subStageParams.value);
    if (response instanceof DataSuccess) {
      subStages.value = response.data ?? [];
    } else {
      subStages.value = [];
    }
  } finally {
    subStagesLoading.value = false;
  }
};

const openMainStage = async (stage: StageModel) => {
  if (props.loading || !stage.id) return;

  getOrCreateStageState(stage);
  selectedMainStageId.value = stage.id;
  selectedSubStageId.value = undefined;
  await router.push({
    name: 'Add Execution Quote',
    query: { ...route.query, stage_id: String(stage.id) },
  });
  await fetchSubStages();
};

const closeMainStage = async () => {
  selectedMainStageId.value = undefined;
  selectedSubStageId.value = undefined;
  subStages.value = [];
  await router.push({
    name: 'Add Execution Quote',
    query: { ...route.query, stage_id: undefined },
  });
};

const selectSubStage = (stage: StageModel) => {
  if (!stage.id || !selectedMainStageId.value) return;

  selectedSubStageId.value = stage.id;
  const state = getOrCreateStageState(selectedMainStage.value ?? stage);
  state.selected_sub_stage_id = stage.id;
};

const selectItemSource = (source: ExecutionQuoteItemSource) => {
  if (props.loading || selectedItemSource.value === source) return;

  selectedItemSource.value = source;
  clearSelectedSourceItem();
};

const sourceIdForCurrentSelection = (): number | undefined =>
  toOptionalId(selectedSourceItem.value);

const addItem = () => {
  const stage = selectedMainStage.value;
  const subStage = subStages.value.find((candidate) => candidate.id === selectedSubStageId.value);
  const sourceId = sourceIdForCurrentSelection();

  if (!stage?.id || !subStage?.id || !selectedItemSource.value || !sourceId) {
    dialogManager.toastWarning(t('execution_quote.validation.item_required'));
    return;
  }

  if (!(itemQuantity.value > 0) || !(itemUnitPrice.value >= 0)) {
    dialogManager.toastWarning(t('execution_quote.validation.item_values'));
    return;
  }

  const state = getOrCreateStageState(stage);
  const sourceRecord = selectedSourceRecord.value;
  const item: ExecutionQuoteItemState = {
    id: `${stage.id}-${subStage.id}-${selectedItemSource.value}-${sourceId}-${Date.now()}`,
    stage_id: stage.id,
    sub_stage_id: subStage.id,
    source_type: selectedItemSource.value,
    source_id: sourceId,
    quantity: Number(itemQuantity.value),
    unit_price: Number(itemUnitPrice.value),
    stage_name: stage.title,
    sub_stage_name: subStage.title,
    source_title: sourceRecord?.title ?? selectedSourceItem.value?.title,
    unit_name: sourceRecordUnit.value,
  };

  state.items.push(item);
  clearSelectedSourceItem();
  updateData();
};

const removeItem = (item: ExecutionQuoteItemState) => {
  const stage = stageStates.value[String(item.stage_id)];
  if (!stage) return;

  stage.items = stage.items.filter((candidate) => candidate.id !== item.id);
  updateData();
};

const updateClientPrice = (value: string | number) => {
  if (!selectedMainStageId.value) return;

  const stage = currentStageState.value;
  if (!stage) return;

  stage.client_price = value === '' ? null : Math.max(Number(value), 0);
  updateData();
};

const onClientPriceInput = (event: Event) => {
  updateClientPrice((event.target as HTMLInputElement).value);
};

const getSourceLabel = (source: ExecutionQuoteItemSource) =>
  t(getExecutionQuoteItemSourceTitleKey(source));

// ======================================================
// Emit Params
// ======================================================

const updateData = () => {
  const stages: ExecutionQuoteStageRequest[] = Object.values(stageStates.value).map((stage) => ({
    stage_id: stage.stage_id,
    client_price: stage.client_price,
    items: stage.items.map(({ sub_stage_id, source_type, source_id, quantity, unit_price }) => ({
      sub_stage_id,
      source_type,
      source_id,
      quantity,
      unit_price,
    })),
  }));

  if (selectedQuoteSource.value === QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE) {
    emit(
      'updateData',
      new AddExecutionQuoteParams({
        quoteSource: selectedQuoteSource.value,
        clientId: clientId.value,
        projectId: projectId.value,
        quoteTypeId: quoteTypeId.value,
        executionQuoteType: selectedExecutionQuoteType.value ?? undefined,
        stages,
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
      executionQuoteType: selectedExecutionQuoteType.value ?? undefined,
      stages,
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

watch(selectedExecutionQuoteType, async (selectedType) => {
  updateData();
  if (selectedType) await fetchMainStages();
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
  selectedExecutionQuoteType.value = null;
  stageStates.value = {};
  mainStages.value = [];
  selectedMainStageId.value = undefined;
  selectedSubStageId.value = undefined;
  subStages.value = [];

  updateData();
});

watch(selectedItemSource, async (source) => {
  clearSelectedSourceItem();
  if (!source) return;

  itemSourcesLoading.value = true;
  try {
    if (source === ExecutionQuoteItemSourceEnum.PRODUCT) {
      await productsController.fetchList(productsParams);
    } else if (source === ExecutionQuoteItemSourceEnum.BUILDING_MATERIAL) {
      await materialController.fetchList(materialParams);
    } else {
      await laborController.fetchList(laborParams);
    }
  } finally {
    itemSourcesLoading.value = false;
  }
});

watch(selectedSourceItem, () => {
  itemUnitPrice.value = sourceRecordPrice.value;
});

watch(sourceRecordPrice, (price) => {
  if (selectedSourceItem.value && itemUnitPrice.value === 0) {
    itemUnitPrice.value = price;
  }
});

watch(sourceTwoDataComplete, async (complete) => {
  if (complete && quoteTypeSelected.value) await fetchMainStages();
});

watch(mainStages, async (stages) => {
  const parsedStageId = Number(route.query.stage_id);
  if (!stages.length || !Number.isInteger(parsedStageId) || parsedStageId <= 0) return;

  const stage = stages.find((candidate) => candidate.id === parsedStageId);
  if (!stage || selectedMainStageId.value === parsedStageId) return;

  getOrCreateStageState(stage);
  selectedMainStageId.value = parsedStageId;
  await fetchSubStages();
  selectedSubStageId.value = currentStageState.value?.selected_sub_stage_id;
});

watch(
  () => route.query.stage_id,
  async (stageId) => {
    const parsedStageId = Number(stageId);
    if (!Number.isInteger(parsedStageId) || parsedStageId <= 0) {
      selectedMainStageId.value = undefined;
      selectedSubStageId.value = undefined;
      subStages.value = [];
      return;
    }

    const stage = mainStages.value.find((candidate) => candidate.id === parsedStageId);
    if (stage) {
      getOrCreateStageState(stage);
      selectedMainStageId.value = parsedStageId;
      await fetchSubStages();
      selectedSubStageId.value = currentStageState.value?.selected_sub_stage_id;
    }
  },
);

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
    projectId.value = previewResponse.data.project_id ?? projectId.value;
    quoteTypeId.value = previewResponse.data.quote_type_id ?? quoteTypeId.value;
  } finally {
    if (requestId === latestDesignQuoteRequest) {
      designQuoteLoading.value = false;

      updateData();
    }
  }
});

onMounted(async () => {
  if (route.query.stage_id && sourceTwoDataComplete.value && quoteTypeSelected.value) {
    await fetchMainStages();
  }
});

updateData();
</script>

<template>
  <section class="execution-quote" :class="{
    'execution-quote--loading': loading,
  }">
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
          <li v-for="step in buildSteps" :key="step.id" class="build-path__step" :class="{
            'build-path__step--current': step.isCurrent,
            'build-path__step--complete': step.isComplete,
          }">
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

            <dd>{{ clientTotal || '—' }}</dd>
          </div>

          <div>
            <dt>
              {{ $t('execution_quote.internal_cost') }}
            </dt>

            <dd>{{ quoteItems.length ? internalCost : '—' }}</dd>
          </div>

          <div>
            <dt>
              {{ $t('execution_quote.items') }}
            </dt>

            <dd>{{ quoteItems.length }}</dd>
          </div>
        </dl>
      </section>
    </div>

    <!-- Source -->
    <section class="execution-quote__card source-section">
      <div class="section-title">
        <div>
          <span v-if="selectedQuoteSource === QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE" class="section-title__badge">
            {{ $t('execution_quote.from_approved_design') }}
          </span>

          <h2>
            {{ $t('execution_quote.source_title') }}
          </h2>
        </div>
      </div>

      <div class="source-options" role="radiogroup" :aria-label="$t('execution_quote.source_title')">
        <!-- Source 1 -->
        <button class="source-option" :class="{
          'source-option--selected': selectedQuoteSource === QuoteSourceEnum.EXECUTION_ONLY,
        }" type="button" role="radio" :aria-checked="selectedQuoteSource === QuoteSourceEnum.EXECUTION_ONLY"
          :disabled="loading" @click="selectSource(QuoteSourceEnum.EXECUTION_ONLY)">
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
        <button class="source-option" :class="{
          'source-option--selected':
            selectedQuoteSource === QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE,
        }" type="button" role="radio"
          :aria-checked="selectedQuoteSource === QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE" :disabled="loading"
          @click="selectSource(QuoteSourceEnum.EXECUTION_FROM_DESIGN_QUOTE)">
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

            <UpdatedCustomInputSelect id="execution-quote-client" v-model="client" :controller="clientController"
              :params="clientParams" :placeholder="$t('execution_quote.placeholders.client')" :disabled="loading"
              :label="$t('execution_quote.fields.client')" required />
          </div>

          <!-- Project -->
          <div class="quote-field">
            <!-- <label class="quote-field__label" for="execution-quote-project">
              {{ $t('execution_quote.fields.project') }}

              <span class="quote-field__required"> * </span>
            </label> -->

            <UpdatedCustomInputSelect id="execution-quote-project" v-model="project" :controller="projectController"
              :params="projectParams" :placeholder="$t('execution_quote.placeholders.project')"
              :disabled="loading || !clientId" required :label="$t('execution_quote.fields.project')" />
          </div>

          <!-- Quote Type -->
          <div class="quote-field">
            <!-- <label class="quote-field__label" for="execution-quote-type">
              {{ $t('execution_quote.fields.quote_type') }}

              <span class="quote-field__required"> * </span>
            </label> -->

            <UpdatedCustomInputSelect id="execution-quote-type" v-model="quoteType" :controller="quoteTypeController"
              :params="quoteTypeParams" :placeholder="$t('execution_quote.placeholders.quote_type')" :disabled="loading"
              required :label="$t('execution_quote.fields.quote_type')" />
          </div>

          <!-- Price Employee -->
          <div class="quote-field">
            <!-- <label class="quote-field__label" for="execution-quote-price-employee">
              {{ $t('execution_quote.fields.price_employee') }}

              <span class="quote-field__required"> * </span>
            </label> -->

            <UpdatedCustomInputSelect id="execution-quote-price-employee" v-model="priceEmployee"
              :controller="employeeController" :params="employeeParams"
              :placeholder="$t('execution_quote.placeholders.price_employee')" :disabled="loading" required
              :label="$t('execution_quote.fields.price_employee')" />
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

            <UpdatedCustomInputSelect id="execution-quote-client" v-model="client" :controller="clientController"
              :params="clientParams" :placeholder="$t('execution_quote.placeholders.client')" :disabled="loading"
              required price_employee :label="$t('execution_quote.fields.client')" />
          </div>

          <!-- Project -->
          <div class="quote-field">
            <!-- <label class="quote-field__label" for="execution-design-project">
              {{ $t('execution_quote.fields.project') }}

              <span class="quote-field__required"> * </span>
            </label> -->

            <UpdatedCustomInputSelect id="execution-design-project" v-model="project" :controller="projectController"
              :params="projectParams" :placeholder="$t('execution_quote.placeholders.project')"
              :disabled="loading || !clientId" required :label="$t('execution_quote.fields.project')" />
          </div>

          <!-- Quote Type -->
          <div class="quote-field">
            <!-- <label class="quote-field__label" for="execution-design-quote-type">
              {{ $t('execution_quote.fields.quote_type') }}

              <span class="quote-field__required"> * </span>
            </label> -->

            <UpdatedCustomInputSelect id="execution-design-quote-type" v-model="quoteType"
              :controller="quoteTypeController" :params="quoteTypeParams"
              :placeholder="$t('execution_quote.placeholders.quote_type')" :disabled="loading" required
              :label="$t('execution_quote.fields.quote_type')" />
          </div>

          <!-- Design Quote -->
          <div class="quote-field">
            <!-- <label class="quote-field__label" for="execution-design-quote">
              {{ $t('execution_quote.fields.design_quote') }}

              <span class="quote-field__required"> * </span>
            </label> -->

            <UpdatedCustomInputSelect id="execution-design-quote" v-model="designQuote"
              :controller="projectPreviewController" :params="designQuoteParams"
              :placeholder="$t('execution_quote.placeholders.design_quote')"
              :disabled="loading || !clientId || !projectId || !quoteTypeId" required
              :label="$t('execution_quote.fields.design_quote')" />
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

      <!-- Quote type -->
      <section v-if="sourceTwoDataComplete" class="execution-quote__card quote-type-section">
        <div class="section-title">
          <h2>{{ $t('execution_quote.quote_type_title') }}</h2>
        </div>

        <div class="quote-type-options">
          <button v-for="quoteTypeOption in [
            ExecutionQuoteTypeEnum.LUMP_SUM,
            ExecutionQuoteTypeEnum.SUPERVISION,
          ]" :key="quoteTypeOption" type="button" class="quote-type-option" :class="{
              'quote-type-option--selected': selectedExecutionQuoteType === quoteTypeOption,
            }" :aria-pressed="selectedExecutionQuoteType === quoteTypeOption" :disabled="loading"
            @click="selectedExecutionQuoteType = quoteTypeOption">
            <strong>{{ $t(getExecutionQuoteTypeTitleKey(quoteTypeOption)) }}</strong>
            <small>{{ $t(`execution_quote.quote_types.${quoteTypeOption}.description`) }}</small>
          </button>
        </div>
      </section>

      <!-- Main stages -->
      <section v-if="sourceTwoDataComplete && quoteTypeSelected && !isStageDetails"
        class="execution-quote__card stages-section">
        <div class="section-title">
          <div>
            <span class="section-title__badge">{{ mainStages.length }}</span>
            <h2>{{ $t('execution_quote.main_stages_title') }}</h2>
          </div>
          <span class="section-hint">{{ $t('execution_quote.main_stages_hint') }}</span>
        </div>

        <div v-if="stagesLoading" class="stage-empty">{{ $t('loading_data') }}</div>
        <div v-else-if="!mainStages.length" class="stage-empty">
          {{ $t('execution_quote.main_stages_empty') }}
        </div>
        <div v-else class="stage-card-grid">
          <button v-for="stage in mainStages" :key="stage.id" type="button" class="stage-card"
            @click="openMainStage(stage)">
            <span class="stage-card__topline">
              <span class="stage-card__status">{{
                stage.status ? $t('active') : $t('inactive')
                }}</span>
              <span class="stage-card__count">{{ stage.stageChildrenCount }}</span>
            </span>
            <strong>{{ stage.title }}</strong>
            <small>{{
              $t('execution_quote.stage_items_count', {
                count: stageStates[String(stage.id)]?.items.length ?? 0,
              })
            }}</small>
            <span class="stage-card__price">
              {{ stageStates[String(stage.id)]?.client_price ?? $t('execution_quote.not_started') }}
            </span>
          </button>
        </div>
      </section>

      <!-- Main stage details -->
      <template v-if="sourceTwoDataComplete && quoteTypeSelected && isStageDetails">
        <section class="execution-quote__card stage-details-header">
          <div>
            <button type="button" class="back-button" @click="closeMainStage">
              {{ $t('execution_quote.back_to_stages') }}
            </button>
            <span class="section-title__badge">{{ $t('execution_quote.stage_details') }}</span>
            <h2>{{ selectedMainStage?.title ?? $t('execution_quote.stage_details') }}</h2>
          </div>
          <span class="section-hint">{{ $t('execution_quote.stage_details_hint') }}</span>
        </section>

        <section class="execution-quote__card workflow-section">
          <div class="section-title">
            <h2>{{ $t('execution_quote.select_sub_stage') }}</h2>
            <span class="section-title__badge">{{ subStages.length }}</span>
          </div>

          <div v-if="subStagesLoading" class="stage-empty">{{ $t('loading_data') }}</div>
          <div v-else-if="!subStages.length" class="stage-empty">
            {{ $t('execution_quote.sub_stages_empty') }}
          </div>
          <div v-else class="sub-stage-grid">
            <button v-for="subStage in subStages" :key="subStage.id" type="button" class="sub-stage-card"
              :class="{ 'sub-stage-card--selected': selectedSubStageId === subStage.id }"
              :aria-pressed="selectedSubStageId === subStage.id" @click="selectSubStage(subStage)">
              <strong>{{ subStage.title }}</strong>
              <small>{{
                $t('execution_quote.stage_items_count', {
                  count: currentStageItems.filter((item) => item.sub_stage_id === subStage.id)
                    .length,
                })
              }}</small>
            </button>
          </div>
        </section>

        <section class="execution-quote__card workflow-section">
          <div class="section-title">
            <h2>{{ $t('execution_quote.what_will_you_add') }}</h2>
            <span v-if="selectedItemSource" class="section-title__badge">{{
              getSourceLabel(selectedItemSource)
              }}</span>
          </div>

          <div class="item-source-grid">
            <button v-for="source in itemSourceCards" :key="source.value" type="button" class="item-source-card"
              :class="{ 'item-source-card--selected': selectedItemSource === source.value }"
              :aria-pressed="selectedItemSource === source.value" @click="selectItemSource(source.value)">
              <span class="item-source-card__code">{{ source.code }}</span>
              <strong>{{ $t(source.titleKey) }}</strong>
              <small>{{ $t(source.descriptionKey) }}</small>
            </button>
          </div>
        </section>

        <section class="execution-quote__card workflow-section">
          <div class="section-title">
            <h2>{{ $t('execution_quote.select_item_title') }}</h2>
            <span v-if="selectedItemSource" class="section-title__badge">{{
              $t('execution_quote.ready_to_add')
              }}</span>
          </div>

          <div v-if="!selectedItemSource || !selectedSubStageId" class="stage-empty">
            {{ $t('execution_quote.select_sub_stage_and_source') }}
          </div>
          <div v-else class="item-form">
            <UpdatedCustomInputSelect v-if="selectedItemSource === ExecutionQuoteItemSourceEnum.PRODUCT"
              id="execution-quote-product" v-model="selectedProduct" :controller="productsController"
              :params="productsParams" :placeholder="$t('execution_quote.placeholders.product')"
              :label="$t('execution_quote.item_fields.product')" :disabled="loading || itemSourcesLoading" required />
            <UpdatedCustomInputSelect v-else-if="selectedItemSource === ExecutionQuoteItemSourceEnum.BUILDING_MATERIAL"
              id="execution-quote-material" v-model="selectedMaterial" :controller="materialController"
              :params="materialParams" :placeholder="$t('execution_quote.placeholders.material')"
              :label="$t('execution_quote.item_fields.material')" :disabled="loading || itemSourcesLoading" required />
            <UpdatedCustomInputSelect v-else id="execution-quote-labor" v-model="selectedLabor"
              :controller="laborController" :params="laborParams"
              :placeholder="$t('execution_quote.placeholders.labor')" :label="$t('execution_quote.item_fields.labor')"
              :disabled="loading || itemSourcesLoading" required />

            <div class="item-form__fields">
              <label class="quote-field">
                <span class="quote-field__label">{{
                  $t('execution_quote.item_fields.quantity')
                  }}</span>
                <input v-model.number="itemQuantity" type="number" min="0.01" step="1" />
              </label>
              <label class="quote-field">
                <span class="quote-field__label">{{
                  $t('execution_quote.item_fields.unit_price')
                  }}</span>
                <input v-model.number="itemUnitPrice" type="number" min="0" step="1" />
              </label>
              <div class="item-form__unit">
                <span>{{ $t('execution_quote.item_fields.unit') }}</span>
                <strong>{{ sourceRecordUnit || $t('execution_quote.not_available') }}</strong>
              </div>
              <button type="button" class="add-item-button" @click="addItem">
                <span aria-hidden="true">+</span> {{ $t('execution_quote.add_item') }}
              </button>
            </div>
          </div>
        </section>

        <section class="execution-quote__card client-price-section">
          <div class="section-title">
            <h2>{{ $t('execution_quote.client_stage_price') }}</h2>
            <span class="section-title__badge">{{ $t('execution_quote.always_visible') }}</span>
          </div>
          <input :value="currentStageClientPrice ?? ''" type="number" min="0" step="1"
            :placeholder="$t('execution_quote.placeholders.client_stage_price')" @input="onClientPriceInput" />
        </section>
      </template>

      <!-- Quote items -->
      <section v-if="sourceTwoDataComplete && quoteTypeSelected" class="execution-quote__card quote-items-section">
        <div class="section-title">
          <h2>{{ $t('execution_quote.quote_items_title') }}</h2>
          <span class="section-title__badge">{{ quoteItems.length }}</span>
        </div>
        <div v-if="quoteItems.length" class="quote-items-table-wrap">
          <table class="quote-items-table">
            <thead>
              <tr>
                <th>{{ $t('execution_quote.table.main_stage') }}</th>
                <th>{{ $t('execution_quote.table.sub_stage') }}</th>
                <th>{{ $t('execution_quote.table.source') }}</th>
                <th>{{ $t('execution_quote.table.item') }}</th>
                <th>{{ $t('execution_quote.table.quantity') }}</th>
                <th>{{ $t('execution_quote.table.unit') }}</th>
                <th>{{ $t('execution_quote.table.unit_price') }}</th>
                <th>{{ $t('execution_quote.table.total') }}</th>
                <th>{{ $t('execution_quote.table.action') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in quoteItems" :key="item.id">
                <td>{{ item.stage_name || '—' }}</td>
                <td>{{ item.sub_stage_name || '—' }}</td>
                <td>{{ getSourceLabel(item.source_type) }}</td>
                <td>{{ item.source_title || item.source_id }}</td>
                <td>{{ item.quantity }}</td>
                <td>{{ item.unit_name || '—' }}</td>
                <td>{{ item.unit_price }}</td>
                <td>{{ item.quantity * item.unit_price }}</td>
                <td>
                  <button type="button" class="delete-item-button" @click="removeItem(item)">
                    {{ $t('execution_quote.delete_item') }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="stage-empty">
          {{ $t('execution_quote.quote_items_empty') }}
        </div>
      </section>

      <section v-if="sourceTwoDataComplete && quoteTypeSelected" class="execution-quote__card totals-section">
        <article>
          <span>{{ $t('execution_quote.internal_cost') }}</span><strong>{{ internalCost }}</strong>
        </article>
        <article>
          <span>{{ $t('execution_quote.items') }}</span><strong>{{ quoteItems.length }}</strong>
        </article>
        <article>
          <span>{{ $t('execution_quote.client_total') }}</span><strong>{{ clientTotal }}</strong>
        </article>
        <article>
          <span>{{ $t('execution_quote.expected_margin') }}</span><strong>{{ expectedMargin }}</strong>
        </article>
        <small v-if="isStageDetails">{{
          $t('execution_quote.current_stage_summary', {
            cost: currentStageInternalCost,
            margin: currentStageExpectedMargin,
          })
        }}</small>
      </section>
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
    minmax(0, 1.17fr) minmax(290px, 0.78fr);
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

.quote-type-options,
.stage-card-grid,
.sub-stage-grid,
.item-source-grid,
.totals-section {
  display: grid;
  gap: 0.75rem;
}

.quote-type-options {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 0.85rem;
}

.quote-type-option,
.stage-card,
.sub-stage-card,
.item-source-card {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-md);
  background: var(--bg-card);
  color: var(--title-card-color);
  cursor: pointer;
  padding: 0.9rem;
  text-align: start;
  transition: var(--transition-fast);
}

.quote-type-option:hover,
.stage-card:hover,
.sub-stage-card:hover,
.item-source-card:hover {
  border-color: var(--PrimaryColor-alpha-30);
  box-shadow: var(--shadow-sm);
}

.quote-type-option--selected,
.sub-stage-card--selected,
.item-source-card--selected {
  border-color: var(--PrimaryColor);
  background: var(--btn-easy);
  box-shadow: inset 0 -3px 0 var(--PrimaryColor);
}

.quote-type-option small,
.stage-card small,
.sub-stage-card small,
.item-source-card small,
.section-hint,
.stage-empty {
  color: var(--subtitle-color);
  font-size: var(--xs-size);
}

.stage-card-grid {
  grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
  margin-top: 0.85rem;
}

.stage-card__topline,
.stage-card__price {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.stage-card__status,
.stage-card__count,
.item-source-card__code {
  width: fit-content;
  border-radius: var(--radius-full);
  background: var(--gray-100);
  color: var(--gray-600);
  font-size: var(--xs-size);
  font-weight: 700;
  padding: 0.2rem 0.5rem;
}

.stage-card__price {
  margin-top: auto;
  color: var(--PrimaryColor);
  font-weight: 800;
}

.sub-stage-grid,
.item-source-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 0.85rem;
}

.item-source-card__code {
  align-self: flex-end;
}

.stage-empty {
  border: 1px dashed var(--border-weak);
  border-radius: var(--radius-sm);
  margin-top: 0.85rem;
  padding: 1.25rem;
  text-align: center;
}

.stage-details-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.stage-details-header h2 {
  margin: 0.45rem 0 0;
}

.back-button {
  display: block;
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  color: var(--PrimaryColor);
  cursor: pointer;
  margin-bottom: 0.65rem;
  padding: 0.45rem 0.75rem;
}

.item-form {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  margin-top: 0.85rem;
}

.item-form__fields {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: end;
  gap: 0.75rem;
}

.item-form__fields input,
.client-price-section input {
  width: 100%;
  min-height: 2.65rem;
  border: 1px solid var(--input-border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  color: var(--Title-input-Color);
  padding: 0.55rem 0.7rem;
}

.item-form__unit {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-height: 2.65rem;
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-sm);
  padding: 0.45rem 0.7rem;
}

.item-form__unit span {
  color: var(--subtitle-color);
  font-size: var(--xs-size);
}

.add-item-button,
.delete-item-button {
  border: 1px solid var(--PrimaryColor);
  border-radius: var(--radius-sm);
  background: var(--PrimaryColor);
  color: var(--white);
  cursor: pointer;
  min-height: 2.65rem;
  padding: 0.55rem 0.85rem;
}

.client-price-section input {
  margin-top: 0.85rem;
}

.quote-items-table-wrap {
  margin-top: 0.85rem;
  overflow-x: auto;
}

.quote-items-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 52rem;
}

.quote-items-table th,
.quote-items-table td {
  border-bottom: 1px solid var(--border-weak);
  padding: 0.65rem;
  text-align: start;
  white-space: nowrap;
}

.quote-items-table th {
  background: var(--bg-section);
  color: var(--title-card-color);
}

.delete-item-button {
  min-height: auto;
  border-color: var(--danger);
  background: var(--danger-light);
  color: var(--danger-dark);
}

.totals-section {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.totals-section article {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  padding: 0.85rem;
}

.totals-section article span,
.totals-section small {
  color: var(--subtitle-color);
  font-size: var(--xs-size);
}

.totals-section article strong {
  color: var(--title-card-color);
  font-size: 1.1rem;
}

.totals-section small {
  grid-column: 1 / -1;
}

@media (max-width: 800px) {

  .quote-type-options,
  .sub-stage-grid,
  .item-source-grid,
  .item-form__fields,
  .totals-section {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .stage-details-header {
    flex-direction: column;
  }
}

@media (max-width: 520px) {

  .quote-type-options,
  .sub-stage-grid,
  .item-source-grid,
  .item-form__fields,
  .totals-section {
    grid-template-columns: 1fr;
  }
}
</style>
