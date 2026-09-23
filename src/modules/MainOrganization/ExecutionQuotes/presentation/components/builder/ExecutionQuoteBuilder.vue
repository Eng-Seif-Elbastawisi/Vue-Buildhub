<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRoute, useRouter } from 'vue-router';

  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import StageController from '@/modules/shared/Stages/presentation/controllers/stage.controller';
  import IndexStageParams from '@/modules/shared/Stages/core/params/index.stage.params';
  import type StageModel from '@/modules/shared/Stages/core/models/stage.model';

  import {
    getExecutionQuoteTypeTitleKey,
    type ExecutionQuoteType,
  } from '../../../core/constants/execution.quote.type.enum';
  import type { ExecutionQuoteItemSource } from '../../../core/constants/execution.quote.item.source.enum';
  import type { ExecutionQuoteStageRequest } from '../../../core/params/store.execution.quote.details.params';
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
  import ExecutionQuoteClientPrice from './ExecutionQuoteClientPrice.vue';
  import ExecutionQuoteItemsTable from './ExecutionQuoteItemsTable.vue';
  import ExecutionQuoteTotals from './ExecutionQuoteTotals.vue';

  const props = withDefaults(
    defineProps<{
      modelValue: ExecutionQuoteType | null;
      enabled: boolean;
      loading?: boolean;
    }>(),
    { loading: false },
  );

  const emit = defineEmits<{
    (event: 'update:modelValue', value: ExecutionQuoteType | null): void;
    (event: 'update:stages', value: ExecutionQuoteStageRequest[]): void;
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
  const mainStagesLoading = ref(false);
  const subStagesLoading = ref(false);

  const mainStageParams = new IndexStageParams({
    perPage: 100,
    withPage: 0,
    parentId: null,
  });

  const selectedMainStage = computed(() =>
    mainStages.value.find((stage) => stage.id === selectedMainStageId.value),
  );

  const currentStageState = computed(() => {
    if (!selectedMainStageId.value) return undefined;
    return stageStates.value[String(selectedMainStageId.value)];
  });

  const currentStageItems = computed(() => currentStageState.value?.items ?? []);

  const quoteItems = computed<ExecutionQuoteItemState[]>(() =>
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

  const currentStageInternalCost = computed(() =>
    currentStageItems.value.reduce((total, item) => total + item.quantity * item.unit_price, 0),
  );

  const currentStageExpectedMargin = computed(
    () => (currentStageState.value?.client_price ?? 0) - currentStageInternalCost.value,
  );

  const quoteTypeTitle = computed(() =>
    props.modelValue ? t(getExecutionQuoteTypeTitleKey(props.modelValue)) : '',
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

  const emittedStages = (): ExecutionQuoteStageRequest[] =>
    Object.values(stageStates.value)
      .filter((stage) => stage.items.length > 0 || stage.client_price !== null)
      .map((stage) => ({
        stage_id: stage.stage_id,
        client_price: stage.client_price,
        items: stage.items.map(
          ({ sub_stage_id, source_type, source_id, sorting_id, quantity, unit_price }) => ({
            stage_id: sub_stage_id,
            source_type,
            source_id,
            ...(sorting_id !== undefined && sorting_id !== null ? { sorting_id } : {}),
            quantity,
            unit_price,
          }),
        ),
      }));

  const emitStages = () => emit('update:stages', emittedStages());

  const resetBuilder = () => {
    mainStages.value = [];
    subStages.value = [];
    stageStates.value = {};
    selectedMainStageId.value = undefined;
    selectedSubStageId.value = undefined;
    selectedItemSource.value = null;
    emit('update:stages', []);
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

    const stage = mainStages.value.find((candidate) => candidate.id === stageId);
    if (!stage) {
      clearActiveStage();
      return;
    }

    const state = getOrCreateStageState(stage);
    selectedMainStageId.value = stageId;
    selectedSubStageId.value = state.selected_sub_stage_id;
    selectedItemSource.value = null;
    await fetchSubStages();
  };

  const openMainStage = async (stage: StageModel) => {
    if (props.loading || !stage.id) return;

    await router.push({
      name: 'Add Execution Quote',
      params: {
        stageView: 'stages',
        stageId: String(stage.id),
      },
    });
  };

  const closeMainStage = async () => {
    await router.push({
      name: 'Add Execution Quote',
      params: {
        stageView: undefined,
        stageId: undefined,
      },
    });
  };

  const selectSubStage = (id: number | string) => {
    if (!currentStageState.value) return;
    selectedSubStageId.value = id;
    currentStageState.value.selected_sub_stage_id = id;
    selectedItemSource.value = null;
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
    };

    stageState.items.push(item);
    emitStages();
  };

  const removeItem = (item: ExecutionQuoteItemState) => {
    const state = stageStates.value[String(item.stage_id)];
    if (!state) return;

    state.items = state.items.filter((candidate) => candidate.id !== item.id);
    emitStages();
  };

  const updateClientPrice = (value: number | null) => {
    if (!currentStageState.value) return;
    currentStageState.value.client_price = value;
    emitStages();
  };

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
    <ExecutionQuoteTypeCards
      :model-value="modelValue"
      :loading="loading"
      @update:model-value="emit('update:modelValue', $event)"
    />

    <template v-if="modelValue">
      <ExecutionQuoteMainStages
        v-if="!selectedMainStageId"
        :stages="mainStages"
        :stage-states="stageStates"
        :loading="mainStagesLoading"
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
          :disabled="loading || !selectedSubStageId"
        />

        <ExecutionQuoteItemForm
          :source="selectedItemSource"
          :sub-stage-id="selectedSubStageId"
          :loading="loading"
          @add="addItem"
        />

        <ExecutionQuoteClientPrice
          :model-value="currentStageState?.client_price ?? null"
          @update:model-value="updateClientPrice"
        />
      </template>

      <ExecutionQuoteItemsTable :items="quoteItems" @remove="removeItem" />

      <ExecutionQuoteTotals
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
</style>
