<script setup lang="ts">
import {
  computed,
  onMounted,
  ref,
} from 'vue';

import type {
  ProductShowStage,
} from '../../../data/models/products.show.model.ts';

import DeleteProductsStageParams from '../../../core/params/delete.products.stage.params.ts';
import StoreProductsStageParams from '../../../core/params/store.products.stage.params.ts';

import ProductsController from '../../controllers/products.controller.ts';

import StageController from '@/modules/shared/Stages/presentation/controllers/stage.controller';
import IndexStageParams from '@/modules/shared/Stages/core/params/index.stage.params';

// ======================================================
// Types
// ======================================================

interface AvailableStage {
  id: number;
  title: string;
  parentId: number | null;
  isMain: boolean;
}

interface GroupedStage extends AvailableStage {
  subStages: AvailableStage[];
}

// ======================================================
// Props
// ======================================================

const props = defineProps<{
  productId: number;
  stages: ProductShowStage[];
  stageIds: number[];
}>();

// ======================================================
// Controllers
// ======================================================

const productsController =
  ProductsController.getInstance();

const stageController =
  StageController.getInstance();

// ======================================================
// State
// ======================================================

const deletingStageId =
  ref<number | undefined>();

const showStageDialog =
  ref(false);

const selectedStageIds =
  ref<number[]>([]);

const storingStages =
  ref(false);

const availableStages =
  ref<AvailableStage[]>([]);

const stagesLoading =
  ref(false);

// ======================================================
// Extract Title
// ======================================================

const extractTitle = (
  item: any,
): string => {
  if (!item) {
    return '';
  }

  if (
    typeof item.title === 'string'
  ) {
    return item.title;
  }

  if (
    Array.isArray(item.title)
  ) {
    const en =
      item.title.find(
        (translation: any) =>
          translation.locale === 'en',
      )?.title;

    const ar =
      item.title.find(
        (translation: any) =>
          translation.locale === 'ar',
      )?.title;

    return (
      en ||
      ar ||
      item.title[0]?.title ||
      ''
    );
  }

  if (
    item.title &&
    typeof item.title === 'object'
  ) {
    return (
      item.title.ar ||
      item.title.en ||
      Object.values(
        item.title,
      )[0] ||
      ''
    ) as string;
  }

  if (
    item.translations?.title
  ) {
    const translations =
      item.translations.title;

    return (
      translations.ar ||
      translations.en ||
      Object.values(
        translations,
      )[0] ||
      ''
    ) as string;
  }

  return item.name ?? '';
};

// ======================================================
// Group Main Stages + Sub Stages
// ======================================================

const groupedStages =
  computed<GroupedStage[]>(() => {
    const mainStages =
      availableStages.value.filter(
        (stage) =>
          stage.isMain,
      );

    return mainStages.map(
      (mainStage) => ({
        ...mainStage,

        subStages:
          availableStages.value.filter(
            (stage) =>
              !stage.isMain &&
              stage.parentId ===
                mainStage.id,
          ),
      }),
    );
  });

// ======================================================
// Group Current Product Stages
// ======================================================

const groupedCurrentStages =
  computed(() => {
    const currentStageIds =
      new Set(
        props.stages?.map(
          (stage) => stage.id,
        ) ?? [],
      );

    return groupedStages.value
      .map((mainStage) => {
        const currentSubStages =
          mainStage.subStages.filter(
            (stage) =>
              currentStageIds.has(
                stage.id,
              ),
          );

        const originalIndexes:
          Record<number, number> =
          {};

        currentSubStages.forEach(
          (stage) => {
            const index =
              props.stages.findIndex(
                (item) =>
                  item.id ===
                  stage.id,
              );

            originalIndexes[
              stage.id
            ] = index;
          },
        );

        return {
          ...mainStage,
          subStages:
            currentSubStages,
          originalIndexes,
        };
      })
      .filter(
        (mainStage) =>
          mainStage.subStages
            .length > 0,
      );
  });

// ======================================================
// Fetch All Stages
// ======================================================

