<script lang="ts" setup>
  import MultiSelect from 'primevue/multiselect';
  import Select from 'primevue/select';

  import { computed, ref, watch, toRefs, type ComputedRef } from 'vue';

  import { useI18n } from 'vue-i18n';

  import type Params from '@/base/Core/Params/params';
  import type PaginationModel from '@/base/Core/Models/paginationModel';

  import ValidationService from '@/base/Presentation/Utils/validationService';

  import IconBackStage from '@/shared/icons/IconBackStage.vue';
  import PlusIcon from '@/shared/icons/PlusIcon.vue';

  import type TitleInterface from '@/base/Data/Models/titleInterface';

  export type ComponentType = 'select' | 'multiselect';

  interface OptionsController {
    fetchAsOptions(params?: Params): Promise<TitleInterface<string | number>[]>;
    isListFailed(): boolean;
    isListSuccess(): boolean;
    pagination?: ComputedRef<PaginationModel | null>;
  }

  interface Props {
    label?: string;

    options?: TitleInterface<string | number>[];

    staticOptions?: TitleInterface<string | number>[] | null;

    modelValue:
      TitleInterface<string | number> | TitleInterface<string | number>[] | null | undefined;

    placeholder: string;

    controller?: OptionsController;

    params?: Params;

    type?: ComponentType | number;

    required?: boolean;

    id?: string;

    name?: string;

    autoFill?: boolean;

    reload?: boolean;

    optional?: boolean;

    hascontent?: boolean;

    hasHeader?: boolean;

    onclick?: () => void;

    helpTitle?: string;

    helpText?: string;

    helpExamples?: string[];

    showHelp?: boolean;

    disabled?: boolean;

    showSelectAll?: boolean;

    selectionLimit?: number;

    paginated?: boolean;
  }

  const emit = defineEmits<{
    'update:modelValue': [
      value: TitleInterface<string | number> | TitleInterface<string | number>[] | null,
    ];

    'update:slot': [];
  }>();

  const { t } = useI18n();

  const props = withDefaults(defineProps<Props>(), {
    label: undefined,

    options: undefined,

    type: 1,

    required: false,

    autoFill: false,

    id: 'custom-select-input',

    reload: true,

    staticOptions: null,

    controller: undefined,

    params: undefined,

    name: undefined,

    onclick: undefined,

    helpTitle: undefined,

    helpText: undefined,

    helpExamples: undefined,

    optional: false,

    showHelp: true,

    disabled: false,

    showSelectAll: false,

    selectionLimit: undefined,

    paginated: false,
  });

  const {
    modelValue,

    type,

    controller,

    params,

    staticOptions,

    autoFill,

    id,

    required,

    reload: enableReload,

    disabled,

    showSelectAll,

    selectionLimit,

    paginated,
  } = toRefs(props);

  const loading = ref(false);

  const message = ref(t('no_data_found'));

  const localValue = ref(props.modelValue);

  const dynamicOptions = ref<TitleInterface<string | number>[]>([]);

  const optionsPage = ref(1);

  let latestOptionsRequest = 0;

  const isMultiselect = computed(() => Number(type.value) === 2);

  const componentType = computed(() => (isMultiselect.value ? MultiSelect : Select));

  const mergedOptions = computed(() => staticOptions?.value ?? dynamicOptions.value);

  const multiselectProps = computed(() =>
    isMultiselect.value
      ? {
          display: 'chip',
          maxSelectedLabels: 6,
          selectionLimit: selectionLimit.value,
          showToggleAll: !showSelectAll.value,
        }
      : {},
  );

  const selectedValues = computed(() => (Array.isArray(localValue.value) ? localValue.value : []));

  const selectedCount = computed(() => selectedValues.value.length);

  const optionsPagination = computed(() => controller.value?.pagination?.value ?? null);

  const optionsLastPage = computed(() => optionsPagination.value?.lastPage ?? 1);

  const allVisibleOptionsSelected = computed(() => {
    if (mergedOptions.value.length === 0) return false;

    const selectedIds = new Set(selectedValues.value.map((option) => String(option.id)));

    return mergedOptions.value.every((option) => selectedIds.has(String(option.id)));
  });

  const selectAllLabel = computed(() =>
    allVisibleOptionsSelected.value
      ? t('clear_selected_options')
      : t('select_all_up_to_limit', {
          count: selectionLimit.value ?? mergedOptions.value.length,
        }),
  );

  const selectionLimitMessage = computed(() => {
    if (!selectionLimit.value) return '';

    if (selectedCount.value >= selectionLimit.value) {
      return t('selection_limit_reached', { count: selectionLimit.value });
    }

    return t('selected_count_limit', {
      selected: selectedCount.value,
      count: selectionLimit.value,
    });
  });

  const normalizedValue = computed({
    get: () => localValue.value,

    set: (newValue) => {
      if (disabled.value) {
        return;
      }

      localValue.value = isMultiselect.value ? ensureArray(newValue) : ensureSingle(newValue);

      emitUpdate();
    },
  });

  watch(modelValue, syncLocalValue);

  watch([params, controller, disabled], handleOptionUpdates, {
    immediate: true,
  });

  watch(mergedOptions, () => {
    if (!modelValue.value || Array.isArray(modelValue.value)) {
      syncLocalValue(modelValue.value);

      return;
    }

    const currentId = (modelValue.value as TitleInterface<string | number>).id;

    const match = mergedOptions.value.find((option) => option.id === currentId);

    if (match && match !== localValue.value) {
      localValue.value = match;
    }
  });

  syncLocalValue(props.modelValue);

  function ensureArray(value: unknown): TitleInterface<string | number>[] {
    if (!Array.isArray(value)) return [];

    const uniqueValues = value.filter(
      (option, index, options) =>
        options.findIndex((candidate) => String(candidate?.id) === String(option?.id)) === index,
    ) as TitleInterface<string | number>[];

    return selectionLimit.value ? uniqueValues.slice(0, selectionLimit.value) : uniqueValues;
  }

  function ensureSingle(value: unknown): TitleInterface<number | string> | null {
    if (value !== null && typeof value === 'object' && 'id' in value) {
      return value as TitleInterface<number | string>;
    }

    return null;
  }

  function syncLocalValue(
    newValue:
      TitleInterface<string | number> | TitleInterface<string | number>[] | null | undefined,
  ): void {
    if (
      newValue === localValue.value &&
      (!Array.isArray(newValue) || !selectionLimit.value || newValue.length <= selectionLimit.value)
    ) {
      return;
    }

    if (Array.isArray(newValue)) {
      localValue.value = ensureArray(newValue).map((item) => {
        const match = mergedOptions.value.find((option) => option.id === item.id);

        return match ?? item;
      });

      return;
    }

    if (newValue && mergedOptions.value.length > 0) {
      const currentId = (newValue as TitleInterface<string | number>).id;

      const match = mergedOptions.value.find((option) => option.id === currentId);

      localValue.value = match ?? newValue;
    } else {
      localValue.value = newValue;
    }
  }

  function emitUpdate(): void {
    if (disabled.value) {
      return;
    }

    emit(
      'update:modelValue',
      localValue.value as
        TitleInterface<string | number> | TitleInterface<string | number>[] | null,
    );

    ValidationService.clearError(id.value);
  }

  async function handleOptionUpdates(): Promise<void> {
    optionsPage.value = 1;

    if (disabled.value) {
      latestOptionsRequest += 1;
      loading.value = false;

      if (!staticOptions?.value) {
        dynamicOptions.value = [];
      }

      return;
    }

    if (params?.value && controller?.value) {
      await fetchOptions();
    } else {
      latestOptionsRequest += 1;
      dynamicOptions.value = staticOptions?.value ?? [];
    }
  }

  async function fetchOptions(page: number = 1): Promise<void> {
    if (disabled.value || !controller?.value || !params?.value) {
      return;
    }

    const requestId = ++latestOptionsRequest;

    try {
      loading.value = true;

      message.value = t('loading_data');

      const fetchedOptions = await controller.value.fetchAsOptions(createPageParams(page));

      if (requestId !== latestOptionsRequest) {
        return;
      }

      dynamicOptions.value = fetchedOptions;
      optionsPage.value = page;

      updateControllerState();

      handleAutoFill(fetchedOptions);
    } catch (error) {
      if (requestId === latestOptionsRequest) {
        handleFetchError(error);
      }
    } finally {
      if (requestId === latestOptionsRequest) {
        loading.value = false;
      }
    }
  }

  function createPageParams(page: number): Params | undefined {
    const source = params.value;

    if (!source || !paginated.value) return source;

    const pageParams = Object.assign(
      Object.create(Object.getPrototypeOf(source)),
      source,
    ) as Params & {
      pageNumber?: number;
      withPage?: number;
    };

    pageParams.pageNumber = page;
    pageParams.withPage = 1;

    return pageParams;
  }

  async function changeOptionsPage(page: number): Promise<void> {
    if (
      !paginated.value ||
      loading.value ||
      page < 1 ||
      page > optionsLastPage.value ||
      page === optionsPage.value
    ) {
      return;
    }

    await fetchOptions(page);
  }

  function getSelectionOutsideVisibleOptions(): TitleInterface<string | number>[] {
    const visibleIds = new Set(mergedOptions.value.map((option) => String(option.id)));

    return selectedValues.value.filter((option) => !visibleIds.has(String(option.id)));
  }

  function getVisibleSelectionAdditions(remainingSlots: number): TitleInterface<string | number>[] {
    return mergedOptions.value
      .filter((option) => !selectedValues.value.some((selected) => selected.id === option.id))
      .slice(0, remainingSlots);
  }

  function toggleSelectAll(): void {
    if (!isMultiselect.value || disabled.value) return;

    const currentSelection = getSelectionOutsideVisibleOptions();

    if (allVisibleOptionsSelected.value) {
      normalizedValue.value = currentSelection;
      return;
    }

    const remainingSlots = selectionLimit.value
      ? Math.max(selectionLimit.value - currentSelection.length, 0)
      : mergedOptions.value.length;
    const additions = getVisibleSelectionAdditions(remainingSlots);

    normalizedValue.value = [...currentSelection, ...additions];
  }

  function updateControllerState(): void {
    if (!controller?.value) {
      return;
    }

    if (controller.value.isListFailed()) {
      message.value = t('an_error_occurred');
    } else if (controller.value.isListSuccess()) {
      message.value = t('no_data_found');
    }
  }

  function handleAutoFill(options: TitleInterface<number | string>[]): void {
    const [onlyOption] = options;

    if (disabled.value || !autoFill?.value || !onlyOption || options.length !== 1) {
      return;
    }

    normalizedValue.value = isMultiselect.value ? [onlyOption] : onlyOption;
  }

  function handleFetchError(error: unknown): void {
    console.error('Fetch error:', error);

    message.value = t('failed_to_load_data');

    dynamicOptions.value = [];
  }

  async function reloadData(): Promise<void> {
    if (disabled.value || loading.value) {
      return;
    }

    await fetchOptions();

    normalizedValue.value = isMultiselect.value ? [] : null;
  }

  const handleAddClick = (): void => {
    if (disabled.value || !props.onclick) {
      return;
    }

    props.onclick();
  };
