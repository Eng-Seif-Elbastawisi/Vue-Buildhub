<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import TranslationParams from '@/base/Core/Params/translationParams';
import MultiLangInput from '@/shared/MultiLangInput.vue';

import type ProductsShowModel from '../../core/models/products.show.model';
import AddProductsParams from '../../core/params/add.products.params';

import ItemTypesController from '@/modules/MainOrganization/ItemTypes/presentation/controllers/item.types.controller';
import IndexItemTypesParams from '@/modules/MainOrganization/ItemTypes/core/params/index.item.types.params';

import type TitleInterface from '@/base/Data/Models/titleInterface';
import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';

import MeasurementController from '@/modules/shared/measurement/presentation/controllers/measurement.controller';
import IndexMeasurementParams from '@/modules/shared/measurement/core/params/index.measurement.params';

import StageController from '@/modules/shared/Stages/presentation/controllers/stage.controller';
import IndexStageParams from '@/modules/shared/Stages/core/params/index.stage.params';

import HandleFilesUpload, {
  type UploadedFile,
} from '@/shared/FormInputs/HandleFilesUpload.vue';

// ======================================================
// i18n
// ======================================================

const { locale } = useI18n();

// ======================================================
// Emits
// ======================================================

const emit = defineEmits<{
  updateData: [params: AddProductsParams];
}>();

// ======================================================
// Props
// ======================================================

const props = defineProps<{
  Products?: ProductsShowModel;
  loading?: boolean;
}>();

// ======================================================
// Controllers
// ======================================================

const itemTypesController =
  ItemTypesController.getInstance();

const measurementController =
  MeasurementController.getInstance();

const stageController =
  StageController.getInstance();

// ======================================================
// Params
// ======================================================

const itemTypesParams =
  new IndexItemTypesParams('', 1, 100, 0);

const measurementParams =
  new IndexMeasurementParams('', 1, 100, 0);

// ======================================================
// Select Values
// ======================================================

const itemTypes =
  ref<TitleInterface<string | number> | null>(null);

const measurement =
  ref<TitleInterface<string | number> | null>(null);

// ======================================================
// Product State
// ======================================================

const translations =
  ref<Record<string, string>>({});

const descriptionTranslations =
  ref<Record<string, string>>({});

const itemTypeId =
  ref<number | undefined>();

const measurementUnitId =
  ref<number | undefined>(1);

const expectedPrice =
  ref<number | undefined>();

const isActive =
  ref(true);

// ======================================================
// Image
// ======================================================

// الملفات التي يرجعها HandleFilesUpload
const imageFiles =
  ref<UploadedFile[]>([]);

// القيمة التي سترسل للـ API
const imageBase64 =
  ref<string | undefined>();

// القيمة التي نمررها للـ HandleFilesUpload
// لازم تكون string أو string[]
const imageFileValue =
  ref<string | undefined>();

// ======================================================
// Stages
// ======================================================

const selectedStageIds =
  ref<number[]>([]);

// ======================================================
// Sorting
// ======================================================

interface Sorting {
  title: string;
  price: number;
}

const getSortingTitle = (
  index: number,
): string => {
  const number = index + 1;

  return locale.value === 'ar'
    ? `فرز ${number}`
    : `Sorting ${number}`;
};

const sortings =
  ref<Sorting[]>([
    {
      title: getSortingTitle(0),
      price: 0,
    },
  ]);

// ======================================================
// Add Sorting
// ======================================================

const addSorting = () => {
  const index =
    sortings.value.length;

  sortings.value.push({
    title: getSortingTitle(index),
    price: 0,
  });

  updateData();
};

// ======================================================
// Image Change
// ======================================================

const updateImage = (
  files: UploadedFile[],
) => {
  imageFiles.value = files;

  const image = files.find(
    (file) =>
      typeof file.base64 === 'string' &&
      file.base64.startsWith('data:image/'),
  );

  if (image) {
    imageBase64.value =
      image.base64;

    imageFileValue.value =
      image.base64;
  } else {
    imageBase64.value =
      undefined;

    imageFileValue.value =
      undefined;
  }

  updateData();
};