const fetchAvailableStages =
  async () => {
    try {
      stagesLoading.value =
        true;

      const result =
        await stageController.fetchList(
          new IndexStageParams({
            word: '',
            page: 1,
            perPage: 1000,
            withPage: 0,
            parentId: null,
          }),
        );

      const allStages =
        Array.isArray(
          result?.data,
        )
          ? result.data
          : [];

      // ==================================================
      // Main Stages
      // ==================================================

      const mainStages =
        allStages.filter(
          (stage: any) =>
            !stage.parent_id,
        );

      // ==================================================
      // Sub Stages
      // ==================================================

      let subStages =
        allStages.filter(
          (stage: any) =>
            stage.parent_id,
        );

      if (
        mainStages.length > 0 &&
        subStages.length === 0
      ) {
        const subResults =
          await Promise.all(
            mainStages.map(
              (stage: any) =>
                stageController
                  .fetchList(
                    new IndexStageParams({
                      word: '',
                      page: 1,
                      perPage: 100,
                      withPage: 0,
                      parentId:
                        stage.id,
                    }),
                  )
                  .then(
                    (
                      response,
                    ) => ({
                      parentId:
                        stage.id,

                      data:
                        Array.isArray(
                          response?.data,
                        )
                          ? response.data
                          : [],
                    }),
                  )
                  .catch(
                    () => ({
                      parentId:
                        stage.id,

                      data: [],
                    }),
                  ),
            ),
          );

        subStages =
          subResults.flatMap(
            (response) =>
              response.data.map(
                (stage: any) => ({
                  ...stage,

                  parent_id:
                    response.parentId,
                }),
              ),
          );
      }

      // ==================================================
      // Map Main Stages
      // ==================================================

      const mappedMainStages:
        AvailableStage[] =
        mainStages.map(
          (stage: any) => ({
            id: stage.id,

            title:
              extractTitle(
                stage,
              ),

            parentId: null,

            isMain: true,
          }),
        );

      // ==================================================
      // Map Sub Stages
      // ==================================================

      const mappedSubStages:
        AvailableStage[] =
        subStages.map(
          (stage: any) => ({
            id: stage.id,

            title:
              extractTitle(
                stage,
              ),

            parentId:
              stage.parent_id ??
              null,

            isMain: false,
          }),
        );

      availableStages.value = [
        ...mappedMainStages,
        ...mappedSubStages,
      ];
    } catch (error) {
      console.error(
        'Failed to fetch available stages:',
        error,
      );

      availableStages.value =
        [];
    } finally {
      stagesLoading.value =
        false;
    }
  };

// ======================================================
// Open Dialog
// ======================================================

const openStageDialog =
  async () => {
    if (
      !availableStages.value.length
    ) {
      await fetchAvailableStages();
    }

    selectedStageIds.value = [
      ...(props.stageIds ?? []),
    ];

    showStageDialog.value =
      true;
  };

// ======================================================
// Close Dialog
// ======================================================

const closeStageDialog =
  () => {
    if (
      storingStages.value
    ) {
      return;
    }

    showStageDialog.value =
      false;

    selectedStageIds.value =
      [];
  };

// ======================================================
// Toggle Stage
// ======================================================

const toggleStage = (
  stageId: number,
) => {
  const index =
    selectedStageIds.value.indexOf(
      stageId,
    );

  if (index !== -1) {
    selectedStageIds.value.splice(
      index,
      1,
    );
  } else {
    selectedStageIds.value.push(
      stageId,
    );
  }
};

// ======================================================
// Check Selected
// ======================================================

const isStageSelected = (
  stageId: number,
) => {
  return selectedStageIds.value.includes(
    stageId,
  );
};

// ======================================================
// Store / Delete Stages
// ======================================================