</script>

<template>
  <div
    class="input-label flex justify-between w-full"
    :class="{
      'input-label--disabled': disabled,
    }"
  >
    <slot v-if="!hasHeader">
      <div class="flex items-center">
        <slot name="reloadHeader" />

        <span
          v-if="enableReload"
          class="reload-icon flex items-center gap-sm me-2 w-full"
          :class="{
            'reload-icon--disabled': disabled,
            'cursor-pointer': !disabled,
          }"
          @click="reloadData"
        >
          <span v-if="optional" class="optional-text"> ({{ $t('optional') }}) </span>

          <IconBackStage />
        </span>
      </div>

      <div class="flex items-center gap-2">
        <div
          v-if="onclick"
          class="add-dialog"
          :class="{
            'add-dialog--disabled': disabled,
          }"
          @click="handleAddClick"
        >
          <PlusIcon />
        </div>

        <span class="field-help-label-row">
          <label
            :class="{
              required,
              'input-label__text--disabled': disabled,
            }"
            :for="id"
            class="input-label"
          >
            <span v-if="required" class="text-red-500"> * </span>

            {{ $t(label ?? '') }}
          </label>
        </span>

        <slot name="LabelHeader" />
      </div>
    </slot>

    <slot v-else name="Header" />
  </div>

  <slot v-if="!hascontent">
    <component
      :is="componentType"
      v-model="normalizedValue"
      :input-id="id"
      :aria-label="label ? t(label) : placeholder"
      :options="mergedOptions"
      :placeholder="placeholder"
      :disabled="disabled"
      class="input-select w-full"
      :class="{
        'input-select--disabled': disabled,
      }"
      option-label="title"
      v-bind="multiselectProps"
      filter
      :loading="loading"
      :empty-message="message"
      @selectall-change="toggleSelectAll"
    >
      <template v-if="isMultiselect && showSelectAll" #header>
        <button
          type="button"
          class="multiselect-select-all"
          :class="{ 'multiselect-select-all--selected': allVisibleOptionsSelected }"
          :aria-pressed="allVisibleOptionsSelected"
          :aria-label="selectAllLabel"
          :disabled="
            disabled ||
            (!allVisibleOptionsSelected &&
              Boolean(selectionLimit) &&
              selectedCount >= (selectionLimit ?? 0))
          "
          @click.stop="toggleSelectAll"
        >
          <span class="multiselect-select-all__check" aria-hidden="true">
            {{ allVisibleOptionsSelected ? '✓' : '' }}
          </span>
          <span>{{ selectAllLabel }}</span>
        </button>
      </template>

      <template v-if="isMultiselect && paginated && optionsLastPage > 1" #footer>
        <div
          class="multiselect-pagination"
          role="navigation"
          :aria-label="$t('options_pagination')"
        >
          <button
            type="button"
            class="multiselect-pagination__button"
            :disabled="loading || optionsPage <= 1"
            :aria-label="$t('prev')"
            @click.stop="changeOptionsPage(optionsPage - 1)"
          >
            {{ $t('prev') }}
          </button>
          <span class="multiselect-pagination__status">
            {{ $t('page_of', { current: optionsPage, total: optionsLastPage }) }}
          </span>
          <button
            type="button"
            class="multiselect-pagination__button"
            :disabled="loading || optionsPage >= optionsLastPage"
            :aria-label="$t('next')"
            @click.stop="changeOptionsPage(optionsPage + 1)"
          >
            {{ $t('next') }}
          </button>
        </div>
      </template>
    </component>

    <p
      v-if="isMultiselect && selectionLimit"
      class="selection-limit-message"
      role="status"
      aria-live="polite"
    >
      {{ selectionLimitMessage }}
    </p>

    <input
      :id="id"
      type="text"
      class="hidden w-full"
      :value="normalizedValue"
      :disabled="disabled"
    />
  </slot>

  <slot v-else name="content" />