// ======================================================
// Remove Image
// ======================================================

const removeImage = () => {
  imageFiles.value = [];

  imageBase64.value =
    undefined;

  imageFileValue.value =
    undefined;

  updateData();
};

// ======================================================
// Stage Types
// ======================================================

interface StageItem {
  id: number;
  title: string;
}

interface StageGroup {
  id: number;
  title: string;
  color: string;
  stages: StageItem[];
}

// ======================================================
// Real Stages
// ======================================================

const stageGroups =
  ref<StageGroup[]>([]);

const stagesLoading =
  ref(false);

// ======================================================
// Helper: Get Title
// ======================================================

const getTitle = (
  item: any,
): string => {
  if (!item) return '';

  if (
    typeof item.title ===
    'string'
  ) {
    return item.title;
  }

  if (
    item.title &&
    typeof item.title ===
      'object'
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
    const title =
      item.translations.title;

    return (
      title.ar ||
      title.en ||
      Object.values(
        title,
      )[0] ||
      ''
    ) as string;
  }

  if (item.name) {
    return item.name;
  }

  return '';
};

// ======================================================
// Stage Colors
// ======================================================

const stageColors = [
  'bg-blue-50',
  'bg-yellow-50',
  'bg-cyan-50',
  'bg-purple-50',
  'bg-green-50',
  'bg-orange-50',
  'bg-amber-50',
  'bg-rose-50',
];

// ======================================================
// Fetch Main Stages + Sub Stages
// ======================================================

const fetchStages = async () => {
  try {
    stagesLoading.value = true;

    const result =
      await stageController.fetchList(
        new IndexStageParams({
          word: '',
          page: 1,
          perPage: 100,
          withPage: 0,
          parentId: null,
        }),
      );

    if (!result?.data) {
      stageGroups.value = [];
      return;
    }

    const mainStages =
      Array.isArray(result.data)
        ? result.data
        : [];

    const groups: StageGroup[] =
      [];

    for (
      let index = 0;
      index < mainStages.length;
      index++
    ) {
      const stage =
        mainStages[index];

      const subStageResult =
        await stageController.fetchList(
          new IndexStageParams({
            word: '',
            page: 1,
            perPage: 100,
            withPage: 0,
            parentId: stage.id,
          }),
        );

      const subStages =
        Array.isArray(
          subStageResult?.data,
        )
          ? subStageResult.data
          : [];

      groups.push({
        id: stage.id,

        title:
          getTitle(stage),

        color:
          stageColors[
            index %
              stageColors.length
          ],

        stages:
          subStages.map(
            (
              subStage: any,
            ) => ({
              id: subStage.id,
              title:
                getTitle(
                  subStage,
                ),
            }),
          ),
      });
    }

    stageGroups.value =
      groups;
  } catch (error) {
    console.error(
      'Failed to fetch stages:',
      error,
    );

    stageGroups.value = [];
  } finally {
    stagesLoading.value =
      false;
  }
};

// ======================================================
// Update Data
// ======================================================

const updateData = () => {
  emit(
    'updateData',

    new AddProductsParams({
      translations:
        new TranslationParams({
          title:
            translations.value,

          description:
            descriptionTranslations.value,
        }),

      itemTypeId:
        itemTypeId.value,

      measurementUnitId:
        measurementUnitId.value,

      expectedPrice:
        expectedPrice.value,

      image:
        imageBase64.value,

      stageIds: [
        ...selectedStageIds.value,
      ],

      sortings:
        sortings.value.map(
          (sorting) => ({
            title:
              sorting.title,

            price:
              sorting.price,
          }),
        ),
    }),
  );
};

// ======================================================
// Translation
// ======================================================

const updateTranslations = (
  value: Record<string, string>,
) => {
  translations.value =
    value;

  updateData();
};

const updateDescriptionTranslations =
  (
    value: Record<string, string>,
  ) => {
    descriptionTranslations.value =
      value;

    updateData();
  };

// ======================================================
// Stage Selection
// ======================================================