const storeStages = async () => {
  if (!props.productId) {
    return;
  }

  const currentStageIds = [
    ...(props.stageIds ?? []),
  ];

  const newStageIds =
    selectedStageIds.value.filter(
      (id) =>
        !currentStageIds.includes(
          id,
        ),
    );

  const removedStageIds =
    currentStageIds.filter(
      (id) =>
        !selectedStageIds.value.includes(
          id,
        ),
    );

  if (
    newStageIds.length === 0 &&
    removedStageIds.length === 0
  ) {
    closeStageDialog();
    return;
  }

  try {
    storingStages.value =
      true;

    // ==================================================
    // Delete Removed Stages
    // ==================================================

    for (
      const stageId of removedStageIds
    ) {
      const deleteResult =
        await productsController.deleteProductStage(
          new DeleteProductsStageParams({
            productId:
              props.productId,

            stageIds: [
              stageId,
            ],
          }),
        );

      if (
        deleteResult?.data
          ?.status !== true
      ) {
        return;
      }
    }

    // ==================================================
    // Store New Stages
    // ==================================================

    if (
      newStageIds.length > 0
    ) {
      const storeResult =
        await productsController.storeProductStage(
          new StoreProductsStageParams({
            productId:
              props.productId,

            stageIds: [
              ...newStageIds,
            ],
          }),
        );

      if (
        storeResult?.data
          ?.status !== true
      ) {
        return;
      }
    }

    showStageDialog.value =
      false;

    selectedStageIds.value =
      [];

    window.location.reload();
  } finally {
    storingStages.value =
      false;
  }
};

// ======================================================
// Delete Current Stage
// ======================================================

const deleteStage = async (
  stage: ProductShowStage,
  index: number,
) => {
  if (!stage.id) {
    props.stages.splice(
      index,
      1,
    );

    return;
  }

  try {
    deletingStageId.value =
      stage.id;

    const result =
      await productsController.deleteProductStage(
        new DeleteProductsStageParams({
          productId:
            props.productId,

          stageIds: [
            stage.id,
          ],
        }),
      );

    if (
      result?.data?.status === true
    ) {
      window.location.reload();
    }
  } finally {
    deletingStageId.value =
      undefined;
  }
};

// ======================================================
// Mounted
// ======================================================

onMounted(() => {
  fetchAvailableStages();
});
</script>

