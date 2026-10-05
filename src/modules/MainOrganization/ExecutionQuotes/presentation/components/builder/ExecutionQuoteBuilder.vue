<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRoute, useRouter } from 'vue-router';

  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import { dialogManager } from '@/base/Presentation/Dialogs/dialog.manager';
  import StageController from '@/modules/shared/Stages/presentation/controllers/stage.controller';
  import IndexStageParams from '@/modules/shared/Stages/core/params/index.stage.params';
  import StageModel from '@/modules/shared/Stages/core/models/stage.model';
  import AppButton from '@/shared/HelpersComponents/AppButton.vue';

  import {
    ExecutionQuoteTypeEnum,
    getExecutionQuoteTypeTitleKey,
    type ExecutionQuoteType,
  } from '../../../core/constants/execution.quote.type.enum';
  import {
    ExecutionQuoteItemSourceEnum,
    type ExecutionQuoteItemSource,
  } from '../../../core/constants/execution.quote.item.source.enum';
  import type ExecutionQuoteStageItemModel from '../../../core/models/execution.quote.stage-item.model';
  import type ExecutionQuoteStageModel from '../../../core/models/execution.quote.stage.model';
  import StoreExecutionQuoteDetailsParams, {
    type ExecutionQuoteMorphItemRequest,
    type ExecutionQuoteStageRequest,
  } from '../../../core/params/store.execution.quote.details.params';
  import {
    EXECUTION_QUOTE_STAGE_PRICING_MINIMUM,
    ExecutionQuoteStagePricingDraft,
    executionQuoteStagePricingValueIsValid,
  } from '../../../core/params/set.execution.quote.stage.pricing.params';
  import type {
    ExecutionQuoteItemDraft,
    ExecutionQuoteItemState,
    ExecutionQuoteStageState,
  } from '../../types/execution.quote.ui.types';

  import ExecutionQuoteTypeCards from './ExecutionQuoteTypeCards.vue';
  import ExecutionQuoteMainStages from './ExecutionQuoteMainStages.vue';
  import ExecutionQuoteStageHeader from './ExecutionQuoteStageHeader.vue';
  import ExecutionQuoteSubStages from './ExecutionQuoteSubStages.vue';
  import ExecutionQuoteItemSourceCards from './ExecutionQuoteItemSourceCards.vue';
  import ExecutionQuoteItemForm from './ExecutionQuoteItemForm.vue';
  import ExecutionQuoteStageClientPrice from './ExecutionQuoteStageClientPrice.vue';
  import ExecutionQuoteItemsTable from './ExecutionQuoteItemsTable.vue';
  import ExecutionQuoteTotals from './ExecutionQuoteTotals.vue';

  const props = withDefaults(
    defineProps<{
      modelValue: ExecutionQuoteType | null;
      enabled: boolean;
      executionQuoteId: number | null;
      initialStages?: ExecutionQuoteStageModel[];
      loading?: boolean;
    }>(),
    {
      initialStages: () => [],
      loading: false,
    },
  );

  const emit = defineEmits<{
    (event: 'update:modelValue', value: ExecutionQuoteType | null): void;
    (event: 'update:stages', value: ExecutionQuoteStageRequest[]): void;
    (event: 'update:details', value: StoreExecutionQuoteDetailsParams[]): void;
    (event: 'update:pricing', value: ExecutionQuoteStagePricingDraft[]): void;
  }>();

  const router = useRouter();
  const route = useRoute();
  const { t } = useI18n();
  const stageController = StageController.getInstance();

  const mainStages = ref<StageModel[]>([]);
  const subStages = ref<StageModel[]>([]);
  const stageStates = ref<Record<string, ExecutionQuoteStageState>>({});
  const selectedMainStageId = ref<number | undefined>();
  const selectedSubStageId = ref<number | string | undefined>();
  const selectedItemSource = ref<ExecutionQuoteItemSource | null>(null);
  const editingItem = ref<ExecutionQuoteItemState | null>(null);
  const stagePricingValues = ref<Record<string, number | null>>({});
  const dirtyPricingStageKeys = ref<Set<string>>(new Set());
  const automaticPricingStageKeys = ref<Set<string>>(new Set());
  const mainStagesLoading = ref(false);
  const subStagesLoading = ref(false);

  const mainStageParams = new IndexStageParams({
    perPage: 100,
    withPage: 0,
    parentId: null,
    status: true,
  });

  const selectedMainStage = computed(() =>
    mainStages.value.find((stage) => stage.id === selectedMainStageId.value),
  );

  const currentStageState = computed(() => {
    if (!selectedMainStageId.value) return undefined;
    return stageStates.value[String(selectedMainStageId.value)];
  });

  const currentPersistedQuoteStage = computed(() => {
    const stageId = Number(selectedMainStageId.value);
    const subStageId = Number(selectedSubStageId.value);
    if (!stageId || !subStageId) return undefined;

    return props.initialStages.find(
      (quoteStage) =>
        quoteStage.id && quoteStage.stageId === stageId && quoteStage.subStageId === subStageId,
    );
  });

  const stagePricingKey = (stageId: number, subStageId: number) => `${stageId}:${subStageId}`;

  const currentStagePricingKey = computed(() => {
    const stageId = Number(selectedMainStageId.value);
    const subStageId = Number(selectedSubStageId.value);
    return stageId && subStageId ? stagePricingKey(stageId, subStageId) : undefined;
  });

  const currentStagePricingValue = computed(() => {
    const pricingKey = currentStagePricingKey.value;
    return pricingKey ? (stagePricingValues.value[pricingKey] ?? null) : null;
  });

  const currentStageItems = computed(() => currentStageState.value?.items ?? []);

  const quoteItems = computed<ExecutionQuoteItemState[]>(() =>
    Object.values(stageStates.value).flatMap((stage) =>
      stage.items.map((item) => ({ ...item, stage_name: stage.stage_name })),
    ),
  );
  const hasUnsavedItems = computed(() =>
    quoteItems.value.some((quoteItem) => !quoteItem.persisted),
  );

  const internalCost = computed(() =>
    quoteItems.value.reduce((total, item) => total + item.quantity * item.unit_price, 0),
  );

  const clientTotal = computed(() =>
    Object.values(stageStates.value).reduce((total, stage) => total + (stage.client_price ?? 0), 0),
  );

  const expectedMargin = computed(() => clientTotal.value - internalCost.value);

  const currentStageInternalCost = computed(() =>
    currentStageItems.value.reduce((total, item) => total + item.quantity * item.unit_price, 0),
  );

  const currentStageExpectedMargin = computed(
    () => (currentStageState.value?.client_price ?? 0) - currentStageInternalCost.value,
  );

  const subStageItemsTotal = (stageId: number, subStageId: number) =>
    (stageStates.value[String(stageId)]?.items ?? [])
      .filter((quoteItem) => Number(quoteItem.sub_stage_id) === subStageId)
      .reduce((total, quoteItem) => total + quoteItem.quantity * quoteItem.unit_price, 0);

  const syncStageClientPriceTotal = (stageId: number) => {
    const stageState = stageStates.value[String(stageId)];
    if (!stageState) return;

    const stagePricePrefix = `${stageId}:`;
    const stagePrices = Object.entries(stagePricingValues.value)
      .filter(
        ([pricingKey, pricingValue]) => pricingKey.startsWith(stagePricePrefix) && pricingValue,
      )
      .map(([, pricingValue]) => pricingValue as number);

    stageState.client_price = stagePrices.length
      ? stagePrices.reduce((total, pricingValue) => total + pricingValue, 0)
      : null;
  };

  const clearAutomaticClientPrice = (stageId: number, pricingKey: string) => {
    delete stagePricingValues.value[pricingKey];
    automaticPricingStageKeys.value = new Set(
      [...automaticPricingStageKeys.value].filter((key) => key !== pricingKey),
    );
    dirtyPricingStageKeys.value = new Set(
      [...dirtyPricingStageKeys.value].filter((key) => key !== pricingKey),
    );
    syncStageClientPriceTotal(stageId);
  };

  const setAutomaticClientPrice = (stageId: number, subStageId: number, pricingKey: string) => {
    stagePricingValues.value[pricingKey] = Math.max(
      subStageItemsTotal(stageId, subStageId),
      EXECUTION_QUOTE_STAGE_PRICING_MINIMUM,
    );
    automaticPricingStageKeys.value = new Set(automaticPricingStageKeys.value).add(pricingKey);
    dirtyPricingStageKeys.value = new Set(dirtyPricingStageKeys.value).add(pricingKey);
    syncStageClientPriceTotal(stageId);
  };

  const syncAutomaticClientPrice = (stageId: number, subStageId: number) => {
    if (props.modelValue !== ExecutionQuoteTypeEnum.LUMP_SUM) return;

    const pricingKey = stagePricingKey(stageId, subStageId);
    const pricingValue = stagePricingValues.value[pricingKey];
    const canApplyDefault =
      automaticPricingStageKeys.value.has(pricingKey) ||
      !executionQuoteStagePricingValueIsValid(ExecutionQuoteTypeEnum.LUMP_SUM, pricingValue);
    if (!canApplyDefault) return;

    const stageItems = stageStates.value[String(stageId)]?.items.filter(
      (quoteItem) => Number(quoteItem.sub_stage_id) === subStageId,
    );
    if (!stageItems?.length) {
      if (automaticPricingStageKeys.value.has(pricingKey)) {
        clearAutomaticClientPrice(stageId, pricingKey);
      }
      return;
    }

    setAutomaticClientPrice(stageId, subStageId, pricingKey);
  };

  const quoteTypeTitle = computed(() =>
    props.modelValue ? t(getExecutionQuoteTypeTitleKey(props.modelValue)) : '',
  );

  const itemPricingEnabled = true;
  const stageClientPricingEnabled = computed(
    () => props.modelValue !== ExecutionQuoteTypeEnum.SUPERVISION,
  );

  const getOrCreateStageState = (stage: StageModel): ExecutionQuoteStageState => {
    const id = Number(stage.id);
    const key = String(id);
    const existing = stageStates.value[key];
    if (existing) return existing;

    const state: ExecutionQuoteStageState = {
      stage_id: id,
      stage_name: stage.title,
      client_price: null,
      items: [],
    };

    stageStates.value[key] = state;
    return state;
  };

  const storedMainStage = (stageId: number): StageModel | undefined => {
    const quoteStage = props.initialStages.find((candidate) => candidate.stageId === stageId);
    if (!quoteStage) return undefined;

    return new StageModel({
      id: stageId,
      title: quoteStage.stage?.title,
      children: [],
    });
  };

  const itemSourceValue = (rawSource: number | undefined): ExecutionQuoteItemSource | undefined =>
    Object.values(ExecutionQuoteItemSourceEnum).includes(rawSource as ExecutionQuoteItemSource)
      ? (rawSource as ExecutionQuoteItemSource)
      : undefined;

  const persistedItemState = (
    quoteStage: ExecutionQuoteStageModel,
    quoteItem: ExecutionQuoteStageItemModel,
    itemIndex: number,
  ): ExecutionQuoteItemState | undefined => {
    const sourceType = itemSourceValue(quoteItem.itemType);
    const sourceId = quoteItem.itemableId ?? quoteItem.itemable?.id;
    if (!quoteStage.stageId || !sourceType || !sourceId) return undefined;

    return {
      id: `persisted-${quoteStage.id ?? quoteStage.stageId}-${quoteItem.id ?? itemIndex}`,
      stage_id: quoteStage.stageId,
      stage_name: quoteStage.stage?.title,
      sub_stage_id: quoteStage.subStageId,
      sub_stage_name: quoteStage.subStage?.title,
      source_type: sourceType,
      source_id: sourceId,
      source_title: quoteItem.itemable?.title,
      quantity: quoteItem.quantity ?? 0,
      unit_price: quoteItem.expectedPrice ?? 0,
      unit_id: quoteItem.unitId ?? 0,
      unit_name: quoteItem.measurementUnit?.title,
      persisted: true,
    };
  };

  const persistedStageState = (
    quoteStage: ExecutionQuoteStageModel,
    existingState?: ExecutionQuoteStageState,
  ): ExecutionQuoteStageState | undefined => {
    if (!quoteStage.stageId) return undefined;

    const stageState = existingState ?? {
      stage_id: quoteStage.stageId,
      stage_name: quoteStage.stage?.title,
      client_price: null,
      items: [],
    };
    const persistedItems = quoteStage.items
      .map((quoteItem, itemIndex) => persistedItemState(quoteStage, quoteItem, itemIndex))
      .filter((quoteItem): quoteItem is ExecutionQuoteItemState => !!quoteItem);

    return {
      ...stageState,
      client_price: stageState.client_price ?? quoteStage.clientPrice ?? null,
      percentage: stageState.percentage ?? quoteStage.percentage ?? null,
      items: [...stageState.items, ...persistedItems],
      selected_sub_stage_id: stageState.selected_sub_stage_id ?? quoteStage.subStageId,
    };
  };

  const emittedStages = (): ExecutionQuoteStageRequest[] =>
    Object.values(stageStates.value)
      .filter((stage) => stage.items.length > 0 || stage.client_price !== null)
      .map((stage) => ({
        stage_id: stage.stage_id,
        client_price: stage.client_price,
        items: stage.items.map(
          ({ sub_stage_id, source_type, source_id, sorting_id, quantity, unit_price }) => ({
            stage_id: sub_stage_id ?? stage.stage_id,
            source_type,
            source_id,
            ...(sorting_id !== undefined && sorting_id !== null ? { sorting_id } : {}),
            quantity,
            unit_price,
          }),
        ),
      }));

  interface StoreRequestGroup {
    stageId: number;
    subStageId: number;
    itemType: ExecutionQuoteItemSource;
    items: ExecutionQuoteMorphItemRequest[];
  }

  const groupedStoreItems = (): StoreRequestGroup[] => {
    const requestGroups = new Map<string, StoreRequestGroup>();

    Object.values(stageStates.value).forEach((stage) => {
      stage.items
        .filter(
          (quoteItem): quoteItem is ExecutionQuoteItemState & { sub_stage_id: number | string } =>
            !quoteItem.persisted && quoteItem.sub_stage_id !== undefined,
        )
        .forEach((quoteItem) => {
          const requestKey = `${stage.stage_id}:${quoteItem.sub_stage_id}:${quoteItem.source_type}`;
          const requestGroup = requestGroups.get(requestKey) ?? {
            stageId: Number(stage.stage_id),
            subStageId: Number(quoteItem.sub_stage_id),
            itemType: quoteItem.source_type,
            items: [],
          };

          requestGroup.items.push({
            morphId: Number(quoteItem.source_id),
            expectedPrice: quoteItem.unit_price,
            quantity: quoteItem.quantity,
            unit: quoteItem.unit_id,
          });
          requestGroups.set(requestKey, requestGroup);
        });
    });

    return [...requestGroups.values()];
  };

  const storeRequests = (): StoreExecutionQuoteDetailsParams[] => {
    const quoteId = props.executionQuoteId;
    if (!quoteId) return [];

    return groupedStoreItems().map(
      (requestGroup) =>
        new StoreExecutionQuoteDetailsParams({
          quoteId,
          ...requestGroup,
        }),
    );
  };

  const pricingDraftForStage = (pricingKey: string): ExecutionQuoteStagePricingDraft => {
    const [stageId, subStageId] = pricingKey.split(':').map(Number);
    const quoteStageId = props.initialStages.find(
      (quoteStage) => quoteStage.stageId === stageId && quoteStage.subStageId === subStageId,
    )?.id;

    return new ExecutionQuoteStagePricingDraft({
      quoteStageId,
      stageId,
      subStageId,
      quoteType: ExecutionQuoteTypeEnum.LUMP_SUM,
      pricingValue: stagePricingValues.value[pricingKey] ?? null,
    });
  };

  const requiredPricingStageKeys = () =>
    groupedStoreItems()
      .filter(({ stageId, subStageId }) => {
        const storedStage = props.initialStages.find(
          (quoteStage) => quoteStage.stageId === stageId && quoteStage.subStageId === subStageId,
        );
        const storedPricingValue = storedStage?.clientPrice;

        return !executionQuoteStagePricingValueIsValid(
          ExecutionQuoteTypeEnum.LUMP_SUM,
          storedPricingValue,
        );
      })
      .map(({ stageId, subStageId }) => stagePricingKey(stageId, subStageId));

  const stagePricingDrafts = (): ExecutionQuoteStagePricingDraft[] => {
    const quoteType = props.modelValue;
    if (quoteType !== ExecutionQuoteTypeEnum.LUMP_SUM) return [];

    const pricingKeys = new Set([...dirtyPricingStageKeys.value, ...requiredPricingStageKeys()]);

    return [...pricingKeys].map(pricingDraftForStage);
  };

  const emitDetails = () => {
    emit('update:stages', emittedStages());
    emit('update:details', storeRequests());
  };

  const emitPricing = () => {
    emit('update:pricing', stagePricingDrafts());
  };

  const hydratedStagePricingValues = (
    quoteStages: ExecutionQuoteStageModel[],
  ): Record<string, number | null> =>
    Object.fromEntries(
      quoteStages.flatMap((quoteStage) => {
        if (!quoteStage.stageId || !quoteStage.subStageId) return [];
        const pricingValue = quoteStage.clientPrice ?? null;
        return [[stagePricingKey(quoteStage.stageId, quoteStage.subStageId), pricingValue]];
      }),
    );

  const hydrateStoredStages = (quoteStages: ExecutionQuoteStageModel[]) => {
    const hydratedStates = quoteStages.reduce<Record<string, ExecutionQuoteStageState>>(
      (states, quoteStage) => {
        const stageState = persistedStageState(quoteStage, states[String(quoteStage.stageId)]);
        return stageState ? { ...states, [String(stageState.stage_id)]: stageState } : states;
      },
      {},
    );

    stageStates.value = hydratedStates;
    stagePricingValues.value = hydratedStagePricingValues(quoteStages);
    dirtyPricingStageKeys.value = new Set();
    automaticPricingStageKeys.value = new Set();

    quoteStages.forEach((quoteStage) => {
      if (!quoteStage.stageId || !quoteStage.subStageId) return;
      syncAutomaticClientPrice(quoteStage.stageId, quoteStage.subStageId);
    });
    emitDetails();
    emitPricing();
  };

  const resetBuilder = () => {
    mainStages.value = [];
    subStages.value = [];
    stageStates.value = {};
    selectedMainStageId.value = undefined;
    selectedSubStageId.value = undefined;
    selectedItemSource.value = null;
    editingItem.value = null;
    stagePricingValues.value = {};
    dirtyPricingStageKeys.value = new Set();
    automaticPricingStageKeys.value = new Set();
    emit('update:stages', []);
    emit('update:details', []);
    emit('update:pricing', []);
  };

  const fetchMainStages = async () => {
    if (!props.enabled || !props.modelValue) return;

    mainStagesLoading.value = true;
    try {
      const response = await stageController.fetchList(mainStageParams);
      mainStages.value = response instanceof DataSuccess ? (response.data ?? []) : [];
    } finally {
      mainStagesLoading.value = false;
    }
  };

  const fetchSubStages = async () => {
    if (!selectedMainStageId.value) {
      subStages.value = [];
      return;
    }

    const params = new IndexStageParams({
      perPage: 100,
      withPage: 0,
      parentId: selectedMainStageId.value,
      status: true,
    });

    subStagesLoading.value = true;
    try {
      const response = await stageController.fetchList(params);
      subStages.value = response instanceof DataSuccess ? (response.data ?? []) : [];
    } finally {
      subStagesLoading.value = false;
    }
  };

  const clearActiveStage = () => {
    selectedMainStageId.value = undefined;
    selectedSubStageId.value = undefined;
    selectedItemSource.value = null;
    subStages.value = [];
  };

  const activateStageFromRoute = async (rawStageId: unknown) => {
    const stageIdValue = Array.isArray(rawStageId) ? rawStageId[0] : rawStageId;
    const stageId = Number(stageIdValue);

    if (!Number.isInteger(stageId) || stageId <= 0) {
      clearActiveStage();
      return;
    }

    if (!mainStages.value.length) await fetchMainStages();

    let stage = mainStages.value.find((candidate) => candidate.id === stageId);
    if (!stage) {
      stage = storedMainStage(stageId);
      if (stage) mainStages.value = [...mainStages.value, stage];
    }

    if (!stage) {
      clearActiveStage();
      return;
    }

    const state = getOrCreateStageState(stage);
    selectedMainStageId.value = stageId;
    const activeEditingItem =
      Number(editingItem.value?.stage_id) === stageId ? editingItem.value : null;
    selectedSubStageId.value = activeEditingItem?.sub_stage_id ?? state.selected_sub_stage_id;
    selectedItemSource.value = activeEditingItem?.source_type ?? null;
    await fetchSubStages();
  };

  const openMainStage = async (stage: StageModel) => {
    if (props.loading || !stage.id || !props.executionQuoteId) return;

    editingItem.value = null;

    await router.push({
      name: 'Build Execution Quote',
      params: { stageId: String(stage.id) },
      query: { id: String(props.executionQuoteId) },
    });
  };

  const closeMainStage = async () => {
    if (!props.executionQuoteId) return;

    editingItem.value = null;

    await router.push({
      name: 'Build Execution Quote',
      params: { stageId: undefined },
      query: { id: String(props.executionQuoteId) },
    });
  };

  const selectSubStage = (id: number | string) => {
    if (!currentStageState.value) return;
    const keepsCurrentEdit = String(editingItem.value?.sub_stage_id) === String(id);
    if (editingItem.value && !keepsCurrentEdit) {
      editingItem.value = null;
    }
    selectedSubStageId.value = id;
    currentStageState.value.selected_sub_stage_id = id;
    selectedItemSource.value = keepsCurrentEdit ? (editingItem.value?.source_type ?? null) : null;
  };

  const addItem = (draft: ExecutionQuoteItemDraft) => {
    const stage = selectedMainStage.value;
    const stageState = currentStageState.value;
    const subStage = subStages.value.find(
      (item) => String(item.id) === String(selectedSubStageId.value),
    );

    if (!stage?.id || !stageState || !subStage?.id || !selectedItemSource.value) return;

    const item: ExecutionQuoteItemState = {
      id: `${stage.id}-${subStage.id}-${selectedItemSource.value}-${draft.source_id}-${Date.now()}`,
      stage_id: stage.id,
      stage_name: stage.title,
      sub_stage_id: subStage.id,
      sub_stage_name: subStage.title,
      source_type: selectedItemSource.value,
      source_id: draft.source_id,
      sorting_id: draft.sorting_id,
      source_title: draft.source_title,
      unit_name: draft.unit_name,
      sorting_title: draft.sorting_title,
      quantity: draft.quantity,
      unit_price: draft.unit_price,
      unit_id: draft.unit_id,
    };

    stageState.items.push(item);
    syncAutomaticClientPrice(stage.id, Number(subStage.id));
    emitDetails();
    emitPricing();
  };

  const updateItem = (draft: ExecutionQuoteItemDraft) => {
    const itemToUpdate = editingItem.value;
    if (!itemToUpdate) return;

    const state = stageStates.value[String(itemToUpdate.stage_id)];
    const itemIndex = state?.items.findIndex((candidate) => candidate.id === itemToUpdate.id) ?? -1;
    if (!state || itemIndex < 0) return;

    state.items[itemIndex] = {
      ...state.items[itemIndex],
      source_id: draft.source_id,
      sorting_id: draft.sorting_id,
      source_title: draft.source_title,
      unit_name: draft.unit_name,
      sorting_title: draft.sorting_title,
      quantity: draft.quantity,
      unit_price: draft.unit_price,
      unit_id: draft.unit_id,
    };
    syncAutomaticClientPrice(Number(itemToUpdate.stage_id), Number(itemToUpdate.sub_stage_id));
    editingItem.value = null;
    emitDetails();
    emitPricing();
  };

  const submitItem = (draft: ExecutionQuoteItemDraft) => {
    if (editingItem.value) {
      updateItem(draft);
      return;
    }

    addItem(draft);
  };

  const openItemStage = async (stageId: number) => {
    if (selectedMainStageId.value === stageId || !props.executionQuoteId) return;

    await router.push({
      name: 'Build Execution Quote',
      params: { stageId: String(stageId) },
      query: { id: String(props.executionQuoteId) },
    });
    await activateStageFromRoute(stageId);
  };

  const editItem = async (quoteItem: ExecutionQuoteItemState) => {
    if (quoteItem.persisted || !props.executionQuoteId) return;

    const stageId = Number(quoteItem.stage_id);
    const stage = mainStages.value.find((candidate) => candidate.id === stageId);
    if (!stage) return;

    await openItemStage(stageId);

    const state = getOrCreateStageState(stage);
    selectedMainStageId.value = stageId;
    selectedSubStageId.value = quoteItem.sub_stage_id;
    state.selected_sub_stage_id = quoteItem.sub_stage_id;
    selectedItemSource.value = quoteItem.source_type;
    editingItem.value = quoteItem;
  };

  const cancelItemEdit = () => {
    editingItem.value = null;
  };

  const removeItem = (item: ExecutionQuoteItemState) => {
    if (item.persisted) return;

    const state = stageStates.value[String(item.stage_id)];
    if (!state) return;

    if (editingItem.value?.id === item.id) editingItem.value = null;
    state.items = state.items.filter((candidate) => candidate.id !== item.id);
    syncAutomaticClientPrice(Number(item.stage_id), Number(item.sub_stage_id));
    emitDetails();
    emitPricing();
  };

  const updateStagePricing = (pricingValue: number | null) => {
    const pricingKey = currentStagePricingKey.value;
    const quoteType = props.modelValue;
    if (!pricingKey || quoteType !== ExecutionQuoteTypeEnum.LUMP_SUM) return;

    stagePricingValues.value[pricingKey] = pricingValue;
    automaticPricingStageKeys.value = new Set(
      [...automaticPricingStageKeys.value].filter((key) => key !== pricingKey),
    );
    dirtyPricingStageKeys.value = new Set(dirtyPricingStageKeys.value).add(pricingKey);

    if (currentStageState.value) syncStageClientPriceTotal(Number(selectedMainStageId.value));

    emitDetails();
    emitPricing();
  };

  const navigateToQuoteList = async () => {
    await router.push({ name: 'Execution Quotes' });
  };

  const exitBuilder = () => {
    if (!hasUnsavedItems.value) {
      void navigateToQuoteList();
      return;
    }

    dialogManager.confirm(t('execution_quote.exit_confirmation'), navigateToQuoteList, {
      title: t('execution_quote.exit_builder'),
    });
  };

  watch(
    () => props.initialStages,
    (quoteStages) => hydrateStoredStages(quoteStages),
    { immediate: true },
  );

  watch(
    () => props.enabled,
    async (enabled) => {
      if (!enabled) {
        resetBuilder();
        return;
      }
      if (props.modelValue) await fetchMainStages();
    },
  );

  watch(
    () => props.modelValue,
    async (value, previous) => {
      if (!value) {
        if (previous) resetBuilder();
        return;
      }

      if (!props.enabled) return;

      if (previous && value !== previous) {
        resetBuilder();
      }

      await fetchMainStages();
      await activateStageFromRoute(route.params.stageId);
    },
  );

  watch(
    () => route.params.stageId,
    (stageId) => activateStageFromRoute(stageId),
  );

  onMounted(async () => {
    if (!props.enabled || !props.modelValue) return;
    await fetchMainStages();
    await activateStageFromRoute(route.params.stageId);
  });