const toggleStage = (
  id: number,
) => {
  const index =
    selectedStageIds.value.indexOf(
      id,
    );

  if (index === -1) {
    selectedStageIds.value.push(
      id,
    );
  } else {
    selectedStageIds.value.splice(
      index,
      1,
    );
  }

  updateData();
};

const isStageSelected = (
  id: number,
) => {
  return selectedStageIds.value.includes(
    id,
  );
};

// ======================================================
// Lifecycle
// ======================================================

onMounted(async () => {
  await fetchStages();

  updateData();
});

// ======================================================
// Edit Product
// ======================================================

watch(
  () => props.Products,

  (product) => {
    if (!product) return;

    translations.value = {
      ...(product.translations
        ?.title ?? {}),
    };

    descriptionTranslations.value =
      {
        ...(product
          .translations
          ?.description ?? {}),
      };

    itemTypeId.value =
      product.itemTypeId;

    measurementUnitId.value =
      product.measurementUnitId;

    expectedPrice.value =
      product.expectedPrice;

    isActive.value =
      product.isActive ?? true;

    selectedStageIds.value = [
      ...(product.stageIds ?? []),
    ];

    // ==================================================
    // Existing Image
    // ==================================================

    if (
      product.image &&
      typeof product.image ===
        'string'
    ) {
      imageBase64.value =
        product.image;

      imageFileValue.value =
        product.image;

      imageFiles.value = [];
    } else {
      imageBase64.value =
        undefined;

      imageFileValue.value =
        undefined;

      imageFiles.value = [];
    }

    // ==================================================
    // Existing Sortings
    // ==================================================

    if (
      product.sortings?.length
    ) {
      sortings.value =
        product.sortings.map(
          (
            sorting: any,
            index: number,
          ) => ({
            title:
              sorting.title ||
              getSortingTitle(
                index,
              ),

            price:
              sorting.price ??
              0,
          }),
        );
    } else {
      sortings.value = [
        {
          title:
            getSortingTitle(
              0,
            ),

          price: 0,
        },
      ];
    }

    updateData();
  },

  {
    immediate: true,
  },
);

// ======================================================
// Update Sorting Titles
// when language changes
// ======================================================

watch(locale, () => {
  sortings.value =
    sortings.value.map(
      (
        sorting,
        index,
      ) => ({
        ...sorting,

        title:
          getSortingTitle(
            index,
          ),
      }),
    );

  updateData();
});

// ======================================================
// Keep Data In Sync
// ======================================================

watch(
  [
    itemTypeId,
    measurementUnitId,
    expectedPrice,
    isActive,
    sortings,
  ],

  updateData,

  {
    deep: true,
  },
);
</script>