<template>
  <section class="card full-width">

    <!-- ================================================== -->
    <!-- Header -->
    <!-- ================================================== -->

    <div class="card-header">

      <div class="card-title-wrap">

        <span class="num">
          03
        </span>

        <div>
          <h3>
            {{
              $t(
                'Products.form.stages_title',
              ) ||
              'المراحل المرتبطة'
            }}
          </h3>

          <p>
            {{
              $t(
                'Products.form.stages_hint',
              ) ||
              'المراحل التي يرتبط بها هذا المنتج'
            }}
          </p>
        </div>

      </div>

      <div class="header-actions">

        <span class="count">
          {{
            props.stages?.length ||
            props.stageIds?.length ||
            0
          }}
        </span>

        <button
          type="button"
          class="add-stage-btn"
          @click="openStageDialog"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line
              x1="12"
              y1="5"
              x2="12"
              y2="19"
            />

            <line
              x1="5"
              y1="12"
              x2="19"
              y2="12"
            />
          </svg>

          <span>
            {{
              $t(
                'common.add',
              ) ||
              'إضافة'
            }}
          </span>
        </button>

      </div>
    </div>

    <!-- ================================================== -->
    <!-- Current Stages - New Design -->
    <!-- ================================================== -->

    <div
      v-if="groupedCurrentStages.length"
      class="current-stages-wrapper"
    >

      <div
        v-for="mainStage in groupedCurrentStages"
        :key="mainStage.id"
        class="current-stage-section"
      >

        <!-- ================================================== -->
        <!-- Main Stage Header -->
        <!-- ================================================== -->

        <div class="current-main-header">

          <div class="main-stage-line"></div>

          <div class="main-stage-content">

            <div class="main-stage-badge">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M12 2v20"
                />

                <path
                  d="M2 12h20"
                />
              </svg>
            </div>

            <div class="main-stage-text">

              <span class="main-stage-label">
                Main Stage
              </span>

              <h4>
                {{ mainStage.title }}
              </h4>

            </div>

            <span class="sub-stage-count">
              {{
                mainStage.subStages.length
              }}

              {{
                mainStage.subStages.length === 1
                  ? 'Stage'
                  : 'Stages'
              }}
            </span>

          </div>

        </div>

        <!-- ================================================== -->
        <!-- Sub Stages -->
        <!-- ================================================== -->

        <div class="current-sub-list">

          <div
            v-for="(
              stage,
              index
            ) in mainStage.subStages"
            :key="stage.id"
            class="current-sub-item"
          >

            <!-- Number -->
            <div class="sub-index">
              {{
                String(
                  index + 1,
                ).padStart(
                  2,
                  '0',
                )
              }}
            </div>

            <!-- Connector -->
            <div class="sub-connector"></div>

            <!-- Content -->
            <div class="sub-content">

              <span class="sub-label">
                Sub Stage
              </span>

              <strong>
                {{ stage.title }}
              </strong>

              <span class="sub-id">
                ID #{{ stage.id }}
              </span>

            </div>

            <!-- Delete -->
            <button
              type="button"
              class="delete-stage-btn"
              :disabled="
                deletingStageId ===
                stage.id
              "
              @click="
                deleteStage(
                  stage,
                  mainStage
                    .originalIndexes[
                    stage.id
                  ],
                )
              "
            >

              <span
                v-if="
                  deletingStageId ===
                  stage.id
                "
                class="delete-loading"
              >
                ...
              </span>

              <svg
                v-else
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline
                  points="3 6 5 6 21 6"
                />

                <path
                  d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"
                />

                <path
                  d="M10 11v6"
                />

                <path
                  d="M14 11v6"
                />

                <path
                  d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"
                />
              </svg>

            </button>

          </div>

        </div>

      </div>

    </div>

    <!-- ================================================== -->
    <!-- Fallback -->
    <!-- ================================================== -->

    <div
      v-else-if="stageIds?.length"
      class="stages-grid"
    >

      <div
        v-for="(
          id,
          index
        ) in stageIds"
        :key="id"
        class="stage-card"
      >

        <div class="stage-top">

          <span class="stage-num">
            {{
              String(
                index + 1,
              ).padStart(
                2,
                '0',
              )
            }}
          </span>

          <span class="check">
            ✓
          </span>

        </div>

        <h4>
          {{
            $t(
              'Products.stages.item',
            ) ||
            'مرحلة'
          }}

          #{{ id }}
        </h4>

        <span class="stage-id">
          #{{ id }}
        </span>

      </div>

    </div>

    <!-- ================================================== -->
    <!-- Empty -->
    <!-- ================================================== -->

    <div
      v-else
      class="empty-box"
    >

      <span>
        ◌
      </span>

      <p>
        {{
          $t(
            'Products.show.no_stages',
          ) ||
          'لا توجد مراحل مرتبطة'
        }}
      </p>

    </div>

    <!-- ================================================== -->
    <!-- Dialog -->
    <!-- ================================================== -->

    <Teleport to="body">

      <div
        v-if="showStageDialog"
        class="dialog-overlay"
        @click.self="
          closeStageDialog
        "
      >

        <div class="stage-dialog">

          <!-- ================================================== -->
          <!-- Dialog Header -->
          <!-- ================================================== -->

          <div class="dialog-header">

            <div>

              <h3>
                {{
                  $t(
                    'Products.form.stages_title',
                  ) ||
                  'اختيار المراحل'
                }}
              </h3>

              <p>
                {{
                  $t(
                    'Products.form.stages_hint',
                  ) ||
                  'اختر المراحل الفرعية المرتبطة بالمنتج'
                }}
              </p>

            </div>

            <button
              type="button"
              class="close-btn"
              :disabled="
                storingStages
              "
              @click="
                closeStageDialog
              "
            >
              ×
            </button>

          </div>

          <!-- ================================================== -->
          <!-- Loading -->
          <!-- ================================================== -->

          <div
            v-if="stagesLoading"
            class="dialog-loading"
          >

            <span>
              ...
            </span>

            <p>
              {{
                $t(
                  'Products.form.stages_loading',
                ) ||
                'جاري تحميل المراحل...'
              }}
            </p>

          </div>

          <!-- ================================================== -->
          <!-- Grouped Stages -->
          <!-- ================================================== -->

          <div
            v-else-if="
              groupedStages.length
            "
            class="available-stages"
          >

            <div
              v-for="mainStage in groupedStages"
              :key="mainStage.id"
              class="stage-group"
            >

              <!-- Main Stage -->

              <div
                class="main-stage-header"
              >

                <div
                  class="main-stage-icon"
                >
                  #
                </div>

                <div
                  class="main-stage-info"
                >

                  <strong>
                    {{
                      mainStage.title
                    }}
                  </strong>

                  <small>
                    Main Stage
                  </small>

                </div>

              </div>

              <!-- Sub Stages -->

              <div
                v-if="
                  mainStage
                    .subStages
                    .length
                "
                class="sub-stages"
              >

                <button
                  v-for="stage in mainStage.subStages"
                  :key="stage.id"
                  type="button"
                  class="available-stage sub-stage"
                  :class="{
                    selected:
                      isStageSelected(
                        stage.id,
                      ),
                  }"
                  @click="
                    toggleStage(
                      stage.id,
                    )
                  "
                >

                  <span
                    class="stage-checkbox"
                  >

                    <svg
                      v-if="
                        isStageSelected(
                          stage.id,
                        )
                      "
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <polyline
                        points="20 6 9 17 4 12"
                      />
                    </svg>

                  </span>

                  <span
                    class="available-stage-info"
                  >

                    <strong>
                      {{
                        stage.title
                      }}
                    </strong>

                    <small>
                      #{{ stage.id }}
                    </small>

                  </span>

                </button>

              </div>

              <div
                v-else
                class="no-sub-stages"
              >
                {{
                  $t(
                    'Products.show.no_sub_stages',
                  ) ||
                  'لا توجد مراحل فرعية'
                }}
              </div>

            </div>

          </div>

          <!-- ================================================== -->
          <!-- Dialog Empty -->
          <!-- ================================================== -->

          <div
            v-else
            class="dialog-empty"
          >

            <span>
              ◌
            </span>

            <p>
              {{
                $t(
                  'Products.show.no_available_stages',
                ) ||
                'لا توجد مراحل متاحة'
              }}
            </p>

          </div>

          <!-- ================================================== -->
          <!-- Footer -->
          <!-- ================================================== -->

          <div
            class="dialog-footer"
          >

            <span
              class="selected-count"
            >
              {{
                selectedStageIds.length
              }}

              {{
                $t(
                  'Products.form.selected',
                ) ||
                'محدد'
              }}
            </span>

            <div
              class="dialog-actions"
            >

              <button
                type="button"
                class="cancel-btn"
                :disabled="
                  storingStages
                "
                @click="
                  closeStageDialog
                "
              >
                {{
                  $t(
                    'common.cancel',
                  ) ||
                  'إلغاء'
                }}
              </button>

              <button
                type="button"
                class="save-btn"
                :disabled="
                  storingStages ||
                  (
                    !selectedStageIds.length &&
                    !props.stageIds?.length
                  )
                "
                @click="
                  storeStages
                "
              >

                <span
                  v-if="
                    storingStages
                  "
                >
                  ...
                </span>

                <span v-else>
                  {{
                    $t(
                      'common.save',
                    ) ||
                    'حفظ'
                  }}
                </span>

              </button>

            </div>

          </div>

        </div>

      </div>

    </Teleport>

  </section>