</script>

<template>
  <div v-if="enabled" class="execution-quote-builder">
    <nav class="builder-toolbar" :aria-label="$t('execution_quote.builder_navigation')">
      <div class="builder-toolbar__context">
        <span>{{ $t('execution_quote.quote_reference', { id: executionQuoteId }) }}</span>
        <strong>{{ selectedMainStage?.title ?? $t('execution_quote.all_stages_context') }}</strong>
      </div>

      <AppButton
        class="builder-toolbar__exit"
        theme="secondary"
        size="sm"
        outline
        icon="left"
        @click="exitBuilder"
      >
        <template #icon>
          <i class="pi pi-sign-out" aria-hidden="true"></i>
        </template>
        {{ $t('execution_quote.exit_builder') }}
      </AppButton>
    </nav>

    <ExecutionQuoteTypeCards
      :model-value="modelValue"
      :loading="loading"
      disabled
      @update:model-value="emit('update:modelValue', $event)"
    />

    <template v-if="modelValue">
      <ExecutionQuoteMainStages
        v-if="!selectedMainStageId"
        :stages="mainStages"
        :stage-states="stageStates"
        :loading="mainStagesLoading"
        :show-pricing="stageClientPricingEnabled"
        @open="openMainStage"
      />

      <template v-else>
        <ExecutionQuoteStageHeader
          :stage-title="selectedMainStage?.title"
          :quote-type-title="quoteTypeTitle"
          :active="selectedMainStage?.status"
          @back="closeMainStage"
        />

        <ExecutionQuoteSubStages
          :model-value="selectedSubStageId"
          :stages="subStages"
          :items="currentStageItems"
          :loading="subStagesLoading"
          @update:model-value="selectSubStage"
        />

        <ExecutionQuoteItemSourceCards
          v-model="selectedItemSource"
          :disabled="loading || !selectedSubStageId || Boolean(editingItem)"
          :pricing-enabled="itemPricingEnabled"
        />

        <ExecutionQuoteItemForm
          :source="selectedItemSource"
          :sub-stage-id="selectedSubStageId"
          :loading="loading"
          :pricing-enabled="itemPricingEnabled"
          :editing-item="editingItem"
          @add="submitItem"
          @cancel-edit="cancelItemEdit"
        />

        <ExecutionQuoteStageClientPrice
          v-if="stageClientPricingEnabled"
          :model-value="currentStagePricingValue"
          :disabled="!selectedSubStageId"
          @update:model-value="updateStagePricing"
        />

        <aside
          v-if="stageClientPricingEnabled && selectedSubStageId && !currentPersistedQuoteStage?.id"
          class="pricing-notice pricing-notice--pending"
          role="status"
        >
          <span class="pricing-notice__icon" aria-hidden="true">
            <i class="pi pi-clock"></i>
          </span>
          <div>
            <strong>{{ $t('execution_quote.stage_pricing.pending_title') }}</strong>
            <p>{{ $t('execution_quote.stage_pricing.pending_description') }}</p>
          </div>
        </aside>
      </template>

      <ExecutionQuoteItemsTable
        :items="quoteItems"
        :show-pricing="itemPricingEnabled"
        @edit="editItem"
        @remove="removeItem"
      />

      <ExecutionQuoteTotals
        v-if="stageClientPricingEnabled"
        :internal-cost="internalCost"
        :items-count="quoteItems.length"
        :client-total="clientTotal"
        :expected-margin="expectedMargin"
        :current-stage-cost="currentStageInternalCost"
        :current-stage-margin="currentStageExpectedMargin"
        :show-current-stage="Boolean(selectedMainStageId)"
      />
    </template>
  </div>
