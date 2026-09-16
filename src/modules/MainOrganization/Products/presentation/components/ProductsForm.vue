<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';

  import TranslationParams from '@/base/Core/Params/translationParams';
  import MultiLangInput from '@/shared/MultiLangInput.vue';

  import type ProductsShowModel from '../../core/models/products.show.model';
  import AddProductsParams from '../../core/params/add.products.params';
  import DeleteProductsSortingParams from '../../core/params/delete.products.sorting.params';

  import ProductsController from '../controllers/products.controller';

  import ItemTypesController from '@/modules/MainOrganization/ItemTypes/presentation/controllers/item.types.controller';
  import IndexItemTypesParams from '@/modules/MainOrganization/ItemTypes/core/params/index.item.types.params';

  import type TitleInterface from '@/base/Data/Models/titleInterface';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';

  import MeasurementController from '@/modules/shared/measurement/presentation/controllers/measurement.controller';
  import IndexMeasurementParams from '@/modules/shared/measurement/core/params/index.measurement.params';

  import StageController from '@/modules/shared/Stages/presentation/controllers/stage.controller';
  import IndexStageParams from '@/modules/shared/Stages/core/params/index.stage.params';

  import HandleFilesUpload, { type UploadedFile } from '@/shared/FormInputs/HandleFilesUpload.vue';

  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';

  interface Sorting {
    id?: number;
    title: string;
    price: number;
  }

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

  const STAGE_COLORS = [
    'bg-blue-50',
    'bg-yellow-50',
    'bg-cyan-50',
    'bg-purple-50',
    'bg-green-50',
    'bg-orange-50',
    'bg-amber-50',
    'bg-rose-50',
  ] as const;

  const { t, locale } = useI18n();

  const emit = defineEmits<{
    updateData: [params: AddProductsParams];
  }>();

  const props = defineProps<{
    Products?: ProductsShowModel;
    loading?: boolean;
  }>();

  const productsController = ProductsController.getInstance();

  const itemTypesController = ItemTypesController.getInstance();
  const measurementController = MeasurementController.getInstance();
  const stageController = StageController.getInstance();

  const itemTypesParams = new IndexItemTypesParams('', 1, 100, 0);
  const measurementParams = new IndexMeasurementParams('', 1, 100, 0);

  const extractTitle = (item: any): string => {
    if (!item) return '';

    if (typeof item.title === 'string') {
      return item.title;
    }

    if (Array.isArray(item.title)) {
      const en = item.title.find((t: any) => t.locale === 'en')?.title;
      const ar = item.title.find((t: any) => t.locale === 'ar')?.title;

      return en || ar || item.title[0]?.title || '';
    }

    if (item.title && typeof item.title === 'object') {
      return item.title.ar || item.title.en || Object.values(item.title)[0] || '';
    }

    if (item.translations?.title) {
      const translations = item.translations.title;

      return translations.ar || translations.en || Object.values(translations)[0] || '';
    }

    return item.name ?? '';
  };

  const getSortingTitle = (index: number): string => {
    return t('Products.form.sorting_label', {
      number: index + 1,
    });
  };

  const createSorting = (price = 0): Sorting => ({
    title: '',
    price,
  });

  const itemTypes = ref<TitleInterface<string | number> | null>(null);
  const measurement = ref<TitleInterface<string | number> | null>(null);

  const translations = ref<Record<string, string>>({});
  const descriptionTranslations = ref<Record<string, string>>({});

  const itemTypeId = ref<number | undefined>();
  const measurementUnitId = ref<number | undefined>();

  const expectedPrice = ref<number | undefined>();
  const isActive = ref(true);

  const imageFiles = ref<UploadedFile[]>([]);
  const imageBase64 = ref<string | undefined>();

  const imageFileValue = computed(() => imageBase64.value);

  const selectedStageIds = ref<number[]>([]);
  const stageGroups = ref<StageGroup[]>([]);
  const stagesLoading = ref(false);

  const sortings = ref<Sorting[]>([createSorting()]);

  const deletingSortingId = ref<number | undefined>();

  const updateImage = (files: UploadedFile[]) => {
    imageFiles.value = files;

    const image = files.find(
      (file) => typeof file.base64 === 'string' && file.base64.startsWith('data:image/'),
    );

    imageBase64.value = image?.base64 ?? undefined;
  };

  const addSorting = () => {
    sortings.value.push(createSorting());
  };

  const deleteSorting = async (sorting: Sorting, index: number) => {
    if (!sorting.id) {
      sortings.value.splice(index, 1);

      if (sortings.value.length === 0) {
        sortings.value.push(createSorting());
      }

      return;
    }

    try {
      deletingSortingId.value = sorting.id;

      const result = await productsController.deleteProductSorting(
        new DeleteProductsSortingParams({
          productSortingId: sorting.id,
        }),
      );

      console.log('DELETE RESULT:', result);

      if (result?.data?.status === true) {
        window.location.reload();
      }
    } finally {
      deletingSortingId.value = undefined;
    }
  };

  const toggleStage = (id: number) => {
    const index = selectedStageIds.value.indexOf(id);

    if (index === -1) {
      selectedStageIds.value.push(id);
    } else {
      selectedStageIds.value.splice(index, 1);
    }
  };

  const isStageSelected = (id: number) => {
    return selectedStageIds.value.includes(id);
  };

  const fetchStages = async () => {
    try {
      stagesLoading.value = true;

      const result = await stageController.fetchList(
        new IndexStageParams({
          word: '',
          page: 1,
          perPage: 1000,
          withPage: 0,
          parentId: null,
        }),
      );

      const allStages = Array.isArray(result?.data) ? result.data : [];

      const mainStages = allStages.filter((stage: any) => !stage.parent_id);

      let subStages = allStages.filter((stage: any) => stage.parent_id);

      if (mainStages.length > 0 && subStages.length === 0) {
        const subResults = await Promise.all(
          mainStages.map((stage: any) =>
            stageController
              .fetchList(
                new IndexStageParams({
                  word: '',
                  page: 1,
                  perPage: 100,
                  withPage: 0,
                  parentId: stage.id,
                }),
              )
              .then((res) => ({
                parentId: stage.id,
                data: Array.isArray(res?.data) ? res.data : [],
              }))
              .catch(() => ({
                parentId: stage.id,
                data: [],
              })),
          ),
        );

        subStages = subResults.flatMap((result) =>
          result.data.map((stage: any) => ({
            ...stage,
            parent_id: result.parentId,
          })),
        );
      }

      stageGroups.value = mainStages.map((stage: any, index: number) => ({
        id: stage.id,
        title: extractTitle(stage),
        color: STAGE_COLORS[index % STAGE_COLORS.length],
        stages: subStages
          .filter((subStage: any) => subStage.parent_id === stage.id)
          .map((subStage: any) => ({
            id: subStage.id,
            title: extractTitle(subStage),
          })),
      }));
    } catch (error) {
      console.error('Failed to fetch stages:', error);

      stageGroups.value = [];
    } finally {
      stagesLoading.value = false;
    }
  };

  const updateData = () => {
    emit(
      'updateData',
      new AddProductsParams({
        translations: new TranslationParams({
          title: translations.value,
          description: descriptionTranslations.value,
        }),

        itemTypeId: itemTypeId.value,

        measurementUnitId: measurementUnitId.value,

        expectedPrice: expectedPrice.value,

        image: imageBase64.value,

        stageIds: [...selectedStageIds.value],

        sortings: sortings.value.map((sorting, index) => ({
          title: getSortingTitle(index),
          price: sorting.price,
        })),
      }),
    );
  };

  const updateTranslations = (value: Record<string, string>) => {
    translations.value = value;
  };

  const updateDescriptionTranslations = (value: Record<string, string>) => {
    descriptionTranslations.value = value;
  };

  watch(
    itemTypes,
    (value) => {
      itemTypeId.value =
        value?.id !== undefined && value?.id !== null ? Number(value.id) : undefined;
    },
    {
      deep: true,
    },
  );

  watch(
    measurement,
    (value) => {
      measurementUnitId.value =
        value?.id !== undefined && value?.id !== null ? Number(value.id) : undefined;
    },
    {
      deep: true,
    },
  );

  watch(locale, () => {
    updateData();
  });

  watch(
    () => props.Products,
    (product) => {
      if (!product) return;

      translations.value = {
        ...(product.translations?.title ?? {}),
      };

      descriptionTranslations.value = {
        ...(product.translations?.description ?? {}),
      };

      itemTypeId.value = product.itemTypeId;

      if (product.itemTypeId) {
        itemTypes.value = {
          id: product.itemTypeId,
          title: product.itemTypeTitle ?? '',
        } as TitleInterface<string | number>;
      }

      measurementUnitId.value = product.measurementUnitId;

      if (product.measurementUnitId) {
        measurement.value = {
          id: product.measurementUnitId,
          title: product.measurementUnitTitle ?? '',
        } as TitleInterface<string | number>;
      }

      expectedPrice.value = product.expectedPrice;

      isActive.value = product.isActive ?? true;

      selectedStageIds.value = [...(product.stageIds ?? [])];

      imageBase64.value =
        typeof product.image === 'string' && product.image ? product.image : undefined;

      imageFiles.value = [];

      sortings.value = product.sortings?.length
        ? product.sortings.map((s) => ({
            id: s.id,
            title: '',
            price: Number(s.price ?? 0),
          }))
        : [createSorting()];
    },
    {
      immediate: true,
    },
  );

  watch(
    [
      translations,
      descriptionTranslations,
      itemTypeId,
      measurementUnitId,
      expectedPrice,
      isActive,
      imageBase64,
      selectedStageIds,
      sortings,
    ],
    updateData,
    {
      deep: true,
    },
  );

  onMounted(async () => {
    await fetchStages();
    updateData();
  });