<template>
  <div
    class="products-form"
    :class="{ disabled: loading }"
  >
    <!-- Header -->
    <div class="form-header">
      <div>
        <h2 class="title">
          منتج جديد
        </h2>

        <p class="subtitle">
          إضافة منتج جديد للمكتبة العامة وربطه بالمراحل.

          <span class="badge">
            BuildHub OS
          </span>
        </p>
      </div>

      <div class="actions">
        <button
          type="button"
          class="btn-secondary"
        >
          رجوع للمنتجات
        </button>

        <button
          type="button"
          class="btn-primary"
        >
          <span>+</span>

          حفظ المنتج
        </button>
      </div>
    </div>

    <div class="form-body">
      <!-- LEFT COLUMN -->
      <aside class="left-panel">

        <!-- Image -->
        <div class="card image-card">
          <div class="card-header">
            <span>
              الصورة والفرز
            </span>

            <label class="switch">
              <input
                type="checkbox"
                v-model="isActive"
              />

              <span
                class="slider"
              ></span>

              <span class="label">
                فعال
              </span>
            </label>
          </div>

          <div class="image-upload">

            <!-- IMPORTANT:
                 file must be string/string[]
                 NOT UploadedFile[]
            -->
            <HandleFilesUpload
              id="product-image"
              :label="$t('image')"
              :file="imageFileValue"
              :multiple="false"
              :max-files="1"
              @change="updateImage"
            />

          </div>
        </div>

        <!-- Sortings -->
        <div class="card sortings-card">
          <div
            v-for="(s, i) in sortings"
            :key="i"
            class="sorting-row"
          >
            <span class="sort-label">
              {{ s.title }}
            </span>

            <input
              v-model.number="s.price"
              type="number"
              class="price-input"
              min="0"
              @input="updateData"
            />

            <span class="currency">
              ج.م
            </span>
          </div>

          <button
            type="button"
            class="add-sorting-btn"
            @click="addSorting"
          >
            <span>+</span>

            <span>
              {{
                locale === 'ar'
                  ? 'إضافة فرز'
                  : 'Add Sorting'
              }}
            </span>
          </button>
        </div>
      </aside>

      <!-- MAIN -->
      <main class="main-panel">

        <!-- Product Data -->
        <div class="card">
          <h3 class="section-title">
            بيانات المنتج
          </h3>

          <div class="grid-2">

            <!-- Product Name -->
            <div class="field">
              <label>
                اسم المنتج

                <span class="required">
                  ?
                </span>
              </label>

              <MultiLangInput
                field-key="title"
                :languages="[
                  'ar',
                  'en',
                ]"
                :model-value="
                  translations
                "
                type="title"
                @update:model-value="
                  updateTranslations
                "
              />
            </div>

            <!-- Item Type -->
            <div class="field-group">
              <UpdatedCustomInputSelect
                id="item-type"
                v-model="itemTypes"
                :controller="
                  itemTypesController
                "
                :label="
                  $t('item_type')
                "
                :params="
                  itemTypesParams
                "
                :placeholder="
                  $t(
                    'item_type.placeholder',
                  )
                "
                required
                @update:model-value="
                  updateData
                "
              />
            </div>

            <!-- Expected Price -->
            <div class="field">
              <label>
                سعر متوقع

                <span class="required">
                  ?
                </span>
              </label>

              <input
                v-model.number="
                  expectedPrice
                "
                type="number"
                class="field-input"
                placeholder="0"
                min="0"
              />
            </div>

            <!-- Measurement -->
            <div class="field-group">
              <UpdatedCustomInputSelect
                id="material-measurement"
                v-model="measurement"
                :controller="
                  measurementController
                "
                :label="
                  $t('measurement')
                "
                :params="
                  measurementParams
                "
                :placeholder="
                  $t(
                    'measurement.unit_placeholder',
                  )
                "
                required
                @update:model-value="
                  updateData
                "
              />
            </div>
          </div>
        </div>

        <!-- Stages -->
        <div class="card">
          <div class="section-header">
            <h3 class="section-title">
              تابع لأي مراحل
            </h3>

            <span class="hint">
              اختر المراحل المرتبطة بهذا المنتج
            </span>
          </div>

          <!-- Loading -->
          <div
            v-if="stagesLoading"
            class="stages-grid"
          >
            <div
              v-for="i in 8"
              :key="i"
              class="stage-group"
            >
              <div class="group-header">
                <span class="count">
                  ...
                </span>

                <h4>
                  جاري تحميل المراحل...
                </h4>
              </div>
            </div>
          </div>

          <!-- Empty -->
          <div
            v-else-if="
              !stageGroups.length
            "
            class="stage-group"
          >
            <div class="group-header">
              <h4>
                لا توجد مراحل متاحة
              </h4>
            </div>
          </div>

          <!-- Real Stages -->
          <div
            v-else
            class="stages-grid"
          >
            <div
              v-for="group in stageGroups"
              :key="group.id"
              class="stage-group"
              :class="group.color"
            >
              <div class="group-header">
                <span class="count">
                  {{
                    group.stages.length
                  }}
                </span>

                <h4>
                  {{ group.title }}
                </h4>
              </div>

              <div class="stage-tags">
                <button
                  v-for="stage in group.stages"
                  :key="stage.id"
                  type="button"
                  class="stage-tag"
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
                  {{ stage.title }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="card">
          <div
            id="description-field"
            class="field-group col-span-2"
          >
            <MultiLangInput
              field-key="description"
              :label="
                $t('description')
              "
              :languages="[
                'ar',
                'en',
              ]"
              :model-value="
                descriptionTranslations
              "
              type="description"
              @update:model-value="
                updateDescriptionTranslations
              "
            />
          </div>
        </div>

      </main>
    </div>
  </div>
