<script lang="ts" setup>
  import MultiSelect from 'primevue/multiselect';
  import Select from 'primevue/select';

  import { computed, ref, watch, toRefs } from 'vue';

  import { useI18n } from 'vue-i18n';

  import type Params from '@/base/Core/Params/params';

  import ValidationService from '@/base/Presentation/Utils/validationService';

  import IconBackStage from '@/shared/icons/IconBackStage.vue';
  import PlusIcon from '@/shared/icons/PlusIcon.vue';

  import type TitleInterface from '@/base/Data/Models/titleInterface';

  export type ComponentType = 'select' | 'multiselect';

  interface OptionsController {
    fetchAsOptions(params?: Params): Promise<TitleInterface<string | number>[]>;
    isListFailed(): boolean;
    isListSuccess(): boolean;
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
  } = toRefs(props);

  const loading = ref(false);

  const message = ref(t('no_data_found'));

  const localValue = ref(props.modelValue);

  const dynamicOptions = ref<TitleInterface<string | number>[]>([]);

  let latestOptionsRequest = 0;

  const isMultiselect = computed(() => Number(type.value) === 2);

  const componentType = computed(() => (isMultiselect.value ? MultiSelect : Select));

  const mergedOptions = computed(() => staticOptions?.value ?? dynamicOptions.value);

  const multiselectProps = computed(() =>
    isMultiselect.value
      ? {
          display: 'chip',
          maxSelectedLabels: 6,
        }
      : {},
  );

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
    return Array.isArray(value) ? (value as TitleInterface<string | number>[]) : [];
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
    if (newValue === localValue.value) {
      return;
    }

    if (Array.isArray(newValue)) {
      localValue.value = newValue.map((item) => {
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

  async function fetchOptions(): Promise<void> {
    if (disabled.value || !controller?.value || !params?.value) {
      return;
    }

    const requestId = ++latestOptionsRequest;

    try {
      loading.value = true;

      message.value = t('loading_data');

      const fetchedOptions = await controller.value.fetchAsOptions(params.value);

      if (requestId !== latestOptionsRequest) {
        return;
      }

      dynamicOptions.value = fetchedOptions;

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
    />

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
    margin-right: 6px;
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