</script>

<template>
  <div class="products-form" :class="{ disabled: loading }">
    <div class="form-header">
      <div>
        <h2 class="title">
          {{ $t('Products.form.title') }}
        </h2>

        <p class="subtitle">
          {{ $t('Products.form.subtitle') }}

          <span class="badge">
            {{ $t('Products.badge') }}
          </span>
        </p>
      </div>

      <div class="actions">
        <button type="button" class="btn-secondary">
          {{ $t('Products.form.back') }}
        </button>

        <button type="button" class="btn-primary">
          <span>+</span>

          {{ $t('Products.form.save') }}
        </button>
      </div>
    </div>

    <div class="form-body">
      <aside class="left-panel">
        <div class="card image-card">
          <div class="card-header">
            <span>
              {{ $t('Products.form.image_and_sorting') }}
            </span>

            <label class="switch">
              <input type="checkbox" v-model="isActive" />

              <span class="slider"></span>

              <span class="label">
                {{ $t('Products.form.active') }}
              </span>
            </label>
          </div>

          <div class="image-upload">
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

        <div class="card sortings-card">
          <div v-for="(s, i) in sortings" :key="s.id ?? `new-${i}`" class="sorting-row">
            <span class="sort-label">
              {{ getSortingTitle(i) }}
            </span>

            <input v-model.number="s.price" type="number" class="price-input" min="0" />

            <span class="currency">
              {{ $t('Products.form.currency') }}
            </span>

            <button
              type="button"
              class="delete-sorting-btn"
              :disabled="deletingSortingId === s.id"
              @click="deleteSorting(s, i)"
            >
              <span v-if="deletingSortingId === s.id"> ... </span>

              <span v-else>×</span>
            </button>
          </div>

          <button type="button" class="add-sorting-btn" @click="addSorting">
            <span>+</span>

            <span>
              {{ $t('Products.form.add_sorting') }}
            </span>
          </button>
        </div>
      </aside>

      <main class="main-panel">
        <div class="card">
          <h3 class="section-title">
            {{ $t('Products.form.product_data') }}
          </h3>

          <div class="grid-2">
            <div class="field">
              <label>
                {{ $t('Products.form.product_name') }}

                <span class="required"> ? </span>
              </label>

              <MultiLangInput
                field-key="title"
                :languages="['ar', 'en']"
                :model-value="translations"
                type="title"
                @update:model-value="updateTranslations"
              />
            </div>

            <div class="field-group">
              <UpdatedCustomInputSelect
                id="item-type"
                v-model="itemTypes"
                :controller="itemTypesController"
                :label="$t('item_type')"
                :params="itemTypesParams"
                :placeholder="$t('item_type.placeholder')"
                required
              />
            </div>

            <div class="field">
              <label>
                {{ $t('Products.form.expected_price') }}

                <span class="required"> ? </span>
              </label>

              <input
                v-model.number="expectedPrice"
                type="number"
                class="field-input"
                placeholder="0"
                min="0"
              />
            </div>

            <div class="field-group">
              <UpdatedCustomInputSelect
                id="material-measurement"
                v-model="measurement"
                :controller="measurementController"
                :label="$t('measurement')"
                :params="measurementParams"
                :placeholder="$t('measurement.unit_placeholder')"
                required
              />
            </div>
          </div>
        </div>

        <div class="card">
          <div class="section-header">
            <h3 class="section-title">
              {{ $t('Products.form.stages_title') }}
            </h3>

            <span class="hint">
              {{ $t('Products.form.stages_hint') }}
            </span>
          </div>

          <div v-if="stagesLoading" class="stages-grid">
            <div v-for="i in 8" :key="i" class="stage-group">
              <div class="group-header">
                <span class="count"> ... </span>

                <h4>
                  {{ $t('Products.form.stages_loading') }}
                </h4>
              </div>
            </div>
          </div>

          <div v-else-if="!stageGroups.length" class="stage-group">
            <div class="group-header">
              <h4>
                {{ $t('Products.form.stages_empty') }}
              </h4>
            </div>
          </div>

          <div v-else class="stages-grid">
            <div
              v-for="group in stageGroups"
              :key="group.id"
              class="stage-group"
              :class="group.color"
            >
              <div class="group-header">
                <span class="count">
                  {{ group.stages.length }}
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
                    selected: isStageSelected(stage.id),
                  }"
                  @click="toggleStage(stage.id)"
                >
                  {{ stage.title }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div id="description-field" class="field-group col-span-2">
            <MultiLangInput
              field-key="description"
              :label="$t('description')"
              :languages="['ar', 'en']"
              :model-value="descriptionTranslations"
              type="description"
              @update:model-value="updateDescriptionTranslations"
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
    background: var(--bg-section);
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
      font-size: var(--xl-size-2);
      font-weight: 700;
      color: var(--title-color);
    }

    .subtitle {
      color: var(--subtitle-color);
      margin-top: 0.25rem;
    }

    .badge {
      background: var(--info-light);
      color: var(--info-dark);
      padding: 0.15rem 0.5rem;
      border-radius: var(--radius-full);
      font-size: var(--xs-size);
    }

    .actions {
      display: flex;
      gap: 0.75rem;
    }
  }

  .btn-primary {
    background: var(--PrimaryColor);
    color: var(--standard-white);
    border: none;
    padding: 0.6rem 1.2rem;
    border-radius: var(--radius-sm);
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    cursor: pointer;
    transition: var(--transition-fast);

    &:hover {
      background: var(--PrimaryColor-hover);
    }
  }

  .btn-secondary {
    background: var(--bg-card);
    border: 1px solid var(--border-weak);
    color: var(--gray-700);
    padding: 0.6rem 1.2rem;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: var(--transition-fast);

    &:hover {
      background: var(--gray-100);
    }
  }

  .form-body {
    display: grid;
    grid-template-columns: 420px 1fr;
    gap: 1.5rem;
  }

  .card {
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    padding: 1.25rem;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border-weak);
  }

  .left-panel {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .image-card .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    font-weight: 600;
    color: var(--title-card-color);
  }

  .image-upload {
    border: 2px dashed var(--border-strong);
    border-radius: var(--radius-md);
    padding: 1rem;
    text-align: center;
    background: var(--bg-section);
  }

  .sortings-card {
    .sorting-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;

      .sort-label {
        width: 60px;
        font-size: var(--sm-size);
        color: var(--subtitle-color);
      }

      .price-input {
        flex: 1;
        padding: 0.4rem 0.6rem;
        border: 1px solid var(--input-border-color);
        border-radius: var(--radius-sm);
        text-align: center;
        font-weight: 600;
        color: var(--Title-input-Color);

        &:focus {
          outline: none;
          border-color: var(--PrimaryColor);
          box-shadow: 0 0 0 3px var(--PrimaryColor-alpha-15);
        }
      }

      .currency {
        font-size: var(--xs-size);
        color: var(--gray-400);
        width: 28px;
      }
    }
  }

  .delete-sorting-btn {
    width: 28px;
    height: 28px;
    flex-shrink: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    border: 1px solid var(--border-weak);
    border-radius: var(--radius-sm);

    background: var(--bg-card);
    color: var(--danger);

    font-size: 1.2rem;
    line-height: 1;

    cursor: pointer;
    transition: var(--transition-fast);

    &:hover:not(:disabled) {
      background: var(--danger-light);
      border-color: var(--danger);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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
    background: var(--bg-card);
    color: var(--PrimaryColor);
    border: 1px dashed var(--PrimaryColor);
    border-radius: var(--radius-sm);
    font-size: var(--sm-size);
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition-fast);

    span:first-child {
      font-size: var(--md-size);
      font-weight: 700;
    }

    &:hover {
      background: var(--PrimaryColor-alpha-8);
    }
  }

  .main-panel {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .section-title {
    font-size: var(--md-size-2);
    font-weight: 700;
    margin-bottom: 1rem;
    color: var(--title-color);
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;

    .hint {
      font-size: var(--xs-size);
      color: var(--subtitle-color);
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
      font-size: var(--sm-size);
      font-weight: 500;
      color: var(--gray-700);
    }

    .required {
      color: var(--danger);
    }
  }

  .field-input {
    padding: 0.6rem 0.85rem;
    border: 1px solid var(--input-border-color);
    border-radius: var(--radius-sm);
    font-size: var(--sm-size);
    background: var(--bg-card);
    color: var(--Title-input-Color);

    &:focus {
      outline: none;
      border-color: var(--PrimaryColor);
      box-shadow: 0 0 0 3px var(--PrimaryColor-alpha-15);
    }
  }

  .stages-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
  }

  .stage-group {
    border-radius: var(--radius-md);
    padding: 0.85rem;
    border: 1px solid var(--border-weak);

    .group-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.6rem;

      .count {
        background: var(--gray-900);
        color: var(--standard-white);
        width: 22px;
        height: 22px;
        border-radius: 50%;
        font-size: var(--xs-size);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      h4 {
        font-size: var(--sm-size);
        font-weight: 600;
        margin: 0;
        color: var(--title-card-color);
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
    border-radius: var(--radius-full);
    font-size: var(--xs-size);
    background: var(--bg-card);
    border: 1px solid var(--border-weak);
    color: var(--gray-700);
    cursor: pointer;
    transition: var(--transition-fast);

    &.selected {
      background: var(--PrimaryColor);
      color: var(--standard-white);
      border-color: var(--PrimaryColor);
    }

    &:hover:not(.selected) {
      border-color: var(--PrimaryColor);
      color: var(--PrimaryColor);
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
      background: var(--gray-300);
      border-radius: var(--radius-full);
      position: relative;
      transition: 0.2s;

      &::after {
        content: '';
        position: absolute;
        width: 16px;
        height: 16px;
        background: var(--standard-white);
        border-radius: 50%;
        top: 2px;
        left: 2px;
        transition: 0.2s;
      }
    }

    input:checked + .slider {
      background: var(--PrimaryColor);

      &::after {
        transform: translateX(16px);
      }
    }

    .label {
      font-size: var(--sm-size);
      color: var(--subtitle-color);
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