</template>

<style scoped lang="scss">
.products-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  background: #f8fafc;
  min-height: 100vh;

  &.disabled {
    pointer-events: none;
    opacity: 0.7;
  }
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  .title {
    font-size: 1.75rem;
    font-weight: 700;
    color: #0f172a;
  }

  .subtitle {
    color: #64748b;
    margin-top: 0.25rem;
  }

  .badge {
    background: #e0f2fe;
    color: #0369a1;
    padding: 0.15rem 0.5rem;
    border-radius: 999px;
    font-size: 0.75rem;
  }

  .actions {
    display: flex;
    gap: 0.75rem;
  }
}

.btn-primary {
  background: #0f766e;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 0.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
}

.btn-secondary {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 0.6rem 1.2rem;
  border-radius: 0.5rem;
  cursor: pointer;
}

.form-body {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 1.5rem;
}

.card {
  background: white;
  border-radius: 1rem;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.05);
  border: 1px solid #e2e8f0;
}

.left-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.image-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    font-weight: 600;
  }
}

.image-upload {
  border: 2px dashed #cbd5e1;
  border-radius: 0.75rem;
  padding: 1rem;
  text-align: center;
  background: #f8fafc;
}

.sortings-card {
  .sorting-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;

    .sort-label {
      width: 60px;
      font-size: 0.875rem;
      color: #64748b;
    }

    .price-input {
      flex: 1;
      padding: 0.4rem 0.6rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      text-align: center;
      font-weight: 600;
    }

    .currency {
      font-size: 0.75rem;
      color: #94a3b8;
      width: 28px;
    }
  }
}

.add-sorting-btn {
  width: 100%;
  margin-top: 0.75rem;
  padding: 0.65rem 1rem;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;

  background: white;
  color: #0f766e;

  border: 1px dashed #0f766e;
  border-radius: 0.5rem;

  font-size: 0.875rem;
  font-weight: 600;

  cursor: pointer;

  transition: all 0.15s ease;

  span:first-child {
    font-size: 1.1rem;
    font-weight: 700;
  }

  &:hover {
    background: #f0fdfa;
  }
}

.main-panel {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #0f172a;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  .hint {
    font-size: 0.85rem;
    color: #64748b;
  }
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #334155;
  }

  .required {
    color: #ef4444;
  }
}

.input,
.select,
.textarea {
  padding: 0.6rem 0.85rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  background: white;

  &:focus {
    outline: none;
    border-color: #0f766e;
    box-shadow:
      0 0 0 3px
      rgb(15 118 110 / 0.15);
  }
}

.textarea {
  resize: vertical;
}

.stages-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.stage-group {
  border-radius: 0.75rem;
  padding: 0.85rem;
  border: 1px solid #e2e8f0;

  .group-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.6rem;

    .count {
      background: #0f172a;
      color: white;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      font-size: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    h4 {
      font-size: 0.9rem;
      font-weight: 600;
      margin: 0;
    }
  }
}

.stage-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.stage-tag {
  padding: 0.3rem 0.65rem;
  border-radius: 999px;
  font-size: 0.75rem;
  background: white;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.15s;

  &.selected {
    background: #0f766e;
    color: white;
    border-color: #0f766e;
  }

  &:hover:not(.selected) {
    border-color: #0f766e;
    color: #0f766e;
  }
}

.switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;

  input {
    display: none;
  }

  .slider {
    width: 36px;
    height: 20px;
    background: #cbd5e1;
    border-radius: 999px;
    position: relative;
    transition: 0.2s;

    &::after {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      background: white;
      border-radius: 50%;
      top: 2px;
      left: 2px;
      transition: 0.2s;
    }
  }

  input:checked + .slider {
    background: #0f766e;

    &::after {
      transform: translateX(16px);
    }
  }

  .label {
    font-size: 0.85rem;
    color: #64748b;
  }
}

@media (max-width: 1100px) {
  .form-body {
    grid-template-columns: 1fr;
  }

  .stages-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .grid-2,
  .stages-grid {
    grid-template-columns: 1fr;
  }
}
</style>