<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';

  import ConfirmCancelDialog from '@/base/Presentation/Dialogs/ConfirmCancelDialog.vue';
  import StageController from '@/modules/shared/Stages/presentation/controllers/stage.controller';
  import type StageModel from '@/modules/shared/Stages/core/models/stage.model';
  import IndexStageParams from '@/modules/shared/Stages/core/params/index.stage.params';

  import DeleteProductsStageParams from '../../../core/params/delete.products.stage.params';
  import StoreProductsStageParams from '../../../core/params/store.products.stage.params';
  import ProductsController from '../../controllers/products.controller';

  interface StageSource {
    id?: number;
    parentId?: number | null;
    parent_id?: number | null;
    title?: unknown;
    translations?: { title?: Record<string, string> };
    name?: string;
  }

  interface AvailableStage {
    id: number;
    title: string;
    parentId: number | null;
    isMain: boolean;
  }

  interface GroupedStage extends AvailableStage {
    subStages: AvailableStage[];
  }

  const props = defineProps<{
    productId: number;
    stages: StageModel[];
    stageIds: number[];
  }>();

  const productsController = ProductsController.getInstance();
  const stageController = StageController.getInstance();

  interface MutationResponse {
    data?: {
      status?: boolean;
    } | null;
  }

  const mutationSucceeded = (result: unknown) =>
    (result as MutationResponse | null)?.data?.status === true;

  const deletingStageId = ref<number | undefined>();
  const showStageDialog = ref(false);
  const selectedStageIds = ref<number[]>([]);
  const storingStages = ref(false);
  const availableStages = ref<AvailableStage[]>([]);
  const stagesLoading = ref(false);
  const locallyRemovedStageIndexes = ref<number[]>([]);

  const getPreferredTranslation = (translations?: Record<string, string>) =>
    translations?.ar || translations?.en || Object.values(translations ?? {})[0] || '';

  const extractTitle = (stage: StageSource): string => {
    if (typeof stage.title === 'string') return stage.title;

    if (Array.isArray(stage.title)) {
      const translations = stage.title as Array<{ locale?: string; title?: string }>;
      const localizedTitles = Object.fromEntries(
        translations.map((translation) => [translation.locale, translation.title]),
      ) as Record<string, string>;

      return getPreferredTranslation(localizedTitles) || translations[0]?.title || '';
    }

    if (stage.title && typeof stage.title === 'object') {
      return getPreferredTranslation(stage.title as Record<string, string>);
    }

    return getPreferredTranslation(stage.translations?.title) || stage.name || '';
  };

  const getParentId = (stage: StageSource) => stage.parentId ?? stage.parent_id ?? null;

  const groupedStages = computed<GroupedStage[]>(() =>
    availableStages.value
      .filter((stage) => stage.isMain)
      .map((mainStage) => ({
        ...mainStage,
        subStages: availableStages.value.filter(
          (stage) => !stage.isMain && stage.parentId === mainStage.id,
        ),
      })),
  );

  const stageRows = computed(() =>
    props.stages.flatMap((stage, index) => {
      if (locallyRemovedStageIndexes.value.includes(index)) return [];

      const stageSource = stage as StageModel & StageSource;
      const group = groupedStages.value.find((mainStage) =>
        mainStage.subStages.some((subStage) => subStage.id === stage.id),
      );
      const availableStage = group?.subStages.find((subStage) => subStage.id === stage.id);

      return [
        {
          stage,
          index,
          title: availableStage?.title || extractTitle(stageSource) || '—',
          groupTitle: group?.title || '—',
        },
      ];
    }),
  );

  const fetchStageList = async (parentId: number | null, perPage: number) => {
    const stageState = await stageController.fetchList(
      new IndexStageParams({
        word: '',
        page: 1,
        perPage,
        withPage: 0,
        parentId,
      }),
    );

    return (Array.isArray(stageState.data) ? stageState.data : []) as StageSource[];
  };

  const fetchSubStagesForMainStage = async (mainStage: StageSource) => {
    if (!mainStage.id) return [];

    try {
      const subStages = await fetchStageList(mainStage.id, 100);

      return subStages.map((stage) => ({ ...stage, parentId: mainStage.id }));
    } catch {
      return [];
    }
  };

  const mapAvailableStages = (stages: StageSource[], isMain: boolean): AvailableStage[] =>
    stages
      .filter((stage): stage is StageSource & { id: number } => stage.id != null)
      .map((stage) => ({
        id: stage.id,
        title: extractTitle(stage),
        parentId: isMain ? null : getParentId(stage),
        isMain,
      }));

  const resolveSubStages = async (mainStages: StageSource[], listedSubStages: StageSource[]) => {
    if (!mainStages.length || listedSubStages.length) return listedSubStages;

    return (await Promise.all(mainStages.map(fetchSubStagesForMainStage))).flat();
  };

  const fetchAvailableStages = async () => {
    stagesLoading.value = true;

    try {
      const allStages = await fetchStageList(null, 1000);
      const mainStages = allStages.filter((stage) => getParentId(stage) == null);
      const listedSubStages = allStages.filter((stage) => getParentId(stage) != null);
      const subStages = await resolveSubStages(mainStages, listedSubStages);

      availableStages.value = [
        ...mapAvailableStages(mainStages, true),
        ...mapAvailableStages(subStages, false),
      ];
    } catch (error) {
      console.error('Failed to fetch available stages:', error);
      availableStages.value = [];
    } finally {
      stagesLoading.value = false;
    }
  };

  const openStageDialog = async () => {
    if (!availableStages.value.length) await fetchAvailableStages();

    selectedStageIds.value = [...(props.stageIds ?? [])];
    showStageDialog.value = true;
  };

  const closeStageDialog = () => {
    if (storingStages.value) return;

    showStageDialog.value = false;
    selectedStageIds.value = [];
  };

  const toggleStage = (stageId: number) => {
    selectedStageIds.value = selectedStageIds.value.includes(stageId)
      ? selectedStageIds.value.filter((id) => id !== stageId)
      : [...selectedStageIds.value, stageId];
  };

  const isStageSelected = (stageId: number) => selectedStageIds.value.includes(stageId);

  const deleteRemovedStages = async (stageIds: number[]) => {
    for (const stageId of stageIds) {
      const deletionState = await productsController.deleteProductStage(
        new DeleteProductsStageParams({
          productId: props.productId,
          stageIds: [stageId],
        }),
      );

      if (!mutationSucceeded(deletionState)) return false;
    }

    return true;
  };

  const storeNewStages = async (stageIds: number[]) => {
    if (!stageIds.length) return true;

    const storageState = await productsController.storeProductStage(
      new StoreProductsStageParams({
        productId: props.productId,
        stageIds,
      }),
    );

    return mutationSucceeded(storageState);
  };

  const storeStages = async () => {
    if (!props.productId) return;

    const currentStageIds = [...(props.stageIds ?? [])];
    const newStageIds = selectedStageIds.value.filter((id) => !currentStageIds.includes(id));
    const removedStageIds = currentStageIds.filter((id) => !selectedStageIds.value.includes(id));

    if (!newStageIds.length && !removedStageIds.length) {
      closeStageDialog();
      return;
    }

    storingStages.value = true;

    try {
      const removedStagesDeleted = await deleteRemovedStages(removedStageIds);

      if (!removedStagesDeleted || !(await storeNewStages(newStageIds))) return;

      showStageDialog.value = false;
      selectedStageIds.value = [];
      window.location.reload();
    } finally {
      storingStages.value = false;
    }
  };

  const deleteStage = async (stage: StageModel, index: number) => {
    if (!stage.id) {
      locallyRemovedStageIndexes.value = [...locallyRemovedStageIndexes.value, index];
      return;
    }

    deletingStageId.value = stage.id;

    try {
      const result = await productsController.deleteProductStage(
        new DeleteProductsStageParams({
          productId: props.productId,
          stageIds: [stage.id],
        }),
      );

      if (mutationSucceeded(result)) window.location.reload();
    } finally {
      deletingStageId.value = undefined;
    }
  };

  onMounted(fetchAvailableStages);