</template>

<style scoped lang="scss">
/* ======================================================
   Card
   ====================================================== */

.card {
  grid-column: 1 / -1;
  padding: 1.35rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.04);
}

/* ======================================================
   Header
   ====================================================== */

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.35rem;
}

.card-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;

  .num {
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.5rem;
    background: #fff7ed;
    color: #b45309;
    font-size: 0.75rem;
    font-weight: 800;
  }

  h3 {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 700;
    color: #0f172a;
  }

  p {
    margin: 0.15rem 0 0;
    font-size: 0.8rem;
    color: #64748b;
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.count {
  min-width: 28px;
  height: 28px;
  padding: 0 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
}

.add-stage-btn {
  min-height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0 0.75rem;
  border: 1px solid #0f766e;
  border-radius: 0.5rem;
  background: #0f766e;
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: 0.15s;

  &:hover {
    background: #115e59;
    border-color: #115e59;
  }
}

/* ======================================================
   NEW OUTSIDE STAGES DESIGN
   ====================================================== */

.current-stages-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.current-stage-section {
  position: relative;
}

/* ======================================================
   Main Stage
   ====================================================== */

.current-main-header {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
}

.main-stage-line {
  width: 4px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 999px;
  background: #f59e0b;
}

.main-stage-content {
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.85rem;
  border-bottom: 1px solid #e2e8f0;
}

.main-stage-badge {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.6rem;
  background: #fff7ed;
  color: #d97706;
  border: 1px solid #fed7aa;
}

.main-stage-text {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.05rem;

  .main-stage-label {
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #f59e0b;
  }

  h4 {
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.95rem;
    font-weight: 700;
    color: #1e293b;
  }
}

.sub-stage-count {
  flex-shrink: 0;
  padding: 0.3rem 0.6rem;
  border-radius: 999px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 0.68rem;
  font-weight: 700;
}

/* ======================================================
   Sub Stages List
   ====================================================== */

.current-sub-list {
  position: relative;
  margin-inline-start: 1.2rem;
  padding-inline-start: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.current-sub-list::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  inset-inline-start: 0.3rem;
  width: 1px;
  background: #e2e8f0;
}

.current-sub-item {
  position: relative;
  min-height: 60px;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.65rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.7rem;
  background: #fff;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;

  &:hover {
    border-color: #cbd5e1;
    box-shadow: 0 4px 12px rgb(15 23 42 / 0.05);
    transform: translateX(2px);
  }
}

.sub-index {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #64748b;
  font-size: 0.65rem;
  font-weight: 800;
}

.sub-connector {
  position: absolute;
  width: 12px;
  height: 1px;
  inset-inline-start: -1.25rem;
  background: #e2e8f0;
}

.sub-content {
  min-width: 0;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.55rem;

  .sub-label {
    display: none;
    font-size: 0.62rem;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
  }

  strong {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.85rem;
    font-weight: 600;
    color: #334155;
  }

  .sub-id {
    flex-shrink: 0;
    padding: 0.2rem 0.45rem;
    border-radius: 0.35rem;
    background: #f8fafc;
    color: #94a3b8;
    font-size: 0.62rem;
    font-weight: 600;
  }
}

/* ======================================================
   Delete
   ====================================================== */

.delete-stage-btn {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #fecaca;
  border-radius: 0.45rem;
  background: #fff;
  color: #ef4444;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s,
    color 0.15s;

  &:hover:not(:disabled) {
    background: #fef2f2;
    border-color: #fca5a5;
    color: #dc2626;
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
}

.delete-loading {
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 1px;
}

/* ======================================================
   Fallback
   ====================================================== */

.stages-grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(180px, 1fr)
  );
  gap: 0.75rem;
}