</template>

<style scoped>
  .execution-quote-builder {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .builder-toolbar,
  .builder-toolbar__context,
  .pricing-notice {
    display: flex;
  }

  .builder-toolbar {
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.85rem 1rem;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-md);
    background: var(--bg-card);
    box-shadow: var(--shadow-sm);
    transition:
      border-color var(--transition-fast),
      box-shadow var(--transition-fast);
    animation: execution-quote-builder-enter 320ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }

  .builder-toolbar:hover,
  .builder-toolbar:focus-within {
    border-color: var(--PrimaryColor-alpha-30);
    box-shadow: var(--shadow-md);
  }

  .builder-toolbar__context {
    flex-direction: column;
    gap: 0.2rem;
    min-width: 0;
    text-align: start;
  }

  .builder-toolbar__context span,
  .pricing-notice p {
    color: var(--subtitle-color);
    font-size: var(--xs-size);
  }

  .builder-toolbar__context strong {
    overflow: hidden;
    color: var(--title-card-color);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .pricing-notice {
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.9rem 1rem;
    border: 1px solid var(--PrimaryColor-alpha-20);
    border-radius: var(--radius-md);
    background: var(--info-light);
    color: var(--title-card-color);
    animation: execution-quote-builder-enter 360ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }

  .pricing-notice__icon {
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    width: 2rem;
    height: 2rem;
    border-radius: var(--radius-full);
    background: var(--PrimaryColor-alpha-10);
    color: var(--PrimaryColor);
  }

  .pricing-notice p {
    margin: 0.2rem 0 0;
    line-height: 1.6;
  }

  .pricing-notice--pending {
    border-style: dashed;
  }

  .execution-quote-builder > :deep(.execution-builder-card) {
    transition:
      border-color var(--transition-fast),
      box-shadow var(--transition-fast);
    animation: execution-quote-builder-enter 380ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }

  .execution-quote-builder > :deep(.execution-builder-card:hover),
  .execution-quote-builder > :deep(.execution-builder-card:focus-within) {
    border-color: var(--PrimaryColor-alpha-30);
    box-shadow: var(--shadow-md);
  }

  .execution-quote-builder :deep(.stage-card:hover),
  .execution-quote-builder :deep(.sub-stage-card:hover),
  .execution-quote-builder :deep(.source-card:hover:not(:disabled)) {
    border-color: var(--PrimaryColor);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  .execution-quote-builder :deep(.stage-card:focus-visible),
  .execution-quote-builder :deep(.sub-stage-card:focus-visible),
  .execution-quote-builder :deep(.source-card:focus-visible) {
    border-color: var(--PrimaryColor);
    outline: 3px solid var(--PrimaryColor-alpha-20);
    outline-offset: 2px;
  }

  .execution-quote-builder :deep(.stage-card),
  .execution-quote-builder :deep(.sub-stage-card),
  .execution-quote-builder :deep(.source-card) {
    transition:
      border-color var(--transition-fast),
      background-color var(--transition-fast),
      box-shadow var(--transition-fast),
      transform var(--transition-fast);
  }

  @keyframes execution-quote-builder-enter {
    from {
      opacity: 0;
      transform: translateY(0.7rem);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 640px) {
    .builder-toolbar {
      align-items: stretch;
      flex-direction: column;
    }

    .builder-toolbar__exit {
      width: 100%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .builder-toolbar,
    .pricing-notice,
    .execution-quote-builder > :deep(.execution-builder-card) {
      animation: none;
    }

    .builder-toolbar,
    .execution-quote-builder > :deep(.execution-builder-card),
    .execution-quote-builder :deep(.stage-card),
    .execution-quote-builder :deep(.sub-stage-card),
    .execution-quote-builder :deep(.source-card) {
      transition: none;
    }

    .execution-quote-builder :deep(.stage-card:hover),
    .execution-quote-builder :deep(.sub-stage-card:hover),
    .execution-quote-builder :deep(.source-card:hover:not(:disabled)) {
      transform: none;
    }
  }
</style>
