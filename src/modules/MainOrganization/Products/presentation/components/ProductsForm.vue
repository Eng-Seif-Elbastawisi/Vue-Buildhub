<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';

  import TranslationParams from '@/base/Core/Params/translationParams';
  import MultiLangInput from '@/shared/MultiLangInput.vue';
  import StatusToggleField from '@/modules/MainOrganization/ChangeStatus/presentation/components/StatusToggleField.vue';

  import type ProductsShowModel from '../../core/models/products.show.model';
  import AddProductsParams from '../../core/params/add.products.params';
  import AddProductsSortingParams from '../../core/params/add.products.sorting.params';
  import DeleteProductsSortingParams from '../../core/params/delete.products.sorting.params';
  import EditProductsParams from '../../core/params/edit.products.params';
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

  import { useRoute } from 'vue-router';

  const route = useRoute();

  const id = computed(() => {
    const value = route.params.products_id;

    return value ? Number(value) : undefined;
  });

  interface SortingItem {
    id?: number;
    title: string;
    price: number;
  }

  interface StageItem {
    id: number;
    title: string;
  }

  interface StageApiItem {
    id: number;
    parent_id?: number | null;
    title?: string | Record<string, string> | Array<{ locale?: string; title?: string }>;
    translations?: { title?: Record<string, string> };
    name?: string;
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
    (event: 'updateData', data: AddProductsParams | EditProductsParams): void;
  }>();

  const props = defineProps<{
    products?: ProductsShowModel;
    loading?: boolean;
  }>();

  const productsController = ProductsController.getInstance();

  const itemTypesController = ItemTypesController.getInstance();
  const measurementController = MeasurementController.getInstance();
  const stageController = StageController.getInstance();

  const itemTypesParams = new IndexItemTypesParams('', 1, 100, 0);
  const measurementParams = new IndexMeasurementParams('', 1, 100, 0);

  const extractTitle = (item: StageApiItem): string => {
    if (!item) return '';

    if (typeof item.title === 'string') {
      return item.title;
    }

    if (Array.isArray(item.title)) {
      const en = item.title.find((translation) => translation.locale === 'en')?.title;
      const ar = item.title.find((translation) => translation.locale === 'ar')?.title;

      return en || ar || item.title[0]?.title || '';
    }

    if (item.title && typeof item.title === 'object') {
      const localizedTitle = item.title as Record<string, string>;

      return localizedTitle.ar || localizedTitle.en || Object.values(localizedTitle)[0] || '';
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

  const createSorting = (price = 0): SortingItem => {
    return {
      title: '',
      price,
    };
  };

  const itemTypes = ref<TitleInterface<string | number> | null>(null);
  const measurement = ref<TitleInterface<string | number> | null>(null);

  const translations = ref<Record<string, string>>({});
  const descriptionTranslations = ref<Record<string, string>>({});

  const itemTypeId = ref<number | undefined>();
  const measurementUnitId = ref<number | undefined>();

  const expectedPrice = ref<number | undefined>();
  const quantity = ref<number | undefined>();

  const isActive = ref(true);
  const gradesEnabled = ref(true);

  const imageFiles = ref<UploadedFile[]>([]);
  const imageBase64 = ref<string | undefined>();

  const imageFileValue = computed(() => imageBase64.value);

  const selectedStageIds = ref<number[]>([]);

  const stageGroups = ref<StageGroup[]>([]);

  const stagesLoading = ref(false);

  const sortings = ref<SortingItem[]>([createSorting()]);

  const deletingSortingId = ref<number | undefined>();

  const updateImage = (files: UploadedFile[]) => {
    imageFiles.value = files;

    const image = files.find(
      (file) => typeof file.base64 === 'string' && file.base64.startsWith('data:image/'),
    );

    imageBase64.value = image?.base64 ?? undefined;
  };

  const addSorting = () => {
    if (!gradesEnabled.value) return;

    sortings.value.push(createSorting());
  };

  const deleteSorting = async (sorting: SortingItem, index: number) => {
    if (!gradesEnabled.value) return;

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

  const hasSubStages = (group: StageGroup) => {
    return group.stages.length > 0;
  };

  const isStageGroupSelected = (group: StageGroup) => {
    return hasSubStages(group) && group.stages.every((stage) => isStageSelected(stage.id));
  };

  const toggleStageGroup = (group: StageGroup) => {
    if (!hasSubStages(group)) return;

    const subStageIds = group.stages.map((stage) => stage.id);

    if (isStageGroupSelected(group)) {
      selectedStageIds.value = selectedStageIds.value.filter(
        (stageId) => !subStageIds.includes(stageId),
      );
      return;
    }

    selectedStageIds.value = [...new Set([...selectedStageIds.value, ...subStageIds])];
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

      const allStages: StageApiItem[] = Array.isArray(result?.data) ? result.data : [];

      const mainStages = allStages.filter((stage) => !stage.parent_id);

      let subStages = allStages.filter((stage) => stage.parent_id);

      if (mainStages.length > 0 && subStages.length === 0) {
        const subResults = await Promise.all(
          mainStages.map((stage) =>
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
                data: (Array.isArray(res?.data) ? res.data : []) as StageApiItem[],
              }))
              .catch(() => ({
                parentId: stage.id,
                data: [],
              })),
          ),
        );

        subStages = subResults.flatMap((result) =>
          result.data.map((stage) => ({
            ...stage,
            parent_id: result.parentId,
          })),
        );
      }

      stageGroups.value = mainStages.map((stage, index) => ({
        id: stage.id,
        title: extractTitle(stage),
        color: STAGE_COLORS[index % STAGE_COLORS.length],
        stages: subStages
          .filter((subStage) => subStage.parent_id === stage.id)
          .map((subStage) => ({
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
    const image = gradesEnabled.value ? imageBase64.value : undefined;

    const validSortings = gradesEnabled.value
      ? sortings.value
          .map((sorting, originalIndex) => ({ sorting, originalIndex }))
          .filter(({ sorting }) => Number(sorting.price) > 0)
          .map(
            ({ sorting, originalIndex }) =>
              new AddProductsSortingParams({
                title: getSortingTitle(originalIndex),
                price: sorting.price,
              }),
          )
      : [];

    const params = id.value
      ? new EditProductsParams({
          productsId: id.value,

          translations: new TranslationParams({
            title: translations.value,
            description: descriptionTranslations.value,
          }),

          itemTypeId: itemTypeId.value,
          measurementUnitId: measurementUnitId.value,
          expectedPrice: expectedPrice.value,
          quantity: typeof quantity.value === 'number' ? quantity.value : undefined,

          image: image,
          stageIds: [...selectedStageIds.value],
          sortings: validSortings,
          isActive: isActive.value,
        })
      : new AddProductsParams({
          translations: new TranslationParams({
            title: translations.value,
            description: descriptionTranslations.value,
          }),

          itemTypeId: itemTypeId.value,
          measurementUnitId: measurementUnitId.value,
          expectedPrice: expectedPrice.value,
          quantity: typeof quantity.value === 'number' ? quantity.value : undefined,

          image: image,
          stageIds: [...selectedStageIds.value],
          sortings: validSortings,
          isActive: isActive.value,
          gradesEnabled: gradesEnabled.value,
        });

    emit('updateData', params);
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
    () => props.products,
    (product) => {
      if (!product) return;

      translations.value = {
        ...(product.translations?.title ?? {}),
      };

      descriptionTranslations.value = {
        ...(product.translations?.description ?? {}),
      };

      itemTypeId.value = product.itemType?.id;

      if (product.itemType) {
        itemTypes.value = {
          id: product.itemType.id,
          title: product.itemType.title ?? '',
        } as TitleInterface<string | number>;
      } else {
        itemTypes.value = null;
      }

      measurementUnitId.value = product.measurementUnit?.id;

      if (product.measurementUnit) {
        measurement.value = {
          id: product.measurementUnit.id,
          title: product.measurementUnit.title ?? '',
        } as TitleInterface<string | number>;
      } else {
        measurement.value = null;
      }

      expectedPrice.value = product.expectedPrice;
      quantity.value = product.quantity;

      isActive.value = product.isActive ?? true;
      gradesEnabled.value = Boolean(product.image || product.sortings?.length);

      selectedStageIds.value = [...(product.stageIds ?? [])];

      imageBase64.value =
        typeof product.image === 'string' && product.image ? product.image : undefined;

      imageFiles.value = [];

      sortings.value = product.sortings?.length
        ? product.sortings.map((sorting) => ({
            id: sorting.id,
            title: '',
            price: Number(sorting.price ?? 0),
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
      quantity,
      isActive,
      gradesEnabled,
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
    <header class="form-header">
      <div class="form-header__icon" aria-hidden="true">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
          />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      </div>

      <div class="form-header__copy">
        <div class="form-header__eyebrow">
          <span class="badge">{{ $t('Products.badge') }}</span>
          <span>{{ id ? $t('Products.form.update') : $t('Products.form.save') }}</span>
        </div>

        <h2 class="title">
          {{ id ? $t('Products.form.update') : $t('Products.form.title') }}
        </h2>

        <p class="subtitle">{{ $t('Products.form.subtitle') }}</p>
      </div>
    </header>

    <div class="form-body">
      <aside class="left-panel">
        <section class="card status-card">
          <div class="status-card__copy">
            <span class="section-kicker">{{ $t('Products.form.status') }}</span>
            <strong>{{
              isActive ? $t('Products.form.active') : $t('Products.form.inactive')
            }}</strong>
          </div>

          <div class="status-card__toggle">
            <StatusToggleField v-model="isActive" input-id="product-status" :disabled="loading" />
          </div>
        </section>

        <section class="card status-card grades-card">
          <div class="status-card__copy">
            <span class="section-kicker">{{ $t('Products.form.enable_product_grades') }}</span>
            <strong>
              {{
                gradesEnabled
                  ? $t('Products.form.grades_enabled')
                  : $t('Products.form.grades_disabled')
              }}
            </strong>
          </div>

          <div class="status-card__toggle">
            <StatusToggleField
              v-model="gradesEnabled"
              input-id="product-grades-status"
              :disabled="loading"
            />
          </div>
        </section>

        <section v-if="gradesEnabled" class="card image-card">
          <div class="section-heading section-heading--compact">
            <span class="section-number">03</span>

            <div>
              <h3>{{ $t('image') }}</h3>
              <p>{{ $t('Products.form.image_and_sorting') }}</p>
            </div>
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
        </section>

        <section v-if="gradesEnabled" class="card sortings-card">
          <div class="section-heading section-heading--compact">
            <span class="section-number">04</span>

            <div>
              <h3>{{ $t('Products.form.sorting_prices') }}</h3>
              <p>{{ $t('Products.form.sorting_hint') }}</p>
            </div>

            <span class="sorting-count">{{ sortings.length }}</span>
          </div>

          <div class="sorting-list">
            <div v-for="(s, i) in sortings" :key="s.id ?? `new-${i}`" class="sorting-row">
              <div class="sorting-row__header">
                <span class="sorting-index">{{ String(i + 1).padStart(2, '0') }}</span>
                <label :for="`sorting-price-${i}`">{{ getSortingTitle(i) }}</label>

                <button
                  type="button"
                  class="delete-sorting-btn"
                  :disabled="deletingSortingId === s.id"
                  :aria-label="$t('common.delete')"
                  :title="$t('common.delete')"
                  @click="deleteSorting(s, i)"
                >
                  <span v-if="deletingSortingId === s.id">…</span>
                  <span v-else aria-hidden="true">×</span>
                </button>
              </div>

              <div class="price-control">
                <input
                  :id="`sorting-price-${i}`"
                  v-model.number="s.price"
                  type="number"
                  class="price-input"
                  min="0"
                  :placeholder="$t('Products.form.sorting_price_placeholder')"
                />
                <!-- step="1" -->

                <span class="currency">{{ $t('Products.form.currency') }}</span>
              </div>
            </div>
          </div>

          <button type="button" class="add-sorting-btn" @click="addSorting">
            <span aria-hidden="true">+</span>
            <span>{{ $t('Products.form.add_sorting') }}</span>
          </button>
        </section>
      </aside>

      <main class="main-panel">
        <section class="card details-card">
          <div class="section-heading">
            <span class="section-number">01</span>

            <div>
              <h3>{{ $t('Products.form.product_data') }}</h3>
              <p>{{ $t('Products.form.subtitle') }}</p>
            </div>
          </div>

          <div class="grid-2">
            <div class="field">
              <label>
                {{ $t('Products.form.product_name') }}

                <span class="required">*</span>
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

                <span class="required">*</span>
              </label>

              <input
                v-model.number="expectedPrice"
                type="number"
                class="field-input"
                :placeholder="$t('Products.placeholders.price')"
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
            <!-- 
            <div class="field">
              <label for="product-quantity">{{ $t('Products.form.quantity') }}</label>
              <input
                id="product-quantity"
                pattern="[0-9]*"
                v-model.number="quantity"
                type="number"
                class="field-input"
              />
            </div> -->
          </div>

          <div id="description-field" class="description-field">
            <MultiLangInput
              field-key="description"
              :label="$t('description')"
              :languages="['ar', 'en']"
              :model-value="descriptionTranslations"
              type="description"
              @update:model-value="updateDescriptionTranslations"
            />
          </div>
        </section>

        <section class="card stages-card">
          <div class="section-heading">
            <span class="section-number">02</span>

            <div>
              <h3>{{ $t('Products.form.stages_title') }}</h3>
              <p>{{ $t('Products.form.stages_hint') }}</p>
            </div>

            <span v-if="selectedStageIds.length" class="selected-count">
              {{ selectedStageIds.length }}
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
              :class="[
                group.color,
                {
                  selected: isStageGroupSelected(group),
                  disabled: !hasSubStages(group),
                },
              ]"
            >
              <button
                type="button"
                class="group-header"
                :disabled="!hasSubStages(group)"
                :aria-pressed="hasSubStages(group) ? isStageGroupSelected(group) : undefined"
                @click="toggleStageGroup(group)"
              >
                <span class="count">
                  {{ group.stages.length }}
                </span>

                <span class="group-title">
                  {{ group.title }}
                </span>
              </button>

              <div class="stage-tags">
                <button
                  v-for="stage in group.stages"
                  :key="stage.id"
                  type="button"
                  class="stage-tag"
                  :class="{
                    selected: isStageSelected(stage.id),
                  }"
                  :aria-pressed="isStageSelected(stage.id)"
                  @click="toggleStage(stage.id)"
                >
                  {{ stage.title }}
                </button>
              </div>
            </div>
          </div>
        </section>
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

  .image-upload {
    border: 2px dashed var(--border-strong);
    border-radius: var(--radius-md);
    padding: 1rem;
    text-align: center;
    background: var(--bg-section);
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

    &:hover:not(:disabled) {
      background: var(--PrimaryColor-alpha-8);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      border-color: var(--gray-300);
      color: var(--gray-400);
    }
  }

  .main-panel {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
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
    transition: var(--transition-fast);

    &.selected {
      border-color: var(--PrimaryColor);
      box-shadow: 0 0 0 2px var(--PrimaryColor-alpha-15);
    }

    &.disabled {
      opacity: 0.6;
    }

    .group-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: 100%;
      margin-bottom: 0.6rem;
      padding: 0;
      border: 0;
      background: transparent;
      text-align: start;
      cursor: pointer;

      &:disabled {
        cursor: not-allowed;
      }

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

      .group-title,
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

  .products-form {
    gap: 1.25rem;
    min-height: 100%;
    padding: clamp(1rem, 2vw, 1.75rem);
  }

  .form-header {
    justify-content: flex-start;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem 1.5rem;
    background: var(--bg-card);
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-sm);

    &__icon {
      display: grid;
      flex: 0 0 3.25rem;
      width: 3.25rem;
      height: 3.25rem;
      color: var(--standard-white);
      background: var(--PrimaryColor);
      border-radius: var(--radius-lg);
      place-items: center;
      box-shadow: var(--shadow-md);
    }

    &__copy {
      min-width: 0;
    }

    &__eyebrow {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.25rem;
      color: var(--subtitle-color);
      font-size: var(--xs-size);
      font-weight: 600;
    }

    .title {
      margin: 0;
      font-size: clamp(var(--lg-size), 2vw, var(--xl-size-2));
    }
  }

  .form-body {
    grid-template-columns: minmax(19rem, 22rem) minmax(0, 1fr);
    gap: 1.25rem;
    align-items: start;
  }

  .card {
    padding: clamp(1rem, 2vw, 1.5rem);
    border-radius: var(--radius-lg);
  }

  .left-panel {
    position: sticky;
    top: 1rem;
  }

  .main-panel {
    min-width: 0;
  }

  .section-heading {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.25rem;

    h3 {
      margin: 0;
      color: var(--title-color);
      font-size: var(--md-size-2);
      font-weight: 700;
    }

    p {
      margin: 0.2rem 0 0;
      color: var(--subtitle-color);
      font-size: var(--xs-size);
    }

    &--compact {
      margin-bottom: 1rem;

      h3 {
        font-size: var(--md-size);
      }
    }
  }

  .section-number {
    display: grid;
    flex: 0 0 2rem;
    width: 2rem;
    height: 2rem;
    color: var(--PrimaryColor);
    background: var(--PrimaryColor-alpha-8);
    border: 1px solid var(--PrimaryColor-alpha-20);
    border-radius: var(--radius-md);
    font-size: var(--xs-size);
    font-weight: 700;
    place-items: center;
  }

  .status-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    border-inline-start: 0.25rem solid var(--PrimaryColor);

    &__copy {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;

      strong {
        color: var(--title-color);
        font-size: var(--md-size);
      }
    }

    &__toggle {
      :deep(.status-field__label),
      :deep(.status-field__text) {
        display: none;
      }

      :deep(.status-field__control) {
        min-height: auto;
      }
    }
  }

  .section-kicker {
    color: var(--subtitle-color);
    font-size: var(--xs-size);
    font-weight: 600;
  }

  .image-upload {
    padding: 0.75rem;
    text-align: initial;
    background: var(--bg-section);
    border: 1px dashed var(--border-strong);
    border-radius: var(--radius-lg);
    transition:
      border-color var(--transition-fast),
      background var(--transition-fast);

    &:focus-within,
    &:hover {
      background: var(--PrimaryColor-alpha-4);
      border-color: var(--PrimaryColor);
    }
  }

  .sorting-count,
  .selected-count {
    display: grid;
    min-width: 1.75rem;
    height: 1.75rem;
    margin-inline-start: auto;
    padding-inline: 0.4rem;
    color: var(--standard-white);
    background: var(--gray-900);
    border-radius: var(--radius-full);
    font-size: var(--xs-size);
    font-weight: 700;
    place-items: center;
  }

  .sorting-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .sorting-row {
    padding: 0.75rem;
    background: var(--bg-section);
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-md);

    &__header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.6rem;

      label {
        overflow: hidden;
        color: var(--title-card-color);
        font-size: var(--sm-size);
        font-weight: 600;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .sorting-index {
    color: var(--PrimaryColor);
    font-size: var(--xs-size);
    font-weight: 700;
  }

  .price-control {
    display: flex;
    align-items: center;
    overflow: hidden;
    background: var(--bg-card);
    border: 1px solid var(--input-border-color);
    border-radius: var(--radius-sm);
    transition:
      border-color var(--transition-fast),
      box-shadow var(--transition-fast);

    &:focus-within {
      border-color: var(--PrimaryColor);
      box-shadow: 0 0 0 3px var(--PrimaryColor-alpha-15);
    }
  }

  .price-input {
    min-width: 0;
    flex: 1;
    padding: 0.65rem 0.75rem;
    color: var(--Title-input-Color);
    background: transparent;
    border: 0;
    outline: 0;
    font-weight: 600;
  }

  .currency {
    padding-inline: 0.7rem;
    color: var(--gray-500);
    border-inline-start: 1px solid var(--border-weak);
    font-size: var(--xs-size);
    white-space: nowrap;
  }

  .delete-sorting-btn {
    display: grid;
    flex-shrink: 0;
    width: 1.75rem;
    height: 1.75rem;
    margin-inline-start: auto;
    color: var(--danger);
    background: transparent;
    border: 0;
    border-radius: var(--radius-full);
    place-items: center;
  }

  .add-sorting-btn {
    margin-top: 0.9rem;
    border-radius: var(--radius-md);
    font-weight: 700;
  }

  .grid-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.25rem;
  }

  .field label {
    font-weight: 600;
  }

  .field-input {
    min-height: 2.75rem;
    border-radius: var(--radius-md);
    transition:
      border-color var(--transition-fast),
      box-shadow var(--transition-fast);
  }

  .description-field {
    margin-top: 1.25rem;
    padding-top: 1.25rem;
    border-top: 1px solid var(--border-weak);
  }

  .stages-grid {
    grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
    gap: 0.75rem;
  }

  .stage-group {
    min-height: 7rem;
    padding: 0.9rem;
    background: var(--bg-section);
    transition:
      border-color var(--transition-fast),
      box-shadow var(--transition-fast);

    &:hover {
      border-color: var(--PrimaryColor-alpha-30);
      box-shadow: var(--shadow-sm);
    }

    .group-header .count {
      display: grid;
      width: 1.5rem;
      height: 1.5rem;
      color: var(--PrimaryColor);
      background: var(--PrimaryColor-alpha-8);
      border-radius: var(--radius-full);
      font-weight: 700;
      place-items: center;
    }
  }

  .stage-tag {
    padding: 0.38rem 0.7rem;

    &:focus-visible {
      outline: 2px solid var(--PrimaryColor);
      outline-offset: 2px;
    }
  }

  @media (max-width: 1100px) {
    .form-body {
      grid-template-columns: 1fr;
    }

    .main-panel {
      grid-row: 1;
    }

    .left-panel {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      position: static;
    }

    .status-card {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: 640px) {
    .products-form {
      padding: 0.75rem;
    }

    .form-header {
      align-items: flex-start;
      padding: 1rem;

      &__icon {
        flex-basis: 2.75rem;
        width: 2.75rem;
        height: 2.75rem;
      }
    }

    .grid-2,
    .left-panel {
      grid-template-columns: 1fr;
    }

    .status-card {
      grid-column: auto;
    }

    .section-heading {
      align-items: flex-start;
    }
  }
</style>