.stage-card {
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  transition: 0.15s;

  &:hover {
    border-color: #0f766e;
    background: #f0fdfa;
  }

  .stage-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.65rem;
  }

  .stage-num {
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: white;
    border: 1px solid #e2e8f0;
    font-size: 0.7rem;
    font-weight: 800;
    color: #0f766e;
  }

  .check {
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: #d1fae5;
    color: #065f46;
    font-size: 0.7rem;
    font-weight: 800;
  }

  h4 {
    margin: 0 0 0.25rem;
    font-size: 0.9rem;
    font-weight: 600;
    color: #0f172a;
  }

  .stage-id {
    font-size: 0.7rem;
    color: #94a3b8;
  }
}

/* ======================================================
   Empty
   ====================================================== */

.empty-box {
  min-height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: #f8fafc;
  border: 1px dashed #e2e8f0;
  border-radius: 0.75rem;
  color: #94a3b8;
  font-size: 0.9rem;

  p {
    margin: 0;
  }
}

/* ======================================================
   Dialog
   ====================================================== */

.dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgb(15 23 42 / 0.45);
}

.stage-dialog {
  width: min(600px, 100%);
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  box-shadow:
    0 20px 40px rgb(15 23 42 / 0.15),
    0 4px 12px rgb(15 23 42 / 0.08);
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem;
  border-bottom: 1px solid #e2e8f0;

  h3 {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 700;
    color: #0f172a;
  }

  p {
    margin: 0.25rem 0 0;
    font-size: 0.8rem;
    color: #64748b;
  }
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background: white;
  color: #64748b;
  font-size: 1.35rem;
  line-height: 1;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #f8fafc;
    color: #0f172a;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.dialog-loading {
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #64748b;

  span {
    font-weight: 700;
    letter-spacing: 2px;
  }

  p {
    margin: 0;
    font-size: 0.85rem;
  }
}