</script>

<template>
  <section class="stages-card">
    <header class="section-header">
      <div class="section-title">
        <span class="section-icon" aria-hidden="true">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="m12 2 9 5-9 5-9-5 9-5Z" />
            <path d="m3 12 9 5 9-5M3 17l9 5 9-5" />
          </svg>
        </span>
        <div>
          <h3>{{ $t('Products.form.stages_title') }}</h3>
          <p>{{ $t('Products.form.stages_hint') }}</p>
        </div>
      </div>

      <div class="section-actions">
        <span class="count-badge">{{ props.stages.length || props.stageIds.length }}</span>
        <button type="button" class="add-stage-btn" @click="openStageDialog">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          {{ $t('Products.show.add_stage') }}
        </button>
      </div>
    </header>

    <div v-if="stageRows.length" class="stages-table">
      <div class="stage-table-head" aria-hidden="true">
        <span>{{ $t('Products.show.stage_number') }}</span>
        <span>{{ $t('Products.show.stage_name') }}</span>
        <span>{{ $t('Products.stages.main') }}</span>
        <span>{{ $t('Products.show.actions') }}</span>
      </div>

      <div v-for="(row, rowIndex) in stageRows" :key="row.stage.id ?? rowIndex" class="stage-row">
        <span class="stage-number" :data-label="$t('Products.show.stage_number')">
          {{ String(rowIndex + 1).padStart(2, '0') }}
        </span>
        <strong class="stage-name" :data-label="$t('Products.show.stage_name')">
          {{ row.title }}
        </strong>
        <span class="stage-group" :data-label="$t('Products.stages.main')">
          {{ row.groupTitle }}
        </span>
        <div class="stage-actions" :data-label="$t('Products.show.actions')">
          <ConfirmCancelDialog
            :title="$t('Products.delete_item_dialog.title')"
            :message="$t('Products.delete_item_dialog.message')"
            :confirm-label="$t('confirm')"
            :cancel-label="$t('cancel')"
            confirm-theme="danger"
            :disabled="deletingStageId === row.stage.id"
            @confirm="deleteStage(row.stage, row.index)"
          >
            <template #trigger="{ open }">
              <button
                type="button"
                class="delete-stage-btn"
                :disabled="deletingStageId === row.stage.id"
                :aria-label="$t('common.delete')"
                @click="open"
              >
                <span v-if="deletingStageId === row.stage.id">…</span>
                <svg
                  v-else
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  aria-hidden="true"
                >
                  <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5" />
                </svg>
              </button>
            </template>
          </ConfirmCancelDialog>
        </div>
      </div>
    </div>

    <div v-else-if="stageIds.length" class="stages-table">
      <div class="stage-table-head stage-table-head--fallback" aria-hidden="true">
        <span>{{ $t('Products.show.stage_number') }}</span>
        <span>{{ $t('Products.show.stage_name') }}</span>
      </div>
      <div v-for="(id, index) in stageIds" :key="id" class="stage-row stage-row--fallback">
        <span class="stage-number">{{ String(index + 1).padStart(2, '0') }}</span>
        <strong class="stage-name">{{ $t('Products.stages.item') }} #{{ id }}</strong>
      </div>
    </div>

    <div v-else class="empty-box">
      <svg
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        aria-hidden="true"
      >
        <path d="m12 2 9 5-9 5-9-5 9-5Z" />
        <path d="m3 12 9 5 9-5M3 17l9 5 9-5" />
      </svg>
      <p>{{ $t('Products.show.no_stages') }}</p>
    </div>

    <Teleport to="body">
      <div v-if="showStageDialog" class="dialog-overlay" @click.self="closeStageDialog">
        <div
          class="stage-dialog"
          role="dialog"
          aria-modal="true"
          :aria-label="$t('Products.form.stages_title')"
        >
          <header class="dialog-header">
            <div>
              <h3>{{ $t('Products.form.stages_title') }}</h3>
              <p>{{ $t('Products.form.stages_hint') }}</p>
            </div>
            <button
              type="button"
              class="close-btn"
              :disabled="storingStages"
              :aria-label="$t('common.close')"
              @click="closeStageDialog"
            >
              ×
            </button>
          </header>

          <div v-if="stagesLoading" class="dialog-state">
            <span>{{ $t('Products.form.stages_loading') }}</span>
          </div>

          <div v-else-if="groupedStages.length" class="available-stages">
            <section
              v-for="mainStage in groupedStages"
              :key="mainStage.id"
              class="stage-group-card"
            >
              <header class="main-stage-header">
                <span class="main-stage-icon" aria-hidden="true">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="m12 2 9 5-9 5-9-5 9-5Z" />
                  </svg>
                </span>
                <div>
                  <strong>{{ mainStage.title }}</strong>
                  <small>{{ $t('Products.stages.main') }}</small>
                </div>
              </header>

              <div v-if="mainStage.subStages.length" class="sub-stages">
                <button
                  v-for="stage in mainStage.subStages"
                  :key="stage.id"
                  type="button"
                  class="available-stage"
                  :class="{ selected: isStageSelected(stage.id) }"
                  :aria-pressed="isStageSelected(stage.id)"
                  @click="toggleStage(stage.id)"
                >
                  <span class="stage-checkbox" aria-hidden="true">
                    <svg
                      v-if="isStageSelected(stage.id)"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="3"
                    >
                      <path d="m20 6-11 11-5-5" />
                    </svg>
                  </span>
                  <span>{{ stage.title }}</span>
                </button>
              </div>

              <p v-else class="no-sub-stages">{{ $t('Products.show.no_sub_stages') }}</p>
            </section>
          </div>

          <div v-else class="dialog-state">
            <span>{{ $t('Products.show.no_available_stages') }}</span>
          </div>

          <footer class="dialog-footer">
            <span class="selected-count">
              {{ selectedStageIds.length }} {{ $t('Products.form.selected') }}
            </span>
            <div class="dialog-actions">
              <button
                type="button"
                class="cancel-btn"
                :disabled="storingStages"
                @click="closeStageDialog"
              >
                {{ $t('common.cancel') }}
              </button>
              <button
                type="button"
                class="save-btn"
                :disabled="storingStages || (!selectedStageIds.length && !props.stageIds.length)"
                @click="storeStages"
              >
                {{ storingStages ? $t('common.loading') : $t('common.save') }}
              </button>
            </div>
          </footer>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped lang="scss">
  .stages-card {
    overflow: hidden;
    background: var(--bg-card);
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 1.15rem;
    border-bottom: 1px solid var(--border-weak);
  }

  .section-title,
  .section-actions,
  .main-stage-header,
  .dialog-actions {
    display: flex;
    align-items: center;
  }

  .section-title {
    gap: 0.7rem;

    h3 {
      margin: 0;
      color: var(--title-color);
      font-size: var(--md-size);
      font-weight: 800;
    }

    p {
      margin: 0.15rem 0 0;
      color: var(--subtitle-color);
      font-size: var(--xs-size);
    }
  }

  .section-icon,
  .main-stage-icon {
    display: grid;
    color: var(--PrimaryColor);
    background: var(--PrimaryColor-light);
    border-radius: var(--radius-sm);
    place-items: center;
  }

  .section-icon {
    width: 2.4rem;
    height: 2.4rem;
    flex: 0 0 2.4rem;
  }

  .section-actions {
    gap: 0.55rem;
  }

  .count-badge {
    display: grid;
    min-width: 1.75rem;
    height: 1.75rem;
    padding-inline: 0.45rem;
    color: var(--gray-600);
    background: var(--gray-100);
    border-radius: var(--radius-full);
    font-size: var(--xs-size);
    font-weight: 700;
    place-items: center;
  }

  .add-stage-btn,
  .save-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    min-height: 2.25rem;
    padding: 0.45rem 0.8rem;
    color: var(--standard-white);
    background: var(--PrimaryColor);
    border: 1px solid var(--PrimaryColor);
    border-radius: var(--radius-sm);
    font-size: var(--xs-size);
    font-weight: 700;
    cursor: pointer;

    &:hover:not(:disabled) {
      background: var(--PrimaryColor-hover);
      border-color: var(--PrimaryColor-hover);
    }

    &:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
  }

  .stages-table {
    overflow-x: auto;
    margin: 1rem 1.15rem;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-sm);
  }

  .stage-table-head,
  .stage-row {
    display: grid;
    grid-template-columns: 5rem minmax(12rem, 1fr) minmax(10rem, 0.65fr) 5rem;
    align-items: center;
    gap: 0.75rem;
    min-width: 40rem;
  }

  .stage-table-head {
    padding: 0.7rem 0.85rem;
    color: var(--gray-600);
    background: var(--gray-50);
    border-bottom: 1px solid var(--border-weak);
    font-size: var(--xs-size);
    font-weight: 700;
  }

  .stage-row {
    padding: 0.75rem 0.85rem;
    border-bottom: 1px solid var(--border-weak);

    &:last-child {
      border-bottom: 0;
    }
  }

  .stage-table-head--fallback,
  .stage-row--fallback {
    grid-template-columns: 5rem minmax(12rem, 1fr);
  }

  .stage-number {
    color: var(--gray-400);
    font-size: var(--xs-size);
    font-weight: 700;
  }

  .stage-name {
    overflow: hidden;
    color: var(--title-card-color);
    font-size: var(--sm-size);
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .stage-group {
    overflow: hidden;
    color: var(--gray-600);
    font-size: var(--sm-size);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .stage-actions {
    display: flex;
    justify-content: flex-end;
  }

  .delete-stage-btn {
    display: grid;
    width: 2.15rem;
    height: 2.15rem;
    padding: 0;
    color: var(--danger);
    background: var(--bg-card);
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-sm);
    cursor: pointer;
    place-items: center;

    &:hover:not(:disabled) {
      background: var(--danger-light);
      border-color: var(--danger);
    }

    &:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
  }

  .empty-box,
  .dialog-state {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 0.5rem;
    color: var(--gray-400);
    font-size: var(--sm-size);
  }

  .empty-box {
    min-height: 9rem;
    margin: 1rem 1.15rem;
    background: var(--gray-50);
    border: 1px dashed var(--border-strong);
    border-radius: var(--radius-sm);

    p {
      margin: 0;
    }
  }

  .dialog-overlay {
    position: fixed;
    z-index: 9999;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background: var(--gray-800-alpha-80);
  }

  .stage-dialog {
    display: flex;
    width: min(38rem, 100%);
    max-height: 85vh;
    overflow: hidden;
    flex-direction: column;
    background: var(--bg-card);
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-xl);
  }

  .dialog-header,
  .dialog-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 1.15rem;
  }

  .dialog-header {
    border-bottom: 1px solid var(--border-weak);

    h3 {
      margin: 0;
      color: var(--title-color);
      font-size: var(--md-size);
      font-weight: 800;
    }

    p {
      margin: 0.2rem 0 0;
      color: var(--subtitle-color);
      font-size: var(--xs-size);
    }
  }

  .close-btn {
    width: 2rem;
    height: 2rem;
    padding: 0;
    color: var(--gray-600);
    background: var(--gray-100);
    border: 0;
    border-radius: var(--radius-sm);
    font-size: var(--md-size-2);
    cursor: pointer;
  }

  .dialog-state {
    min-height: 13rem;
  }

  .available-stages {
    overflow-y: auto;
    padding: 1rem;
  }

  .stage-group-card {
    overflow: hidden;
    margin-bottom: 0.75rem;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-sm);

    &:last-child {
      margin-bottom: 0;
    }
  }

  .main-stage-header {
    gap: 0.65rem;
    padding: 0.75rem;
    background: var(--PrimaryColor-light);
    border-bottom: 1px solid var(--border-weak);

    strong,
    small {
      display: block;
    }

    strong {
      color: var(--title-card-color);
      font-size: var(--sm-size);
    }

    small {
      margin-top: 0.1rem;
      color: var(--subtitle-color);
      font-size: var(--xs-size-2);
    }
  }

  .main-stage-icon {
    width: 2rem;
    height: 2rem;
  }

  .sub-stages {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
    padding: 0.75rem;
  }

  .available-stage {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    min-width: 0;
    padding: 0.65rem;
    color: var(--gray-700);
    background: var(--bg-card);
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-sm);
    font-size: var(--xs-size);
    font-weight: 600;
    text-align: start;
    cursor: pointer;

    &:hover,
    &.selected {
      color: var(--PrimaryColor);
      background: var(--PrimaryColor-light);
      border-color: var(--PrimaryColor);
    }
  }

  .stage-checkbox {
    display: grid;
    flex: 0 0 1.25rem;
    width: 1.25rem;
    height: 1.25rem;
    color: var(--standard-white);
    background: var(--bg-card);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-xs);
    place-items: center;

    .selected & {
      background: var(--PrimaryColor);
      border-color: var(--PrimaryColor);
    }
  }

  .no-sub-stages {
    margin: 0;
    padding: 1rem;
    color: var(--gray-400);
    font-size: var(--xs-size);
    text-align: center;
  }

  .dialog-footer {
    background: var(--gray-50);
    border-top: 1px solid var(--border-weak);
  }

  .selected-count {
    color: var(--gray-600);
    font-size: var(--xs-size);
    font-weight: 600;
  }

  .dialog-actions {
    gap: 0.5rem;
  }

  .cancel-btn {
    min-height: 2.25rem;
    padding: 0.45rem 0.9rem;
    color: var(--gray-700);
    background: var(--bg-card);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-sm);
    font-size: var(--xs-size);
    font-weight: 700;
    cursor: pointer;
  }

  @media (max-width: 700px) {
    .section-header {
      align-items: flex-start;
      flex-direction: column;
    }

    .section-actions {
      width: 100%;
      justify-content: space-between;
    }

    .stage-table-head {
      display: none;
    }

    .stage-row {
      min-width: 0;
      grid-template-columns: 1fr auto;
      gap: 0.5rem 1rem;
    }

    .stage-number,
    .stage-name,
    .stage-group,
    .stage-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;

      &::before {
        content: attr(data-label);
        color: var(--gray-500);
        font-size: var(--xs-size-2);
        font-weight: 500;
      }
    }

    .stage-name,
    .stage-group,
    .stage-actions {
      grid-column: 1 / -1;
    }

    .stage-actions {
      justify-content: flex-end;
    }

    .stage-row--fallback {
      grid-template-columns: 1fr;
    }

    .sub-stages {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 520px) {
    .dialog-footer {
      align-items: stretch;
      flex-direction: column;
    }

    .dialog-actions > * {
      flex: 1;
    }
  }
</style>