</template>

<style scoped lang="scss">
  .required span {
    color: red;
  }

  .reload-icon {
    z-index: 9999;

    &--disabled {
      cursor: not-allowed;
      opacity: 0.5;
      pointer-events: none;
    }
  }

  .add-dialog {
    width: 20px;
    height: 20px;
    margin-inline-end: 6px;
    cursor: pointer;

    svg {
      width: 18px;
      height: 18px;
    }

    &--disabled {
      cursor: not-allowed;
      opacity: 0.5;
      pointer-events: none;
    }
  }

  .input-label--disabled {
    opacity: 0.75;
  }

  .input-label__text--disabled {
    cursor: not-allowed;
    color: var(--gray-4);
  }

  .input-select {
    width: 100%;
    border-radius: 50px;
    background-color: transparent;

    &:focus {
      border: 1px solid #d9dbe9 !important;
    }
  }

  .input-select--disabled {
    cursor: not-allowed;
    opacity: 0.65;
    pointer-events: none;
  }

  .selection-limit-message {
    margin: 0.35rem 0 0;
    color: var(--gray-5);
    font-size: var(--xs-size);
  }

  .multiselect-select-all {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.65rem 0.75rem;
    border: 0;
    background: transparent;
    color: var(--bread-crumb-color-span);
    cursor: pointer;
    text-align: start;

    &:hover,
    &:focus-visible {
      background: var(--PrimaryColor-light);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.55;
    }

    &--selected {
      color: var(--PrimaryColor);
      font-weight: 600;
    }
  }

  .multiselect-select-all__check {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.15rem;
    height: 1.15rem;
    border: 1px solid var(--PrimaryColor);
    border-radius: 0.25rem;
    font-size: 0.8rem;
  }

  .multiselect-pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-top: 1px solid var(--border-weak);
  }

  .multiselect-pagination__button {
    border: 0;
    background: transparent;
    color: var(--PrimaryColor);
    cursor: pointer;
    font-size: var(--xs-size);

    &:disabled {
      cursor: not-allowed;
      opacity: 0.45;
    }
  }

  .multiselect-pagination__status {
    color: var(--gray-5);
    font-size: var(--xs-size);
  }

  :deep(.p-select.p-disabled),
  :deep(.p-multiselect.p-disabled) {
    cursor: not-allowed;
    opacity: 0.65;
    pointer-events: none;
  }

  :deep(.p-select.p-disabled .p-select-dropdown),
  :deep(.p-multiselect.p-disabled .p-multiselect-dropdown) {
    pointer-events: none;
  }
</style>