/* ======================================================
   Dialog Groups
   ====================================================== */

.available-stages {
  max-height: 400px;
  overflow-y: auto;
  padding: 1rem;
}

.stage-group {
  margin-bottom: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  background: #f8fafc;
  overflow: hidden;

  &:last-child {
    margin-bottom: 0;
  }
}

.main-stage-header {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.85rem 1rem;
  background: #fff7ed;
  border-bottom: 1px solid #fed7aa;
}

.main-stage-icon {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  background: #f59e0b;
  color: white;
  font-size: 0.75rem;
  font-weight: 800;
}

.main-stage-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;

  strong {
    font-size: 0.9rem;
    font-weight: 700;
    color: #92400e;
  }

  small {
    font-size: 0.7rem;
    color: #b45309;
  }
}

.sub-stages {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  background: white;
}

.available-stage {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.6rem;
  background: white;
  text-align: start;
  cursor: pointer;
  transition:
    border-color 0.15s,
    background 0.15s;

  &:hover {
    border-color: #99f6e4;
    background: #f0fdfa;
  }

  &.selected {
    border-color: #0f766e;
    background: #f0fdfa;
  }
}

.sub-stage {
  margin-inline-start: 1rem;
  width: calc(100% - 1rem);
}

.stage-checkbox {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #cbd5e1;
  border-radius: 0.4rem;
  color: white;
  background: white;

  .selected & {
    border-color: #0f766e;
    background: #0f766e;
  }
}

.available-stage-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;

  strong {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.85rem;
    font-weight: 600;
    color: #334155;
  }

  small {
    font-size: 0.7rem;
    color: #94a3b8;
  }
}

.no-sub-stages {
  padding: 1rem;
  text-align: center;
  font-size: 0.8rem;
  color: #94a3b8;
  background: white;
}

.dialog-empty {
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #94a3b8;
  font-size: 0.9rem;

  p {
    margin: 0;
  }
}

/* ======================================================
   Dialog Footer
   ====================================================== */

.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.selected-count {
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
}

.dialog-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cancel-btn,
.save-btn {
  min-width: 80px;
  min-height: 36px;
  padding: 0 1rem;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.cancel-btn {
  border: 1px solid #cbd5e1;
  background: white;
  color: #475569;

  &:hover:not(:disabled) {
    background: #f8fafc;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.save-btn {
  border: 1px solid #0f766e;
  background: #0f766e;
  color: white;

  &:hover:not(:disabled) {
    background: #115e59;
    border-color: #115e59;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

/* ======================================================
   Responsive
   ====================================================== */

@media (max-width: 600px) {
  .card {
    padding: 1rem;
  }

  .card-header {
    gap: 1rem;
  }

  .card-title-wrap {
    align-items: flex-start;

    p {
      display: none;
    }
  }

  .header-actions {
    flex-shrink: 0;
  }

  .add-stage-btn span {
    display: none;
  }

  .current-sub-list {
    margin-inline-start: 0.5rem;
    padding-inline-start: 1rem;
  }

  .sub-content {
    flex-wrap: wrap;
    gap: 0.25rem 0.5rem;

    strong {
      width: 100%;
    }

    .sub-id {
      order: 2;
    }
  }

  .sub-stage-count {
    display: none;
  }

  .current-sub-item {
    padding: 0.6rem;
  }

  .dialog-footer {
    align-items: stretch;
    flex-direction: column;
  }

  .dialog-actions {
    justify-content: flex-end;
  }
}
</style>